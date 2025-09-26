import * as anchor from "@coral-xyz/anchor";
// import idl from "../target/idl/provenance_project.json";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { assert } from "chai";

// 👇 프로그램 타입을 임포트합니다.
import { ProvenanceProject } from "../target/types/provenance_project";

describe("provenance_project", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // const program = new Program(idl as any, provider);
  // 👈 프로그램을 anchor.workspace에서 로드하도록 수정합니다.
  const program = anchor.workspace.ProvenanceProject as Program<ProvenanceProject>;
  

  before(async () => {
    const balance = await provider.connection.getBalance(provider.wallet.publicKey);
    console.log(`Test wallet balance: ${balance / anchor.web3.LAMPORTS_PER_SOL} SOL`);
    const airdropSignature = await provider.connection.requestAirdrop(
      provider.wallet.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSignature);
  });

  it("사용자의 노력을 온체인에 기록합니다!", async () => {
    const user = anchor.web3.Keypair.generate();
    const logAccount = anchor.web3.Keypair.generate();

    // 사용자에게 충분한 SOL을 에어드랍합니다.
    const airdropSignature = await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(airdropSignature);
    
    const testData = "25분 집중 완료!";

    const txSignature = await program.methods
      .logEffort(testData) // Note: Anchor often converts snake_case to camelCase in methods too.
      .accounts({
        logAccount: logAccount.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user, logAccount])
      .rpc();

    console.log("트랜잭션이 성공적으로 전송되었습니다. 서명:", txSignature);

    // 'EffortLog'를 'effortLog' (camelCase)로 수정합니다.
    const fetchedLogAccount = await program.account.effortLog.fetch(logAccount.publicKey);

    assert.ok(fetchedLogAccount.authority.equals(user.publicKey));
    assert.equal(fetchedLogAccount.effortData, testData);
    assert.ok(fetchedLogAccount.timestamp.toNumber() > 0);
  });
});