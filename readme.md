## Efforia (에포리아): ‘노력(Effort)’과 ‘행복감(Euphoria)’의 합성어입니다. <br>
노력을 통해 성취감과 보상을 얻는 긍정적인 경험을 암시합니다.

## 🚀 새로운 PC환경에서 프로젝트 설정하기 (README.md)
이 문서는 새로운 개발 환경에서 Pomodoro dApp 프로젝트를 설정하는 과정을 안내합니다.

### 1. 사전 준비 (Prerequisites)
아래 소프트웨어들이 PC에 설치되어 있어야 합니다.

Git: 소스 코드를 내려받기 위해 필요합니다.

Docker Desktop: 로컬 솔라나 개발 환경을 실행하기 위해 필수입니다.

Node.js: v18 이상 버전을 권장합니다.

VS Code: 코드 에디터로 권장합니다.

### 2. 초기 설정 (Initial Setup)
터미널을 열어 원하는 위치에 프로젝트 소스 코드를 내려받습니다.

```
git clone <YOUR_GIT_REPOSITORY_URL>
cd pomodoro-app
```



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
cd programs
# 기존 프로젝트가 남아있을 경우: docker compose down
docker compose up -d
```
컨테이너 접속

```
docker exec -it solana_dev_env bash
```

### 4. solana-test-validator 테스트 (컨테이너 내에서)
```
cd provenance_project/
../setup_local.sh
```
그리고 이후 다음과 같이 뜨는 콘솔로그를 복사 후 <br>
<b>backend(backend/src/solana.ts 혹은 .env)와 frontend에(.env.local) 각각 복사</b>

아래는 콘솔예시

```
Copy these addresses into your backend code (e.g., backend/src/solana.ts):
================================================================
export const PROGRAM_ID = new PublicKey("CeHSR...76T");
export const MINT_ADDRESS = new PublicKey("BmtXT...BBT");
export const SERVER_TOKEN_ACCOUNT_ADDRESS = new PublicKey("Gho...ywibi");
================================================================

🔑 Important keys:
  - Deployer (mint authority): 5TiyLdC...4v8
  - Backend wallet: 97TzS...XdP
  - Vault address: Ghosv...ibi
  - Vault owner: 97TzSq...JdP
```

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

