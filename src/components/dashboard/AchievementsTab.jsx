import React, { useState } from 'react';
import { Award } from 'lucide-react';
import { mockAchievements } from '../../constants/mockData';
import Modal from '../common/Modal';

export default function AchievementsTab() {
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
                    <div className="text-left bg-gray-200 dark:bg-gray-700 p-4 rounded-lg space-y-2 mb-4">
                        <p className="text-sm text-gray-800 dark:text-gray-200"><strong>획득일:</strong> {selectedAch.date}</p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 break-all"><strong>트랜잭션:</strong> <a href="#" className="text-green-600 dark:text-green-400 hover:underline">{selectedAch.tx}</a></p>
                    </div>
                     <button className="w-full bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 font-semibold py-3 px-4 rounded-lg cursor-not-allowed">
                        마켓플레이스에 등록 (준비 중)
                    </button>
                </Modal>
            )}
        </div>
    );
};