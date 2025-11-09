// backend/src/solana.ts
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { 
    createCreateMetadataAccountV3Instruction, 
    createCreateMasterEditionV3Instruction,
    PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
    createCreateMasterEditionInstruction
} from '@metaplex-foundation/mpl-token-metadata';

import fs from 'fs/promises';
// 수정: 필요한 모듈들을 추가로 가져옵니다.
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import BN from 'bn.js';

import idl from '../../programs/provenance_project/target/idl/provenance_project.json' with { type: 'json' }; // 💡 IDL 파일 경로

import type { ProvenanceProject } from '../../programs/provenance_project/target/types/provenance_project.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from '@solana/spl-token'; // 추가
import dotenv from 'dotenv';
dotenv.config();
// 프로그램 ID와 필요한 상수 (사용자 환경에 맞게 변경)
export const PROGRAM_ID = new PublicKey(process.env.PROGRAM_ID as string);
export const MINT_ADDRESS = new PublicKey(process.env.MINT_ADDRESS as string);
export const SERVER_TOKEN_ACCOUNT_ADDRESS = new PublicKey(process.env.SERVER_TOKEN_ACCOUNT_ADDRESS as string);
const COLLECTION_MINT_ADDRESS= process.env.COLLECTION_MINT_ADDRESS as string;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL as string;

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

