
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

[에러 해결 문서](./docs/error_solution.md)