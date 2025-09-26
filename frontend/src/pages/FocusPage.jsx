import React, { useState, useEffect } from 'react';

export default function FocusPage({ onExit, duration, onComplete }) {
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