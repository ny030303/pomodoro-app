import React, { useState } from 'react';
import { GoogleIcon, KakaoIcon } from '../components/common/Icons';
import WalletConnectModal from '../components/auth/WalletConnectModal';

export default function LoginPage({ onLogin }) {
    const [isWalletModalOpen, setWalletModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSocialLogin = () => {
        setIsLoading(true);
        setTimeout(() => {
            onLogin();
        }, 2000);
    };
 
    const handleWalletLogin = () => {
        setWalletModalOpen(true);
    };
 
    const handleLoginSuccess = () => {
        setWalletModalOpen(false);
        onLogin();
    };

    return (
        <>
            <div className="w-full h-full flex flex-col justify-center items-center text-center p-8">
                <div className="relative p-8 sm:p-12 rounded-3xl max-w-md w-full bg-white dark:bg-slate-800 shadow-2xl">
                    <div className="mb-8">
                         <svg width="0" height="0" style={{ position: 'absolute' }}>
                             <defs>
                                 <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                     <stop offset="0%" className="text-green-400" stopColor="currentColor" />
                                     <stop offset="100%" className="text-green-500" stopColor="currentColor" />
                                 </linearGradient>
                             </defs>
                         </svg>
                         <svg className="w-24 h-24 mx-auto" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                             <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                             <path d="M3 12a9 9 0 0 0 11.23 8.814"/>
                             <path d="M12 3a9 9 0 0 1 5.766 15.82"/>
                         </svg>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Proof of Effort</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">당신의 노력을 블록체인에 증명하세요.</p>
                    
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 dark:border-green-400"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">보안 지갑을 생성하는 중입니다...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <button onClick={handleSocialLogin} className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 text-gray-800 dark:text-white font-semibold py-3 px-4 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">
                                <GoogleIcon />
                                Google 계정으로 시작하기
                            </button>
                            <button onClick={handleSocialLogin} style={{backgroundColor: '#FEE500'}} className="w-full flex items-center justify-center gap-3 text-black font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity">
                                <KakaoIcon />
                                카카오로 시작하기
                            </button>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button onClick={handleWalletLogin} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
                            또는 지갑으로 연결하기
                        </button>
                    </div>
                </div>
            </div>
            {isWalletModalOpen && <WalletConnectModal onClose={() => setWalletModalOpen(false)} onLoginSuccess={handleLoginSuccess} />}
        </>
    );
};