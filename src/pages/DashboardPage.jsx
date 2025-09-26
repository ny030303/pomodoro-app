// pages/DashboardPage.js (통합 버전)

import React, { useState,useEffect, useMemo  } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Play, BarChart2, Award, Users, Settings, ArrowLeft, Database, Wallet } from 'lucide-react';

import TimerTab from '../components/dashboard/TimerTab';
import StatsTab from '../components/dashboard/StatsTab';
import AchievementsTab from '../components/dashboard/AchievementsTab';
import LeaderboardTab from '../components/dashboard/LeaderboardTab';
import WalletConnectButton from '../components/auth/WalletConnectButton';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'; // Umi
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'; // Umi 지갑 어댑터
import { fetchAllDigitalAssetByOwner } from '@metaplex-foundation/mpl-token-metadata'; // Metaplex NFT 조회 함수

// ==================================================================
// 1. 기존 뽀모도로 대시보드 컴포넌트
// ==================================================================
const PomodoroDashboard = ({ onStart, onProfileView, timerMode, setTimerMode, completedSessions, weeklyGoal, recentActivity }) => {
    const [activeTab, setActiveTab] = useState('timer');

    const tabs = [
        { id: 'timer', label: '타이머', icon: Play },
        { id: 'stats', label: '통계', icon: BarChart2 },
        { id: 'achievements', label: '업적', icon: Award },
        { id: 'leaderboard', label: '리더보드', icon: Users },
    ];

    return (
        <>
            <div className="mb-8">
                <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-green-500 dark:text-green-400 border-b-2 border-green-500 dark:border-green-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            <div className="flex justify-center">
                {activeTab === 'timer' && <TimerTab onStart={onStart} timerMode={timerMode} setTimerMode={setTimerMode} completedSessions={completedSessions} weeklyGoal={weeklyGoal} recentActivity={recentActivity} />}
                {activeTab === 'stats' && <StatsTab />}
                {activeTab === 'achievements' && <AchievementsTab />}
                {activeTab === 'leaderboard' && <LeaderboardTab onProfileView={onProfileView} />}
            </div>
        </>
    );
};


// ==================================================================
// 2. Web3 프로듀서 대시보드 컴포넌트 (수정된 버전)
// ==================================================================
const ProducerDashboard = () => {
    const wallet = useWallet(); // 전체 wallet 객체를 가져옵니다.
    const { publicKey } = wallet;

    const [activeTab, setActiveTab] = useState('dashboard');
    const [myRecs, setMyRecs] = useState([]); // NFT 데이터를 저장할 상태
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태

    // Umi 인스턴스를 생성합니다.
    // ✅ [수정된 부분] useMemo를 사용하여 umi 객체 생성
    // 이렇게 하면 wallet 객체가 변경되지 않는 한, 컴포넌트가 리렌더링되어도 umi 객체를 새로 만들지 않습니다.
    const umi = useMemo(() => 
        createUmi('https://api.devnet.solana.com')
            .use(walletAdapterIdentity(wallet)),
        [wallet] // wallet 객체가 바뀔 때만 umi를 재생성하도록 설정
    );

    // '내 REC' 탭이 활성화되면 NFT를 조회하는 로직
    useEffect(() => {
        const fetchMyRecs = async () => {
            if (!publicKey) return;

            setIsLoading(true);
            try {
                // Umi를 사용하여 지갑 주소로 모든 디지털 자산(NFT)을 가져옵니다.
                const assets = await fetchAllDigitalAssetByOwner(umi, publicKey);
                
                // NFT의 off-chain 메타데이터(json)를 함께 가져와서 가공합니다.
                const recData = await Promise.all(assets.map(async (asset) => {
                    const response = await fetch(asset.metadata.uri);
                    const json = await response.json();
                    return {
                        name: json.name,
                        image: json.image,
                        description: json.description,
                        mintAddress: asset.publicKey,
                    };
                }));

                setMyRecs(recData);
            } catch (error) {
                console.error("REC NFT를 불러오는 데 실패했습니다:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab === 'my-recs') {
            fetchMyRecs();
        }
    }, [activeTab, publicKey, umi]); // 의존성 배열에 umi 추가

    const tabs = [
        { id: 'dashboard', label: '대시보드', icon: BarChart2 },
        { id: 'my-recs', label: '내 REC', icon: Award },
        { id: 'data-logs', label: '데이터 로그', icon: Database },
    ];

    if (!publicKey) return <div className="text-center text-white">지갑을 연결하여 정보를 확인하세요.</div>;


    return (
        <div className="text-white">
            <div className="mb-8">
                <div className="flex justify-center border-b border-gray-700">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-6 text-sm font-medium transition-colors ${activeTab === tab.id ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            <main className="flex justify-center mt-8">
                {activeTab === 'dashboard' && (
                     <div className="w-full max-w-4xl text-center">
                        <p className="text-gray-400 mb-6">
                            연결된 지갑: <span className="font-mono text-green-400 bg-gray-800 px-2 py-1 rounded">{publicKey.toBase58()}</span>
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* ... 기존 프로듀서 대시보드 내용 ... */}
                        </div>
                    </div>
                )}
                {activeTab === 'my-recs' && (
                    <div className="w-full max-w-4xl">
                        <h3 className="text-2xl font-semibold mb-4 text-center">내 REC 인증서</h3>
                        {isLoading ? (
                            <p className="text-center">인증서를 불러오는 중...</p>
                        ) : myRecs.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {myRecs.map((rec) => (
                                    <div key={rec.mintAddress} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                                        <img src={rec.image} alt={rec.name} className="w-full h-48 object-cover" />
                                        <div className="p-4">
                                            <h4 className="font-bold text-lg truncate">{rec.name}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center bg-gray-800 p-8 rounded-lg">보유한 REC 인증서가 없습니다.</p>
                        )}
                    </div>
                )}
                {activeTab === 'data-logs' && (
                    <div className="p-8 bg-gray-800 rounded-lg"><p>데이터 로그 테이블이 여기에 표시됩니다.</p></div>
                )}
            </main>
        </div>
    );
}


// ==================================================================
// 3. 두 대시보드를 전환하는 메인 컨테이너 컴포넌트
// ==================================================================
export default function DashboardPage(props) {
    // 'pomodoro' | 'producer' 두 가지 뷰 모드를 관리하는 상태
    const [view, setView] = useState('pomodoro');
    const { connected } = useWallet();

    // 지갑이 연결되지 않았을 경우, 프로듀서 대시보드 접근 시 연결 안내
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
                    {/* 뷰 전환 버튼 */}
                    {view === 'pomodoro' ? (
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

            {/* view 상태에 따라 적절한 대시보드를 렌더링 */}
            {view === 'pomodoro' ? (
                <PomodoroDashboard {...props} />
            ) : (
                <ProducerDashboard />
            )}
        </div>
    );
}