// src/pages/LoginPage.jsx

import React from 'react';
import WalletConnectButton from '../components/auth/WalletConnectButton'; 

// LoginPage 컴포넌트
// 지갑 연결 상태는 App.jsx에서 전역으로 관리되므로 별도의 props가 필요 없습니다.
export default function LoginPage() {
    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center text-center p-4 bg-gray-100 dark:bg-gray-900">
            <div className="relative p-8 sm:p-12 rounded-3xl max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl">
                
                {/* 로고와 제목 */}
                <div className="mb-8">
                    {/* SVG 그래디언트 정의 */}
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className="text-green-400" stopColor="currentColor" />
                                <stop offset="100%" className="text-green-500" stopColor="currentColor" />
                            </linearGradient>
                        </defs>
                    </svg>
                    {/* 로고 아이콘 */}
                    <svg className="w-24 h-24 mx-auto" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        <path d="M3 12a9 9 0 0 0 11.23 8.814"/>
                        <path d="M12 3a9 9 0 0 1 5.766 15.82"/>
                    </svg>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    Green Energy REC Platform
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                    당신의 친환경 에너지를 블록체인에 증명하세요.
                </p>
                
                {/* 메인 지갑 연결 버튼 */}
                <div className="w-full">
                    <WalletConnectButton />
                </div>

                {/* 사용자 안내 문구 */}
                <div className="mt-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        솔라나 지갑이 없으신가요?<br/>
                        버튼을 눌러 Phantom 지갑을 선택하면 구글 계정으로 쉽게 생성할 수 있습니다.
                    </p>
                </div>

            </div>
        </div>
    );
};