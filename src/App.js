// src/App.js
import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Todas las vistas se importan juntas aquí
import LoginScreen from './views/LoginScreen';
import WaiterDashboard from './views/WaiterDashboard';
import ChefDashboard from './views/ChefDashboard';
import CashierDashboard from './views/CashierDashboard';
import AdminDashboard from './views/AdminDashboard/AdminDashboard'; // Ruta corregida

// Todos los componentes se importan juntos aquí
import CustomModal from './components/CustomModal';
import { CheckCircle, AlertCircle } from 'lucide-react';

// --- Componentes Internos ---
const LoadingScreen = () => (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gray-100">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4 animate-spin" style={{borderTopColor: '#3498db'}}></div>
        <h2 className="text-center text-gray-700 text-xl font-semibold">Cargando Sistema...</h2>
    </div>
);

const AppLogic = () => {
    const [view, setView] = useState('login'); 
    const [currentUser, setCurrentUser] = useState(null);
    const [notificationModal, setNotificationModal] = useState({ isOpen: false, message: '' });
    const [authLoading, setAuthLoading] = useState(true);
    
    const { loading: dataLoading } = useData();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = { id: user.uid, ...userDocSnap.data() };
                    setCurrentUser(userData);
                    setView(userData.role);
                } else {
                    setView('login');
                    setCurrentUser(null);
                    auth.signOut();
                }
            } else {
                setView('login');
                setCurrentUser(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (dataLoading || authLoading) {
        return <LoadingScreen />;
    }

    const handleSetView = (newView) => {
        if (newView === 'login') {
            auth.signOut();
        }
    };

    const renderView = () => {
        if (!currentUser) {
            return <LoginScreen setView={setView} setCurrentUser={setCurrentUser} setNotificationModal={setNotificationModal} />;
        }

        switch (view) {
            case 'waiter':
                return <WaiterDashboard currentUser={currentUser} setView={handleSetView} setNotificationModal={setNotificationModal} />;
            case 'chef':
                return <ChefDashboard currentUser={currentUser} setView={handleSetView} />;
            case 'cashier':
                return <CashierDashboard currentUser={currentUser} setView={handleSetView} setNotificationModal={setNotificationModal} />;
            case 'admin':
                return <AdminDashboard currentUser={currentUser} setView={handleSetView} setNotificationModal={setNotificationModal} />;
            default:
                return <LoginScreen setView={setView} setCurrentUser={setCurrentUser} setNotificationModal={setNotificationModal} />;
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

// --- Componente Principal ---
const App = () => {
    return (
        <DataProvider>
            <AppLogic />
        </DataProvider>
    );
};

export default App;