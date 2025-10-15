// backend/src/mintEffortToken.ts
import { connection, getServerKeypair, MINT_ADDRESS } from "./solana.js";
import { PublicKey } from "@solana/web3.js";
import { mintTo, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

export async function mintEffortTokenToUser(userPublicKey: PublicKey, amount: number) {
  const serverKeypair = await getServerKeypair();

  // 유저의 토큰 계정이 없으면 생성
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    serverKeypair,
    MINT_ADDRESS,
    userPublicKey
  );

  // decimals=9 기준, 1토큰 = 1_000_000_000
  const mintAmount = amount * 1_000_000_000;

  const signature = await mintTo(
    connection,
    serverKeypair, // fee payer & mint authority
    MINT_ADDRESS,
    userTokenAccount.address,
    serverKeypair, // mint authority
    mintAmount
  );
  console.log(`✅ Minted ${amount} EFFORT to ${userTokenAccount.address.toBase58()}. Tx: ${signature}`);
  return signature;
}
