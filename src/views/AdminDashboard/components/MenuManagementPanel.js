// src/views/AdminDashboard/components/MenuManagementPanel.js
import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { db } from '../../../services/firebase';
import { doc, updateDoc, addDoc, collection, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Edit, Trash2, CheckCircle, X } from 'lucide-react';
import MenuItemFormModal from './MenuItemFormModal';

const MenuManagementPanel = ({ setNotificationModal }) => {
    const { menu } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const openModal = (item = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleSave = async (itemData) => {
        itemData.price = parseFloat(itemData.price);
        itemData.cost = parseFloat(itemData.cost);
        itemData.stock = parseInt(itemData.stock, 10);
        try {
            if (editingItem) {
                await updateDoc(doc(db, "menu", editingItem.id), itemData);
                setNotificationModal({ isOpen: true, message: "Producto actualizado con éxito." });
            } else {
                await addDoc(collection(db, "menu"), itemData);
                setNotificationModal({ isOpen: true, message: "Producto creado con éxito." });
            }
            closeModal();
        } catch (error) {
            setNotificationModal({ isOpen: true, message: `Error al guardar: ${error.message}` });
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm("¿Está seguro de que desea eliminar este producto del menú?")) {
            try {
                await deleteDoc(doc(db, "menu", itemId));
                setNotificationModal({ isOpen: true, message: "Producto eliminado con éxito." });
            } catch (error) {
                setNotificationModal({ isOpen: true, message: `Error al eliminar: ${error.message}` });
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2">
                <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Menú</h1>
                <button onClick={() => openModal()} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    <PlusCircle size={20}/>Añadir Producto
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
                <table className="min-w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Nombre</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Categoría</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Precio</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Stock</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-600 uppercase">Disponible</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {menu.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                                <td className="py-3 px-4 text-gray-600">{item.category}</td>
                                <td className="py-3 px-4 text-gray-600">S/ {item.price.toFixed(2)}</td>
                                <td className="py-3 px-4 font-bold text-gray-800">{item.stock}</td>
                                <td className="py-3 px-4">
                                    <div className="flex justify-center">{item.available ? <CheckCircle className="text-green-500" /> : <X className="text-red-500"/>}</div>
                                </td>
                                <td className="py-3 px-4 flex gap-4">
                                    <button onClick={() => openModal(item)} className="text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:scale-125"><Edit size={20}/></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800 transition-all duration-300 transform hover:scale-125"><Trash2 size={20}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <MenuItemFormModal isOpen={isModalOpen} onClose={closeModal} onSave={handleSave} item={editingItem} />}
        </div>
    );
};

export default MenuManagementPanel;