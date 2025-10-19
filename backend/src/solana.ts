// backend/src/solana.ts
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import fs from 'fs/promises';
// 수정: 필요한 모듈들을 추가로 가져옵니다.
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import idl from '../../programs/provenance_project/target/idl/provenance_project.json' with { type: 'json' }; // 💡 IDL 파일 경로

import type { ProvenanceProject } from '../../programs/provenance_project/target/types/provenance_project.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'; // 추가
import { mintEffortTokenToUser } from './mintEffortToken.js';
export const PROGRAM_ID = new PublicKey("CeHSRR3qLQjzBgmAeat75wuoeynUagCCwR1nbUNTG76T");
export const MINT_ADDRESS = new PublicKey("7ykAXH2fidNiTeHjGfZcxMafa2XWfauskghcG6vDDPjT");
export const SERVER_TOKEN_ACCOUNT_ADDRESS = new PublicKey("8EMfz6MbpXchvzZiAAtKed7AW7eN86bFhaA2bfpjHQNr");

// 로컬 솔라나 검증기 RPC URL
const SOLANA_RPC_URL = 'http://127.0.0.1:8899';

// 1. 솔라나 커넥션 생성
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed');

// 2. 서버(Payer) 지갑 로드
// 이 지갑은 트랜잭션 수수료를 지불하고, $EFFORT 토큰을 분배하는 주체가 됩니다.
// 프로젝트 루트의 dev-wallet.json을 사용합니다.
export const getServerKeypair = async (): Promise<Keypair> => {
  try {
    // 수정: __dirname을 ES 모듈 방식으로 생성합니다.
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const walletPath = path.resolve(__dirname, '../../programs/backend/dev-wallet.json');
    const secretKeyString = await fs.readFile(walletPath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('🔥 Failed to load server keypair:', error);
    throw new Error('Could not load server wallet. Make sure dev-wallet.json exists.');
  }
};

// 간단한 연결 테스트 함수
export const checkSolanaConnection = async () => {
    try {
        const version = await connection.getVersion();
        console.log('✅ Solana connection successful. Version:', version);
        const serverWallet = await getServerKeypair();
        console.log('🔑 Server wallet loaded. Public Key:', serverWallet.publicKey.toBase58());
    } catch(err) {
        console.error('❌ Failed to connect to Solana:', err);
    }
}

// export const MINT_ADDRESS = new PublicKey("Brkh89P9dKrriUdmS5c8ZvY8dZTXjuGe3P26ByectEcW");
// export const SERVER_TOKEN_ACCOUNT_ADDRESS = new PublicKey("2SHqkgfAACoRKxY9C7mrCyF3C3NRw3kpQYb77TmqDM8e");

export const logEffortForUser = async (userPublicKey: PublicKey): Promise<string> => {
    console.log(`Logging effort for user: ${userPublicKey.toBase58()}`);
    
    // 1. 유저에게 토큰 발행 (예: 1 EFFORT)
  // await mintEffortTokenToUser(userPublicKey, 1);

    const serverKeypair = await getServerKeypair();
    const wallet = new Wallet(serverKeypair);
    // 2. 솔라나 RPC와 지갑을 Anchor가 이해할 수 있는 형태로 연결
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    // 3. IDL, Program ID, Provider를 사용해 프로그램을 제어할 수 있는 객체를 생성
    const program = new Program<ProvenanceProject>(idl as ProvenanceProject, provider);

    // A new Keypair is generated for the log account for each transaction.
    const logAccount = Keypair.generate();

    const userTokenAccountAddress = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        userPublicKey
    );
    // 4. 기존 SystemProgram.transfer 대신 program의 instruction을 호출
    console.log(`Program ID from IDL: ${program.programId.toBase58()}`);

    const signature = await program.methods
    // A string argument is now passed to the function
    .logEffort("Pomodoro session completed at " + new Date().toISOString()) 
    .accounts({
      logAccount: logAccount.publicKey,
      user: userPublicKey,
      authority: provider.wallet.publicKey,
      mint: MINT_ADDRESS,
      fromTokenAccount: SERVER_TOKEN_ACCOUNT_ADDRESS,
    })
    .signers([logAccount]) // logAccount는 새로 생성되므로 여전히 signer
    .rpc();
    console.log(`✅ Transaction confirmed with signature: ${signature}`);
    return signature;
};

