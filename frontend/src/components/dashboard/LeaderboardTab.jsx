// src/components/dashboard/LeaderboardTab.js

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react'; // ⬅️ [신규] 'YOU' 표시를 위해 지갑 훅 임포트
// import { mockLeaderboard } from '../../constants/mockData'; // ⬅️ [제거] 목 데이터 임포트 제거

/**
 * 사용자 Pubkey를 축약해주는 헬퍼 함수
 */
const shortenAddress = (address, chars = 4) => {
  if (!address) return '';
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export default function LeaderboardTab({ onProfileView }) {
  // ⬅️ [신규] 실시간 데이터를 위한 State 추가
  const [ranking, setRanking] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ⬅️ [신규] 현재 사용자의 지갑 주소 가져오기
  const { publicKey } = useWallet();
  const userAddress = publicKey ? publicKey.toBase58() : null;

  // ⬅️ [신규] API 데이터 로딩을 위한 useEffect
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/ranking/weekly');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setRanking(data);
        setError(null);
      } catch (err) {
        console.error("랭킹 로드 실패:", err);
        setError("랭킹을 불러올 수 없습니다. 백엔드 서버를 확인하세요.");
      } finally {
        setIsLoading(false); // 로딩 완료
      }
    };

    setIsLoading(true); // 컴포넌트 마운트 시 로딩 시작
    fetchRanking();

    // 1분마다 랭킹 자동 갱신
    const intervalId = setInterval(fetchRanking, 60000);
    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 정리
  }, []); // [] - 마운트 시 1회 실행

  // --- [신규] 로딩 및 에러 상태 처리 ---
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 text-center dark:text-gray-300">
        리더보드 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 text-center text-red-500">
        {error}
      </div>
    );
  }
  // --- 여기까지 ---

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">리더보드</h3>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* 헤더 (기존과 동일) */}
        <div className="flex bg-gray-200 dark:bg-gray-700 p-3 text-sm font-semibold text-gray-600 dark:text-gray-300">
          <div className="w-1/6 text-center">순위</div>
          <div className="w-3/6">사용자</div>
          <div className="w-2/6 text-right">완료 세션</div>
        </div>

        {/* 랭킹 목록 (데이터 바인딩 수정) */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {ranking.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              아직 주간 랭킹 데이터가 없습니다.
            </div>
          ) : (
            // [수정] 'mockLeaderboard' 대신 'ranking' state 사용
            ranking.map(entry => {
              // [신규] API로 받은 유저 주소와 현재 지갑 주소 비교
              const isCurrentUser = userAddress && entry.user === userAddress;

              return (
                <div key={entry.rank} className={`flex items-center p-3 transition-colors ${
                  isCurrentUser // [수정] 'YOU' 대신 'isCurrentUser'로 하이라이트
                    ? 'bg-green-100 dark:bg-green-900/50'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                  <div className="w-1/6 text-center text-lg font-bold text-gray-700 dark:text-gray-300">
                    {entry.rank} {/* API 데이터 */}
                  </div>
                  <div className="w-3/6">
                    <button onClick={() => onProfileView(entry)} className="font-medium text-gray-900 dark:text-white hover:text-green-500 dark:hover:text-green-400 cursor-pointer">
                      {isCurrentUser ? "YOU" : shortenAddress(entry.user, 6)} {/* [수정] 랭킹 유저 표시 */}
                    </button>
                  </div>
                  <div className="w-2/6 text-right font-mono text-gray-900 dark:text-white">
                    {entry.totalSessions} {/* [수정] API 데이터 (sessions -> totalSessions) */}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}