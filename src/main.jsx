import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registro do Service Worker para suporte PWA e Modo Estádio Off-line
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        // Atualizações automáticas em segundo plano
        reg.onupdatefound = () => {
          const installingWorker = reg.installing
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] Nova versão do Radar Scout disponível.')
              }
            }
          }
        }
      })
      .catch((err) => {
        console.warn('[PWA] Falha ao registrar Service Worker:', err)
      })
  })
}

