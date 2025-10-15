// backend/src/createMint.ts
import fs from "fs";
import path, { dirname } from "path"; // dirname 추가
import { fileURLToPath } from "url"; // fileURLToPath 추가
import { Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import { createMint } from "@solana/spl-token";

// ✅ ES 모듈에서 __dirname을 사용하기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. PC에 있는 기존 dev-wallet.json 키페어 로드
// 경로는 이전과 동일하지만, 이제 __dirname이 올바르게 작동합니다.
const payer = Keypair.fromSecretKey(
  Uint8Array.from(
    JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../programs/backend/dev-wallet.json'), "utf-8"))
  )
);

// 2. 로컬 Validator(Docker 내부)에 연결
const connection = new Connection("http://127.0.0.1:8899", "confirmed");

// 3. SPL 토큰 민트 생성 함수
async function setupMint() {
  console.log(`Payer a.k.a Mint Authority: ${payer.publicKey.toBase58()}`);

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    9
  );

  console.log("✅ SPL Token Mint Created!");
  console.log(`Mint Public Key: ${mint.toBase58()}`);
  console.log("이 공개키를 복사해서 constants.ts 파일에 저장하세요.");
}

// ✅ try...catch로 감싸서 에러를 명확하게 출력
setupMint().catch(err => {
  console.error("❌ Mint 생성 중 심각한 오류 발생:");
  console.error(err);
});