import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Play, BarChart2, Award, Users, X, Link, Sun, Moon, CheckCircle } from 'lucide-react';

// --- MOCK DATA --- //
const initialRecentActivity = [
  { id: 1, text: "25분 집중 완료. 솔라나에 증명 기록됨.", link: "https://solscan.io/", timestamp: new Date(Date.now() - 3600 * 1000 * 2) },
  { id: 2, text: "5분 휴식 완료.", link: null, timestamp: new Date(Date.now() - 3600 * 1000 * 2.5) },
  { id: 3, text: "25분 집중 완료. 솔라나에 증명 기록됨.", link: "https://solscan.io/", timestamp: new Date(Date.now() - 3600 * 1000 * 5) },
  { id: 4, text: "업적 달성: 첫 10 뽀모도로!", link: null, timestamp: new Date(Date.now() - 3600 * 1000 * 24) },
  { id: 5, text: "25분 집중 완료. 솔라나에 증명 기록됨.", link: "https://solscan.io/", timestamp: new Date(Date.now() - 3600 * 1000 * 48) },
];

const mockAchievements = [
  { id: 1, title: "첫 발걸음", description: "첫 뽀모도로 세션을 완료했습니다.", earned: true, date: "2023-10-01", tx: "4sf...j9x" },
  { id: 2, title: "집중의 맛", description: "첫 10 뽀모도로를 달성했습니다.", earned: true, date: "2023-10-03", tx: "8as...k2p" },
  { id: 3, title: "꾸준함의 증표", description: "연속 7일 집중했습니다.", earned: true, date: "2023-10-07", tx: "9df...l5o" },
  { id: 4, title: "마라토너", description: "하루에 8 세션을 완료했습니다.", earned: false, date: null, tx: null },
  { id: 5, title: "블록체인 탐험가", description: "총 50개의 증명을 블록체인에 기록했습니다.", earned: false, date: null, tx: null },
  { id: 6, title: "주간 목표 챔피언", description: "주간 목표를 4주 연속 달성했습니다.", earned: false, date: null, tx: null },
];

const mockLeaderboard = [
  { rank: 1, user: "5x...7yZ", sessions: 184 },
  { rank: 2, user: "9A...c3F", sessions: 172 },
  { rank: 3, user: "user.sol", sessions: 155 },
  { rank: 4, user: "YOU", sessions: 140 },
  { rank: 5, user: "3p...q8R", sessions: 121 },
  { rank: 6, user: "hJ...mN2", sessions: 98 },
  { rank: 7, user: "kL...tY9", sessions: 85 },
];

const mockHeatmapData = () => {
  const data = {};
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    data[dateString] = Math.floor(Math.random() * 8);
  }
  return data;
};

const TIMER_CONFIG = {
    focus: { duration: 25 * 60, label: "Focus" },
    shortBreak: { duration: 5 * 60, label: "Short Break" },
    longBreak: { duration: 15 * 60, label: "Long Break" },
};

const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "방금 전";
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "달 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    return Math.floor(seconds) + "초 전";
};


// --- HELPER COMPONENTS --- //

