// src/views/AdminDashboard/components/UserManagementPanel.js
import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { db } from '../../../services/firebase';
import { doc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import UserFormModal from './UserFormModal';

const UserManagementPanel = ({ setNotificationModal }) => {
    const { users } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const openModal = (user = null) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSave = async (userData) => {
        try {
            if (editingUser) {
                const userRef = doc(db, "users", editingUser.id);
                await updateDoc(userRef, userData);
                setNotificationModal({ isOpen: true, message: "Usuario actualizado con éxito." });
            } else {
                await addDoc(collection(db, "users"), userData);
                setNotificationModal({ isOpen: true, message: "Usuario creado con éxito." });
            }
            closeModal();
        } catch (error) {
            setNotificationModal({ isOpen: true, message: `Error al guardar: ${error.message}` });
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm("¿Está seguro de que desea eliminar este usuario? Esta acción es irreversible.")) {
            try {
                await deleteDoc(doc(db, "users", userId));
                setNotificationModal({ isOpen: true, message: "Usuario eliminado con éxito." });
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
            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
                <table className="min-w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Nombre</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Rol</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-gray-800">{user.name}</td>
                                <td className="py-3 px-4 text-gray-600 capitalize">{user.role}</td>
                                <td className="py-3 px-4 flex gap-4">
                                    <button onClick={() => openModal(user)} className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:scale-125"><Edit size={20}/></button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 transition-all duration-300 transform hover:scale-125"><Trash2 size={20}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <UserFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} user={editingUser} />}
        </div>
    );
};

export default UserManagementPanel;