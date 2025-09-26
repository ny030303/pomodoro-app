# ./solana-dev.Dockerfile
FROM solanafoundation/anchor:v0.31.1

# 컨테이너 내부의 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app