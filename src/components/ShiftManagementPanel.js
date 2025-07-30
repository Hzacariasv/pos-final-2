// src/components/ShiftManagementPanel.js
import React from 'react';
import { doc, deleteDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useData } from '../context/DataContext';
import { ToggleLeft, ToggleRight } from 'lucide-react';

const ShiftManagementPanel = () => {
    // Este componente obtiene los datos por sí mismo, así que es muy fácil de usar en cualquier parte
    const { users, shifts } = useData();
    const waiters = users.filter(u => u.role === 'waiter');
    const activeShifts = shifts.filter(s => s.endTime && s.endTime.toDate() > new Date());

    const toggleShift = async (waiter) => {
        const existingShift = activeShifts.find(s => s.waiterId === waiter.id);
        if (existingShift) {
            await deleteDoc(doc(db, "shifts", existingShift.id));
        } else {
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 10 * 60 * 60 * 1000); // Turno de 10 horas
            await addDoc(collection(db, "shifts"), {
                waiterId: waiter.id,
                waiterName: waiter.name,
                startTime: serverTimestamp(),
                endTime: endTime
            });
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-inner border">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Gestión de Turnos de Meseros</h2>
            <div className="space-y-3">
                {waiters.map(waiter => {
                    const isActive = activeShifts.some(s => s.waiterId === waiter.id);
                    return (
                        <div key={waiter.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border">
                            <span className="font-semibold text-gray-700">{waiter.name}</span>
                            <button
                                onClick={() => toggleShift(waiter)}
                                className={`font-bold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 ${isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                            >
                                {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                {isActive ? 'Desactivar Turno' : 'Activar Turno'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShiftManagementPanel;