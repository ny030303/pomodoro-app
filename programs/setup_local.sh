#!/bin/bash

# --- 스크립트 설정 ---
set -e # 오류 발생 시 즉시 스크립트 중단
BACKEND_WALLET="../backend/dev-wallet.json"
TEST_USER_WALLET="GNyAZwvJVsnpxQCRJJfZiukkENfTPtGTYwvZmdLeJ2gV" # 테스트할 팬텀 지갑 주소로 변경 가능

# --- 1. 지갑 잔액 충전 ---
echo "--- 1. Funding Wallets ---"
# 배포를 위한 컨테이너 기본 지갑 충전
echo "💰 Funding Deployer wallet..."
solana airdrop 2 $(solana-keygen pubkey) --url http://127.0.0.1:8899
# 수수료 지불을 위한 백엔드 서버 지갑 충전
echo "💰 Funding Backend server wallet..."
solana airdrop 2 $(solana-keygen pubkey $BACKEND_WALLET) --url http://127.0.0.1:8899

# --- 2. 앵커 프로그램 빌드 및 배포 ---
echo "\n--- 2. Building and Deploying Anchor Program ---"
anchor build
DEPLOY_OUTPUT=$(anchor deploy --provider.cluster localnet)
# ✅ "Program Id"로 정확하게 수정
PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep "Program Id" | awk -F': ' '{print $2}')

if [ -z "$PROGRAM_ID" ]; then
    echo "🚨 Deployment failed or Program ID not found!"
    exit 1
fi

# --- 3. SPL 토큰 및 금고(Vault) 생성 ---
echo "\n--- 3. Creating SPL Token and Server Vault ---"
# 토큰 생성
TOKEN_MINT_ADDRESS=$(spl-token create-token --fee-payer $BACKEND_WALLET --url localhost | grep "Creating token" | awk '{print $3}')
# ✅ 서버용 토큰 금고(Vault) 계정 생성
VAULT_ADDRESS=$(spl-token create-account $TOKEN_MINT_ADDRESS --owner $(solana-keygen pubkey $BACKEND_WALLET) --fee-payer $BACKEND_WALLET --url localhost | grep "Creating account" | awk '{print $3}')
# ✅ 생성된 금고에 초기 토큰 100만개 발행
spl-token mint $TOKEN_MINT_ADDRESS 1000000 $VAULT_ADDRESS --owner $BACKEND_WALLET --fee-payer $BACKEND_WALLET --url localhost > /dev/null

# --- 4. (선택) 테스트 유저를 위한 토큰 계정 생성 ---
echo "\n--- 4. Creating Token Account for a Test User (Optional) ---"
spl-token create-account $TOKEN_MINT_ADDRESS --owner $TEST_USER_WALLET --fee-payer $BACKEND_WALLET --url localhost

# --- 5. 최종 결과 출력 ---
echo "\n🎉🎉🎉 Setup Complete! 🎉🎉🎉"
echo "\nCopy these new addresses into your backend code (e.g., backend/src/solana.ts):"
echo "----------------------------------------------------------------"
echo "export const PROGRAM_ID = new PublicKey(\"$PROGRAM_ID\");"
echo "export const MINT_ADDRESS = new PublicKey(\"$TOKEN_MINT_ADDRESS\");"
echo "export const SERVER_TOKEN_ACCOUNT_ADDRESS = new PublicKey(\"$VAULT_ADDRESS\");"
echo "----------------------------------------------------------------"