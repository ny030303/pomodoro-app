import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";

import idl from "../target/idl/provenance_project.json";
import { ProvenanceProject } from "../target/types/provenance_project";
describe("shop_purchase", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // const programId = new PublicKey("E4Ctii4zDZ89quHkeDhgLkJkV9xynWgwcpnF1Fbtdhht");
  // const program = new Program(idl as any, provider);
  const program = anchor.workspace.ProvenanceProject as Program<ProvenanceProject>;

  let mint: PublicKey;
  let buyer: Keypair;
  let buyerTokenAccount: PublicKey;
  let treasuryTokenAccount: PublicKey;
  const price = 10;

  before(async () => {
    buyer = anchor.web3.Keypair.generate();

    const airdropSig = await provider.connection.requestAirdrop(
      buyer.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig);

    mint = await createMint(
      provider.connection,
      buyer,
      buyer.publicKey,
      null,
      9
    );

    buyerTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        buyer,
        mint,
        buyer.publicKey
      )
    ).address;

    await mintTo(
      provider.connection,
      buyer,
      mint,
      buyerTokenAccount,
      buyer.publicKey,
      1000
    );

    treasuryTokenAccount = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        provider.wallet.payer,
        mint,
        provider.wallet.publicKey
      )
    ).address;
  });

  it("사용자가 아이템 구매 시 $EFFORT 토큰 소모 및 구매 기록 생성", async () => {
    const purchaseLog = anchor.web3.Keypair.generate();
    
    // BN 객체를 사용하여 price를 전달합니다.
    const priceAsBn = new anchor.BN(price);

    const tx = await program.methods
      .purchaseItem(1, priceAsBn) // purchase_item -> purchaseItem, price -> priceAsBn
      .accounts({
        buyer: buyer.publicKey,
        buyerTokenAccount: buyerTokenAccount,
        treasuryTokenAccount: treasuryTokenAccount,
        purchaseLog: purchaseLog.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([buyer, purchaseLog])
      .rpc();

    console.log("구매 트랜잭션 성공, 시그니처:", tx);

    // 'PurchaseLog'를 'purchaseLog' (camelCase)로 수정합니다.
    const purchaseAccount = await program.account.purchaseLog.fetch(purchaseLog.publicKey);

    assert.equal(purchaseAccount.buyer.toBase58(), buyer.publicKey.toBase58());
    assert.equal(purchaseAccount.itemId, 1); // item_id -> itemId
    assert.ok(purchaseAccount.timestamp.toNumber() > 0);
  });
});