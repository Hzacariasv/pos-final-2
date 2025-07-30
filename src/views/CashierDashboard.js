// src/views/CashierDashboard.js
import React, { useState, useEffect } from 'react';
import { DollarSign, LogOut } from 'lucide-react';
import { useData } from '../context/DataContext';
import { db } from '../services/firebase';
import { doc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';
import CustomModal from '../components/CustomModal';
import PaymentModal from '../components/PaymentModal';
import ShiftManagementPanel from '../components/ShiftManagementPanel';

const CashierDashboard = ({ currentUser, setView, setNotificationModal }) => {
    const [activeTab, setActiveTab] = useState('tables');
    const [selectedTable, setSelectedTable] = useState(null);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isForceCloseModalOpen, setForceCloseModalOpen] = useState(false);
    
    const { tables, sales } = useData();
    
    useEffect(() => {
        if (selectedTable) {
            const updatedTable = tables.find(t => t.id === selectedTable.id);
            if (updatedTable) {
                setSelectedTable(updatedTable);
            }
        }
    }, [tables, selectedTable]);

    const handleTableClick = (table) => {
        if (table.status === 'occupied' || table.status === 'ready') {
            setSelectedTable(table);
            setForceCloseModalOpen(true);
        } else if (table.status === 'billing') {
            setSelectedTable(table);
            setPaymentModalOpen(true);
        }
    };

    const handleForceCloseConfirm = async () => {
        if (!selectedTable) return;
        const batch = writeBatch(db);
        const tableRef = doc(db, "tables", selectedTable.id);
        batch.update(tableRef, { status: 'billing' });
        const forcedClosureRef = doc(collection(db, "forcedClosures"));
        batch.set(forcedClosureRef, {
            tableId: selectedTable.id,
            tableName: selectedTable.name,
            waiterId: selectedTable.waiterId ?? null,
            waiterName: selectedTable.waiterName ?? null,
            cashierId: currentUser.id,
            cashierName: currentUser.name,
            timestamp: serverTimestamp()
        });
        await batch.commit();
        setForceCloseModalOpen(false);
        setPaymentModalOpen(true);
    };

    const todaySales = sales.filter(s => {
        const saleDate = s.createdAt?.toDate();
        const today = new Date();
        return s.cashierId === currentUser.id && saleDate && saleDate.toDateString() === today.toDateString();
    });
    const totalTodaySales = todaySales.reduce((acc, sale) => acc + sale.total, 0);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <DollarSign size={32} className="text-blue-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Panel de Caja</h1>
                        <p className="text-gray-600">Bienvenido, {currentUser.name}</p>
                    </div>
                </div>
                <button onClick={() => setView('login')} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md transform hover:scale-95">
                    <LogOut size={18} /> Salir
                </button>
            </header>
            
            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('tables')} className={`flex-1 py-3 px-6 font-bold text-lg transition-all duration-300 ${activeTab === 'tables' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>Estado de Mesas</button>
                    <button onClick={() => setActiveTab('shifts')} className={`flex-1 py-3 px-6 font-bold text-lg transition-all duration-300 ${activeTab === 'shifts' ? 'border-b-4 border-purple-500 text-purple-600' : 'text-gray-500 hover:bg-gray-50'}`}>Turnos Meseros</button>
                    <button onClick={() => setActiveTab('report')} className={`flex-1 py-3 px-6 font-bold text-lg transition-all duration-300 ${activeTab === 'report' ? 'border-b-4 border-green-500 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>Mi Reporte de Caja</button>
                </div>
                
                <div className="p-4">
                    {activeTab === 'tables' && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                            {tables.map(table => {
                                let colorClass = 'bg-gray-200 hover:bg-gray-300 border-gray-300';
                                let content;
                                if (table.status === 'free') {
                                    content = <span className="text-gray-500 font-bold text-xl">{table.name.split(' ')[1]}</span>;
                                } else {
                                    const total = table.currentOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                                    colorClass = table.status === 'billing' ? 'bg-red-500 text-white border-red-700' : 'bg-green-500 text-white border-green-700';
                                    content = (
                                        <div className="text-center p-1">
                                            <p className="font-bold text-lg">{table.name.split(' ')[1]}</p>
                                            <p className="text-xs font-semibold uppercase truncate">{table.waiterName}</p>
                                            <p className="text-sm font-bold mt-1">S/ {total.toFixed(2)}</p>
                                        </div>
                                    );
                                }
                                return (
                                    <button
                                        key={table.id}
                                        onClick={() => handleTableClick(table)}
                                        disabled={table.status === 'free'}
                                        className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 p-1 border-2 shadow-sm hover:shadow-lg transform hover:-translate-y-1 ${colorClass} disabled:bg-gray-200 disabled:cursor-not-allowed disabled:transform-none`}
                                    >
                                        {content}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {activeTab === 'shifts' && <ShiftManagementPanel />}
                    {activeTab === 'report' && (
                        <div className="bg-white p-6 rounded-lg shadow-inner border">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Reporte de Caja del Día</h2>
                            <div className="text-5xl font-extrabold text-blue-600">
                                S/ {totalTodaySales.toFixed(2)}
                            </div>
                            <p className="text-gray-500 mt-2">Total de ventas registradas por ti en el día de hoy.</p>
                            <button className="mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                                Rendir Caja del Día
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {selectedTable && (
                <>
                    <PaymentModal
                        isOpen={isPaymentModalOpen}
                        onClose={() => setPaymentModalOpen(false)}
                        table={selectedTable}
                        cashier={currentUser}
                        setNotificationModal={setNotificationModal}
                    />
                    <CustomModal
                        isOpen={isForceCloseModalOpen}
                        onClose={() => setForceCloseModalOpen(false)}
                        title="Forzar Cobro de Mesa"
                    >
                        <p className="text-lg">¿Desea forzar el cobro de la <strong>{selectedTable.name}</strong> atendida por <strong>{selectedTable.waiterName}</strong>?</p>
                        <p className="text-sm text-gray-600 mt-2">Esta acción cambiará el estado de la mesa a "Facturando" y abrirá inmediatamente el modal de pago.</p>
                        <div className="flex justify-end gap-4 mt-8">
                            <button onClick={() => setForceCloseModalOpen(false)} className="bg-gray-300 font-bold py-2 px-6 rounded-lg hover:bg-gray-400 transition-all duration-300">Cancelar</button>
                            <button onClick={handleForceCloseConfirm} className="bg-red-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-600 transition-all duration-300">Sí, Forzar Cobro</button>
                        </div>
                    </CustomModal>
                </>
            )}
        </div>
    );
};

export default CashierDashboard;