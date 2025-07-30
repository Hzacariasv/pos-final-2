// src/App.js
import React from 'react';
import { DataProvider, useData } from './context/DataContext';
import { auth } from './services/firebase';

import LoginScreen from './views/LoginScreen';
import WaiterDashboard from './views/WaiterDashboard';
import ChefDashboard from './views/ChefDashboard';
import CashierDashboard from './views/CashierDashboard';
import AdminDashboard from './views/AdminDashboard/AdminDashboard';

const LoadingScreen = () => (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4 animate-spin" style={{borderTopColor: '#3498db'}}></div>
        <h2 className="text-center text-gray-700 text-xl font-semibold">Cargando Sistema...</h2>
    </div>
);

const AppLogic = () => {
    const { loading, appUser } = useData();

    if (loading) {
        return <LoadingScreen />;
    }

    const handleSetView = (newView) => {
        if (newView === 'login') {
            auth.signOut();
        }
    };
    
    if (!appUser) {
        return <LoginScreen />;
    }

    switch (appUser.role) {
        case 'waiter':
            return <WaiterDashboard currentUser={appUser} setView={handleSetView} />;
        case 'chef':
            return <ChefDashboard currentUser={appUser} setView={handleSetView} />;
        case 'cashier':
            return <CashierDashboard currentUser={appUser} setView={handleSetView} />;
        case 'admin':
            return <AdminDashboard currentUser={appUser} setView={handleSetView} />;
        default:
            return <div>Error: Rol desconocido. <button onClick={() => auth.signOut()}>Salir</button></div>;
    }
};

const App = () => {
    return (
        <DataProvider>
            <AppLogic />
        </DataProvider>
    );
};

export default App;