// const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
//   'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
// );
async function getMetadataPDA(mint: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

async function getMasterEditionPDA(mint: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
}

// 구매 함수
export const purchaseItem = async (
  buyerKeypair: Keypair,
  itemId: number,
  price: number,
  name: string,
  symbol: string,
  uri: string
): Promise<string> => {
  const serverKeypair = await getServerKeypair();
  const wallet = new Wallet(serverKeypair);

  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
  const program = new Program<ProvenanceProject>(idl as ProvenanceProject, PROGRAM_ID as any, provider as any);

  // NFT 민트 계정과 사용자 NFT 계정 주소 계산
  const nftMint = Keypair.generate();

  const userNftTokenAddress = getAssociatedTokenAddressSync(
    nftMint.publicKey,
    buyerKeypair.publicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // $EFFORT 구매자 토큰 계정 주소
  const buyerEffortTokenAddress = getAssociatedTokenAddressSync(
    MINT_ADDRESS,
    buyerKeypair.publicKey
  );
  const [metadataAccount, _bump1] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      nftMint.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  const [masterEditionAccount, _bump2] = await PublicKey.findProgramAddress(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      nftMint.publicKey.toBuffer(),
      Buffer.from('edition'),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  // 트랜잭션 빌드 - Anchor 프로그램의 purchase_item 호출
  // 서명자는 buyer와 nftMint (새 민트) 입니다.
  const tx = await program.methods
    .purchaseItem(itemId, new BN(price), name, symbol, uri)
    .accounts({
      buyer: buyerKeypair.publicKey,
      authority: provider.wallet.publicKey,
      buyerTokenAccount: buyerEffortTokenAddress,
      treasuryTokenAccount: SERVER_TOKEN_ACCOUNT_ADDRESS,
      nftMint: nftMint.publicKey,
      userNftAccount: userNftTokenAddress,
      metadataAccount: metadataAccount,
      masterEditionAccount: masterEditionAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    } as any)
    .signers([buyerKeypair, nftMint])
    .rpc();

  console.log(`NFT 구매 트랜잭션 시그니처: ${tx}`);
  return tx;
};

// 간단한 연결 테스트 함수
export const checkSolanaConnection = async () => {
  try {
    const version = await connection.getVersion();
    console.log('✅ Solana connection successful. Version:', version);
    const serverWallet = await getServerKeypair();
    console.log('🔑 Server wallet loaded. Public Key:', serverWallet.publicKey.toBase58());
  } catch (err) {
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
      // --- 기존 계정들 ---
      logAccount: logAccount.publicKey,
      user: userPublicKey,
      authority: provider.wallet.publicKey, // 서버 지갑
      mint: MINT_ADDRESS,
      fromTokenAccount: SERVER_TOKEN_ACCOUNT_ADDRESS, // 서버의 $EFFORT 금고

      // 🌟 --- [필수] 누락된 계정들 추가 ---
      toTokenAccount: userTokenAccountAddress, // 유저의 $EFFORT 지갑 (ATA)
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    } as any)
    .signers([logAccount]) // logAccount는 새로 생성되므로 여전히 signer
    .rpc();
  console.log(`✅ Transaction confirmed with signature: ${signature}`);
  return signature;
};

// 🚨 [수정] 'purchaseItem' 함수를 'createPurchaseTransaction'으로 변경
// 이 함수는 트랜잭션을 *전송*하는 대신, *부분 서명된 트랜잭션*을 생성하여 반환합니다.
export const createPurchaseTransaction = async (
    buyerPublicKey: PublicKey,
    itemId: number,
    price: number,
    name: string,
    symbol: string,
    uri: string
): Promise<string> => {
    const serverKeypair = await getServerKeypair();
    const wallet = new Wallet(serverKeypair);
    const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
    // @ts-ignore
    const program = new Program<ProvenanceProject>(idl, provider);

    // --- 계정 준비 ---
    const nftMint = Keypair.generate();
    const userNftTokenAddress = getAssociatedTokenAddressSync(nftMint.publicKey, buyerPublicKey);
    const buyerEffortTokenAddress = getAssociatedTokenAddressSync(MINT_ADDRESS, buyerPublicKey);
    
    // 헬퍼 함수 대신 직접 계산 (혹은 기존 헬퍼 사용해도 무방)
    const [metadataAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), nftMint.publicKey.toBuffer()],
        TOKEN_METADATA_PROGRAM_ID
    );
    const [masterEditionAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), nftMint.publicKey.toBuffer(), Buffer.from('edition')],
        TOKEN_METADATA_PROGRAM_ID
    );

    // --- 1. Anchor 트랜잭션 기본 생성 ($EFFORT 지불 + 껍데기 민팅) ---
    const transaction = await program.methods
        .purchaseItem(itemId, new BN(price), name, symbol, uri)
        .accounts({
            buyer: buyerPublicKey,
            authority: serverKeypair.publicKey,
            buyerTokenAccount: buyerEffortTokenAddress,
            treasuryTokenAccount: SERVER_TOKEN_ACCOUNT_ADDRESS,
            nftMint: nftMint.publicKey,
            userNftAccount: userNftTokenAddress,
            metadataAccount: metadataAccount,
            masterEditionAccount: masterEditionAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        } as any)
        .transaction();

    // --- 2. [중요] Metaplex 명령어 추가 (껍데기에 데이터 입히기) ---
    // (a) 메타데이터 생성 (이름, 이미지 URI 등 연결)
    transaction.add(createCreateMetadataAccountV3Instruction(
        {
            metadata: metadataAccount,
            mint: nftMint.publicKey,
            mintAuthority: serverKeypair.publicKey,
            payer: buyerPublicKey, // 수수료는 구매자가 부담 (혹은 serverKeypair로 변경 가능)
            updateAuthority: serverKeypair.publicKey,
        },
        {
            createMetadataAccountArgsV3: {
                data: {
                    name: name,
                    symbol: symbol,
                    uri: uri,
                    sellerFeeBasisPoints: 0,
                    creators: null, collection: null, uses: null,
                },
                isMutable: false, collectionDetails: null,
            },
        }
    ));

    // (b) 마스터 에디션 생성 (NFT로 확정)
    transaction.add(createCreateMasterEditionV3Instruction(
        {
            edition: masterEditionAccount,
            mint: nftMint.publicKey,
            updateAuthority: serverKeypair.publicKey,
            mintAuthority: serverKeypair.publicKey,
            payer: buyerPublicKey, // 수수료 구매자 부담
            metadata: metadataAccount,
        },
        { createMasterEditionArgs: { maxSupply: 0 } }
    ));

    // --- 3. 트랜잭션 설정 및 부분 서명 ---
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
    transaction.feePayer = buyerPublicKey; // 최종 수수료 지불자 = 사용자

    // 서버가 필요한 부분 서명 수행
    transaction.partialSign(serverKeypair); // authority 서명
    transaction.partialSign(nftMint);       // 새 Mint 계정 서명

    // --- 4. 직렬화 및 반환 ---
    console.log(`[API] 부분 서명된 트랜잭션 생성 완료 (Item: ${name})`);
    return transaction.serialize({ requireAllSignatures: false }).toString('base64');
};