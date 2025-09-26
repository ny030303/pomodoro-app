// src/components/auth/WalletConnectButton.js 
// 파일명을 더 명확하게 WalletConnectButton.js로 하는 것을 추천합니다.

import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const WalletConnectButton = () => {
    return (
        <WalletMultiButton />
    );
};

export default WalletConnectButton;