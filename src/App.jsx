import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { initialRecentActivity } from './constants/mockData';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FocusPage from './pages/FocusPage';
import ProfilePage from './pages/ProfilePage';
import ThemeToggle from './components/layout/ThemeToggle';
import Modal from './components/common/Modal';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
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
    // 실제 라우팅 환경에서는 navigate('/dashboard') 와 같이 처리합니다.
    // 여기서는 activeTab을 leaderboard로 설정하는 것이 더 적합할 수 있습니다.
    setCurrentView('dashboard');
  }

  const renderContent = () => {
      if (!isLoggedIn) {
          return <LoginPage onLogin={handleLogin} />;
      }
      switch (currentView) {
          case 'focus':
              return <FocusPage onExit={handleExitFocus} duration={focusDuration} onComplete={handleSessionComplete} />;
          case 'profile':
              return <ProfilePage user={profileUser} onBack={handleBackToLeaderboard} />;
          case 'dashboard':
          default:
              return <DashboardPage 
                        onStart={handleStartFocus} 
                        onProfileView={handleViewProfile} 
                        timerMode={timerMode} 
                        setTimerMode={setTimerMode} 
                        completedSessions={completedSessions} 
                        weeklyGoal={weeklyGoal} 
                        recentActivity={recentActivity} 
                     />;
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