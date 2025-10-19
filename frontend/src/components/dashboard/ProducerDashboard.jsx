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
            {/* ... (ProducerDashboard의 기존 JSX 코드 전체) ... */}
        </div>
    );
}

export default ProducerDashboard;