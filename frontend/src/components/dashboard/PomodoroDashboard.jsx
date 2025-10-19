// src/components/dashboard/PomodoroDashboard.jsx

import React, { useState } from 'react';
import { Play, BarChart2, Award, Users } from 'lucide-react';

import TimerTab from './TimerTab';
import StatsTab from './StatsTab';
import AchievementsTab from './AchievementsTab';
import LeaderboardTab from './LeaderboardTab';

const PomodoroDashboard = ({ handleStartFocus, onProfileView, timerMode, setTimerMode, completedSessions, weeklyGoal, recentActivity, effortBalance, isLoadingData, statsData, isLoadingStats, fetchStatisticsData}) => {
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
                {activeTab === 'timer' && <TimerTab
                    handleStartFocus={handleStartFocus}
                    timerMode={timerMode}
                    setTimerMode={setTimerMode}
                    completedSessions={completedSessions}
                    weeklyGoal={weeklyGoal}
                    recentActivity={recentActivity}
                    effortBalance={effortBalance}
                    isLoading={isLoadingData}
                />}
                {activeTab === 'stats' && <StatsTab
                    statsData={statsData}
                    isLoadingStats={isLoadingStats}
                    fetchStatisticsData={fetchStatisticsData}
                />}
                {activeTab === 'achievements' && <AchievementsTab />}
                {activeTab === 'leaderboard' && <LeaderboardTab onProfileView={onProfileView} />}
            </div>
        </>
    );
};

export default PomodoroDashboard;