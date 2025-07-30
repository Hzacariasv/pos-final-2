// src/views/AdminDashboard/components/SalesReportPanel.js
import React, { useMemo, useState } from 'react';
import { useData } from '../../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesReportPanel = () => {
    const { sales } = useData();
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [startDate, setStartDate] = useState(startOfMonth.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const filteredSales = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return sales.filter(sale => {
            if (!sale.createdAt) return false;
            const saleDate = sale.createdAt.toDate();
            return saleDate >= start && saleDate <= end;
        });
    }, [sales, startDate, endDate]);

    const salesByDay = filteredSales.reduce((acc, sale) => {
        if (!sale.createdAt) return acc;
        const date = sale.createdAt.toDate().toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
        acc[date] = (acc[date] || 0) + sale.total;
        return acc;
    }, {});

    const chartData = Object.keys(salesByDay).map(date => ({
        date,
        total: salesByDay[date]
    })).sort((a, b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));

    const totalSalesInPeriod = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

    return (
        <div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b-2 pb-3">Reporte de Ventas</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-xl border">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Inicio</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Fin</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-4 rounded-lg flex flex-col justify-center">
                    <p className="font-bold text-lg">Venta Total del Periodo</p>
                    <p className="text-4xl font-extrabold">S/ {totalSalesInPeriod.toFixed(2)}</p>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-700">Ventas por Día</h2>
                <div className="w-full h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis tickFormatter={(value) => `S/ ${value}`} />
                            <Tooltip formatter={(value) => [`S/ ${value.toFixed(2)}`, "Venta Total"]} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
                            <Legend />
                            <Bar dataKey="total" fill="#3b82f6" name="Venta Total" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <h2 className="text-2xl font-bold mb-4 text-gray-700">Detalle de Ventas en Periodo</h2>
                <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-200 sticky top-0">
                            <tr>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Fecha</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Cajero</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Mesa</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Total</th>
                                <th className="py-3 px-4 text-left font-semibold text-gray-600 uppercase">Método</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredSales.sort((a,b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0)).map(sale => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 text-gray-700">{sale.createdAt ? sale.createdAt.toDate().toLocaleString('es-PE') : 'N/A'}</td>
                                    <td className="py-3 px-4 text-gray-700">{sale.cashierName}</td>
                                    <td className="py-3 px-4 text-gray-700">{sale.tableName}</td>
                                    <td className="py-3 px-4 font-bold text-gray-800">S/ {sale.total.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-gray-700">{sale.paymentMethod}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesReportPanel;