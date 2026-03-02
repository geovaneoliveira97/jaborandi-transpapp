import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

window.onerror = (msg, src, line, col, err) => {
  document.body.innerHTML = `<pre style="color:red;padding:20px">${msg}\n${src}:${line}\n${err?.stack}</pre>`
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Registra o Service Worker para habilitar instalação como PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.error('Service Worker falhou:', err)
    })
  })
}
