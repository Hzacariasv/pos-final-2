// src/views/LoginScreen.js
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react'; // <-- 1. Importamos los íconos del ojo

const LoginScreen = ({ setView, setCurrentUser, setNotificationModal }) => {
    const { companyInfo } = useData();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // 2. Añadimos un nuevo estado para controlar la visibilidad
    const [showPassword, setShowPassword] = useState(false); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const authUser = userCredential.user;

            const userDocRef = doc(db, "users", authUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                setCurrentUser({ id: authUser.uid, ...userData });
                setView(userData.role);
            } else {
                throw new Error("No se encontraron los datos del usuario.");
            }

        } catch (error) {
            let friendlyMessage = "Ocurrió un error al iniciar sesión.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                friendlyMessage = "El correo electrónico o la contraseña son incorrectos.";
            }
            console.error("Login error:", error);
            setError(friendlyMessage);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="text-center mb-8 animate-fade-in-down">
                <h1 className="text-5xl font-extrabold text-gray-800 tracking-tight">{companyInfo?.name || 'Restaurante POS'}</h1>
                <p className="text-gray-500 mt-2 text-lg">{companyInfo?.address || 'Cargando información...'}</p>
            </div>
            
            <div className="w-full max-w-sm animate-fade-in-up bg-white p-8 rounded-xl shadow-2xl">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                        {/* 3. Modificamos el campo de la contraseña */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'} // <-- Cambia el tipo dinámicamente
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 pr-10" // <-- Añadimos padding a la derecha
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)} // <-- Llama a la función para cambiar el estado
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-400"
                        >
                            {isLoading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;