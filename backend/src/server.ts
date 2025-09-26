// backend/src/server.ts

import express from 'express';
import type { Request, Response } from 'express'; // 'type' 키워드를 사용해 분리

const app = express();
const PORT = process.env.PORT || 4000;

// JSON 요청 본문을 파싱하기 위한 미들웨어
app.use(express.json());

// 기본 헬스 체크 엔드포인트
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running!' });
});

// TODO: 여기에 뽀모도로 세션 관련 API 엔드포인트를 추가할 예정입니다.
// 예: POST /api/sessions, GET /api/sessions/:userAddress 등

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});