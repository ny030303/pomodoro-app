-- 1. 사용할 데이터베이스를 선택합니다. (예: 'pomodoro_db')
USE pomodoro_db;

CREATE TABLE `EffortLog` (
    `id` VARCHAR(30) NOT NULL,
    `signature` VARCHAR(88) NOT NULL,
    `user` VARCHAR(44) NOT NULL,
    `sessions` INT NOT NULL DEFAULT 1,
    `timestamp` DATETIME NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `EffortLog_signature_key` (`signature`)
);