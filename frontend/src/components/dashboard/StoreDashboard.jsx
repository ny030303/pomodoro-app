// src/components/dashboard/StoreDashboard.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { BarChart2, Award, Database, PersonStanding, Palette, Gem, UserRound } from 'lucide-react';

const StoreDashboard = (props) => {
    
    const [activeTab, setActiveTab] = useState('charactor');
    const tabs = [
        { id: 'charactor', label: '캐릭터', icon: PersonStanding },
        { id: 'theme', label: '테마', icon: Palette },
        { id: 'item', label: '아이템', icon: Gem },
        { id: 'My', label: 'MY', icon: UserRound },
    ];


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
                                className={`flex items-center gap-2 py-4 px-6 text-sm font-medium transition-colors 
                                    ${activeTab === tab.id ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
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