const PhantomIcon = () => (
    <svg width="24" height="24" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M25.6822 4.16797C23.5064 2.1333 20.6133 1.01562 17.6114 1.01562C11.6075 1.01562 6.78613 5.83696 6.78613 11.8409V22.2854C6.78613 22.8858 7.26827 23.3679 7.86867 23.3679H12.2013C12.8017 23.3679 13.2838 22.8858 13.2838 22.2854V11.8409C13.2838 9.0792 15.1887 6.87791 17.72 6.87791C18.9958 6.87791 20.1042 7.42345 20.8906 8.35262C21.6225 9.22731 22.0435 10.3357 22.0435 11.564V28.9882C22.0435 29.5886 21.5614 30.0707 20.961 30.0707H16.6284C16.028 30.0707 15.5458 29.5886 15.5458 28.9882V17.8488C15.5458 17.2484 15.0637 16.7662 14.4633 16.7662C13.8629 16.7662 13.3807 17.2484 13.3807 17.8488V28.9882C13.3807 30.7499 14.8454 32.2146 16.607 32.2146H20.9824C22.744 32.2146 24.2087 30.7499 24.2087 28.9882V11.5854C24.2087 9.82373 24.9192 8.21045 26.1124 7.03867C27.327 5.84551 28.9403 5.15625 30.6449 5.15625C33.4066 5.15625 35.6292 7.37884 35.6292 10.1405V20.585C35.6292 21.1854 35.1471 21.6675 34.5467 21.6675H30.2141C29.6137 21.6675 29.1315 21.1854 29.1315 20.585V10.1405C29.1315 8.52722 27.8384 7.3126 26.2251 7.3126C25.925 7.3126 25.6248 7.35547 25.3461 7.44118C23.9068 7.89362 23.0854 9.24845 23.0854 10.7409V30.6905C23.0854 34.9327 26.6348 38.4821 30.877 38.4821C35.1192 38.4821 38.6686 34.9327 38.6686 30.6905V10.1405C38.6686 6.07428 35.2536 1.76302 30.9327 1.05846C29.1711 0.73626 27.4094 1.48666 25.6822 4.16797Z" fill="#A955FF"/>
    </svg>
);

const Modal = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X size={24} />
            </button>
            {children}
        </div>
    </div>
);

const Tooltip = ({ text, children }) => (
  <div className="relative group flex items-center">
    {children}
    <div className="absolute bottom-full mb-2 w-max bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      {text}
    </div>
  </div>
);

