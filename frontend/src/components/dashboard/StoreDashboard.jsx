// src/components/dashboard/StoreDashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
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

    const [activeTab, setActiveTab] = useState('charactor');
    const tabs = [
        { id: 'charactor', label: '캐릭터', icon: PersonStanding },
        { id: 'theme', label: '테마', icon: Palette },
        { id: 'item', label: '아이템', icon: HatGlasses },
        { id: 'my', label: 'MY', icon: UserRound },
    ];


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

                                    <button className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed">
                                        마켓플레이스에 등록 (준비 중)
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