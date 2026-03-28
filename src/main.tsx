// src/main.tsx
//
// Ponto de entrada da aplicação React.
//
// Responsabilidades:
//   • Montar o componente raiz (App) no elemento HTML com id="root"
//   • StrictMode: ativa verificações extras do React em desenvolvimento,
//     detectando efeitos colaterais acidentais e uso de APIs obsoletas
//   • Registrar o Service Worker para habilitar a instalação como PWA
//     e o funcionamento offline do app
//   • Notificar o usuário quando uma nova versão do SW estiver disponível

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Validação explícita do elemento root — falha rápida com mensagem clara
// em vez de TypeError silenciosa ao tentar chamar .render() em null.
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error(
    '[main] Elemento #root não encontrado no DOM. ' +
    'Verifique se o index.html contém <div id="root"></div>.'
  )
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Registra o Service Worker apenas se o navegador tiver suporte.
// O registro ocorre no evento 'load' para não competir com o carregamento
// inicial da página, garantindo que o app já esteja visível antes do SW iniciar.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      // Detecta quando um novo SW foi instalado e está aguardando ativação.
      // Exibe um banner de atualização para que o usuário possa aplicar
      // a nova versão sem precisar fechar e reabrir o app manualmente.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // Há uma nova versão disponível — dispara evento customizado
            // para que o App.tsx possa exibir o banner de atualização.
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

  // Quando o SW assume controle (após o usuário clicar em "Atualizar"),
  // recarrega a página para aplicar o novo bundle.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}
