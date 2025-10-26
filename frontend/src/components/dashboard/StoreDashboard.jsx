// src/components/dashboard/StoreDashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { BarChart2, Award, Database, PersonStanding, Palette, HatGlasses, UserRound } from 'lucide-react';
import { storeCharacterboard } from '../../constants/mockData';
import { Application, extend, } from '@pixi/react';
import { Container, Graphics, Sprite } from 'pixi.js';
import DragonBonesComponent from '../dashboard/DragonBonesComponent';
import { StoreModal } from '../common/Modal';

extend({ Container, Graphics, Sprite });
extend({ Container, Graphics }); // Pixi 컴포넌트 등록

const StoreDashboard = (props) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    const [isBuying, setIsBuying] = useState(false);

    const [activeTab, setActiveTab] = useState('charactor');
    const [isLoading, setIsLoading] = useState(false);
    const [txSignature, setTxSignature] = useState(null);
    const [error, setError] = useState(null);
    const tabs = [
        { id: 'charactor', label: '캐릭터', icon: PersonStanding },
        { id: 'theme', label: '테마', icon: Palette },
        { id: 'item', label: '아이템', icon: HatGlasses },
        { id: 'my', label: 'MY', icon: UserRound },
    ];

    const handleBuy = async (item) => {
        if (!publicKey) {
            alert("지갑을 연결해주세요.");
            return;
        }
        setError(null);
        setTxSignature(null);
        setIsLoading(true);
        setIsBuying(true);
        try {
            const symbol = "POMO";
            const uri = "https://example.com/metadata.json";

            // purchaseItemClient 호출
            const txHash = await props.purchaseItemClient(item.itemId, item.price, item.name, symbol, uri);
            setTxSignature(sig);

            // 트랜잭션 상태 확인 UI (옵션)
            await connection.confirmTransaction(sig, 'confirmed');
        } catch (error) {
            console.error("구매 실패:", error);
            setError('구매 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
            setIsBuying(false);
            setIsLoading(false);
        }
    };

    return (
        <div className="text-white">
            <div className="mb-8">
                <div className="flex justify-center border-b border-gray-700">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-6 text-sm font-medium transition-colors 
                                    ${activeTab === tab.id ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}>
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>
            {txSignature && (
                <p>
                    구매 완료! 트랜잭션 시그니처:{' '}
                    <a
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=custom&customUrl=${encodeURIComponent(import.meta.env.VITE_SOLANA_RPC_HOST)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {txSignature.slice(0, 8)}... 보기
                    </a>
                </p>
            )}
            <main className="flex justify-center mt-8">
                {activeTab === 'charactor' && (
                    <div className="w-full max-w-4xl text-center">
                        <div className="w-full">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                {storeCharacterboard.map(val => (
                                    <div key={val.id} onClick={() => setSelectedItem(val)}
                                        className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 
                                    ${true ? 'opacity-100 cursor-pointer hover:scale-105' : 'opacity-40 grayscale'}`}>
                                        <div className={`w-20  rounded-full flex items-center justify-center mb-4 `}>

                                            <Application width={val.width} height={val.height} backgroundAlpha={0}>
                                                <DragonBonesComponent
                                                    assetDir={val.dir}
                                                    characterUrl={val.url}
                                                    parts={val.parts}
                                                    onError={(error) => { console.log(`캐릭터 로딩 실패: ${error.message}`); }} />
                                            </Application>
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white text-md mb-1">{val.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{val.description}</p>
                                    </div>
                                ))}
                            </div>
                            {selectedItem && (
                                <StoreModal onClose={() => setSelectedItem(null)}>
                                    <div className="w-30 h-40 rounded-full flex items-center justify-center mb-4 mx-auto">
                                        <Application width={selectedItem.width} height={selectedItem.height} backgroundAlpha={0}>
                                            <DragonBonesComponent
                                                assetDir={selectedItem.dir}
                                                characterUrl={selectedItem.url}
                                                parts={selectedItem.parts}
                                                onError={(error) => { console.log(`캐릭터 로딩 실패: ${error.message}`); }} />
                                        </Application>
                                    </div>
                                    <h3 className="text-2xl text-gray-900 dark:text-white font-bold mb-2">{selectedItem.name}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedItem.description}</p>

                                    <button
                                        onClick={() => handleBuy(selectedItem)}
                                        disabled={isLoading}
                                        className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg">
                                        {isLoading ? '구매 중...' : '아이템 구매'}
                                    </button>
                                </StoreModal>
                            )}
                        </div>
                    </div>
                )}
                {activeTab === 'my-recs' && (
                    <div className="w-full max-w-4xl">

                    </div>
                )}
                {activeTab === 'data-logs' && (
                    <div className="p-8 bg-gray-800 rounded-lg"><p>데이터 로그 테이블이 여기에 표시됩니다.</p></div>
                )}
            </main>
        </div>
    );
}

export default StoreDashboard;