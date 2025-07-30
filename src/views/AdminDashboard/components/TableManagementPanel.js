// src/views/AdminDashboard/components/TableManagementPanel.js
import React from 'react';
import { useData } from '../../../context/DataContext';
import { db } from '../../../services/firebase';
import { collection, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { PlusCircle, Trash2 } from 'lucide-react';

const TableManagementPanel = ({ setNotificationModal }) => {
    const { tables } = useData();

    const addNewTable = async () => {
        const tableNumbers = tables.map(t => parseInt(t.name.split(' ')[1], 10));
        const nextTableNumber = Math.max(0, ...tableNumbers) + 1;
        const newTable = {
            name: `Mesa ${nextTableNumber}`,
            status: 'free',
            waiterId: null,
            waiterName: null,
            waiterColor: null,
            currentOrder: { items: [], paidItems: [], customerName: '', status: 'new' }
        };

        try {
            await addDoc(collection(db, "tables"), newTable);
            setNotificationModal({ isOpen: true, message: `Mesa ${nextTableNumber} creada con éxito.` });
        } catch (error) {
            setNotificationModal({ isOpen: true, message: `Error al crear la mesa: ${error.message}` });
        }
    };

    const deleteTable = async (tableId, tableName) => {
        if (window.confirm(`¿Está seguro de que desea eliminar la ${tableName}?`)) {
            try {
                await deleteDoc(doc(db, "tables", tableId));
                setNotificationModal({ isOpen: true, message: `${tableName} eliminada con éxito.` });
            } catch (error) {
                setNotificationModal({ isOpen: true, message: `Error al eliminar la mesa: ${error.message}` });
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 pb-3 border-b-2">
                <h1 className="text-3xl font-extrabold text-gray-800">Configuración de Mesas</h1>
                <button onClick={addNewTable} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                    <PlusCircle size={20}/>Añadir Mesa
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg p-4 border">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {tables.map(table => (
                        <div key={table.id} className="relative group">
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-700">
                                {table.name.split(' ')[1]}
                            </div>
                            <button 
                                onClick={() => deleteTable(table.id, table.name)} 
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform hover:scale-110">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TableManagementPanel;