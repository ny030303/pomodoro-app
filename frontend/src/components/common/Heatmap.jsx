// src/components/common/Heatmap.jsx (최종 수정본)

import React, { useMemo } from 'react';
import Tooltip from './Tooltip';

export default function Heatmap({ data }) {
    // ✅ 1. 전달받은 data 배열을 빠른 조회를 위한 Map 형태로 변환합니다.
    // 이 작업은 data가 변경될 때만 실행됩니다.
    const dataMap = useMemo(() => {
        const map = new Map();
        if (data) {
            data.forEach(item => {
                map.set(item.date, item.count);
            });
        }
        return map;
    }, [data]);

    // --- (아래 코드는 기존과 동일) ---
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
                        // ✅ 2. 변환된 Map에서 효율적으로 count를 가져옵니다.
                        const count = dataMap.get(dateString) || 0;
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