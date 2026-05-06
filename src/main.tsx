// src/main.tsx
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('[main] Elemento #root não encontrado no DOM.')
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Registra o Service Worker com atualização automática.
// Quando o SW envia SW_UPDATED (após um novo deploy),
// a página recarrega sozinha para todos os usuários.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      // Recebe mensagem do SW e recarrega automaticamente
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'SW_UPDATED') {
          window.location.reload()
        }
      })

      // Fallback: exibe banner para casos onde o SW já estava ativo
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            window.dispatchEvent(new CustomEvent('sw-update-available', {
              detail: { registration }
            }))
          }
        })
      })
    } catch (err) {
      console.error('[SW] Falha ao registrar Service Worker:', err)
    }
  })

  // Quando o SW assume controle, recarrega a página
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}
