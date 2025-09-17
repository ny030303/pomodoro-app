import React from 'react';
import { Link, Info } from 'lucide-react';
import { TIMER_CONFIG } from '../../constants';
import { formatTimeAgo } from '../../lib/utils';
import Tooltip from '../common/Tooltip';

export default function TimerTab({ onStart, timerMode, setTimerMode, completedSessions, weeklyGoal, recentActivity }) {
    const { duration, label } = TIMER_CONFIG[timerMode];
    const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');
    const timerModes = Object.keys(TIMER_CONFIG);

    return (
        <div className="flex flex-col items-center text-center w-full max-w-xl bg-gray-100 dark:bg-gray-800 p-6 sm:p-10 rounded-lg">
            <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full flex gap-2 mb-8">
                {timerModes.map(mode => (
                    <button 
                        key={mode} 
                        onClick={() => setTimerMode(mode)}
                        className={`py-2 px-6 rounded-full text-sm font-semibold transition-colors ${timerMode === mode ? 'bg-green-500 dark:bg-green-400 text-white dark:text-gray-900' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        {TIMER_CONFIG[mode].label}
                    </button>
                ))}
            </div>
            {/* Timer Circle */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200 dark:text-gray-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50" />
                    <circle className="text-green-500 dark:text-green-400" strokeWidth="4" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50" strokeDasharray="301.59" strokeDashoffset="0" strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white">{minutes}:{seconds}</div>
                    <div className="text-lg text-gray-500 dark:text-gray-400">{label}</div>
                </div>
            </div>
            <button onClick={() => onStart(duration)} className="bg-green-500 dark:bg-green-400 text-gray-900 font-bold py-4 px-16 rounded-lg text-xl transition-colors duration-200 hover:bg-green-600 dark:hover:bg-green-500">
                START
            </button>
            {/* Weekly Goal & Recent Activity Wrapper */}
            <div className="w-full max-w-md mt-8 space-y-8">
                {/* Weekly Goal */}
                <div>
                    <div className="flex justify-between items-center mb-2 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <span>주간 목표</span>
                            <Tooltip text="보상은 플랫폼 전체 수익의 30%로 조성된 보상 풀에서 지급되어 지속 가능하게 운영됩니다.">
                                <Info size={14} className="cursor-help" />
                            </Tooltip>
                        </div>
                        <span>{completedSessions} / {weeklyGoal} Sessions</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div className="bg-green-500 dark:bg-green-400 h-3 rounded-full" style={{ width: `${(completedSessions / weeklyGoal) * 100}%` }}></div>
                    </div>
                </div>
                {/* Recent Activity */}
                <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">최근 활동</h3>
                    <div className="space-y-3">
                        {recentActivity.map(activity => (
                            <div key={activity.id} className="bg-gray-200 dark:bg-gray-700/50 p-3 rounded-lg text-sm flex items-center justify-between transition-colors hover:bg-gray-300/80 dark:hover:bg-gray-700">
                                <span className="text-gray-800 dark:text-gray-300">{activity.text}</span>
                                <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(activity.timestamp)}</span>
                                    {activity.link && (
                                        <a href={activity.link} target="_blank" rel="noopener noreferrer" className="text-green-500 dark:text-green-400 hover:text-green-400 dark:hover:text-green-300">
                                            <Link size={16} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}