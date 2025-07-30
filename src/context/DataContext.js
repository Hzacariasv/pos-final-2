// src/context/DataContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { db, auth } from '../services/firebase'; // Importamos auth
import { onAuthStateChanged } from 'firebase/auth'; // Importamos el "oyente"
import { collection, onSnapshot, doc } from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null); // Nuevo estado para el usuario

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
        // El "oyente" de Firebase ahora vive aquí
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user); // Guardamos el usuario de Firebase

            if (user) {
                // SOLO SI hay un usuario, nos suscribimos para recibir los datos
                console.log("Usuario autenticado, cargando datos de la tienda...");
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
                setLoading(false); // Dejamos de cargar una vez que tenemos usuario y listeners
                
                // Esta función se ejecutará cuando el componente se desmonte para limpiar los listeners
                return () => unsubscribers.forEach(unsub => unsub());
            } else {
                // Si no hay usuario, no cargamos nada y simplemente terminamos de "cargar"
                console.log("No hay usuario, mostrando pantalla de login.");
                setLoading(false);
            }
        });

        return () => unsubscribe(); // Limpiamos el "oyente" principal
    }, []);

    const value = {
        loading,
        currentUser, // Ahora proveemos el usuario a toda la app
        companyInfo,
        users,
        menu,
        tables,
        shifts,
        kitchenOrders,
        sales,
        forcedClosures
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};