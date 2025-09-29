// backend/src/server.ts
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { checkSolanaConnection, logEffortForUser } from './solana.js'; // logEffortForUser 추가
import { PublicKey } from '@solana/web3.js';

const app = express();
const PORT = process.env.PORT || 3001; // 백엔드 서버는 3001번 포트 사용

// 미들웨어 설정
app.use(cors()); // 모든 출처의 요청을 허용 (개발 환경)
app.use(express.json()); // JSON 요청 본문을 파싱

// 뽀모도로 완료 기록 및 토큰 보상을 위한 API 엔드포인트
app.post('/api/log-effort', async (req: Request, res: Response) => {
  try {
    const { userPublicKey } = req.body;

    if (!userPublicKey) {
      return res.status(400).json({ error: 'User public key is required.' });
    }

    // solana.ts에 정의할 함수를 호출하여 트랜잭션을 처리
    const transactionSignature = await logEffortForUser(new PublicKey(userPublicKey));

    res.status(200).json({ 
        message: 'Effort logged successfully!',
        signature: transactionSignature 
    });

  } catch (error) {
    console.error('Error logging effort:', error);
    res.status(500).json({ error: 'Failed to log effort.' });
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