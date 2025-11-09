#!/bin/bash

# --- 스크립트 설정 ---
set -e # 오류 발생 시 즉시 중단

# 🌐 데브넷 URL 설정 (가장 중요)
RPC_URL="https://api.devnet.solana.com"
CLUSTER="devnet"

BACKEND_WALLET="../backend/dev-wallet.json"
TEST_USER_WALLET="GNyAZwvJVsnpxQCRJJfZiukkENfTPtGTYwvZmdLeJ2gV"

echo "🚀 Starting setup on Solana DEVNET ($RPC_URL)..."
echo "⚠️  This might take a few minutes due to network speed and rate limits."

# 지갑이 없으면 자동 생성
if [ ! -f /root/.config/solana/id.json ]; then
    echo "⚠️  Deployer wallet not found. Creating new one..."
    solana-keygen new -o /root/.config/solana/id.json --no-bip39-passphrase
fi

# 백엔드 지갑이 없으면 생성
if [ ! -f "$BACKEND_WALLET" ]; then
    echo "⚠️  Backend wallet not found. Creating new one..."
    mkdir -p ../backend
    solana-keygen new -o "$BACKEND_WALLET" --no-bip39-passphrase
fi

# 지갑 공개키 저장
DEPLOYER_PUBKEY=$(solana-keygen pubkey /root/.config/solana/id.json)
BACKEND_PUBKEY=$(solana-keygen pubkey "$BACKEND_WALLET")

echo "🔑 Deployer Pubkey: $DEPLOYER_PUBKEY"
echo "🔑 Backend Pubkey:  $BACKEND_PUBKEY"

# --- 1. 지갑 잔액 충전 (에어드랍) ---
echo ""
echo "--- 1. Funding Wallets (Airdrop) ---"
echo "⏳ Requesting airdrop for Deployer... (might fail if rate-limited)"
# 데브넷 에어드랍은 실패할 수 있으므로 '|| true'로 스크립트 중단 방지
solana airdrop 2 "$DEPLOYER_PUBKEY" --url "$RPC_URL" || echo "⚠️  Deployer airdrop failed. Please fund manually if needed."
sleep 5 # ⏳ 데브넷 속도 제한 고려

echo "⏳ Requesting airdrop for Backend..."
solana airdrop 2 "$BACKEND_PUBKEY" --url "$RPC_URL" || echo "⚠️  Backend airdrop failed. Please fund manually if needed."
sleep 5

# 잔액 확인
DEPLOYER_BALANCE=$(solana balance "$DEPLOYER_PUBKEY" --url "$RPC_URL")
BACKEND_BALANCE=$(solana balance "$BACKEND_PUBKEY" --url "$RPC_URL")
echo "✅ Deployer balance: $DEPLOYER_BALANCE SOL"
echo "✅ Backend balance:  $BACKEND_BALANCE SOL"

# 잔액 부족 시 경고
if [[ $(echo "$DEPLOYER_BALANCE < 0.5" | bc -l) -eq 1 ]]; then
  echo "🚨 ERROR: Deployer wallet has insufficient funds (< 0.5 SOL). Please fund it manually: $DEPLOYER_PUBKEY"
  exit 1
fi

# --- 2. 앵커 프로그램 빌드 및 배포 ---
echo ""
echo "--- 2. Building and Deploying Anchor Program ---"
# Anchor.toml이 devnet을 바라보도록 설정되어 있는지 확인하는 것이 좋습니다.
# 여기서는 강제로 devnet으로 배포합니다.
anchor build

PROGRAM_ID=$(grep -E "^\s*#?\s*provenance_project\s*=" Anchor.toml | sed 's/#//g' | awk -F'"' '{print $2}')

if [ -z "$PROGRAM_ID" ]; then
    echo "🚨 Could not find Program ID in Anchor.toml"
    exit 1
fi

echo "📝 Program ID from Anchor.toml: $PROGRAM_ID"
echo "⏳ Deploying to devnet... (This can take a while)"
anchor deploy --provider.cluster "$CLUSTER" --provider.wallet /root/.config/solana/id.json
echo "✅ Program deployed to devnet: $PROGRAM_ID"

# --- 3. SPL 토큰 및 금고(Vault) 생성 ---
echo ""
echo "--- 3. Creating SPL Token and Server Vault on Devnet ---"

# 토큰 생성
echo "⏳ Creating new token..."
TOKEN_OUTPUT=$(spl-token create-token --url "$RPC_URL" --decimals 9 2>&1)
TOKEN_MINT_ADDRESS=$(echo "$TOKEN_OUTPUT" | grep "Creating token" | awk '{print $3}')

if [ -z "$TOKEN_MINT_ADDRESS" ]; then
    echo "🚨 Token creation failed!"
    echo "$TOKEN_OUTPUT"
    exit 1
fi
echo "✅ Token created: $TOKEN_MINT_ADDRESS"
sleep 5 # ⏳ 트랜잭션 확정 대기

# Vault 생성 (Backend 소유)
echo "⏳ Creating server vault account..."
VAULT_ADDRESS=$(spl-token create-account "$TOKEN_MINT_ADDRESS" \
    --owner "$BACKEND_PUBKEY" \
    --fee-payer /root/.config/solana/id.json \
    --url "$RPC_URL" 2>&1 | grep "Creating account" | awk '{print $3}')

if [ -z "$VAULT_ADDRESS" ]; then
     # 실패 시 재시도 (fee-payer를 backend로 변경)
    echo "⚠️  First attempt failed. Retrying with backend as fee-payer..."
    sleep 5
    VAULT_ADDRESS=$(spl-token create-account "$TOKEN_MINT_ADDRESS" \
        --owner "$BACKEND_PUBKEY" \
        --fee-payer "$BACKEND_WALLET" \
        --url "$RPC_URL" 2>&1 | grep "Creating account" | awk '{print $3}')
        
    if [ -z "$VAULT_ADDRESS" ]; then
        echo "🚨 Vault creation failed!"
        exit 1
    fi
fi

echo "✅ Vault created: $VAULT_ADDRESS"
sleep 5

# 민팅
echo "⏳ Minting 1,000,000 tokens to vault..."
spl-token mint "$TOKEN_MINT_ADDRESS" 1000000 "$VAULT_ADDRESS" --url "$RPC_URL"
echo "✅ Minted successfully!"

# --- 4. 최종 결과 출력 ---
echo ""
echo "🎉🎉🎉 Devnet Setup Complete! 🎉🎉🎉"
echo ""
echo "Copy these addresses into your backend code (backend/src/solana.ts):"
echo "================================================================"
echo "export const PROGRAM_ID = new PublicKey(\"$PROGRAM_ID\");"
echo "export const MINT_ADDRESS = new PublicKey(\"$TOKEN_MINT_ADDRESS\");"
echo "export const SERVER_TOKEN_ACCOUNT_ADDRESS = new PublicKey(\"$VAULT_ADDRESS\");"
echo "================================================================"
echo ""
echo "⚠️  Ensure your backend is also connected to DEVNET!"
echo "   (const SOLANA_RPC_URL = 'https://api.devnet.solana.com';)"