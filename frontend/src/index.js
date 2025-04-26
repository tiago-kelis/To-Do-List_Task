import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Adicione este bloco para desregistrar service workers
if ('serviceWorker' in navigator) {
  console.log("Tentando desregistrar service workers...");
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      console.log("Desregistrando service worker:", registration);
      registration.unregister();
    }
    console.log("Service workers desregistrados com sucesso");
  }).catch(error => {
    console.error("Erro ao desregistrar service workers:", error);
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();