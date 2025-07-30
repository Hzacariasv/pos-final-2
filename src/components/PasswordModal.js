// src/components/PasswordModal.js
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import CustomModal from './CustomModal';

const PasswordModal = ({ isOpen, onClose, onConfirm, user }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleConfirm = () => {
        if (password === user.password) {
            onConfirm(user);
            onClose();
        } else {
            setError('Contraseña incorrecta. Inténtelo de nuevo.');
            const modal = document.querySelector('.animate-fade-in-up');
            if (modal) {
                modal.classList.add('animate-shake');
                setTimeout(() => modal.classList.remove('animate-shake'), 500);
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title={`Iniciar Sesión como ${user?.name}`}>
            <div className="flex flex-col gap-4 items-center">
                <p className="text-gray-600 text-center">Por favor, ingrese la contraseña para</p>
                <p className="font-bold text-xl text-gray-800">{user?.name}</p>
                <div className="relative w-full mt-2">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                        placeholder="Contraseña"
                        autoFocus
                    />
                </div>
                {error && <p className="text-red-500 text-sm mt-1 animate-fade-in">{error}</p>}
                <button
                    onClick={handleConfirm}
                    className="w-full mt-4 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
                    <Unlock size={20} /> Confirmar
                </button>
            </div>
        </CustomModal>
    );
};

export default PasswordModal;