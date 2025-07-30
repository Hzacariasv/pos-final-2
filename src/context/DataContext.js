// src/context/DataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [appUser, setAppUser] = useState(null); // ÚNICO estado para el usuario final

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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // 1. Si hay un usuario de Auth, buscamos su perfil en Firestore
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    // 2. Si el perfil existe, creamos nuestro objeto de usuario final y lo guardamos
                    setAppUser({ uid: user.uid, ...userDocSnap.data() });
                } else {
                    // Si no hay perfil, el usuario no puede continuar.
                    setAppUser(null);
                    auth.signOut(); // Cerramos la sesión para evitar bucles
                }
            } else {
                // Si no hay usuario de Auth, nos aseguramos de que no haya usuario en la app
                setAppUser(null);
            }
            // Solo después de verificar todo, terminamos de cargar
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Este efecto carga los datos de la tienda SOLO si ya tenemos un usuario válido
    useEffect(() => {
        if (!appUser) return; // Si no hay usuario, no cargamos nada más.

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

        return () => unsubscribers.forEach(unsub => unsub());
    }, [appUser]);

    const value = {
        loading,
        appUser, // El nuevo y único objeto de usuario
        companyInfo, users, menu, tables, shifts, kitchenOrders, sales, forcedClosures
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};