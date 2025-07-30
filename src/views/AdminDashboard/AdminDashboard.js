// src/views/AdminDashboard/AdminDashboard.js
import React, { useState } from 'react';
import { LogOut, Settings, Users, UtensilsCrossed, Package, FileText, LineChart, BarChart2, Clock, AlertCircle, MonitorPlay, Building, Calendar } from 'lucide-react';
import SalesReportPanel from './components/SalesReportPanel';
import UserManagementPanel from './components/UserManagementPanel';
// ... (importa los otros paneles que ya tienes)

// El componente UnderConstructionPanel con un estilo más limpio
const UnderConstructionPanel = ({ title }) => (
    <div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 pb-3 border-b-2">{title}</h1>
        <div className="mt-8 flex flex-col items-center text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <Settings className="w-24 h-24 text-gray-300 animate-spin-slow" />
            <p className="mt-6 text-2xl text-gray-600 font-bold">Panel en Desarrollo</p>
            <p className="text-gray-500 mt-2 max-w-md">Esta funcionalidad estará disponible próximamente.</p>
        </div>
    </div>
);

const AdminDashboard = ({ currentUser, setView, setNotificationModal }) => {
    const [panel, setPanel] = useState('userManagement'); // Inicia en Gestión de Usuarios para el ejemplo

    const renderPanel = () => {
        // El switch para renderizar los paneles no cambia
        switch(panel) {
            case 'userManagement': return <UserManagementPanel setNotificationModal={setNotificationModal} />;
            case 'salesReport': return <SalesReportPanel />;
            // ... (agrega los otros casos aquí)
            default: return <UnderConstructionPanel title={panel} />;
        }
    };

    const NavButton = ({ panelName, label, icon: Icon }) => (
        // CAMBIO: Botones con mejor estilo, padding y efecto hover
        <button 
            onClick={() => setPanel(panelName)}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors duration-200 ${
                panel === panelName 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
            }`}
        >
            <Icon size={20} />
            <span className="font-semibold">{label}</span>
        </button>
    );

    return (
        // CAMBIO: Contenedor principal con un fondo gris claro
        <div className="flex h-screen bg-slate-100 font-sans">
            {/* CAMBIO: Sidebar con un color más suave y sombra */}
            <aside className="w-72 bg-white text-gray-800 flex flex-col shadow-lg">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-blue-600">Admin Panel</h2>
                    <p className="text-sm text-gray-500">Sesión: {currentUser.name}</p>
                </div>
                {/* CAMBIO: La navegación ahora tiene más espacio */}
                <nav className="flex-1 p-4 space-y-4">
                    {/* CAMBIO: Cada sección está ahora en su propia "tarjeta" */}
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <h3 className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Reportes</h3>
                        <div className="space-y-1">
                            <NavButton panelName="salesReport" label="Reporte de Ventas" icon={LineChart} />
                            <NavButton panelName="cashierReports" label="Arqueos de Caja" icon={FileText} />
                            <NavButton panelName="waiterProductivity" label="Productividad Meseros" icon={BarChart2} />
                            <NavButton panelName="omissionsReport" label="Omisiones por Mesero" icon={AlertCircle} />
                            <NavButton panelName="prepTimes" label="Tiempos de Preparación" icon={Clock} />
                        </div>
                    </div>
                    
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <h3 className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Gestión</h3>
                        <div className="space-y-1">
                            <NavButton panelName="menuManagement" label="Gestión de Menú" icon={UtensilsCrossed} />
                            <NavButton panelName="stockManagement" label="Gestión de Stock" icon={Package} />
                            <NavButton panelName="userManagement" label="Gestión de Usuarios" icon={Users} />
                            <NavButton panelName="shiftManagement" label="Gestión de Turnos" icon={Calendar} />
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <h3 className="px-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Configuración</h3>
                        <div className="space-y-1">
                            <NavButton panelName="tableManagement" label="Configuración de Mesas" icon={Settings} />
                            <NavButton panelName="companyInfo" label="Datos de Empresa" icon={Building} />
                            <NavButton panelName="tableStatus" label="Estado de Mesas (Live)" icon={MonitorPlay} />
                        </div>
                    </div>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <button onClick={() => setView('login')} className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-all duration-300">
                        <LogOut size={18} /> Cerrar Sesión
                    </button>
                </div>
            </aside>
            {/* CAMBIO: El contenido principal ahora tiene un padding generoso */}
            <main className="flex-1 p-8 overflow-y-auto">
                {/* La tarjeta del contenido principal para que no se pegue a los bordes */}
                <div className="bg-white p-6 rounded-lg shadow-lg min-h-full">
                    {renderPanel()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;