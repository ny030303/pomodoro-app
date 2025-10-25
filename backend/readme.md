1단계: Prisma 스키마 확인
backend/prisma/schema.prisma 파일을 확인하세요:


2단계: 환경 변수 설정
backend/.env 파일:

text
DATABASE_URL="mysql://user:password@localhost:3306/pomodoro_db"
3단계: Prisma Migration 실행
bash
cd backend

# 1. Prisma client 생성
npx prisma generate

# 2. 데이터베이스 마이그레이션 (테이블 생성)
npx prisma migrate dev --name init

# 또는 기존 스키마와 동기화
npx prisma db push
