import React, { useMemo } from 'react';
import { Award } from 'lucide-react';
import { mockAchievements, mockHeatmapData } from "@/constants/mockData";
import Heatmap from "@/components/common/Heatmap";

export default function ProfilePage({ user, onBack }) {
    const heatmapData = useMemo(() => mockHeatmapData(), []);
    const userAchievements = mockAchievements.filter(ach => Math.random() > 0.3);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in">
            <div className="mb-8">
                <button onClick={onBack} className="text-green-500 dark:text-green-400 hover:text-green-400 dark:hover:text-green-300">&larr; 리더보드로 돌아가기</button>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="bg-gray-200 dark:bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center text-green-500 dark:text-green-400 text-3xl font-bold">
                    {user.user.substring(0, 2)}
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.user}</h2>
                    <p className="text-gray-500 dark:text-gray-400">총 완료 세션: <span className="text-gray-900 dark:text-white font-mono">{user.sessions}</span></p>
                </div>
            </div>

            <div className="space-y-10">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">집중 히트맵</h3>
                    <Heatmap data={heatmapData} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">획득한 NFT 배지</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                        {userAchievements.map(ach => (
                            ach.earned &&
                            <div key={ach.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-col items-center text-center">
                                <div className="bg-green-500 dark:bg-green-400 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                                    <Award size={32} className="text-white dark:text-gray-900" />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">{ach.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center text-sm text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p>모든 기록은 솔라나 블록체인에 기반하여 위조가 불가능합니다.</p>
            </div>
        </div>
    );
};