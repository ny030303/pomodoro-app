// backend/src/server.ts
// 💡 [수정] dotenv 임포트 및 설정 (가장 위에 있어야 함)
import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { checkSolanaConnection, createPurchaseTransaction, logEffortForUser } from './solana.js';
import { PublicKey } from '@solana/web3.js';
// 💡 [수정] Prisma 대신 mysql2/promise와 cuid 임포트
import mysql from 'mysql2/promise';
import cuid from 'cuid'; // (O)

const app = express();
const PORT = process.env.PORT || 3001;

// 💡 [수정] Prisma 인스턴스 대신 DB 커넥션 풀 생성
// .env 파일의 DATABASE_URL (예: "mysql://user:pass@host:3306/db_name")
const dbPool = mysql.createPool(process.env.DATABASE_URL || '');

// DB 연결 체크 함수
const checkDbConnection = async () => {
    try {
        const connection = await dbPool.getConnection();
        console.log('✅ MySQL connection successful.');
        connection.release(); // 연결 반환
    } catch (err: any) {
        console.error('❌ Failed to connect to MySQL:', err.message);
    }
};

// 미들웨어 설정
app.use(cors());
app.use(express.json());

// -------------------------------------------------
// 💡 [신규] 상점에 표시할 아이템 목록 전체 조회 API (Raw SQL)
// -------------------------------------------------
app.get('/api/items', async (req: Request, res: Response) => {
    try {
        // 💡 [수정] Prisma 대신 Raw SQL 사용
        const sql = "SELECT * FROM Item ORDER BY contractId ASC";
        const [rows] = await dbPool.execute(sql);
        
        const items = rows as any[]; // (타입 캐스팅)

        // 💡 [중요] DB에서 가져온 BigInt(price)는 문자열(string)일 수 있습니다.
        // 클라이언트가 사용하기 편하게 일관되게 문자열로 변환합니다.
        const serializedItems = items.map(item => ({
            ...item,
            price: item.price.toString(), // DB 값을 문자열로 통일
        }));

        res.status(200).json(serializedItems);

    } catch (error: any) {
        console.error('아이템 목록 조회 API 오류:', error);
        res.status(500).json({ error: '아이템 목록을 불러오는 데 실패했습니다.' });
    }
});

// -------------------------------------------------
// 💡 [수정] 아이템 구매 API (Raw SQL)
// -------------------------------------------------
app.post('/api/purchase/create-tx', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const { buyer, itemId } = req.body; 
        if (!buyer || !itemId) {
            return res.status(400).json({ error: 'Buyer public key and Item ID are required.' });
        }

        // --- 2. [수정] Prisma 대신 Raw SQL로 아이템 조회 ---
        // 💡 SQL Injection 방지를 위해 '?' 플레이스홀더 사용
        const sql = "SELECT * FROM Item WHERE id = ? LIMIT 1";
        const [rows] = await dbPool.execute(sql, [itemId]);
        
        const items = rows as any[];
        if (items.length === 0) {
            return res.status(404).json({ error: 'Item not found.' });
        }
        
        const item = items[0]; // 💡 첫 번째 결과 사용
        
        // --- 3. DB에서 조회한 정보로 트랜잭션 생성 ---
        const { contractId, price, name, symbol, uri } = item;
        const buyerPublicKey = new PublicKey(buyer);

        console.log(`[API /purchase] ${buyer} 가 ${itemId} (ContractId: ${contractId}) 구매 요청`);

        // --- 4. solana.ts의 함수 호출 ---
        // 💡 DB에서 온 price (string or number)를 Number()로 변환
        const base64Transaction = await createPurchaseTransaction(
            buyerPublicKey,
            contractId,    
            Number(price), // 👈 DB 값을 number로 변환
            name,
            symbol,
            uri
        );

        res.status(200).json({ transaction: base64Transaction });

    } catch (error: any) {
        console.error('Error creating purchase transaction:', error);
        res.status(500).json({ error: 'Failed to create purchase transaction.', message: error.message });
    }
});

// -------------------------------------------------
// 💡 [수정] 뽀모도로 완료 기록 (Raw SQL)
// -------------------------------------------------
app.post('/api/log-effort', async (req: Request, res: Response) => {
    try {
        const { userPublicKey } = req.body;
        if (!userPublicKey) {
            return res.status(400).json({ error: 'User public key is required.' });
        }
        const userKey = new PublicKey(userPublicKey);

        const transactionSignature = await logEffortForUser(userKey);

        // 2. [수정] Prisma 대신 Raw SQL로 DB에 기록
        try {
            // 💡 CUID (Prisma @default(cuid()) 대체)
            const newId = cuid(); 
            const timestamp = new Date();
            const userAddress = userKey.toBase58();
            
            const sql = `
                INSERT INTO EffortLog (id, signature, user, sessions, timestamp) 
                VALUES (?, ?, ?, ?, ?)
            `;
            // 💡 SQL Injection 방지
            await dbPool.execute(sql, [
                newId,
                transactionSignature,
                userAddress,
                1, // sessions
                timestamp
            ]);
            
            console.log(`[DB 저장] ${transactionSignature} 성공`);
        } catch (dbError: any) {
            console.error(`[DB 오류] ${transactionSignature} 저장 실패:`, dbError.message);
            // 💡 [수정] Prisma 오류(P2002) 대신 MySQL 고유 오류(ER_DUP_ENTRY) 코드
            if (dbError.code === 'ER_DUP_ENTRY') {
                console.warn(`[DB 경고] 이미 처리된 트랜잭션입니다 (signature unique)`);
            }
        }

        res.status(200).json({ 
            message: 'Effort logged successfully!',
            signature: transactionSignature 
        });

    } catch (error: any) { // 온체인 오류
        console.error('Error logging effort:', error);
        res.status(500).json({ error: 'Failed to log effort.', message: (error as Error).message });
    }
});

// -------------------------------------------------
// 💡 [수정] 주간 랭킹 조회 (Raw SQL)
// -------------------------------------------------
app.get('/api/ranking/weekly', async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        // 💡 [수정] Prisma 대신 Raw SQL (GROUP BY)
        const sql = `
            SELECT user, SUM(sessions) as totalSessions 
            FROM EffortLog 
            WHERE timestamp >= ? AND timestamp < ? 
            GROUP BY user 
            ORDER BY totalSessions DESC 
            LIMIT 20
        `;
        
        const [rows] = await dbPool.execute(sql, [startOfWeek, endOfWeek]);

        const rankingData = rows as { user: string, totalSessions: number | string }[];

        // 프론트엔드에서 사용하기 좋은 형태로 가공
        const ranking = rankingData.map((item, index) => ({
            rank: index + 1,
            user: item.user,
            totalSessions: Number(item.totalSessions) || 0, // SUM 결과(string/number)를 number로
        }));

        res.status(200).json(ranking);

    } catch (error: any) {
        console.error('주간 랭킹 API 오류:', error);
        res.status(500).json({ error: '랭킹을 불러오는 데 실패했습니다.' });
    }
});

// -------------------------------------------------
// API 헬스 체크 및 서버 시작 (기존과 동일)
// -------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'API server is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  // 💡 솔라나 및 DB 연결 동시 체크
  checkSolanaConnection();
  checkDbConnection();
});