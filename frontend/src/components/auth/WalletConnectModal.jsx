import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PhantomIcon } from '../common/Icons';
import AnimatedCheck from '../common/AnimatedCheck';

export default function WalletConnectModal({ onClose, onLoginSuccess }) {
    const [status, setStatus] = useState('selection'); // 'selection', 'connecting', 'signing', 'success'

    useEffect(() => {
        if (status === 'connecting') {
            const timer = setTimeout(() => setStatus('signing'), 2000);
            return () => clearTimeout(timer);
        }
        if (status === 'signing') {
            const timer = setTimeout(() => setStatus('success'), 2000);
            return () => clearTimeout(timer);
        }
        if (status === 'success') {
            const timer = setTimeout(() => {
                onLoginSuccess();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, onLoginSuccess]);

    const renderContent = () => {
        switch (status) {
            case 'connecting':
                return (
                    <div className="text-center">
                        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                            <div className="absolute animate-spin rounded-full h-full w-full border-t-2 border-b-2 border-green-500 dark:border-green-400"></div>
                            <PhantomIcon />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">지갑 연결 중...</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">지갑에서 연결을 승인해주세요.</p>
                    </div>
                );
            case 'signing':
                return (
                    <div className="text-center">
                         <div className="animate-pulse mx-auto mb-6 w-16 h-16 flex justify-center items-center">
                             <div style={{ transform: 'scale(2)'}}>
                                 <PhantomIcon />
                            </div>
                         </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">서명을 요청합니다</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">로그인을 위해 서명을 완료해주세요.</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center">
                        <AnimatedCheck />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">연결 성공!</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">대시보드로 이동합니다.</p>
                    </div>
                );
            case 'selection':
            default:
                return (
                    <>
                        <button onClick={() => setStatus('connecting')} className="w-full flex items-center p-4 rounded-xl bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <PhantomIcon />
                            <span className="ml-4 font-semibold text-gray-900 dark:text-white">Phantom</span>
                        </button>
                    </>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="relative p-8 rounded-3xl max-w-sm w-full bg-white dark:bg-slate-800 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {status === 'selection' ? '연결할 지갑 선택' : '지갑 연결'}
                    </h3>
                </div>
                <div className="min-h-[150px] flex flex-col justify-center">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};