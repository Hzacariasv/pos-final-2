// src/App.js
import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { auth } from './services/firebase';

import LoginScreen from './views/LoginScreen';
import WaiterDashboard from './views/WaiterDashboard';
import ChefDashboard from './views/ChefDashboard';
import CashierDashboard from './views/CashierDashboard';
import AdminDashboard from './views/AdminDashboard/AdminDashboard';
import CustomModal from './components/CustomModal';
import { CheckCircle } from 'lucide-react';

const LoadingScreen = () => (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4 animate-spin" style={{borderTopColor: '#3498db'}}></div>
        <h2 className="text-center text-gray-700 text-xl font-semibold">Cargando Sistema...</h2>
    </div>
);

const AppLogic = () => {
    const [view, setView] = useState('login'); 
    const [localUser, setLocalUser] = useState(null);
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: '' });
    
    const { loading, currentUser, users } = useData();

    useEffect(() => {
        // Si no hay sesión de Auth, nos aseguramos de que no haya usuario local y mostramos el login.
        if (!currentUser) {
            setLocalUser(null);
            setView('login');
            return;
        }

        // Si hay sesión de Auth pero la lista de usuarios de Firestore aún no carga, esperamos.
        if (users.length === 0) {
            return;
        }

        // Si hay sesión de Auth Y la lista de usuarios ya cargó, buscamos el perfil.
        const userData = users.find(u => u.id === currentUser.uid);
        if (userData) {
            // Perfil encontrado, establecemos el usuario y su vista.
            setLocalUser(userData);
            setView(userData.role);
        } else {
            // Perfil no encontrado (caso raro), cerramos la sesión para evitar un bucle.
            console.error("Usuario autenticado pero no encontrado en Firestore. Cerrando sesión.");
            auth.signOut();
        }

    }, [currentUser, users]); // Este efecto se ejecuta si cambia el usuario de Auth o la lista de usuarios.


    if (loading) {
        return <LoadingScreen />;
    }

    const handleSetView = (newView) => {
        if (newView === 'login') {
            auth.signOut();
        }
    };

    const renderView = () => {
        if (!localUser) {
            return <LoginScreen setView={setView} setCurrentUser={setLocalUser} setNotificationModal={setNotificationModal} />;
        }
        
        switch (view) {
            case 'waiter':
                return <WaiterDashboard currentUser={localUser} setView={handleSetView} setNotificationModal={setNotificationModal} />;
            case 'chef':
                return <ChefDashboard currentUser={localUser} setView={handleSetView} />;
            case 'cashier':
                return <CashierDashboard currentUser={localUser} setView={handleSetView} setNotificationModal={setNotificationModal} />;
            case 'admin':
                return <AdminDashboard currentUser={localUser} setView={handleSetView} setNotificationModal={setNotificationModal} />;
            default:
                // Si el usuario existe pero no tiene rol, mostramos un mensaje.
                return <div>Error: El usuario no tiene un rol asignado.</div>;
        }
    };

    return (
        <div className="App">
            <CustomModal
                isOpen={notificationModal.isOpen}
                onClose={() => setNotificationModal({isOpen: false, message: ''})}
                title="Aviso del Sistema">
                <div className="flex items-center">
                    <CheckCircle className="text-green-500 mr-4 flex-shrink-0" size={40} />
                    <p className="text-lg text-gray-700">{notificationModal.message}</p>
                </div>
            </CustomModal>
            {renderView()}
        </div>
    );
};

const App = () => {
    return (
        <DataProvider>
            <AppLogic />
        </DataProvider>
    );
};

export default App;