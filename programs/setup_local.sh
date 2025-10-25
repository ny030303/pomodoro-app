#!/bin/bash

# --- 스크립트 설정 ---
set -e
BACKEND_WALLET="../backend/dev-wallet.json"
TEST_USER_WALLET="GNyAZwvJVsnpxQCRJJfZiukkENfTPtGTYwvZmdLeJ2gV"
RPC_URL="http://127.0.0.1:8899"

# 지갑이 없으면 자동 생성
if [ ! -f /root/.config/solana/id.json ]; then
    echo "⚠️  지갑이 없습니다. 새 지갑을 생성합니다..."
    solana-keygen new -o /root/.config/solana/id.json --no-bip39-passphrase
fi

# 백엔드 지갑이 없으면 생성
if [ ! -f "$BACKEND_WALLET" ]; then
    echo "⚠️  백엔드 지갑이 없습니다. 새로 생성합니다..."
    mkdir -p ../backend
    solana-keygen new -o "$BACKEND_WALLET" --no-bip39-passphrase
fi

# 지갑 공개키 저장
DEPLOYER_PUBKEY=$(solana-keygen pubkey /root/.config/solana/id.json)
BACKEND_PUBKEY=$(solana-keygen pubkey "$BACKEND_WALLET")

# --- 1. 지갑 잔액 충전 ---
echo "--- 1. Funding Wallets ---"
echo "💰 Funding Deployer wallet..."
solana airdrop 2 --url "$RPC_URL"

echo "💰 Funding Backend server wallet..."
solana airdrop 2 "$BACKEND_PUBKEY" --url "$RPC_URL"

echo "✅ Deployer balance: $(solana balance --url $RPC_URL)"
echo "✅ Backend balance: $(solana balance $BACKEND_PUBKEY --url $RPC_URL)"

# --- 2. 앵커 프로그램 빌드 및 배포 ---
echo ""
echo "--- 2. Building and Deploying Anchor Program ---"
anchor build

# Anchor.toml에서 Program ID 추출 (주석 무시)
PROGRAM_ID=$(grep -E "^\s*#?\s*provenance_project\s*=" Anchor.toml | sed 's/#//g' | awk -F'"' '{print $2}')

if [ -z "$PROGRAM_ID" ]; then
    echo "🚨 Could not find Program ID in Anchor.toml"
    exit 1
fi

echo "📝 Program ID from Anchor.toml: $PROGRAM_ID"
anchor deploy --provider.cluster localnet
echo "✅ Program deployed: $PROGRAM_ID"

# --- 3. SPL 토큰 및 금고(Vault) 생성 ---
echo ""
echo "--- 3. Creating SPL Token and Server Vault ---"

# 기존 토큰 정보 정리
if [ -f ".token_info" ]; then
    rm .token_info
fi

# 토큰 생성 (deployer가 mint authority)
echo "🪙 Creating new token with deployer as mint authority..."
TOKEN_OUTPUT=$(spl-token create-token --url "$RPC_URL" --decimals 9 2>&1)
TOKEN_MINT_ADDRESS=$(echo "$TOKEN_OUTPUT" | grep "Creating token" | awk '{print $3}')

if [ -z "$TOKEN_MINT_ADDRESS" ]; then
    echo "🚨 Token creation failed!"
    exit 1
fi

echo "✅ Token created: $TOKEN_MINT_ADDRESS"
echo "✅ Mint authority: $DEPLOYER_PUBKEY (deployer wallet)"

# 🔥 Vault 생성 - Backend 소유로 직접 생성
echo "🏦 Creating server vault account (owned by backend wallet)..."

# Backend가 fee도 지불하고, owner도 Backend로 설정
VAULT_ADDRESS=$(spl-token create-account "$TOKEN_MINT_ADDRESS" \
    --owner "$BACKEND_PUBKEY" \
    --fee-payer "$BACKEND_WALLET" \
    --url "$RPC_URL" 2>&1 | grep "Creating account" | awk '{print $3}')

