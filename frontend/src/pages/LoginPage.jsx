// src/pages/LoginPage.jsx

import React from 'react';
import WalletConnectButton from '../components/auth/WalletConnectButton'; 
import MyScene from '../components/common/MyScene'; 
// LoginPage 컴포넌트
// 지갑 연결 상태는 App.jsx에서 전역으로 관리되므로 별도의 props가 필요 없습니다.
export default function LoginPage() {
    return (
        <div className="w-full min-h-screen flex flex-col justify-center items-center text-center p-4 bg-gray-100 dark:bg-gray-900" 
        style={{backgroundImage: "url('/images/background1.png')", backgroundSize: 'cover'}}>
            {/* #3c4758 */}
            {/* <MyScene /> */}
            <div className="relative w-full" style={{maxWidth:"34em"}}>
                
                {/* 로고와 제목 */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                   Efforia
                </h1>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                   집중의 가치를 발견하고, 키워나가세요!
                </p>
                <div className="">
                    {/* <MyCharacter/> */}
                    {/* SVG 그래디언트 정의 */}
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" className="text-green-400" stopColor="currentColor" />
                                <stop offset="100%" className="text-green-500" stopColor="currentColor" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <img src="/images/backModels1.png" alt="bg" className='mb-12' />
                </div>
                
                
                
                {/* 메인 지갑 연결 버튼 */}
                <div className="w-full">
                    <WalletConnectButton  />
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