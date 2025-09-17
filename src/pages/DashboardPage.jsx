import React, { useState } from 'react';
import { Play, BarChart2, Award, Users } from 'lucide-react';
import TimerTab from '../components/dashboard/TimerTab';
import StatsTab from '../components/dashboard/StatsTab';
import AchievementsTab from '../components/dashboard/AchievementsTab';
import LeaderboardTab from '../components/dashboard/LeaderboardTab';

export default function DashboardPage({ onStart, onProfileView, timerMode, setTimerMode, completedSessions, weeklyGoal, recentActivity }) {
    const [activeTab, setActiveTab] = useState('timer');

    const tabs = [
      { id: 'timer', label: '타이머', icon: Play },
      { id: 'stats', label: '통계', icon: BarChart2 },
      { id: 'achievements', label: '업적', icon: Award },
      { id: 'leaderboard', label: '리더보드', icon: Users },
    ];

    return (
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-8">
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
      </div>
    );
};