// src/views/ChefDashboard.js
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { db } from '../services/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ChefHat, LogOut, CheckCircle } from 'lucide-react';

const ChefDashboard = ({ currentUser, setView }) => {
    const [activeTab, setActiveTab] = useState('pending');
    const [checkedItems, setCheckedItems] = useState({});

    // Obtenemos los datos desde el Contexto
    const { kitchenOrders } = useData();

    const handleCheckItem = (orderId, itemId) => {
        setCheckedItems(prev => ({ ...prev, [`${orderId}-${itemId}`]: !prev[`${orderId}-${itemId}`] }));
    };

    const handleMarkOrderComplete = async (order) => {
        const batch = writeBatch(db);
        const kitchenOrderRef = doc(db, "kitchenOrders", order.id);
        batch.update(kitchenOrderRef, { status: 'ready', readyAt: serverTimestamp() });
        const tableRef = doc(db, "tables", order.tableId);
        batch.update(tableRef, { status: 'ready' });
        await batch.commit();
    };

    const OrderCard = ({ order }) => {
        const allItemsChecked = order.items.every(item => checkedItems[`${order.id}-${item.id}`]);
        return (
            <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col gap-3 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-center border-b pb-3">
                    <div>
                        <h3 className="font-bold text-xl text-gray-900">{order.tableName}</h3>
                        <p className="text-sm text-gray-500">Mesero: {order.waiterName}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold">{order.createdAt?.toDate() ? new Date(order.createdAt.toDate()).toLocaleTimeString() : '...'}</p>
                        {order.status === 'ready' && order.readyAt && (<p className="text-xs text-green-600 font-bold">Listo a las {new Date(order.readyAt.toDate()).toLocaleTimeString()}</p>)}
                    </div>
                </div>
                <div className="space-y-2 py-2">
                    {order.items.map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex items-start gap-3 bg-gray-50 p-2.5 rounded-md border">
                            {order.status === 'pending' && (<input type="checkbox" className="mt-1 h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" checked={!!checkedItems[`${order.id}-${item.id}`]} onChange={() => handleCheckItem(order.id, item.id)} />)}
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{item.quantity}x {item.name}</p>
                                {item.notes && <p className="text-xs text-red-600 italic font-medium">Nota: {item.notes}</p>}
                            </div>
                        </div>
                    ))}
                </div>
                {order.status === 'pending' && (
                    <button onClick={() => handleMarkOrderComplete(order)} disabled={!allItemsChecked}
                        className="w-full bg-green-500 text-white font-bold py-2.5 rounded-lg mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105">
                        <CheckCircle size={20} /> Marcar Orden Como Lista
                    </button>
                )}
            </div>
        );
    };

    const pendingOrders = kitchenOrders.filter(o => o.status === 'pending').sort((a,b) => (a.createdAt?.toDate() || 0) - (b.createdAt?.toDate() || 0));
    const readyOrders = kitchenOrders.filter(o => o.status === 'ready').sort((a,b) => (b.readyAt?.toDate() || 0) - (a.readyAt?.toDate() || 0));
    
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <header className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <ChefHat size={32} className="text-red-500" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Panel de Cocina</h1>
                        <p className="text-gray-600">Bienvenido, {currentUser.name}</p>
                    </div>
                </div>
                <button onClick={() => setView('login')} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md transform hover:scale-95">
                    <LogOut size={18} /> Salir
                </button>
            </header>
            <div className="bg-white rounded-lg shadow-md">
                <div className="flex border-b border-gray-200">
                    <button onClick={() => setActiveTab('pending')} className={`flex-1 py-3 px-6 font-bold text-lg transition-all duration-300 ${activeTab === 'pending' ? 'border-b-4 border-red-500 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>Pendientes ({pendingOrders.length})</button>
                    <button onClick={() => setActiveTab('ready')} className={`flex-1 py-3 px-6 font-bold text-lg transition-all duration-300 ${activeTab === 'ready' ? 'border-b-4 border-green-500 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}>Listos ({readyOrders.length})</button>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {activeTab === 'pending' && pendingOrders.map(order => <OrderCard key={order.id} order={order} />)}
                    {activeTab === 'ready' && readyOrders.map(order => <OrderCard key={order.id} order={order} />)}
                     {activeTab === 'pending' && pendingOrders.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">No hay pedidos pendientes.</p>}
                    {activeTab === 'ready' && readyOrders.length === 0 && <p className="col-span-full text-center text-gray-500 py-10">No hay pedidos listos.</p>}
                </div>
            </div>
        </div>
    );
};

export default ChefDashboard;