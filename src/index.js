// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Asegúrate de tener un archivo index.css para los estilos base de Tailwind
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Este bloque de código inyecta las animaciones CSS en la página.
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
    @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
    @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
    @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
    .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
    @keyframes spin-slow { to { transform: rotate(360deg); } }
    .animate-spin-slow { animation: spin-slow 3s linear infinite; }
    @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
    .animate-shake { animation: shake 0.5s ease-in-out; }
`;
document.head.appendChild(styleSheet);