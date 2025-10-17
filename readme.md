Efforia (에포리아): ‘노력(Effort)’과 ‘행복감(Euphoria)’의 합성어입니다. 노력을 통해 성취감과 보상을 얻는 긍정적인 경험을 암시합니다.

## 🚀 새로운 PC환경에서 프로젝트 설정하기 (README.md)
이 문서는 새로운 개발 환경에서 Pomodoro dApp 프로젝트를 설정하는 과정을 안내합니다.

### 1. 사전 준비 (Prerequisites)
아래 소프트웨어들이 PC에 설치되어 있어야 합니다.

Git: 소스 코드를 내려받기 위해 필요합니다.

Docker Desktop: 로컬 솔라나 개발 환경을 실행하기 위해 필수입니다.

Node.js: v18 이상 버전을 권장합니다.

VS Code: 코드 에디터로 권장합니다.

### 2. 초기 설정 (Initial Setup)
프로젝트 클론
터미널을 열어 원하는 위치에 프로젝트 소스 코드를 내려받습니다.

```
git clone <YOUR_GIT_REPOSITORY_URL>
cd pomodoro-app
```
영구 지갑 설정 (매우 중요)
컨테이너를 재시작할 때마다 지갑이 초기화되는 것을 방지하기 위해, PC에 영구적으로 사용할 '배포용 지갑'을 생성하고 컨테이너와 연결합니다.

PC에 지갑 생성:


```
# 예시: C 드라이브 my-keys 폴더에 deployer.json 이름으로 지갑 생성
solana-keygen new -o C:\my-keys\deployer.json
docker-compose.yml 수정:
docker-compose.yml 파일을 열어, volumes 섹션에 방금 만든 지갑 경로를 추가합니다.
```

```
services:
  solana_dev:
    # ... 기존 설정 ...
    volumes:
      - .:/app
      # ✅ 아래 한 줄을 추가하여 PC의 지갑을 컨테이너와 연결
      - C:\my-keys\deployer.json:/root/.config/solana/id.json
```
참고: dev-wallet.json(서버 지갑)은 프로젝트에 포함되어 있으므로 별도로 생성할 필요 없습니다.

의존성 설치
프로젝트의 backend와 frontend에 필요한 라이브러리들을 설치합니다.

```
# 백엔드 의존성 설치
cd backend
npm install
cd ..

# 프론트엔드 의존성 설치
cd frontend
npm install
cd ..
```
### 3. 로컬 환경 실행 및 초기화
도커 컨테이너 시작

```
docker-compose up -d
```
컨테이너 접속

```
docker exec -it solana_dev_env bash
```
솔라나 CLI 설정 (컨테이너 내부에서 실행)
아래 명령어들을 컨테이너 내부에서 실행합니다.

```
# 네트워크를 로컬 검증기로 설정
solana config set --url http://solana-test-validator:8899

# 배포용 지갑에 SOL 충전 (넉넉하게 5 SOL)
solana airdrop 5

# 스마트 컨트랙트 빌드 및 배포
anchor build
anchor deploy 
```
⚠️ 중요: anchor deploy 실행 후 출력되는 새로운 Program ID를 복사해두세요.

$EFFORT 토큰 생성 (컨테이너 내부에서 실행)

```
# 1. 토큰 생성 (새로운 Mint 주소 복사)
spl-token create-token --decimals 6

# 2. 서버 금고 생성 (새로운 Token Account 주소 복사)
# --owner 에는 dev-wallet.json의 주소(F6Hb...)를, <TOKEN_ADDRESS>에는 위에서 생성한 Mint 주소를 넣으세요.
spl-token create-account --owner F6Hbmo1sB8My3Re1rtoVCoTztFTAMS1P2sADYP72wfKL <TOKEN_ADDRESS>
```

# 3. 토큰 발행
```
spl-token mint <TOKEN_ADDRESS> 1000000 <NEW_TOKEN_ACCOUNT_ADDRESS>
```
### 4. 소스 코드에 새 주소 업데이트
새로운 환경에서 생성된 주소들을 소스 코드에 반영해야 합니다.

programs/provenance_project/src/lib.rs: declare_id! 매크로 안의 주소를 3번 단계에서 얻은 새로운 Program ID로 교체합니다.

backend/src/solana.ts: 파일 상단의 MINT_ADDRESS와 SERVER_TOKEN_ACCOUNT_ADDRESS 상수의 값을 4번 단계에서 생성한 새로운 주소들로 교체합니다.

최종 배포: 위 파일들을 수정한 뒤, 컨테이너 안에서 anchor deploy를 한번 더 실행하여 최신 ID가 반영된 프로그램을 배포합니다.

### 5. 애플리케이션 실행
백엔드 서버 실행

```
cd backend
npm run dev
```

프론트엔드 서버 실행 (별도의 터미널에서)

```
cd frontend
npm run dev
```