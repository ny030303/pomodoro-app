import React, { useState, useEffect, useMemo } from 'react';

// --- Solana Wallet Adapter Imports ---
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { usePomodoroData } from './hooks/usePomodoroData'; // Custom Hook

// --- Component & Asset Imports ---
import { CheckCircle } from 'lucide-react';
import { initialRecentActivity } from './constants/mockData';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FocusPage from './pages/FocusPage';
import ProfilePage from './pages/ProfilePage';
import ThemeToggle from './components/layout/ThemeToggle';
import Modal from './components/common/Modal';
import { logEffortOnChain } from './lib/api';

// --- CSS Imports ---
import '@solana/wallet-adapter-react-ui/styles.css';

// This component contains the core application logic.
function AppContent() {
  // --- Hooks ---
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { effortBalance, onChainActivity, isLoadingData, statsData, isLoadingStats, refetchData, fetchStatisticsData, purchaseItemClient } = usePomodoroData(initialRecentActivity);
  
  // --- State ---
  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('dashboard');
  const [profileUser, setProfileUser] = useState(null);
  const [timerMode, setTimerMode] = useState('focus');
  const [focusDuration, setFocusDuration] = useState(25 * 60); // 25 minutes
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(8); // Example initial value
  const [weeklyGoal, setWeeklyGoal] = useState(20); // Example initial value

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleStartFocus = (duration) => {
    setFocusDuration(duration);
    setCurrentView('focus');
  };

  const handleExitFocus = () => setCurrentView('dashboard');

  const handleSessionComplete = async () => {
    const sessionType = timerMode;
    console.log(`sessionType: ${sessionType}`);
    if (sessionType === 'focus') {
      if (!publicKey) {
        alert("Please connect your wallet to prove your effort.");
        return;
      }

      try {
        const result = await logEffortOnChain(publicKey.toBase58()); // ✅ Corrected typo here
        console.log('API response successful, signature:', result.signature);

        console.log("Waiting for transaction to be confirmed...");
        await connection.confirmTransaction(result.signature, 'confirmed');
        console.log("Transaction confirmed!");

        await refetchData();

        setPomodoroCount(prev => prev + 1);
        setCompletedSessions(prev => prev + 1);

      } catch (error) {
        console.error("Failed to log effort:", error);
        alert(`Failed to log effort: ${error.message}`);
        return;
      }
    }

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
  };

  const renderContent = () => {
    if (!connected) { return <LoginPage />; }

    switch (currentView) {
      case 'focus':
        return <FocusPage onExit={handleExitFocus} duration={focusDuration} onComplete={handleSessionComplete} />;
      case 'profile':
        return <ProfilePage user={profileUser} onBack={handleBackToLeaderboard} />;
      case 'dashboard':
      default:
        return <DashboardPage
          handleStartFocus={handleStartFocus}
          onProfileView={handleViewProfile}
          timerMode={timerMode}
          setTimerMode={setTimerMode}
          completedSessions={completedSessions}
          weeklyGoal={weeklyGoal}
          recentActivity={onChainActivity}
          effortBalance={effortBalance}
          isLoadingData={isLoadingData}
          statsData={statsData} // ⬅️ 추가
          isLoadingStats={isLoadingStats} // ⬅️ 추가
          fetchStatisticsData={fetchStatisticsData} // ⬅️ 추가
          purchaseItemClient={purchaseItemClient}
        />;
    }
  };

  return (
    <main className="bg-gray-100 dark:bg-gray-900 dark:bg-gradient-to-tr dark:from-gray-900 dark:to-slate-800 text-gray-900 dark:text-white min-h-screen font-sans transition-colors duration-300">
      {connected && <ThemeToggle theme={theme} setTheme={setTheme} />}
      <div className="w-full h-full">
        {renderContent()}
        {showCompletionModal && (
          <Modal onClose={() => setShowCompletionModal(false)}>
            <CheckCircle size={60} className="text-green-500 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Complete!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Great work! Time for a well-deserved break.</p>
            <button onClick={handleStartNext} className="bg-green-500 dark:bg-green-400 text-white dark:text-gray-900 py-3 px-8 rounded-lg w-full font-semibold hover:bg-green-600 dark:hover:bg-green-500">
              {timerMode === 'focus' ? 'Start Break' : 'Start Next Focus'}
            </button>
          </Modal>
        )}
      </div>
    </main>
  );
}

// The top-level component that sets up the wallet providers.
export default function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => import.meta.env.VITE_SOLANA_RPC_HOST, []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}