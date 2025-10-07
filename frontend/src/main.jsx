import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- 👇 이 부분을 앱 최상단에 추가하세요! ---
import * as PIXI from 'pixi.js';
import { Buffer } from 'buffer';

// 1. pixi-dragonbones가 전역 PIXI 객체를 찾을 수 있도록 설정합니다.
// @ts-ignore
window.PIXI = PIXI;

// 2. Solana/Metaplex 라이브러리를 위한 Buffer 폴리필도 여기에 함께 둡니다.
window.Buffer = Buffer;
// --- 👆 여기까지 ---
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
