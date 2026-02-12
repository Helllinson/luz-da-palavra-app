import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // <-- AGORA USA O APP CORRETO

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Root element não encontrado");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);