if [ -z "$VAULT_ADDRESS" ]; then
    echo "🚨 Vault creation failed!"
    echo "Trying without fee-payer..."
    
    # Deployer가 fee 지불하고 Backend 소유로 생성
    VAULT_ADDRESS=$(spl-token create-account "$TOKEN_MINT_ADDRESS" \
        --owner "$BACKEND_PUBKEY" \
        --url "$RPC_URL" 2>&1 | grep "Creating account" | awk '{print $3}')
    
    if [ -z "$VAULT_ADDRESS" ]; then
        echo "🚨 All vault creation methods failed!"
        exit 1
    fi
fi

echo "✅ Vault created: $VAULT_ADDRESS"

# 소유자 확인
VAULT_OWNER=$(spl-token display "$VAULT_ADDRESS" --url "$RPC_URL" 2>/dev/null | grep "Owner:" | awk '{print $2}')
echo "📋 Vault owner: $VAULT_OWNER"

if [ "$VAULT_OWNER" == "$BACKEND_PUBKEY" ]; then
    echo "✅ Vault ownership is correct!"
else
    echo "⚠️  WARNING: Vault owner mismatch!"
    echo "   Expected: $BACKEND_PUBKEY"
    echo "   Actual:   $VAULT_OWNER"
    exit 1
fi

# 민팅 (deployer가 mint authority이므로 deployer로 민팅)
echo "💰 Minting 1,000,000 tokens to vault..."
spl-token mint "$TOKEN_MINT_ADDRESS" 1000000 "$VAULT_ADDRESS" --url "$RPC_URL"

# 잔액 확인
BALANCE=$(spl-token balance --address "$VAULT_ADDRESS" --url "$RPC_URL" 2>/dev/null | awk '{print $1}')
echo "✅ Minted successfully!"
echo "📊 Current vault balance: $BALANCE tokens"

# 🔥 소유권 이전 (필요한 경우)
if [ $NEED_TRANSFER -eq 1 ]; then
    echo ""
    echo "🔄 Transferring vault ownership to backend wallet..."
    spl-token authorize "$VAULT_ADDRESS" owner "$BACKEND_PUBKEY" --url "$RPC_URL"
    echo "✅ Ownership transferred to: $BACKEND_PUBKEY"
fi

# 최종 소유자 확인
FINAL_OWNER=$(spl-token display "$VAULT_ADDRESS" --url "$RPC_URL" 2>/dev/null | grep "Owner:" | awk '{print $2}')
echo "📋 Final vault owner: $FINAL_OWNER"

if [ "$FINAL_OWNER" == "$BACKEND_PUBKEY" ]; then
    echo "✅ Vault ownership is correct!"
else
    echo "⚠️  WARNING: Vault owner does not match backend wallet!"
    echo "   Expected: $BACKEND_PUBKEY"
    echo "   Actual:   $FINAL_OWNER"
fi

# 토큰 정보 저장
echo "$TOKEN_MINT_ADDRESS" > .token_info

# --- 4. 테스트 유저를 위한 토큰 계정 생성 ---
echo ""
echo "--- 4. Creating Token Account for Test User (Optional) ---"
echo "Creating token account for: $TEST_USER_WALLET"

timeout 15 spl-token create-account "$TOKEN_MINT_ADDRESS" \
    --owner "$TEST_USER_WALLET" \
    --url "$RPC_URL" \
    2>&1 | grep "Creating account" || echo "⚠️  Test account creation skipped (might already exist)"

# --- 5. 최종 결과 출력 ---
echo ""
echo "🎉🎉🎉 Setup Complete! 🎉🎉🎉"
echo ""
echo "Copy these addresses into your backend code (e.g., backend/src/solana.ts):"
echo "================================================================"
echo "export const PROGRAM_ID = new PublicKey(\"$PROGRAM_ID\");"
echo "export const MINT_ADDRESS = new PublicKey(\"$TOKEN_MINT_ADDRESS\");"
echo "export const SERVER_TOKEN_ACCOUNT_ADDRESS = new PublicKey(\"$VAULT_ADDRESS\");"
echo "================================================================"
echo ""
echo "🔑 Important keys:"
echo "  - Deployer (mint authority): $DEPLOYER_PUBKEY"
echo "  - Backend wallet: $BACKEND_PUBKEY"
echo "  - Vault address: $VAULT_ADDRESS"
echo "  - Vault owner: $FINAL_OWNER"
