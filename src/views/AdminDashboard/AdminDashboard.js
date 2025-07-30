// src/views/AdminDashboard/AdminDashboard.js
import React, { useState } from 'react';
import { LogOut, Settings, Users, UtensilsCrossed, Package, FileText, LineChart, BarChart2, Clock, AlertCircle, MonitorPlay, Building, Calendar } from 'lucide-react';

// Importando TODOS los paneles primero
import SalesReportPanel from './components/SalesReportPanel';
import UserManagementPanel from './components/UserManagementPanel';
import MenuManagementPanel from './components/MenuManagementPanel';
import StockManagementPanel from './components/StockManagementPanel';
import CompanyInfoPanel from './components/CompanyInfoPanel';
import WaiterProductivityPanel from './components/WaiterProductivityPanel';
import TableManagementPanel from './components/TableManagementPanel';
import ShiftManagementPanel from '../../components/ShiftManagementPanel'; // Este es compartido

// AHORA, después de todos los imports, definimos el componente
const UnderConstructionPanel = ({ title }) => (
    <div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 pb-3 border-b-2">{title}</h1>
        <div className="mt-8 flex flex-col items-center text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <Settings className="w-24 h-24 text-gray-300 animate-spin-slow" />
            <p className="mt-6 text-2xl text-gray-600 font-bold">Panel en Desarrollo</p>
            <p className="text-gray-500 mt-2 max-w-md">La lógica completa para este reporte estará disponible próximamente.</p>
        </div>
    </div>
);

// Y finalmente, el componente principal del dashboard
const AdminDashboard = ({ currentUser, setView, setNotificationModal }) => {
    const [panel, setPanel] = useState('salesReport');

    const renderPanel = () => {
        switch(panel) {
            case 'salesReport': return <SalesReportPanel />;
            case 'userManagement': return <UserManagementPanel setNotificationModal={setNotificationModal} />;
            case 'menuManagement': return <MenuManagementPanel setNotificationModal={setNotificationModal} />;
            case 'stockManagement': return <StockManagementPanel setNotificationModal={setNotificationModal} />;
            case 'companyInfo': return <CompanyInfoPanel setNotificationModal={setNotificationModal}/>;
            case 'shiftManagement': return <ShiftManagementPanel />;
            case 'waiterProductivity': return <WaiterProductivityPanel />;
            case 'tableManagement': return <TableManagementPanel setNotificationModal={setNotificationModal} />;
            case 'cashierReports': return <UnderConstructionPanel title="Arqueos de Caja" />;
            case 'omissionsReport': return <UnderConstructionPanel title="Omisiones por Mesero" />;
            case 'prepTimes': return <UnderConstructionPanel title="Tiempos de Preparación" />;
            case 'tableStatus': return <UnderConstructionPanel title="Estado de Mesas en Tiempo Real" />;
            default: return <div>Seleccione un panel</div>;
        }
    };

    const NavButton = ({ panelName, label, icon: Icon }) => (
        <button onClick={() => setPanel(panelName)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-left transition-colors duration-200 ${panel === panelName ? 'bg-gray-900 text-white shadow-inner' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
            <Icon size={20} />
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-72 bg-gray-800 text-white flex flex-col shadow-2xl">
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold">Admin Panel</h2>
                    <p className="text-sm text-gray-400">Sesión: {currentUser.name}</p>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <h3 className="px-4 pt-2 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Reportes</h3>
                    <NavButton panelName="salesReport" label="Reporte de Ventas" icon={LineChart} />
                    <NavButton panelName="cashierReports" label="Arqueos de Caja" icon={FileText} />
                    <NavButton panelName="waiterProductivity" label="Productividad Meseros" icon={BarChart2} />
                    <NavButton panelName="omissionsReport" label="Omisiones por Mesero" icon={AlertCircle} />
                    <NavButton panelName="prepTimes" label="Tiempos de Preparación" icon={Clock} />
                    <h3 className="px-4 pt-4 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Gestión</h3>
                    <NavButton panelName="menuManagement" label="Gestión de Menú" icon={UtensilsCrossed} />
                    <NavButton panelName="stockManagement" label="Gestión de Stock" icon={Package} />
                    <NavButton panelName="userManagement" label="Gestión de Usuarios" icon={Users} />
                    <NavButton panelName="shiftManagement" label="Gestión de Turnos" icon={Calendar} />
                    <h3 className="px-4 pt-4 pb-1 text-xs font-bold text-gray-500 uppercase tracking-wider">Configuración</h3>
                    <NavButton panelName="tableManagement" label="Configuración de Mesas" icon={Settings} />
                    <NavButton panelName="companyInfo" label="Datos de Empresa" icon={Building} />
                    <NavButton panelName="tableStatus" label="Estado de Mesas (Live)" icon={MonitorPlay} />
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button onClick={() => setView('login')} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-all duration-300">
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="bg-white p-6 rounded-lg shadow-lg min-h-full">
                    {renderPanel()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;