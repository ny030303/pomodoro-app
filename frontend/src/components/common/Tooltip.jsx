import React from 'react';

export default function Tooltip({ text, children }) {
    return (
        <div className="relative group flex items-center">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs bg-gray-700 text-white text-xs rounded py-1 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg">
                {text}
            </div>
        </div>
    );
}