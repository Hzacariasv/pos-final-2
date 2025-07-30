// src/components/PaymentModal.js
import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign } from 'lucide-react';
import { doc, writeBatch, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import CustomModal from './CustomModal';

const PaymentModal = ({ isOpen, onClose, table, cashier, setNotificationModal }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const paidItems = table.currentOrder.paidItems || [];

    useEffect(() => {
        setSelectedItems([]);
    }, [isOpen, table]);

    const handleItemToggle = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const processPayment = async (itemsToPay, totalAmount, method) => {
        const batch = writeBatch(db);
        
        // 1. Crear el registro de la venta
        const saleRef = doc(collection(db, "sales"));
        batch.set(saleRef, {
            cashierId: cashier.id,
            cashierName: cashier.name,
            waiterId: table.waiterId ?? null,
            waiterName: table.waiterName ?? null,
            tableId: table.id,
            tableName: table.name,
            customerName: table.currentOrder.customerName || 'Consumidor Final',
            items: itemsToPay,
            total: totalAmount,
            createdAt: serverTimestamp(),
            paymentMethod: method
        });

        // 2. Actualizar la mesa
        const tableRef = doc(db, "tables", table.id);
        const newPaidItems = [...paidItems, ...itemsToPay];
        const allItemsInOrder = table.currentOrder.items;
        
        const allItemsPaid = allItemsInOrder.every(orderItem => 
            newPaidItems.some(paidItem => paidItem.id === orderItem.id)
        );

        if (allItemsPaid) {
            // Si todo está pagado, se libera la mesa
            batch.update(tableRef, {
                status: 'free',
                waiterId: null,
                waiterName: null,
                waiterColor: null,
                currentOrder: { items: [], paidItems: [], customerName: '', status: 'new' }
            });
        } else {
            // Si es un pago parcial, solo se actualizan los items pagados
            batch.update(tableRef, {
                'currentOrder.paidItems': newPaidItems
            });
        }

        await batch.commit();

        if (allItemsPaid) {
            onClose();
            setNotificationModal({isOpen: true, message: `Mesa ${table.name} liquidada con éxito.`});
        } else {
            setSelectedItems([]);
            setNotificationModal({isOpen: true, message: `Pago parcial de S/${totalAmount.toFixed(2)} (${method}) registrado.`});
        }
    };

    const handlePaySelection = () => {
        const itemsToPay = table.currentOrder.items.filter(item => selectedItems.includes(item.id));
        if (itemsToPay.length === 0) return;
        const total = itemsToPay.reduce((sum, item) => sum + item.price * item.quantity, 0);
        processPayment(itemsToPay, total, paymentMethod);
    };

    const remainingItemsToPay = table.currentOrder.items.filter(item => !paidItems.some(paid => paid.id === item.id));

    const handlePayTotal = () => {
        if (remainingItemsToPay.length === 0) return;
        const total = remainingItemsToPay.reduce((sum, item) => sum + item.price * item.quantity, 0);
        processPayment(remainingItemsToPay, total, paymentMethod);
    };

    const selectionTotal = table.currentOrder.items
        .filter(item => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const remainingTotal = remainingItemsToPay.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CustomModal isOpen={isOpen} onClose={onClose} title={`Cobro - ${table.name}`} size="lg">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold">Cliente:</p>
                <p className="font-bold text-xl text-blue-900">{table.currentOrder.customerName || 'Consumidor Final'}</p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {table.currentOrder.items.map(item => {
                    const isPaid = paidItems.some(paidItem => paidItem.id === item.id);
                    return (
                        <div key={item.id} className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-300 ${isPaid ? 'bg-gray-200 text-gray-500' : 'bg-white'}`}>
                            <input
                                type="checkbox"
                                className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleItemToggle(item.id)}
                                disabled={isPaid}
                            />
                            <div className={`flex-grow ${isPaid ? 'line-through' : ''}`}>
                                <p className="font-semibold">{item.quantity}x {item.name}</p>
                            </div>
                            <p className={`font-bold text-lg ${isPaid ? 'line-through' : ''}`}>S/ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 border-t pt-4 space-y-4">
                <div className="flex justify-between items-center text-2xl">
                    <span className="font-bold text-gray-700">SALDO PENDIENTE:</span>
                    <span className="font-extrabold text-red-600">S/ {remainingTotal.toFixed(2)}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="font-semibold mb-2 text-gray-800">Pagar Selección (S/ {selectionTotal.toFixed(2)}) con:</p>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setPaymentMethod('Efectivo')} className={`p-2 rounded-lg font-semibold border-2 transition-all duration-300 ${paymentMethod === 'Efectivo' ? 'bg-green-500 text-white border-green-600' : 'bg-white hover:bg-gray-100'}`}>Efectivo</button>
                        <button onClick={() => setPaymentMethod('Tarjeta')} className={`p-2 rounded-lg font-semibold border-2 transition-all duration-300 ${paymentMethod === 'Tarjeta' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white hover:bg-gray-100'}`}>Tarjeta</button>
                        <button onClick={() => setPaymentMethod('Yape/Plin')} className={`p-2 rounded-lg font-semibold border-2 transition-all duration-300 ${paymentMethod === 'Yape/Plin' ? 'bg-purple-500 text-white border-purple-600' : 'bg-white hover:bg-gray-100'}`}>Yape/Plin</button>
                    </div>
                    <button onClick={handlePaySelection} disabled={selectedItems.length === 0} className="w-full mt-3 bg-orange-500 text-white font-bold py-3 rounded-lg disabled:bg-gray-400 flex items-center justify-center gap-2 transition-all duration-300 shadow hover:shadow-lg transform hover:scale-105">
                        <CreditCard size={20}/> Pagar Selección
                    </button>
                </div>
                <button onClick={handlePayTotal} disabled={remainingItemsToPay.length === 0} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:bg-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                    <DollarSign size={20}/> Liquidar Saldo Total (S/ {remainingTotal.toFixed(2)})
                </button>
            </div>
        </CustomModal>
    );
};

export default PaymentModal;