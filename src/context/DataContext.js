// src/context/DataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const [authLoading, setAuthLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    // Estados para los datos de la tienda
    const [companyInfo, setCompanyInfo] = useState(null);
    const [users, setUsers] = useState([]);
    const [menu, setMenu] = useState([]);
    const [tables, setTables] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [kitchenOrders, setKitchenOrders] = useState([]);
    const [sales, setSales] = useState([]);
    const [forcedClosures, setForcedClosures] = useState([]);

    useEffect(() => {
        // Este "oyente" SOLO se encarga de saber si alguien inició sesión o no.
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setAuthLoading(false); // Terminamos de verificar la autenticación
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        // Este segundo "oyente" SOLO se activa si hay un usuario.
        if (!currentUser) {
            setDataLoading(false); // Si no hay usuario, no hay nada que cargar.
            return;
        }

        // Si hay un usuario, empezamos a cargar los datos de la tienda.
        setDataLoading(true);
        const unsubscribers = [
            onSnapshot(doc(db, "companyInfo", "main"), (doc) => setCompanyInfo(doc.data())),
            onSnapshot(collection(db, "users"), (snapshot) => setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(collection(db, "menu"), (snapshot) => setMenu(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(collection(db, "tables"), (snapshot) => setTables(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(collection(db, "shifts"), (snapshot) => setShifts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(collection(db, "kitchenOrders"), (snapshot) => setKitchenOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(collection(db, "sales"), (snapshot) => setSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
            onSnapshot(collection(db, "forcedClosures"), (snapshot) => setForcedClosures(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))),
        ];
        
        // Asumimos que los datos cargan rápido. En un caso real, se podría manejar un estado de carga por cada colección.
        setDataLoading(false);

        return () => unsubscribers.forEach(unsub => unsub());
    }, [currentUser]); // <-- Esta es la clave: el efecto se re-ejecuta solo si 'currentUser' cambia.

    const value = {
        loading: authLoading || dataLoading,
        currentUser,
        companyInfo, users, menu, tables, shifts, kitchenOrders, sales, forcedClosures
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};