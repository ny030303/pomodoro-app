import React, { useMemo, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { mockHeatmapData } from '../../constants/mockData';
import Heatmap from '../common/Heatmap';

export default function StatsTab({ statsData, isLoadingStats, fetchStatisticsData }) {
    // const heatmapData = useMemo(() => mockHeatmapData(), []);
    // const chartData = {
    //     days: [ {day: '월', val: 5}, {day: '화', val: 7}, {day: '수', val: 4}, {day: '목', val: 8}, {day: '금', val: 6}, {day: '토', val: 2}, {day: '일', val: 3} ],
    //     hours: [ {hour: '오전', val: 40}, {hour: '오후', val: 60}, {hour: '저녁', val: 80}, {hour: '밤', val: 30} ]
    // };
    // 🎯 [중요] 이 컴포넌트가 실제로 받은 props를 콘솔에 출력해봅니다.
    console.log('[StatsTab Debug] Received props:', { statsData, isLoadingStats });
    // ✅ 2. 이 컴포넌트가 처음 렌더링될 때, 데이터 조회를 시작하도록 요청합니다.
    useEffect(() => {
        fetchStatisticsData();
    }, [fetchStatisticsData]); // fetchStatisticsData는 useCallback으로 생성되어 한번만 실행됩니다.

    // ✅ 3. 로딩 중일 때 보여줄 UI
    if (isLoadingStats) {
        return <div className="text-center p-8">통계 데이터를 불러오는 중입니다... 🌀</div>
    }

    return (
        <div className="w-full space-y-8">
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">집중 히트맵</h3>
                {/* <Heatmap data={heatmapData} /> */}
                {/* ✅ 4. 목업 데이터 대신 props로 받은 실제 히트맵 데이터를 사용합니다. */}
                <Heatmap data={statsData.heatmap} />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">상세 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">요일별 집중 시간</h4>
                        <div className="flex justify-around items-end h-48">
                            {/* {chartData.days.map(d => (
                                <div key={d.day} className="flex flex-col items-center">
                                    <div className="w-8 bg-green-500 dark:bg-green-400 rounded-t-sm hover:bg-green-400 dark:hover:bg-green-300 transition-colors" style={{height: `${d.val * 12}%`}}></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{d.day}</span>
                                </div>
                            ))} */}
                            {/* ✅ 5. 목업 데이터 대신 props로 받은 실제 차트 데이터를 사용합니다. */}
                            {statsData.charts.days.map(d => (
                                <div key={d.day} className="flex flex-col items-center">
                                    <div className="w-8 bg-green-500 dark:bg-green-400 rounded-t-sm hover:bg-green-400 dark:hover:bg-green-300 transition-colors"
                                        style={{ height: `${d.val * 0.4}rem` }}
                                    ></div>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <Lock size={32} className="text-white/80 mb-2" />
                            <span className="text-white font-bold text-lg">Premium</span>
                            <button className="mt-4 bg-green-500 text-white text-sm font-semibold py-2 px-4 rounded-full hover:bg-green-400 transition-colors">
                                업그레이드
                            </button>
                        </div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">가장 집중이 잘되는 시간대</h4>
                        <div className="flex justify-around items-end h-48">
                            {/* {statsData.charts.days.map(d => (
                                <div key={d.day} className="flex flex-col items-center">
                                     <div className="w-10 bg-green-500/50 dark:bg-green-400/50 rounded-t-sm" style={{height: `${h.val}%`}}></div>
                                     <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{h.hour}</span>
                                </div>
                            ))} */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}