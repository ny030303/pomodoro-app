// pages/DashboardPage.jsx (최종 정리 버전)

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Settings, ArrowLeft } from 'lucide-react';

// ✅ 1. 방금 만든 두 컴포넌트를 import 합니다.
import PomodoroDashboard from '../components/dashboard/PomodoroDashboard';
import ProducerDashboard from '../components/dashboard/ProducerDashboard';
import WalletConnectButton from '../components/auth/WalletConnectButton';

export default function DashboardPage(props) {
    const [view, setView] = useState('pomodoro');
    const { connected } = useWallet();

    const handleViewChange = () => {
        if (!connected) {
            alert('프로듀서 대시보드를 보려면 지갑을 먼저 연결해주세요.');
        } else {
            setView('producer');
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold dark:text-white">
                    {view === 'pomodoro' ? 'Pomodoro Dashboard' : 'Producer Dashboard'}
                </h1>
                <div className="flex items-center gap-4">
                    {view === 'pomoro' ? (
                        <button onClick={handleViewChange} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="프로듀서 대시보드 보기">
                            <Settings className="dark:text-white" />
                        </button>
                    ) : (
                        <button onClick={() => setView('pomodoro')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="뽀모도로로 돌아가기">
                            <ArrowLeft className="dark:text-white" />
                        </button>
                    )}
                    <WalletConnectButton />
                </div>
            </header>

            {/* ✅ 2. view 상태에 따라 분리된 컴포넌트를 렌더링합니다. */}
            {view === 'pomodoro' ? (
                <PomodoroDashboard {...props} />
            ) : (
                <ProducerDashboard />
            )}
        </div>
    );
}