## 에러 해결
## 1. RPC URL 설정
RPC URL: https://api.mainnet-beta.solana.com <br>
였을경우 RPC URL을 로컬로 변경

```
solana config set --url localhost
```

### 최종 확인 및 배포

1. 설정 확인

```
solana config get
```
이제 RPC URL이 http://127.0.0.1:8899로 나오는 것을 볼 수 있을 겁니다.

2. 잔액 확인

```
solana balance
```

3. 배포
마지막으로 배포를 실행합니다.

```
anchor deploy
```


----------

## 2. Attempt to debit an account but found no record of a prior credit.

이것은 "잔액이 0인 계좌에서 돈(SOL)을 인출하려고 시도했다"는 의미입니다.

### 원인: 잔액 부족
솔라나에서 트랜잭션을 보내려면 두 가지 비용이 발생할 수 있습니다.

트랜잭션 수수료(Fee): 모든 트랜잭션에 필요한 아주 적은 양의 SOL입니다.

계정 생성비(Rent): 사용자의 effortLog 계정(PDA)이 처음 만들어질 때, 그 공간을 블록체인에 영구적으로 임대하기 위한 보증금(rent) 성격의 SOL입니다.

이 비용을 지불해야 하는 계좌에 SOL이 한 푼도 없으면, 트랜잭션이 전송되기 전 시뮬레이션 단계에서 위와 같은 오류를 내보내며 실패합니다.

#### 어떤 계좌의 잔액이 부족할까
우리 시스템에서는 두 계좌가 "범인 후보"입니다.

#### 범인 후보 1: 서버 지갑 (dev-wallet.json)
역할: 트랜잭션 **수수료(Fee)**를 지불합니다.

잔액이 0인 이유: 이전에 에어드랍을 받았더라도, solana-test-validator를 껐다가 다시 켰다면 모든 기록이 초기화되어 잔액이 0이 됩니다. 이것이 가장 유력한 원인입니다.

