// src/views/WaiterDashboard.js
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { db } from '../services/firebase';
import { doc, writeBatch, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import { LogOut, MinusCircle, PlusCircle, Trash2, ShoppingCart, MonitorPlay } from 'lucide-react';
import * as Tone from 'tone';

const WaiterDashboard = ({ currentUser, setView, setNotificationModal }) => {
    const [selectedTable, setSelectedTable] = useState(null);
    const [currentOrder, setCurrentOrder] = useState({ items: [], customerName: '', status: 'new' });
    const [timeRemaining, setTimeRemaining] = useState('');
    
    // Obtenemos los datos desde el Contexto
    const { menu, tables, shifts } = useData();

    const waiterShift = shifts.find(s => s.waiterId === currentUser.id && s.endTime && s.endTime.toDate() > new Date());
    
    // El resto de la lógica del componente no cambia, solo la forma en que recibe los datos.
    useEffect(() => {
        if (!waiterShift || !waiterShift.endTime) return;
        const interval = setInterval(() => {
            const now = new Date();
            const endTime = waiterShift.endTime.toDate();
            const diff = endTime.getTime() - now.getTime();
            if (diff <= 0) {
                setTimeRemaining('Turno finalizado');
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [waiterShift]);

    useEffect(() => {
        const myTables = tables.filter(t => t.waiterId === currentUser.id);
        myTables.forEach(table => {
            if (table.status === 'ready') {
                const synth = new Tone.Synth().toDestination();
                synth.triggerAttackRelease("C5", "8n");
                if ('vibrate' in navigator) { navigator.vibrate([200, 100, 200]); }
                setNotificationModal({isOpen: true, message: `¡Mesa ${table.name} está lista para recoger!`});
            }
        });
    }, [tables, currentUser.id, setNotificationModal]);

    const handleSelectTable = (table) => {
        if (table.status === 'free') {
            const newOrder = { items: [], customerName: '', status: 'new', paidItems: [] };
            setSelectedTable(table);
            setCurrentOrder(newOrder);
            const batch = writeBatch(db);
            const tableRef = doc(db, "tables", table.id);
            batch.update(tableRef, { status: 'occupied', waiterId: currentUser.id, waiterName: currentUser.name, waiterColor: currentUser.color || '#808080', currentOrder: newOrder });
            batch.commit();
        } else if (table.waiterId === currentUser.id) {
            setSelectedTable(table);
            setCurrentOrder(table.currentOrder);
        } else if (table.status !== 'free') {
            setNotificationModal({isOpen: true, message: `Mesa ocupada por ${table.waiterName}`});
        }
    };

    const addToOrder = (product) => {
        setCurrentOrder(prevOrder => {
            const existingItem = prevOrder.items.find(item => item.id === product.id);
            let newItems;
            if (existingItem) {
                newItems = prevOrder.items.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            } else {
                newItems = [...prevOrder.items, { ...product, quantity: 1, notes: '' }];
            }
            return { ...prevOrder, items: newItems, status: 'confirmed' };
        });
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromOrder(productId);
            return;
        }
        setCurrentOrder(prevOrder => ({ ...prevOrder, items: prevOrder.items.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item), status: 'confirmed' }));
    };

    const removeFromOrder = (productId) => {
        setCurrentOrder(prevOrder => ({ ...prevOrder, items: prevOrder.items.filter(item => item.id !== productId), status: 'confirmed' }));
    };

    const updateItemNotes = (productId, notes) => {
        setCurrentOrder(prevOrder => ({ ...prevOrder, items: prevOrder.items.map(item => item.id === productId ? { ...item, notes } : item), status: 'confirmed' }));
    };

    const handleConfirmOrder = async () => {
        if (!selectedTable) return;
        const tableRef = doc(db, "tables", selectedTable.id);
        await updateDoc(tableRef, { currentOrder });
        setNotificationModal({isOpen: true, message: 'Pedido local confirmado en la mesa.'});
    };

    const handleSendToKitchen = async () => {
        if (!selectedTable || currentOrder.items.length === 0) return;
        await handleConfirmOrder();
        const kitchenOrder = { tableId: selectedTable.id, tableName: selectedTable.name, waiterName: currentUser.name, items: currentOrder.items, status: 'pending', createdAt: serverTimestamp(), readyAt: null };
        await addDoc(collection(db, "kitchenOrders"), kitchenOrder);
        const updatedOrderState = { ...currentOrder, status: 'sent' };
        setCurrentOrder(updatedOrderState);
        const tableRef = doc(db, "tables", selectedTable.id);
        await updateDoc(tableRef, { currentOrder: updatedOrderState });
        setNotificationModal({isOpen: true, message: 'Pedido enviado a cocina.'});
    };

    const handleReadyForBilling = async () => {
        if (!selectedTable) return;
        const tableRef = doc(db, "tables", selectedTable.id);
        await updateDoc(tableRef, { status: 'billing' });
        setSelectedTable(null);
        setCurrentOrder({ items: [], customerName: '', status: 'new' });
    };
    
    const total = currentOrder.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const categories = [...new Set(menu.map(item => item.category))];
    const canSendToKitchen = currentOrder.status === 'confirmed' && currentOrder.items.length > 0;
    const canBill = selectedTable?.status === 'ready';

    // El JSX/HTML no cambia
    return (
        <div className="h-screen w-screen bg-gray-100 grid grid-cols-12 grid-rows-1 auto-rows-auto gap-3 p-3 font-sans">
            <header className="col-span-12 bg-white rounded-lg shadow-md p-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div style={{backgroundColor: currentUser.color}} className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-inner`}>
                        {currentUser.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{currentUser.name}</h1>
                        <p className="text-sm text-gray-500 font-medium">Rol: Mesero</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-gray-700 text-sm">Fin de turno en:</p>
                    <p className="text-lg font-bold text-red-600">{timeRemaining}</p>
                </div>
                <button onClick={() => setView('login')} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-md transform hover:scale-95">
                    <LogOut size={18} /> Salir
                </button>
            </header>
            <div className="col-span-12 md:col-span-3 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 border-b pb-3">Mapa de Mesas</h2>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2.5">
                    {tables.map(table => {
                        let colorClass = 'bg-gray-200 hover:bg-gray-300 border-gray-300';
                        let textColor = 'text-gray-700';
                        let style = {};
                        let animationClass = '';
                        if (table.status === 'occupied') { style = {backgroundColor: table.waiterColor, border: `2px solid ${table.waiterColor}`}; textColor = 'text-white'; colorClass = '' } 
                        else if (table.status === 'ready') { colorClass = 'bg-cyan-400 border-cyan-500'; textColor = 'text-white'; animationClass = 'animate-pulse'; } 
                        else if (table.status === 'billing') { colorClass = 'bg-red-500 border-red-600'; textColor = 'text-white'; }
                        return (
                            <button key={table.id} onClick={() => handleSelectTable(table)} style={style}
                                className={`aspect-square rounded-lg font-bold flex flex-col items-center justify-center transition-all duration-300 border-2 shadow-sm hover:shadow-lg transform hover:-translate-y-1 ${colorClass} ${textColor} ${animationClass} ${selectedTable?.id === table.id ? 'ring-4 ring-blue-500' : ''}`}>
                                <span className="text-xl">{table.name?.split(' ')[1] || ''}</span>
                                <span className="text-xs font-semibold uppercase">{table.status === 'occupied' ? table.waiterName?.split(' ')[0] : table.status}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="col-span-12 md:col-span-5 bg-white rounded-lg shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-center text-gray-800">Pedido: {selectedTable?.name || 'Seleccione una mesa'}</h2>
                </div>
                {selectedTable ? (
                    <>
                        <div className="p-4 flex-grow overflow-y-auto bg-gray-50">
                            <div className="mb-4">
                                <label htmlFor="customerName" className="block text-sm font-bold text-gray-700 mb-1">Nombre del Cliente (Opcional)</label>
                                <input id="customerName" type="text" value={currentOrder.customerName} onChange={(e) => setCurrentOrder({...currentOrder, customerName: e.target.value, status: 'confirmed'})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition" placeholder="Ej: Juan Pérez" />
                            </div>
                            {currentOrder.items.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <ShoppingCart size={48} className="mx-auto text-gray-300" />
                                    <p className="mt-2">Añada productos desde el menú</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {currentOrder.items.map(item => (
                                        <div key={item.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
                                            <div className="flex-grow">
                                                <p className="font-bold text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-600">S/ {item.price.toFixed(2)}</p>
                                                <input type="text" placeholder="Notas para cocina..." value={item.notes} onChange={(e) => updateItemNotes(item.id, e.target.value)} className="w-full text-xs mt-1 p-1.5 border rounded-md" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="bg-red-100 text-red-700 rounded-full p-1.5 transition-colors hover:bg-red-200"><MinusCircle size={20}/></button>
                                                <span className="font-bold w-8 text-center text-lg">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="bg-green-100 text-green-700 rounded-full p-1.5 transition-colors hover:bg-green-200"><PlusCircle size={20}/></button>
                                            </div>
                                            <button onClick={() => removeFromOrder(item.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                            <div className="flex justify-between items-center text-2xl font-bold mb-4">
                                <span className="text-gray-700">Total:</span>
                                <span className="text-black">S/ {total.toFixed(2)}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button onClick={handleConfirmOrder} disabled={currentOrder.items.length === 0} className="bg-blue-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105">Confirmar</button>
                                <button onClick={handleSendToKitchen} disabled={!canSendToKitchen} className="bg-green-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105">Enviar a Cocina</button>
                                <button onClick={handleReadyForBilling} disabled={!canBill} className="bg-orange-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 transition-all shadow-md hover:shadow-lg transform hover:scale-105">Listo p/ Cobrar</button>
                            </div>
                        </div>
                    </>
                ) : (
                     <div className="flex-grow flex items-center justify-center bg-gray-50">
                        <div className="text-center text-gray-400">
                           <MonitorPlay size={64} className="mx-auto" />
                           <p className="mt-4 text-lg font-medium">Por favor, seleccione o abra una mesa para empezar.</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="col-span-12 md:col-span-4 bg-white rounded-lg shadow-md flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-2xl font-bold text-center text-gray-800">Menú</h2>
                </div>
                <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
                    {categories.map(category => (
                        <div key={category} className="mb-5">
                            <h3 className="font-bold text-lg text-gray-700 mb-3 border-b-2 border-gray-200 pb-2">{category}</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                {menu.filter(p => p.category === category && p.available && p.stock > 0).map(product => (
                                    <button key={product.id} onClick={() => addToOrder(product)} disabled={!selectedTable}
                                        className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:bg-blue-50 hover:border-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white shadow-sm hover:shadow-md">
                                        <p className="font-semibold text-sm text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-500">S/ {product.price.toFixed(2)}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WaiterDashboard;