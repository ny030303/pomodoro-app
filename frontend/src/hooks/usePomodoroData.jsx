// src/hooks/usePomodoroData.js (최종 수정본)

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';

const EFFORT_TOKEN_MINT_ADDRESS = new PublicKey(import.meta.env.VITE_EFFORT_TOKEN_MINT_ADDRESS);
const PROVENANCE_PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROVENANCE_PROGRAM_ID);

export const usePomodoroData = (initialActivity) => {
    const { publicKey } = useWallet();
    const { connection } = useConnection();

    // --- 모든 상태를 한 곳에서 관리 ---
    const [effortBalance, setEffortBalance] = useState(0);
    const [onChainActivity, setOnChainActivity] = useState(initialActivity);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [statsData, setStatsData] = useState({ heatmap: [], charts: { days: [], hours: [] } });
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // ✅ 1. '최근 활동'과 '잔액'을 가져오는 로직을 하나의 함수로 통합하고 useCallback으로 감쌉니다.
    const fetchRecentData = useCallback(async () => {
        if (!publicKey || !connection) {
            setIsLoadingData(false);
            return;
        }
        setIsLoadingData(true);
        
        try {
            // 잔액 조회
            const userTokenAccount = getAssociatedTokenAddressSync(EFFORT_TOKEN_MINT_ADDRESS, publicKey);
            const balance = await connection.getTokenAccountBalance(userTokenAccount);
            setEffortBalance(parseFloat(balance.value.uiAmountString || '0'));
        } catch (error) {
            setEffortBalance(0);
        }

        try {
            // 최근 트랜잭션 20개 조회
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
            const validSignatures = signatures.filter(s => !s.err);
            const transactions = await connection.getParsedTransactions(validSignatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });

            const effortTransactions = transactions
                .filter(tx => tx && tx.transaction.message.instructions.some(ix => ix.programId.equals(PROVENANCE_PROGRAM_ID)))
                .map(tx => ({
                    id: tx.transaction.signatures[0],
                    text: "집중 완료. 온체인에 노력이 증명되었습니다.",
                    link: `https://explorer.solana.com/tx/${tx.transaction.signatures[0]}?cluster=custom&customUrl=${encodeURIComponent(import.meta.env.VITE_SOLANA_RPC_HOST)}`,
                    timestamp: new Date((tx.blockTime || 0) * 1000)
                }));
            
            setOnChainActivity(effortTransactions.slice(0, 5));
        } catch (error) {
            console.error("트랜잭션 내역 조회 실패:", error);
            setOnChainActivity(initialActivity);
        } finally {
            setIsLoadingData(false);
        }
    }, [publicKey, connection, initialActivity]);


    // ✅ 2. '통계' 데이터를 가져오는 함수도 useCallback으로 감싸서 안정성을 높입니다.
    const fetchStatisticsData = useCallback(async () => {
        if (!publicKey || !connection) return;
        setIsLoadingStats(true);

        try {
            console.log("[Stats Debug] Fetching up to 1000 transactions for statistics...");
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
            const validSignatures = signatures.filter(s => !s.err);
            const transactions = await connection.getParsedTransactions(validSignatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });
            
            console.log(`[Stats Debug] Found ${transactions.length} total transactions.`);

            const effortTimestamps = transactions
                .filter(tx => tx && tx.transaction.message.instructions.some(ix => ix.programId.equals(PROVENANCE_PROGRAM_ID)))
                .map(tx => new Date((tx.blockTime || 0) * 1000));
            
            console.log(`[Stats Debug] Filtered down to ${effortTimestamps.length} effort transactions.`);

            // --- 데이터 가공 로직 ---
            const heatmap = {};
            const days = Array(7).fill(0);
            const hours = { '오전': 0, '오후': 0, '저녁': 0, '밤': 0 };

            effortTimestamps.forEach(ts => {
                const dateKey = ts.toISOString().split('T')[0];
                heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
                days[ts.getDay()]++;
                const hour = ts.getHours();
                if (hour >= 6 && hour < 12) hours['오전']++;
                else if (hour >= 12 && hour < 18) hours['오후']++;
                else if (hour >= 18 && hour < 24) hours['저녁']++;
                else hours['밤']++;
            });
            // ✅ 최종적으로 상태에 저장될 객체를 만듭니다.
            const finalStatsObject = {
                heatmap: Object.entries(heatmap).map(([date, count]) => ({ date, count })),
                charts: {
                    days: ['일', '월', '화', '수', '목', '금', '토'].map((day, i) => ({ day, val: days[i] })),
                    hours: Object.entries(hours).map(([hour, val]) => ({ hour, val })),
                }
            };

            // 🎯 [중요] 이 로그를 추가해서 최종 결과물을 확인합니다!
            console.log("[Stats Debug] Final processed data to be rendered:", JSON.stringify(finalStatsObject, null, 2));
            
            setStatsData(finalStatsObject);
        } catch (error) {
            console.error("통계 데이터 조회 실패:", error);
        } finally {
            setIsLoadingStats(false);
        }
    }, [publicKey, connection]);

    // ✅ 3. 컴포넌트가 처음 마운트되거나 지갑이 바뀔 때 '최근 데이터'를 자동으로 불러옵니다.
    useEffect(() => {
        fetchRecentData();
    }, [fetchRecentData]); // fetchRecentData는 useCallback으로 감싸져 있어 publicKey/connection이 바뀔 때만 변경됩니다.

    // ✅ 4. 모든 상태와 함수를 깔끔하게 반환합니다.
    return { 
        effortBalance, 
        onChainActivity, 
        isLoadingData, 
        statsData,
        isLoadingStats,
        refetchData: fetchRecentData, // refetchData가 이제 올바른 함수를 가리킵니다.
        fetchStatisticsData 
    };
};