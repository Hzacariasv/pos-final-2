// src/views/AdminDashboard/components/MenuItemFormModal.js
import React, { useState } from 'react';
import CustomModal from '../../../components/CustomModal';

const MenuItemFormModal = ({ isOpen, onClose, onSave, item }) => {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        category: item?.category || 'Platos de Fondo',
        price: item?.price || 0,
        cost: item?.cost || 0,
        stock: item?.stock || 0,
        available: item?.available ?? true,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title={item ? 'Editar Producto' : 'Crear Producto'} size="lg">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Producto</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock Inicial</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Precio de Venta (S/)</label>
                    <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo (S/)</label>
                    <input type="number" step="0.01" name="cost" value={formData.cost} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                    <input type="checkbox" id="available" name="available" checked={formData.available} onChange={handleChange} className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"/>
                    <label htmlFor="available" className="font-bold text-gray-700">Disponible para la venta</label>
                </div>
                <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300">Cancelar</button>
                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">Guardar Producto</button>
                </div>
            </form>
        </CustomModal>
    );
};

export default MenuItemFormModal;