// src/components/CustomModal.js
import React from 'react';
import { X } from 'lucide-react';

const CustomModal = ({ isOpen, onClose, children, title, size = 'md' }) => {
    if (!isOpen) return null;
    const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300">
            <div className={`bg-white rounded-2xl shadow-2xl w-full m-4 animate-fade-in-up ${sizeClasses[size]}`}>
                <div className="p-5 border-b border-gray-200 rounded-t-2xl bg-gray-50 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:rotate-90 transform transition-all duration-300"><X size={28} /></button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default CustomModal;