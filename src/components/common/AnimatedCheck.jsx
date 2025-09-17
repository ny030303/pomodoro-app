import React from 'react';

export default function AnimatedCheck() {
    return (
        <svg className="w-16 h-16 mx-auto mb-6" viewBox="0 0 52 52">
            <circle className="stroke-current text-green-500/30 dark:text-green-400/30" cx="26" cy="26" r="25" fill="none" strokeWidth="4"/>
            <path className="stroke-current text-green-500 dark:text-green-400 checkmark-path" fill="none" strokeWidth="5" strokeLinecap="round" d="M14 27l5 5 16-16"/>
            <style>{`
                .checkmark-path {
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: draw 0.4s 0.2s ease-out forwards;
                }
                @keyframes draw {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </svg>
    );
}