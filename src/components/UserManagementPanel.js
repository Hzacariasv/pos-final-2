// src/views/AdminDashboard/components/UserManagementPanel.js
import React, { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { db, auth } from '../../../services/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { PlusCircle, Edit, Trash2, Users } from 'lucide-react';
import UserFormModal from './UserFormModal';

const UserManagementPanel = ({ setNotificationModal }) => {
    const { users } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // CAMBIO AQUÍ: Calculamos las estadísticas de usuarios
    const userStats = useMemo(() => {
        const roles = { admin: 0, cashier: 0, chef: 0, waiter: 0 };
        users.forEach(user => {
            if (roles[user.role] !== undefined) {
                roles[user.role]++;
            }
        });
        return { total: users.length, ...roles };
    }, [users]);

    const openModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSave = async (userData) => {
        if (editingUser) {
            setNotificationModal({ isOpen: true, message: "La edición de usuarios está deshabilitada en esta versión." });
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            const newUser = userCredential.user;

            const userDocRef = doc(db, "users", newUser.uid);
            await setDoc(userDocRef, {
                name: userData.name,
                email: userData.email,
                role: userData.role,
                color: userData.color,
            });

            setNotificationModal({ isOpen: true, message: "Usuario creado con éxito." });
            closeModal();
        } catch (error) {
            let friendlyMessage = "Error al crear el usuario.";
            if (error.code === 'auth/email-already-in-use') {
                friendlyMessage = "El correo electrónico ya está en uso.";
            } else if (error.code === 'auth/weak-password') {
                friendlyMessage = "La contraseña debe tener al menos 6 caracteres.";
            }
            console.error("Error creating user:", error);
            setNotificationModal({ isOpen: true, message: friendlyMessage });
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("¿Está seguro? Esto solo lo eliminará de la lista, pero no del sistema de login.")) {
            try {
                await deleteDoc(doc(db, "users", userId));
                setNotificationModal({ isOpen: true, message: "Usuario eliminado de la lista con éxito." });
            } catch (error) {
                setNotificationModal({ isOpen: true, message: `Error al eliminar: ${error.message}` });
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2">
                <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Usuarios</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    <PlusCircle size={20}/>Añadir Usuario
                </button>
            </div>

            {/* CAMBIO AQUÍ: Nueva estructura de Grid para PC */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Columna de la Tabla */}
                <div className="lg:col-span-2 bg-white shadow-md rounded-lg overflow-hidden border">
                    <table className="min-w-full">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Nombre</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Email</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Rol</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                    <td className="py-3 px-4 text-gray-600 capitalize">{user.role}</td>
                                    <td className="py-3 px-4 flex gap-4">
                                        <button onClick={() => openModal(user)} className="text-gray-400 cursor-not-allowed" disabled><Edit size={20}/></button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 transition-all duration-300 transform hover:scale-125"><Trash2 size={20}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CAMBIO AQUÍ: Nueva Columna de Estadísticas (solo visible en pantallas grandes) */}
                <div className="lg:col-span-1 bg-gray-50 p-6 rounded-lg border">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2"><Users size={24}/> Resumen</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                            <span className="font-bold text-gray-800">Total de Usuarios</span>
                            <span className="font-extrabold text-xl text-blue-600">{userStats.total}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                            <span className="font-semibold text-gray-600">Administradores</span>
                            <span className="font-bold text-lg text-gray-800">{userStats.admin}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                            <span className="font-semibold text-gray-600">Cajeros</span>
                            <span className="font-bold text-lg text-gray-800">{userStats.cashier}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                            <span className="font-semibold text-gray-600">Chefs</span>
                            <span className="font-bold text-lg text-gray-800">{userStats.chef}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                            <span className="font-semibold text-gray-600">Meseros</span>
                            <span className="font-bold text-lg text-gray-800">{userStats.waiter}</span>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && <UserFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} user={editingUser} />}
        </div>
    );
};

export default UserManagementPanel;