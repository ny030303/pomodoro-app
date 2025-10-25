// src/components/dashboard/ProducerDashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BarChart2, Award, Database } from 'lucide-react';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { fetchAllDigitalAssetByOwner } from '@metaplex-foundation/mpl-token-metadata';

const ProducerDashboard = () => {
    const wallet = useWallet();
    const { publicKey } = wallet;

    const [activeTab, setActiveTab] = useState('dashboard');
    const [myRecs, setMyRecs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const umi = useMemo(() =>
        createUmi('https://api.devnet.solana.com')
            .use(walletAdapterIdentity(wallet)),
        [wallet]
    );

    useEffect(() => {
        const fetchMyRecs = async () => {
            if (!publicKey) return;
            setIsLoading(true);
            try {
                const assets = await fetchAllDigitalAssetByOwner(umi, publicKey);
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
    }, [activeTab, publicKey, umi]);

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

export default ProducerDashboard;