// src/views/AdminDashboard/components/StockManagementPanel.js
import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { db } from '../../../services/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { Save } from 'lucide-react';

const StockManagementPanel = ({ setNotificationModal }) => {
    const { menu } = useData();
    const [stockLevels, setStockLevels] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const initialStock = menu.reduce((acc, item) => {
            acc[item.id] = item.stock;
            return acc;
        }, {});
        setStockLevels(initialStock);
        setHasChanges(false);
    }, [menu]);

    const handleStockChange = (itemId, value) => {
        const newStock = parseInt(value, 10);
        if (!isNaN(newStock)) {
            setStockLevels(prev => ({...prev, [itemId]: newStock}));
            setHasChanges(true);
        } else if (value === '') {
            setStockLevels(prev => ({...prev, [itemId]: 0}));
            setHasChanges(true);
        }
    };

    const handleSaveChanges = async () => {
        if (!hasChanges) {
            setNotificationModal({ isOpen: true, message: "No hay cambios que guardar." });
            return;
        }
        const batch = writeBatch(db);
        let updates = 0;
        menu.forEach(item => {
            if (item.stock !== stockLevels[item.id]) {
                const itemRef = doc(db, "menu", item.id);
                batch.update(itemRef, { stock: stockLevels[item.id] });
                updates++;
            }
        });

        if (updates > 0) {
            try {
                await batch.commit();
                setNotificationModal({ isOpen: true, message: `${updates} producto(s) actualizado(s) con éxito.` });
                setHasChanges(false);
            } catch (error) {
                setNotificationModal({ isOpen: true, message: `Error al guardar: ${error.message}` });
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2">
                <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Stock</h1>
                <button 
                    onClick={handleSaveChanges} 
                    disabled={!hasChanges}
                    className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <Save size={20}/>Guardar Cambios
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-y-auto max-h-[75vh] border">
                <table className="min-w-full">
                    <thead className="bg-gray-200 sticky top-0">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Producto</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-600 uppercase">Stock Actual</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase w-56">Nuevo Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {menu.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-2 px-4 font-semibold text-gray-800">{item.name}</td>
                                <td className="py-2 px-4 text-center font-bold text-lg">{item.stock}</td>
                                <td className="py-2 px-4">
                                    <input 
                                        type="number" 
                                        value={stockLevels[item.id] ?? ''} 
                                        onChange={(e) => handleStockChange(item.id, e.target.value)}
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-md text-lg focus:ring-2 focus:ring-blue-500" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockManagementPanel;