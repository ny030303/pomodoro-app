// src/hooks/usePomodoroData.js (최종 수정본)

import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Keypair, SystemProgram } from '@solana/web3.js';
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { AnchorProvider, Program, web3, BN } from '@coral-xyz/anchor';

import idl from '../../../programs/provenance_project/target/idl/provenance_project.json' with { type: 'json' }; // 💡 IDL 파일 경로
import { purchaseCreateTx } from '../lib/api';
const EFFORT_TOKEN_MINT_ADDRESS = new PublicKey(import.meta.env.VITE_EFFORT_TOKEN_MINT_ADDRESS);
const PROVENANCE_PROGRAM_ID = new PublicKey(import.meta.env.VITE_PROVENANCE_PROGRAM_ID);
const SERVER_AUTHORITY = new PublicKey(import.meta.env.VITE_SERVER_AUTHORITY_PUBKEY); // 서버 권한 계정
const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'); // Metaplex 프로그램

// NFT 메타데이터 PDA 계산 함수 예시
const getMetadataPDA = async (mint) => {
    const [pubkey] = await PublicKey.findProgramAddress(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
    return pubkey;
}

// 마스터 에디션 PDA 계산 함수 예시
const getMasterEditionPDA = async (mint) => {
    const [pubkey] = await PublicKey.findProgramAddress(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from('edition'),
        ],
        TOKEN_METADATA_PROGRAM_ID
    );
    return pubkey;
}

export const usePomodoroData = (initialActivity) => {
    const { publicKey, wallet } = useWallet();
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
            console.log(balance);
        } catch (error) {
            console.log(error);
            setEffortBalance(0);
        }

        try {
            // 최근 트랜잭션 20개 조회
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
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
            const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
            const validSignatures = signatures.filter(s => !s.err);
            // const transactions = await connection.getParsedTransactions(validSignatures.map(s => s.signature), { maxSupportedTransactionVersion: 0 });
            const transactions = [];
            for (const sig of validSignatures) {
                try {
                    // 하나씩 요청
                    const tx = await connection.getParsedTransaction(sig.signature, {
                        maxSupportedTransactionVersion: 0
                    });
                    if (tx) transactions.push(tx);
                     // 너무 빠르면 429 에러가 날 수 있으니 아주 약간 대기
                    await new Promise(resolve => setTimeout(resolve, 100));
                } catch (e) {
                    console.warn("개별 트랜잭션 조회 실패:", e);
                }
            }
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


    const purchaseItemClient = useCallback(async (itemId, price, name, symbol, uri) => {
        // 1. 지갑 연결 및 서명 기능 확인
        if (!publicKey || !connection || !wallet || !wallet.adapter.signTransaction) {
            console.error("지갑 미연결 또는 서명 기능 미지원");
            throw new Error('지갑이 연결되지 않았거나, 서명 기능을 지원하지 않습니다.');
        }

        console.log(`[Purchase] 1. 백엔드 API로 트랜잭션 생성 요청 (Item: ${itemId})`);

        try {
            // 2. 백엔드 API에 '트랜잭션 생성' 요청
            // (실제 프로덕션에서는 price, name, symbol, uri 등은 
            //  보안을 위해 백엔드가 itemId를 기반으로 직접 조회해야 합니다)
            let response = await purchaseCreateTx({
                buyer: publicKey.toBase58(), // 구매자(클라이언트)의 주소
                itemId: itemId,
                // (아래 정보들은 서버가 검증용으로만 사용하거나, 
                //  아예 itemId만 받고 서버에서 모든 정보를 DB 조회하는 것이 좋습니다)
                price,
                name,
                symbol,
                uri
            });
            if (!response) {
                throw new Error('트랜잭션 생성에 실패했습니다.');
            }

            console.log(response);
            // 3. 백엔드로부터 '부분 서명된' 트랜잭션(Base64) 수신
            const { transaction: base64Transaction } = response;

            console.log("[Purchase] 2. 백엔드로부터 부분 서명된 트랜잭션 수신 완료");

            // 4. Base64 트랜잭션을 Transaction 객체로 변환
            const transactionBuffer = Buffer.from(base64Transaction, 'base64');
            const transaction = web3.Transaction.from(transactionBuffer);

            // 5. [중요] 트랜잭션의 수수료 지불자(feePayer)와 
            //    최신 블록해시(recentBlockhash)를 클라이언트(구매자) 기준으로 설정
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            console.log("[Purchase] 3. 사용자에게 지갑 서명 요청...");

            // 6. 사용자가 지갑으로 최종 서명
            const signedTx = await wallet.adapter.signTransaction(transaction);

            console.log("[Purchase] 4. 최종 서명 완료. 네트워크로 트랜잭션 전송...");

            // 7. 완전히 서명된 트랜잭션을 직렬화하여 네트워크로 전송
            const rawTx = signedTx.serialize();
            const txSignature = await connection.sendRawTransaction(rawTx, {
                skipPreflight: false, // preflight를 켜두는 것이 좋습니다.
            });

            console.log(`[Purchase] 5. 트랜잭션 전송 완료, 확인 대기... (Sig: ${txSignature})`);

            // 8. 트랜잭션 확인 (Confirmed)
            const confirmation = await connection.confirmTransaction(
                txSignature,
                'confirmed'
            );

            if (confirmation.value.err) {
                throw new Error(`트랜잭션 확인 실패: ${confirmation.value.err}`);
            }

            console.log("✅ [Purchase] 6. 아이템 구매 성공!", txSignature);

            // 구매 성공 후 데이터 새로고침
            fetchRecentData();

            return txSignature;

        } catch (error) {
            console.error("아이템 구매 중 치명적 오류 발생:", error);
            // (UI에 오류 메시지를 표시하는 로직, e.g., react-hot-toast)
            throw error; // 오류를 다시 던져서 컴포넌트에서 catch 할 수 있게 함
        }
    }, [publicKey, connection, wallet, fetchRecentData]); // 💡 fetchRecentData 의존성 추가

    // 클라이언트에서 권한을 다 가진 상태로 트랜잭션을 만드는 purchaseItemClient 코드

    // const purchaseItemClient = useCallback(async (itemId, price, name, symbol, uri) => {
    //     if (!publicKey || !connection || !wallet) throw new Error('Wallet not connected or connection unavailable');

    //     const anchorWallet = {
    //         publicKey: publicKey,
    //         signTransaction: wallet.adapter.signTransaction.bind(wallet.adapter),
    //         signAllTransactions: wallet.adapter.signAllTransactions?.bind(wallet.adapter),
    //     };
    //     console.log(anchorWallet);
    //     const provider = new AnchorProvider(connection, anchorWallet, AnchorProvider.defaultOptions());

    //     const program = new Program(idl, provider);

    //     const nftMint = Keypair.generate();

    //     const metadataAccount = await getMetadataPDA(nftMint.publicKey);
    //     const masterEditionAccount = await getMasterEditionPDA(nftMint.publicKey);

    //     const buyerTokenAccount = getAssociatedTokenAddressSync(EFFORT_TOKEN_MINT_ADDRESS, publicKey);
    //     const userNftTokenAccount = getAssociatedTokenAddressSync(nftMint.publicKey, publicKey);
    //     const treasuryTokenAccount = new PublicKey(import.meta.env.VITE_SERVER_TOKEN_ACCOUNT_ADDRESS);

    //     const txSignature = await program.methods
    //         .purchaseItem(itemId, new BN(price), name, symbol, uri)
    //         .accounts({
    //             buyer: publicKey,
    //             authority: SERVER_AUTHORITY,
    //             buyerTokenAccount,
    //             treasuryTokenAccount,
    //             nftMint: nftMint.publicKey,
    //             userNftAccount: userNftTokenAccount,
    //             metadataAccount,
    //             masterEditionAccount,
    //             tokenProgram: TOKEN_PROGRAM_ID,
    //             associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //             systemProgram: SystemProgram.programId,
    //             rent: web3.SYSVAR_RENT_PUBKEY,
    //             tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    //         })
    //         .signers([nftMint])
    //         .rpc();

    //     return txSignature;
    // }, [publicKey, connection, wallet]);

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
        fetchStatisticsData,
        purchaseItemClient
    };


};