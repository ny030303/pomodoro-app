import React, { useState, useEffect } from 'react';

export default function FocusPage({ onExit, duration, onComplete }) {
    const [time, setTime] = useState(duration);
    const [showExitPopup, setShowExitPopup] = useState(false);
    // ✅ 1. 완료 처리가 이미 실행되었는지 추적하는 상태 변수 추가
    const [isCompleted, setIsCompleted] = useState(false);

    // ✅ 2. 타이머 로직을 위한 useEffect (컴포넌트 마운트 시 한 번만 실행)
    useEffect(() => {
        // 타이머를 생성하고, 1초마다 시간을 1씩 감소시킴
        const timerId = setInterval(() => {
            setTime(prevTime => prevTime - 1);
        }, 1000);

        // 컴포넌트가 언마운트될 때 타이머를 정리(clean-up)
        return () => clearInterval(timerId);
    }, []); // 의존성 배열을 비워서 최초 렌더링 시에만 실행되도록 함

    // ✅ 3. 시간이 다 되었는지 감지하는 별도의 useEffect
    useEffect(() => {
        // 시간이 0 이하가 되었고, "아직 완료 처리를 한 적이 없다면"
        if (time <= 0 && !isCompleted) {
            console.log("Timer finished. Calling onComplete...");
            // 완료 처리를 했다고 표시 (무한 루프 방지)
            setIsCompleted(true);
            // 부모 컴포넌트의 완료 함수를 "딱 한 번만" 호출
            onComplete();
        }
    }, [time, onComplete, isCompleted]); // 이 변수들이 바뀔 때마다 검사


    // ESC 키 이벤트 리스너 (기존 코드와 동일)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowExitPopup(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 렌더링 로직 (기존 코드와 거의 동일)
    // 💡 time이 음수가 되지 않도록 Math.max(0, time) 사용
    const safeTime = Math.max(0, time);
    const minutes = Math.floor(safeTime / 60).toString().padStart(2, '0');
    const seconds = (safeTime % 60).toString().padStart(2, '0');
    const progress = ((duration - safeTime) / duration) * 301.59;

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
                              <button onClick={() => setShowExitPopup(false)} className="bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white py-2 px-6 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 w-full">유지</button>
                              <button onClick={onExit} className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-500 w-full">포기</button>
                          </div>
                      </div>
                  </div>
            )}
        </div>
    );
};