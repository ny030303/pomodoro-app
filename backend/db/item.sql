-- ------------------------------------------------------------------
-- 1. [필수] 사용할 데이터베이스를 선택합니다.
-- 'pomodoro_db'를 실제 데이터베이스 이름으로 변경하세요!
-- ------------------------------------------------------------------
USE pomodoro_db;

CREATE TABLE `Item` (
  `id` int NOT NULL,
  `contractId` int NOT NULL,
  `price` bigint NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `symbol` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uri` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Item_contractId_key` (`contractId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ------------------------------------------------------------------
-- 2. Item 테이블에 데이터를 삽입합니다.
-- ------------------------------------------------------------------
INSERT INTO `Item` (
  `id`, 
  `contractId`, 
  `price`, 
  `name`, 
  `symbol`, 
  `uri`, 
  `imageUrl`
)
VALUES
(
  1,  -- id (클라이언트용 고유 문자열 ID)
  1,               -- contractId (스마트 컨트랙트용 u32 ID)
  200000000000,    -- price (BigInt: 200 * 10^9, 9자리 소수점 가정)
  'Cat',           -- name
  'CAT',           -- symbol (10자 이내)
  'https://arweave.net/your-cat-metadata.json', -- uri (NFT 메타데이터 주소)
  '/assets/Cat/cat_preview.png' -- imageUrl (상점 미리보기 이미지)
),
(
  2, -- id
  2,                 -- contractId
  200000000000,      -- price
  'Rabbit',          -- name
  'RABBIT',          -- symbol
  'https://arweave.net/your-rabbit-metadata.json', -- uri
  '/assets/Rabbit/rabbit_preview.png' -- imageUrl
);