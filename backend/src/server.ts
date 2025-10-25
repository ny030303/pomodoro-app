// backend/src/server.ts
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { checkSolanaConnection, logEffortForUser } from './solana.js'; // logEffortForUser 추가
import { PublicKey } from '@solana/web3.js';
import { PrismaClient } from '@prisma/client'; // 1. Prisma 클라이언트 임포트

const app = express();
const PORT = process.env.PORT || 3001; // 백엔드 서버는 3001번 포트 사용
const prisma = new PrismaClient(); // 2. Prisma 클라이언트 인스턴스 생성

// 미들웨어 설정
app.use(cors()); // 모든 출처의 요청을 허용 (개발 환경)
app.use(express.json()); // JSON 요청 본문을 파싱

// 뽀모도로 완료 기록 및 토큰 보상을 위한 API 엔드포인트
// 3. [수정] 뽀모도로 완료 기록 (DB 저장 로직 추가)
app.post('/api/log-effort', async (req: Request, res: Response) => {
    try {
        const { userPublicKey } = req.body;
        if (!userPublicKey) {
            return res.status(400).json({ error: 'User public key is required.' });
        }

        const userKey = new PublicKey(userPublicKey);

        // 1. 온체인 트랜잭션 호출
        const transactionSignature = await logEffortForUser(userKey);

        // 2. [신규] 온체인 성공 시, 오프체인 DB에 기록
        try {
            await prisma.effortLog.create({
                data: {
                    signature: transactionSignature,
                    user: userKey.toBase58(),
                    sessions: 1,
                    timestamp: new Date(), // DB 저장 시각 기준
                },
            });
            console.log(`[DB 저장] ${transactionSignature} 성공`);
        } catch (dbError: any) {
            // DB 저장이 실패해도 트랜잭션은 성공했으므로 200 OK를 반환하되, 에러 로깅
            console.error(`[DB 오류] ${transactionSignature} 저장 실패:`, dbError.message);
            if (dbError.code === 'P2002') {
                console.warn(`[DB 경고] 이미 처리된 트랜잭션입니다.`);
            }
        }

        res.status(200).json({ 
            message: 'Effort logged successfully!',
            signature: transactionSignature 
        });

    } catch (error) {
        console.error('Error logging effort:', error);
        res.status(500).json({ error: 'Failed to log effort.' });
    }
});

// 4. [신규] 주간 랭킹 조회 API 엔드포인트
app.get('/api/ranking/weekly', async (req: Request, res: Response) => {
    try {
        // 이번 주의 시작(일요일 00:00)과 끝(다음 주 일요일 00:00) 계산
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // (주의) getDay()는 일요일(0) ~ 토요일(6)
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        // Prisma로 랭킹 집계 쿼리
        const rankingData = await prisma.effortLog.groupBy({
            by: ['user'], // 사용자로 그룹화
            where: {
                timestamp: {
                    gte: startOfWeek, // 이번 주 시작 이후
                    lt: endOfWeek,    // 이번 주 종료 이전
                },
            },
            _sum: {
                sessions: true, // sessions 필드를 합산
            },
            orderBy: {
                _sum: {
                    sessions: 'desc', // 합산된 세션 수로 내림차순 정렬
                },
            },
            take: 20, // 상위 20명
        });

        // 프론트엔드에서 사용하기 좋은 형태로 가공
        const ranking = rankingData.map((item, index) => ({
            rank: index + 1,
            user: item.user,
            totalSessions: item._sum.sessions || 0,
        }));

        res.status(200).json(ranking);

    } catch (error: any) {
        console.error('주간 랭킹 API 오류:', error);
        res.status(500).json({ error: '랭킹을 불러오는 데 실패했습니다.' });
    }
});

// API 헬스 체크를 위한 기본 라우트
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API server is running!' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});