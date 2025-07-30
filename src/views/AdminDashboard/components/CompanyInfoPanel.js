// src/views/AdminDashboard/components/CompanyInfoPanel.js
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { db } from '../../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Save } from 'lucide-react';

const CompanyInfoPanel = ({ setNotificationModal }) => {
    const { companyInfo } = useData();
    const [info, setInfo] = useState({ name: '', ruc: '', address: '', phone: '' });

    useEffect(() => {
        if (companyInfo) {
            setInfo(companyInfo);
        }
    }, [companyInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInfo(prev => ({...prev, [name]: value}));
    };

    const handleSave = async () => {
        try {
            const infoRef = doc(db, "companyInfo", "main");
            await updateDoc(infoRef, info);
            setNotificationModal({ isOpen: true, message: "Datos de la empresa actualizados." });
        } catch (error) {
            setNotificationModal({ isOpen: true, message: `Error al guardar: ${error.message}` });
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 pb-3 border-b-2">Datos de la Empresa</h1>
            <div className="bg-white p-8 rounded-xl shadow-md space-y-5 max-w-2xl border">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Restaurante</label>
                    <input type="text" name="name" value={info.name || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">RUC</label>
                    <input type="text" name="ruc" value={info.ruc || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Dirección</label>
                    <input type="text" name="address" value={info.address || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                    <input type="text" name="phone" value={info.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="pt-4 flex justify-end">
                    <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                        <Save size={20}/>Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompanyInfoPanel;