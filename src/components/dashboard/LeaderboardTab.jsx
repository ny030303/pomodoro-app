import React from 'react';
import { mockLeaderboard } from '../../constants/mockData';

export default function LeaderboardTab({ onProfileView }) {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">리더보드</h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <div className="flex bg-gray-200 dark:bg-gray-700 p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    <div className="w-1/6 text-center">순위</div>
                    <div className="w-3/6">사용자</div>
                    <div className="w-2/6 text-right">완료 세션</div>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {mockLeaderboard.map(entry => (
                        <div key={entry.rank} className={`flex items-center p-3 transition-colors ${entry.user === 'YOU' ? 'bg-green-100 dark:bg-green-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                            <div className="w-1/6 text-center text-lg font-bold text-gray-700 dark:text-gray-300">{entry.rank}</div>
                            <div className="w-3/6">
                                <button onClick={() => onProfileView(entry)} className="font-medium text-gray-900 dark:text-white hover:text-green-500 dark:hover:text-green-400 cursor-pointer">{entry.user}</button>
                            </div>
                            <div className="w-2/6 text-right font-mono text-gray-900 dark:text-white">{entry.sessions}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}