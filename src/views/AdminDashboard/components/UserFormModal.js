// src/views/AdminDashboard/components/UserFormModal.js
import React, { useState } from 'react';
import CustomModal from '../../../components/CustomModal';

const UserFormModal = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({ name: user?.name || '', role: user?.role || 'waiter', password: '', color: user?.color || '#cccccc' });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!formData.name || !formData.role || (!user && !formData.password)){
            alert("Por favor, complete nombre, rol y contraseña (para usuarios nuevos).");
            return;
        }
        const dataToSave = {...formData};
        if(!dataToSave.password) { delete dataToSave.password; }
        onSave(dataToSave);
    };

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuario' : 'Crear Usuario'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder={user ? "Dejar en blanco para no cambiar" : ""} required={!user} />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Rol del Usuario</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500">
                        <option value="waiter">Mesero</option>
                        <option value="cashier">Cajero</option>
                        <option value="chef">Chef</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                {(formData.role === 'waiter' || formData.role === 'cashier') && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Color Identificativo</label>
                        <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-full h-12 px-1 py-1 border border-gray-300 rounded-md cursor-pointer"/>
                    </div>
                )}
                <div className="flex justify-end gap-4 pt-6 border-t mt-6">
                    <button type="button" onClick={onClose} className="bg-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all duration-300">Cancelar</button>
                    <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">Guardar</button>
                </div>
            </form>
        </CustomModal>
    );
};

export default UserFormModal;