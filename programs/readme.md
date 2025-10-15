
# 뽀모도로 Proof of Effort dApp: 온체인 프로그램

이 리포지토리는 '뽀모도로 기반 Web3 노력 증명(Proof of Effort) dApp'의 핵심 로직을 담당하는 \*\*솔라나 온체인 프로그램(스마트 컨트랙트)\*\*의 개발 및 배포 환경입니다.

사용자가 뽀모도로 기법으로 집중한 시간을 온체인에 기록하여 `$EFFORT`라는 SPL 토큰을 보상으로 받고, 이 토큰으로 앱 내의 NFT 아이템을 구매하여 캐릭터를 꾸미는 선순환 경제 구조를 목표로 합니다.

## ✨ 기술 스택

  * **블록체인**: Solana
  * **스마트 컨트랙트**: Rust, Anchor Framework
  * **개발 환경**: Docker, Docker Compose
  * **테스트**: TypeScript, Mocha, Chai

-----

## 📋 사전 요구 사항

이 개발 환경을 사용하기 위해서는 아래의 소프트웨어가 로컬 머신에 설치되어 있어야 합니다.

  * [Docker](https://www.docker.com/get-started)
  * [Docker Compose](https://docs.docker.com/compose/install/)
  * [VS Code](https://code.visualstudio.com/) (+ [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) 확장 프로그램 권장)

-----

## 🚀 시작하기: 개발 환경 설정

아래 단계를 따라 Docker 컨테이너 기반의 격리된 개발 환경을 설정하고 실행합니다.

### 1\. 리포지토리 클론

```bash
git clone <이 리포지토리의 URL>
cd <프로젝트 폴더 이름>
```

### 2\. Docker 컨테이너 빌드 및 실행

프로젝트 루트 폴더에서 다음 명령어를 실행하여 Docker 이미지를 빌드하고 컨테이너를 백그라운드에서 실행합니다.

```bash
docker-compose up -d
```

이 명령은 `solana-dev-DockerFile`을 기반으로 이미지를 만들고, `solana_dev_env`라는 이름의 컨테이너를 실행시킵니다.

### 3\. 컨테이너 접속

개발에 필요한 모든 명령어는 컨테이너 내부에서 실행해야 합니다. 아래 명령어로 컨테이너 쉘에 접속하세요.

```bash
docker exec -it solana_dev_env bash
```

이제 터미널 프롬프트가 `root@...:/app#` 형태로 바뀌며, 컨테이너 안에서 모든 `anchor`, `solana` 명령어를 사용할 수 있습니다.

### 4\. 의존성 패키지 설치

컨테이너에 접속한 상태에서, TypeScript 테스트 코드를 실행하기 위한 Node.js 의존성 패키지를 설치합니다.

```bash
yarn install
```

이제 모든 개발 준비가 완료되었습니다\!

-----

## 💻 개발 워크플로우

개발은 **로컬 PC에서 코드를 수정**하고, **컨테이너 안에서 명령어를 실행**하는 방식으로 진행됩니다. `docker-compose.yml`의 `volumes` 설정 덕분에 로컬 파일 시스템과 컨테이너 내부의 `/app` 디렉토리가 실시간으로 동기화됩니다.

### ✅ 주요 명령어

모든 명령어는 `docker exec`로 컨테이너에 접속한 터미널에서 실행합니다.

  * **스마트 컨트랙트 컴파일 및 빌드**

    ```bash
    anchor build
    ```

    빌드가 성공하면 `target/` 디렉토리에 IDL(JSON)과 프로그램 바이너리(.so) 파일이 생성됩니다.

  * **테스트 실행**

    ```bash
    anchor test
    ```

    `tests/` 폴더 안의 TypeScript 테스트 파일들을 실행하여 프로그램 로직을 검증합니다.

  * **로컬 테스트넷에 배포**

    ```bash
    # 1. (별도의 터미널에서) 로컬 검증기 실행
    solana-test-validator

    # 2. (컨테이너 쉘에서) 로컬 검증기에 프로그램 배포
    anchor deploy
    ```

-----

## 📂 폴더 구조 설명

프로젝트의 주요 파일 및 디렉토리 구조는 다음과 같습니다.

```
.
├── 📂 programs/provenance_project/ # 스마트 컨트랙트 Rust 소스코드
│   └── src/
│       └── lib.rs              # ✅ 메인 로직 (뽀모도로 세션 기록, 토큰 보상)
│       
├── 📂 tests/                     # TypeScript 기반 테스트 코드
│   ├── provenance_project.ts   # 메인 로직 테스트 스크립트
│   └── shop_purchase.ts        # 상점 로직 테스트 스크립트
├── 📂 target/                    # 빌드 결과물 (IDL, 바이너리 등)
├── 📂 migrations/                # 배포 스크립트 폴더
├── 📜 Anchor.toml                # Anchor 프로젝트의 메인 설정 파일
├── 📜 Cargo.toml                 # Rust 프로그램의 의존성 및 설정
├── 📜 package.json               # Node.js 의존성 (테스트 환경용)
├── 📜 docker-compose.yml        # Docker 서비스(컨테이너) 정의 및 실행 설정
└── 📜 solana-dev-DockerFile     # 개발 환경 Docker 이미지 설계도
```

-----
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
