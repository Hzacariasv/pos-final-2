// src/views/AdminDashboard/components/WaiterProductivityPanel.js
import React, { useMemo } from 'react';
import { useData } from '../../../context/DataContext';

const WaiterProductivityPanel = () => {
    const { sales, users } = useData();
    const waiters = users.filter(u => u.role === 'waiter');

    const productivityData = useMemo(() => {
        const waiterStats = waiters.map(waiter => {
            const waiterSales = sales.filter(sale => sale.waiterId === waiter.id);
            const totalRevenue = waiterSales.reduce((sum, sale) => sum + sale.total, 0);
            const ordersCount = waiterSales.length;
            return {
                id: waiter.id,
                name: waiter.name,
                totalRevenue,
                ordersCount,
                averageTicket: ordersCount > 0 ? totalRevenue / ordersCount : 0,
            };
        });
        return waiterStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [sales, waiters]);

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 pb-3 border-b-2">Productividad de Meseros</h1>
            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
                <table className="min-w-full">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Mesero</th>
                            <th className="py-3 px-4 text-right font-semibold text-gray-600 uppercase">Ventas Totales</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-600 uppercase">N° de Órdenes</th>
                            <th className="py-3 px-4 text-right font-semibold text-gray-600 uppercase">Ticket Promedio</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {productivityData.map(waiter => (
                            <tr key={waiter.id} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4 font-medium text-gray-800">{waiter.name}</td>
                                <td className="py-3 px-4 text-right font-bold text-gray-800">S/ {waiter.totalRevenue.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center font-medium text-gray-600">{waiter.ordersCount}</td>
                                <td className="py-3 px-4 text-right font-medium text-gray-600">S/ {waiter.averageTicket.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WaiterProductivityPanel;