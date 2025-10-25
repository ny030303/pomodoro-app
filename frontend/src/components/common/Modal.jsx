import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <X size={24} />
                </button>
                {children}
            </div>
        </div>
    );
}

export  function StoreModal({ children, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <X size={24} />
                </button>
                {children}
            </div>
        </div>
    );
}