import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registrar el Service Worker para habilitar PWA y soporte offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('PWA ServiceWorker registrado con éxito con el scope: ', registration.scope);
      })
      .catch(err => {
        console.log('Fallo al registrar el ServiceWorker de la PWA: ', err);
      });
  });
}