#### 범인 후보 2: 사용자 지갑 (GNyAZw...)
역할: 자신의 effortLog PDA 계정을 처음 생성할 때 필요한 **임대료(Rent)**를 지불합니다. (이것은 스마트 컨트랙트 코드의 #[account(init, payer = user, ...)] 부분에 정의되어 있습니다.)

잔액이 0인 이유: 마찬가지로, solana-test-validator가 재시작되었다면 이 계좌의 잔액도 0이 됩니다.

### 해결 방법: 두 계좌 모두 확인하고 SOL 충전하기
Docker 컨테이너에 접속한 터미널에서 아래 단계를 진행하세요.

서버 지갑 주소 확인 (이미 알고 있다면 생략)

```
solana-keygen pubkey backend/dev-wallet.json
```
두 계좌의 잔액 확인

서버 지갑 잔액 확인 (위에서 확인한 주소 입력)
```
solana balance <서버 지갑 주소> --url localhost
```
사용자 지갑 잔액 확인
```
solana balance GNyAZwvJVsnpxQCRJJfZiukkENfTPtGTYwvZmdLeJ2gV --url localhost
```

잔액이 0인 계좌에 에어드랍하기

아마 둘 다 0일 가능성이 높습니다. 두 계좌 모두에 2 SOL씩 충전해주세요.


### 서버 지갑에 충전
```
solana airdrop 2 <서버 지갑 주소> --url localhost
```
### 사용자 지갑에 충전
```
solana airdrop 2 <사용자 지갑 주소> --url localhost
```

Postman으로 API 다시 테스트하기

두 계좌에 모두 SOL을 충전한 뒤, Postman으로 다시 API 요청을 보내보세요. 이번에는 트랜잭션이 성공적으로 처리될 것입니다.

💡 핵심 기억사항: solana-test-validator를 껐다가 다시 켤 때마다 모든 계정의 잔액이 초기화됩니다. 따라서 validator를 재시작했다면, 항상 개발에 필요한 계좌들에 solana airdrop을 다시 해주는 습관을 들이는 것이 좋습니다.


-----
로컬 Solana 개발 환경에서 서버 지갑과 유저 지갑을 확인하는 방법

1. 지갑 주소(퍼블릭키) 확인
지갑 파일이 있다면 CLI에서 다음 명령어로 공개키를 확인할 수 있습니다.

```
solana address -k <지갑_파일_경로>
```
예:

```
solana address -k backend/dev-wallet.json
solana address -k user-wallet.json
```
2. 지갑 잔고 확인
특정 지갑의 SOL 잔고를 확인하려면:

```
solana balance <지갑_퍼블릭키> --url localhost
```
예:

```
solana balance F6Hbmo1sB8My3Re1rtoVCoTztFTAMS1P2sADYP72wfKL --url localhost
solana balance GNyAZwvJVsnpxQCRJJfZiukkENfTPtGTYwvZmdLeJ2gV --url localhost
```

3. SPL 토큰 계정(ATA) 확인
특정 지갑이 보유한 SPL 토큰 계정을 확인하려면:

```
spl-token accounts --owner <지갑_퍼블릭키> --url localhost
```
특정 SPL 토큰 ATA의 상태를 확인하려면:

```
solana account <ATA_주소> --url localhost
```
4. 지갑 파일 위치 및 Docker 환경에서 확인
Docker 컨테이너 내부에서 지갑 파일 위치는 volumes 설정에 따라 다릅니다.

예를 들어, solana_config 볼륨이 /root/.config/solana에 마운트되어 있다면, 컨테이너 쉘에서 다음 명령어로 지갑 파일을 확인할 수 있습니다.

```
cat /root/.config/solana/id.json
solana address -k /root/.config/solana/id.json
```


-----
### 서버 토큰 계정에 토큰을 민트(발행)
예를 들어 1000 EFFORT 토큰을 채우려면:

```
spl-token mint CpyfUoLpFjsCMzdWVDVEKymatW6Q3Si1AWHasvidA59M 1000000000000 ACi61QTA84zNtJRWPMYjk1dLuyF2CE72Wfc7sRyJhJaa --owner ../backend/dev-wallet.json --fee-payer ../backend/dev-wallet.json --url localhost
```

1000 EFFORT = 1000 * 10^9 (decimals=9) = 1,000,000,000,000 lamports 단위로 입력

CpyfUoLpFjsCMzdWVDVEKymatW6Q3Si1AWHasvidA59M는 민트 주소

ACi61QTA84zNtJRWPMYjk1dLuyF2CE72Wfc7sRyJhJaa는 서버 토큰 계정 주소

--owner와 --fee-payer는 dev-wallet.json 경로

서버 토큰 계정 잔액 확인:

```
spl-token accounts --owner F6Hbmo1sB8My3Re1rtoVCoTztFTAMS1P2sADYP72wfKL --url localhost
```

-----
Error: Account 5DwZ2azJV4oaoC1e8SSisMskZhDnWWwStpMTxVLWxJG has insufficient funds for spend (1.8806268 SOL) + fee (0.00143 SOL)
해당 오류 메시지는 지갑에 필요한 SOL이 부족해서 트랜잭션이 실패한 것을 의미합니다. 구체적으로, 계정 5DwZ2azJV4oaoC1e8SSisMskZhDnWWwStpMTxVLWxJG에 트랜잭션을 처리할 만큼의 SOL, 즉 "1.8806268 SOL + 0.00143 SOL(수수료)"가 없습니다.

원인 및 핵심 포인트
트랜잭션 발생 시 요구 금액(1.8806268 SOL) + 네트워크 수수료(0.00143 SOL)

해당 계정의 잔고가 부족해서 발생한 오류.

해결 방법
1. SOL 에어드랍으로 잔고 충전 (testnet, devnet)
로컬 개발 네트워크라면, 다음 커맨드로 SOL을 충전할 수 있습니다.

```
solana airdrop 2 5DwZ2azJV4oaoC1e8SSisMskZhDnWWwStpMTxVLWxJG --url http://localhost:8899
```
이 커맨드는 해당 계정에 2 SOL을 에어드랍합니다.

꼭 RPC URL을 정확하게 지정해야 합니다 (--url http://localhost:8899).


-----
root@e3c4f9173487:/app/provenance_project# ../setup_local.sh 
--- 1. Funding Wallets ---
💰 Funding Deployer wallet...
Error: No such file or directory (os error 2)
Error: Dynamic program error: No default signer found, run "solana-keygen new -o /root/.config/solana/id.json" to create a new one

✅ 해결 방법
방법 1: 새 지갑 생성 (권장)
컨테이너 안에서 다음 명령어를 실행하세요:

bash
# 이미 컨테이너 안에 있으므로
solana-keygen new -o /root/.config/solana/id.json
실행하면:

복구 문구(seed phrase)가 표시됩니다

⚠️ 개발용이므로 비밀번호는 엔터(빈 값)로 넘어가도 됩니다

지갑이 /root/.config/solana/id.json에 생성됩니다

방법 2: 기존 지갑 복구 (이미 지갑이 있는 경우)
만약 이전에 사용하던 지갑의 seed phrase가 있다면:

bash
solana-keygen recover -o /root/.config/solana/id.json
그리고 seed phrase를 입력하면 복구됩니다.

🚀 전체 작업 흐름
bash
# 1. 지갑 생성
solana-keygen new -o /root/.config/solana/id.json

# 2. 지갑 주소 확인
solana address

# 3. SOL 에어드랍 (테스트용)
solana airdrop 2

# 4. 잔액 확인
solana balance

# 5. 이제 setup 스크립트 다시 실행
../setup_local.sh
📋 상세 실행 예시
bash
root@e3c4f9173487:/app/provenance_project# solana-keygen new -o /root/.config/solana/id.json

Generating a new keypair

For added security, enter a BIP39 passphrase

NOTE! This passphrase improves security of the recovery seed phrase NOT the
keypair file itself, which is stored as insecure plain text

BIP39 Passphrase (empty for none): [엔터]

Wrote new keypair to /root/.config/solana/id.json
================================================================================
pubkey: 5DwZ2azJV4oaoC1e8SSisMskZhDnWWwStpMTxVLWxJG
================================================================================
Save this seed phrase and your BIP39 passphrase to recover your new keypair:
[12개 단어가 표시됨 - 개발용이므로 저장 안 해도 됨]
================================================================================

root@e3c4f9173487:/app/provenance_project# solana airdrop 2
Requesting airdrop of 2 SOL

Signature: 3x...

2 SOL

root@e3c4f9173487:/app/provenance_project# solana balance
2 SOL

root@e3c4f9173487:/app/provenance_project# ../setup_local.sh
--- 1. Funding Wallets ---
💰 Funding Deployer wallet...
✅ Success!
...
💡 자동화 팁
매번 지갑을 새로 만들기 귀찮다면, setup_local.sh 스크립트 맨 위에 이 코드를 추가하세요:

bash
#!/bin/bash

# 지갑이 없으면 자동 생성
if [ ! -f /root/.config/solana/id.json ]; then
    echo "⚠️  지갑이 없습니다. 새 지갑을 생성합니다..."
    solana-keygen new -o /root/.config/solana/id.json --no-bip39-passphrase
fi

echo "--- 1. Funding Wallets ---"
# ... 기존 코드 계속
이렇게 하면 지갑이 없을 때 자동으로 생성됩니다!

🔍 참고: 볼륨 영구 저장
지갑은 solana_config 볼륨에 저장되므로:

✅ 컨테이너를 재시작해도 지갑 유지

✅ docker-compose down 해도 지갑 유지

❌ docker volume rm pomodoro-app_solana_config 하면 지갑 삭제

지갑 생성 후 setup_local.sh를 다시 실행하면 정상적으로 작동할 것입니다! 🎉


------
Error: Client(Error { request: Some(SendTransaction), kind: RpcError(RpcResponseError { code: -32002, message: "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x4", data: SendTransactionPreflightFailure(RpcSimulateTransactionResult { err: Some(InstructionError(0, Custom(4))), logs: Some(["Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA invoke [1]", "Program log: Instruction: MintToChecked", "Program log: Error: owner does not match", "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA consumed 4260 of 4260 compute units", "Program TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA failed: custom program error: 0x4"]), accounts: None, units_consumed: Some(4260), return_data: None, inner_instructions: None, replacement_blockhash: None }) }) })