const Heatmap = ({ data }) => {
    const days = useMemo(() => {
        const dayArray = [];
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 364);
        for (let i = 0; i < 365; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dayArray.push(date);
        }
        return dayArray;
    }, []);
    
    const getColor = (count) => {
        if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
        if (count <= 2) return 'bg-green-200 dark:bg-green-800';
        if (count <= 4) return 'bg-green-400 dark:bg-green-600';
        if (count <= 6) return 'bg-green-600 dark:bg-green-400';
        return 'bg-green-700 dark:bg-green-300';
    };

    const dayNames = ['월', '수', '금'];

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-full overflow-x-auto">
            <div className="flex justify-start items-end gap-1" style={{direction: 'ltr'}}>
                <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400 mr-2 shrink-0">
                    {dayNames.map((day, i) => <div key={day} className="h-4 leading-4" style={{marginTop: i > 0 ? '1rem' : 0}}>{day}</div>)}
                </div>
                <div className="grid grid-flow-col grid-rows-7 gap-1">
                    {days.map((date, i) => {
                        const dateString = date.toISOString().split('T')[0];
                        const count = data[dateString] || 0;
                        return (
                            <Tooltip key={i} text={`${count} sessions on ${dateString}`}>
                                <div className={`w-4 h-4 rounded-sm ${getColor(count)}`}></div>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// --- UI SECTIONS --- //
const AnimatedCheck = () => (
    <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 52 52">
        <circle className="stroke-current text-green-500/30 dark:text-green-400/30" cx="26" cy="26" r="25" fill="none" strokeWidth="4"/>
        <path className="stroke-current text-green-500 dark:text-green-400 checkmark-path" fill="none" strokeWidth="5" strokeLinecap="round" d="M14 27l5 5 16-16"/>
        <style>{`
            .checkmark-path {
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: draw 0.4s 0.2s ease-out forwards;
            }
            @keyframes draw {
                to {
                    stroke-dashoffset: 0;
                }
            }
        `}</style>
    </svg>
);


const WalletConnectModal = ({ onClose, onLoginSuccess }) => {
    const [status, setStatus] = useState('selection'); // 'selection', 'connecting', 'signing', 'success'

    useEffect(() => {
        if (status === 'connecting') {
            const timer = setTimeout(() => setStatus('signing'), 2000);
            return () => clearTimeout(timer);
        }
        if (status === 'signing') {
            const timer = setTimeout(() => setStatus('success'), 2000);
            return () => clearTimeout(timer);
        }
        if (status === 'success') {
            const timer = setTimeout(() => {
                onLoginSuccess();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, onLoginSuccess]);

    const renderContent = () => {
        switch (status) {
            case 'connecting':
                return (
                    <div className="text-center">
                        <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                            <div className="absolute animate-spin rounded-full h-full w-full border-t-2 border-b-2 border-green-500 dark:border-green-400"></div>
                            <PhantomIcon />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">지갑 연결 중...</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">지갑에서 연결을 승인해주세요.</p>
                    </div>
                );
            case 'signing':
                return (
                    <div className="text-center">
                         <div className="animate-pulse mx-auto mb-6 w-16 h-16 flex justify-center items-center">
                             <div style={{ transform: 'scale(2)'}}>
                                <PhantomIcon />
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">서명을 요청합니다</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">로그인을 위해 서명을 완료해주세요.</p>
                    </div>
                );
            case 'success':
                 return (
                    <div className="text-center">
                        <AnimatedCheck />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">연결 성공!</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">대시보드로 이동합니다.</p>
                    </div>
                );
            case 'selection':
            default:
                return (
                    <>
                        <button onClick={() => setStatus('connecting')} className="w-full flex items-center p-4 rounded-xl bg-gray-200/50 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <PhantomIcon />
                            <span className="ml-4 font-semibold text-gray-900 dark:text-white">Phantom</span>
                        </button>
                    </>
                );
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="relative p-8 rounded-3xl max-w-sm w-full bg-white dark:bg-slate-800 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {status === 'selection' ? '연결할 지갑 선택' : '지갑 연결'}
                    </h3>
                </div>
                <div className="min-h-[150px] flex flex-col justify-center">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};


const LoginScreen = ({ onLogin }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
  
    const handleLogin = () => {
        setIsModalOpen(true);
    };
  
    const handleLoginSuccess = () => {
        setIsModalOpen(false);
        onLogin();
    };

    return (
        <>
            <div className="w-full h-full flex flex-col justify-center items-center text-center p-8">
                <div className="relative p-8 sm:p-12 rounded-3xl max-w-lg w-full bg-white dark:bg-slate-800 shadow-2xl">
                    <div className="mb-8">
                        <svg width="0" height="0" style={{ position: 'absolute' }}>
                          <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" className="text-green-400" stopColor="currentColor" />
                              <stop offset="100%" className="text-green-500" stopColor="currentColor" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <svg className="w-24 h-24 mx-auto animate-pulse" viewBox="0 0 24 24" fill="none" stroke="url(#logoGradient)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                            <path d="M3 12a9 9 0 0 0 11.23 8.814"/>
                            <path d="M12 3a9 9 0 0 1 5.766 15.82"/>
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Proof of Effort</h1>
                    {/* <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">당신의 노력을 블록체인에 증명하세요.</p> */}
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-12"></p>
                    <button 
                        onClick={handleLogin}
                        className="bg-gradient-to-br from-green-400 to-green-500 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/40 transform hover:-translate-y-1"
                    >
                        Connect Wallet & Sign In
                    </button>
                </div>
            </div>
            {isModalOpen && <WalletConnectModal onClose={() => setIsModalOpen(false)} onLoginSuccess={handleLoginSuccess} />}
        </>
    );
};

const TimerTab = ({ onStart, timerMode, setTimerMode, completedSessions, weeklyGoal, recentActivity }) => {
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
                        <span>주간 목표</span>
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

const StatsTab = () => {
  const heatmapData = useMemo(() => mockHeatmapData(), []);
  const chartData = {
      days: [ {day: '월', val: 5}, {day: '화', val: 7}, {day: '수', val: 4}, {day: '목', val: 8}, {day: '금', val: 6}, {day: '토', val: 2}, {day: '일', val: 3} ],
      hours: [ {hour: '오전', val: 40}, {hour: '오후', val: 60}, {hour: '저녁', val: 80}, {hour: '밤', val: 30} ]
  };

  return (
    <div className="w-full space-y-8">
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">집중 히트맵</h3>
            <Heatmap data={heatmapData} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">상세 분석</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">요일별 집중 시간</h4>
                    <div className="flex justify-around items-end h-48">
                        {chartData.days.map(d => (
                            <div key={d.day} className="flex flex-col items-center">
                                <div className="w-8 bg-green-500 dark:bg-green-400 rounded-t-sm hover:bg-green-400 dark:hover:bg-green-300 transition-colors" style={{height: `${d.val * 12}%`}}></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{d.day}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">가장 집중이 잘되는 시간대</h4>
                    <div className="flex justify-around items-end h-48">
                        {chartData.hours.map(h => (
                             <div key={h.hour} className="flex flex-col items-center">
                                <div className="w-10 bg-green-500 dark:bg-green-400 rounded-t-sm hover:bg-green-400 dark:hover:bg-green-300 transition-colors" style={{height: `${h.val}%`}}></div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{h.hour}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
};

const AchievementsTab = () => {
    const [selectedAch, setSelectedAch] = useState(null);

    return (
        <div className="w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">업적 갤러리</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {mockAchievements.map(ach => (
                    <div key={ach.id} onClick={() => ach.earned && setSelectedAch(ach)} className={`bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex flex-col items-center text-center transition-all duration-300 ${ach.earned ? 'opacity-100 cursor-pointer hover:scale-105' : 'opacity-40 grayscale'}`}>
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${ach.earned ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-600'}`}>
                            <Award size={40} className={`${ach.earned ? 'text-white dark:text-gray-900' : 'text-gray-400'}`} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-md mb-1">{ach.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{ach.description}</p>
                    </div>
                ))}
            </div>
            {selectedAch && (
                <Modal onClose={() => setSelectedAch(null)}>
                    <div className="bg-green-500 dark:bg-green-400 w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Award size={50} className="text-white dark:text-gray-900" />
                    </div>
                    <h3 className="text-2xl text-gray-900 dark:text-white font-bold mb-2">{selectedAch.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedAch.description}</p>
                    <div className="text-left bg-gray-200 dark:bg-gray-700 p-4 rounded-lg space-y-2">
                        <p className="text-sm text-gray-800 dark:text-gray-200"><strong>획득일:</strong> {selectedAch.date}</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-all"><strong>트랜잭션:</strong> <a href="#" className="text-green-600 dark:text-green-400 hover:underline">{selectedAch.tx}</a></p>
                    </div>
                </Modal>
            )}
        </div>
    );
};


const LeaderboardTab = ({ onProfileView }) => (
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


const Dashboard = ({ onStart, onProfileView, timerMode, setTimerMode, completedSessions, weeklyGoal, recentActivity }) => {
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

const FocusScreen = ({ onExit, duration, onComplete }) => {
    const [time, setTime] = useState(duration);
    const [showExitPopup, setShowExitPopup] = useState(false);

    useEffect(() => {
        if(time === 0) {
            onComplete();
            return;
        }
        const timer = setInterval(() => {
            setTime(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [time, onComplete]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowExitPopup(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    const progress = ((duration - time) / duration) * 301.59;

    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center z-50">
            <div className="relative w-80 h-80 md:w-96 md:h-96">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-200 dark:text-gray-800" strokeWidth="2" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50" />
                    <circle 
                        className="text-green-500 dark:text-green-400" 
                        strokeWidth="2" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="48" 
                        cx="50" 
                        cy="50" 
                        strokeDasharray="301.59" 
                        strokeDashoffset={progress}
                        strokeLinecap="round" 
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }} 
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-7xl md:text-9xl font-thin text-gray-900 dark:text-white font-mono">{minutes}:{seconds}</div>
                </div>
            </div>
            <p className="text-gray-400 dark:text-gray-500 mt-8">Press 'ESC' to exit focus mode.</p>
            
            {showExitPopup && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
                     <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
                         <h3 className="text-xl text-gray-900 dark:text-white font-bold mb-4">집중을 포기하시겠습니까?</h3>
                         <p className="text-gray-500 dark:text-gray-400 mb-8">현재 세션은 저장되지 않습니다.</p>
                         <div className="flex gap-4">
                             <button onClick={() => setShowExitPopup(false)} className="bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-2 px-6 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 w-full">계속 집중</button>
                             <button onClick={onExit} className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-500 w-full">포기</button>
                         </div>
                     </div>
                 </div>
            )}
        </div>
    );
};

const ProfilePage = ({ user, onBack }) => {
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

const ThemeToggle = ({ theme, setTheme }) => {
    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    return (
        <button onClick={toggleTheme} className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
};


export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'focus', 'profile'
  const [profileUser, setProfileUser] = useState(null);
  const [timerMode, setTimerMode] = useState('focus');
  const [focusDuration, setFocusDuration] = useState(25 * 60);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(8);
  const [weeklyGoal, setWeeklyGoal] = useState(20);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);


  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLogin = () => setIsLoggedIn(true);
  
  const handleStartFocus = (duration) => {
    setFocusDuration(duration);
    setCurrentView('focus');
  };

  const handleExitFocus = () => setCurrentView('dashboard');
  
  const handleSessionComplete = () => {
      let newActivityText = "";
      let sessionType = timerMode;

      if (sessionType === 'focus') {
          setPomodoroCount(prev => prev + 1);
          setCompletedSessions(prev => prev + 1);
          newActivityText = "25분 집중 완료. 솔라나에 증명 기록됨.";
      } else if (sessionType === 'shortBreak') {
          newActivityText = "5분 휴식 완료.";
      } else if (sessionType === 'longBreak') {
          newActivityText = "15분 휴식 완료.";
      }

      const newActivity = {
          id: Date.now(),
          text: newActivityText,
          link: sessionType === 'focus' ? "https://solscan.io/" : null,
          timestamp: new Date()
      };
      
      setRecentActivity(prev => [newActivity, ...prev].slice(0, 5));
      setShowCompletionModal(true);
  };
  
  const handleStartNext = () => {
      const nextMode = timerMode === 'focus'
        ? (pomodoroCount + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
        : 'focus';
      setTimerMode(nextMode);
      setShowCompletionModal(false);
      setCurrentView('dashboard');
  };
  
  const handleViewProfile = (user) => {
    setProfileUser(user);
    setCurrentView('profile');
  };

  const handleBackToLeaderboard = () => {
    setCurrentView('dashboard');
  }

  const renderContent = () => {
      if (!isLoggedIn) {
          return <LoginScreen onLogin={handleLogin} />;
      }
      switch (currentView) {
          case 'focus':
              return <FocusScreen onExit={handleExitFocus} duration={focusDuration} onComplete={handleSessionComplete} />;
          case 'profile':
              return <ProfilePage user={profileUser} onBack={handleBackToLeaderboard} />;
          case 'dashboard':
          default:
              return <Dashboard onStart={handleStartFocus} onProfileView={handleViewProfile} timerMode={timerMode} setTimerMode={setTimerMode} completedSessions={completedSessions} weeklyGoal={weeklyGoal} recentActivity={recentActivity} />;
      }
  };

  return (
    <main className="bg-gray-100 dark:bg-gray-900 dark:bg-gradient-to-tr dark:from-gray-900 dark:to-slate-800 text-gray-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
      {isLoggedIn && <ThemeToggle theme={theme} setTheme={setTheme} />}
      <div className="w-full h-full">
          {renderContent()}
          {showCompletionModal && (
              <Modal onClose={() => setShowCompletionModal(false)}>
                  <CheckCircle size={60} className="text-green-500 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">세션 완료!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">수고하셨습니다. 이제 휴식을 취할 시간입니다.</p>
                  <button onClick={handleStartNext} className="bg-green-500 dark:bg-green-400 text-white dark:text-gray-900 py-3 px-8 rounded-lg w-full font-semibold hover:bg-green-600 dark:hover:bg-green-500">
                      {timerMode === 'focus' ? '휴식 시작하기' : '다음 집중 시작하기'}
                  </button>
              </Modal>
          )}
      </div>
    </main>
  );
}

