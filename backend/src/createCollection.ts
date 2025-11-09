// backend/src/scripts/create-collection.ts

import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { 
    createCreateMetadataAccountV3Instruction, 
    createCreateMasterEditionV3Instruction,
    PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';
import { 
    TOKEN_PROGRAM_ID, 
    ASSOCIATED_TOKEN_PROGRAM_ID, 
    createMintToInstruction, 
    createAssociatedTokenAccountInstruction, 
    getAssociatedTokenAddressSync,
    MINT_SIZE,
    createInitializeMintInstruction
} from '@solana/spl-token';
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

// --- 설정 ---
// (주의) 로컬넷인지 데브넷인지 확인하세요!
const RPC_URL = process.env.SOLANA_RPC_URL as string; // 또는 'http://127.0.0.1:8899'
const connection = new Connection(RPC_URL, 'confirmed');

// --- 서버 지갑 로드 ---
const getServerKeypair = async (): Promise<Keypair> => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // dev-wallet.json 경로를 정확하게 맞춰주세요!
    const walletPath = path.resolve(__dirname, '../../programs/backend/dev-wallet.json');
    const secretKeyString = await fs.readFile(walletPath, { encoding: 'utf8' });
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    return Keypair.fromSecretKey(secretKey);
};

const main = async () => {
    console.log("🎨 컬렉션 NFT 생성을 시작합니다...");
    const wallet = await getServerKeypair();
    console.log(`🔑 서버 지갑: ${wallet.publicKey.toBase58()}`);

    // 1. 새 Mint 계정 생성
    const collectionMint = Keypair.generate();
    console.log(`✨ 컬렉션 Mint 주소: ${collectionMint.publicKey.toBase58()}`);

    // 2. ATA (토큰 계좌) 주소 계산
    const collectionTokenAccount = getAssociatedTokenAddressSync(
        collectionMint.publicKey,
        wallet.publicKey
    );

    // 3. Metaplex PDA 계산
    const [metadataAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), collectionMint.publicKey.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );
    const [masterEditionAccount] = await PublicKey.findProgramAddress(
        [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), collectionMint.publicKey.toBuffer(), Buffer.from("edition")],
        TOKEN_METADATA_PROGRAM_ID
    );

    // --- 트랜잭션 생성 ---
    const tx = new Transaction();

    // (a) Mint 계정 생성 (SOL 전송 + 초기화)
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
    tx.add(
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: collectionMint.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(collectionMint.publicKey, 0, wallet.publicKey, wallet.publicKey)
    );

    // (b) ATA 생성 및 1개 민팅
    tx.add(
        createAssociatedTokenAccountInstruction(
            wallet.publicKey, collectionTokenAccount, wallet.publicKey, collectionMint.publicKey
        ),
        createMintToInstruction(
            collectionMint.publicKey, collectionTokenAccount, wallet.publicKey, 1
        )
    );

    // (c) 메타데이터 생성 (여기에 컬렉션 정보를 입력하세요!)
    tx.add(
        createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataAccount,
                mint: collectionMint.publicKey,
                mintAuthority: wallet.publicKey,
                payer: wallet.publicKey,
                updateAuthority: wallet.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: {
                        name: "Pomodoro Wearables", // ⬅️ 컬렉션 이름
                        symbol: "POMO",            // ⬅️ 컬렉션 심볼
                        uri: "https://arweave.net/collection-metadata.json", // ⬅️ (중요) 실제 메타데이터 URI 필요
                        sellerFeeBasisPoints: 0,
                        creators: [{ address: wallet.publicKey, verified: true, share: 100 }],
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                    collectionDetails: { __kind: 'V1', size: 0 }, // ⬅️ 이것이 컬렉션임을 표시
                },
            }
        )
    );

    // (d) 마스터 에디션 생성
    tx.add(
        createCreateMasterEditionV3Instruction(
            {
                edition: masterEditionAccount,
                mint: collectionMint.publicKey,
                updateAuthority: wallet.publicKey,
                mintAuthority: wallet.publicKey,
                payer: wallet.publicKey,
                metadata: metadataAccount,
            },
            { createMasterEditionArgs: { maxSupply: 0 } }
        )
    );

    // --- 전송 ---
    console.log("🚀 트랜잭션 전송 중...");
    const sig = await sendAndConfirmTransaction(connection, tx, [wallet, collectionMint]);
    console.log(`✅ 컬렉션 생성 완료! 시그니처: ${sig}`);
    console.log(`\n👇 아래 주소를 복사해서 .env 파일에 저장하세요!`);
    console.log(`COLLECTION_MINT_ADDRESS=${collectionMint.publicKey.toBase58()}`);
};

main().catch(err => console.error(err));