import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Clear browser cache
if ('caches' in window) {
  console.log('Limpando caches do navegador...');
  
  // Lista de caches para limpar
  const cachesToClear = [
    'static-site-cache', // Nome comum para caches de sites estáticos
    'workbox-precache',  // Usado pelo Workbox (comum em PWAs)
    'runtime-cache'      // Cache de runtime comum
  ];
  
  // Tenta limpar caches conhecidos
  cachesToClear.forEach(cacheName => {
    caches.delete(cacheName)
      .then(success => {
        console.log(`Cache '${cacheName}' ${success ? 'limpo com sucesso' : 'não encontrado'}`);
      })
      .catch(error => {
        console.error(`Erro ao limpar cache '${cacheName}':`, error);
      });
  });
  
  // Limpa todos os caches disponíveis
  caches.keys().then(cacheNames => {
    console.log('Todos os caches encontrados:', cacheNames);
    return Promise.all(
      cacheNames.map(cacheName => {
        console.log(`Tentando limpar cache: ${cacheName}`);
        return caches.delete(cacheName);
      })
    );
  }).then(() => {
    console.log('Todos os caches foram limpos');
  }).catch(error => {
    console.error('Erro ao limpar todos os caches:', error);
  });
}

// Desregistrar service workers
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

// ADIÇÃO OPCIONAL 1: Verificar se já limpamos o cache nesta sessão
if (!sessionStorage.getItem('cacheCleared')) {
  console.log('Primeira visita na sessão, limpando cache adicional...');
  
  // Limpar localStorage e sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Storage local limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar storage local:', error);
  }
  
  // Marcar que já limpamos o cache nesta sessão
  sessionStorage.setItem('cacheCleared', 'true');
}

// ADIÇÃO OPCIONAL 2: Verificar versão do app
const APP_VERSION = '1.0.1'; // Incremente isso a cada deploy significativo
const lastVersion = localStorage.getItem('appVersion');

if (lastVersion !== APP_VERSION) {
  console.log(`Versão mudou de ${lastVersion || 'nenhuma'} para ${APP_VERSION}, executando ações de atualização...`);
  
  // Você pode adicionar ações específicas para atualização de versão aqui
  
  // Armazenar a nova versão
  localStorage.setItem('appVersion', APP_VERSION);
  
  // Opcional: Recarregar a página para garantir atualizações completas
  // Se descomentado, adicione lógica para evitar loop infinito de recarregamento
  // if (!window.location.search.includes('updated=true')) {
  //   window.location.search = window.location.search ? 
  //     window.location.search + '&updated=true' : 
  //     'updated=true';
  // }
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