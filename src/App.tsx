// src/App.tsx
//
// Componente raiz da aplicação — controla qual página está visível
// e gerencia o estado global compartilhado entre as páginas.
//
// Responsabilidades:
//   • Buscar as linhas de ônibus do banco (Supabase) ao iniciar
//   • Controlar a navegação entre as quatro páginas (home, lines, schedule, about)
//   • Manter a linha selecionada sincronizada mesmo após recarregamento dos dados
//   • Exibir banner de atualização quando uma nova versão do PWA estiver disponível

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import type { BusLine, AppView } from './types/types'
import { isBusLine } from './types/types'

import Header from './components/Header'
import BottomNav from './components/BottomNav'
import { LoadingScreen, ErrorScreen } from './components/LoadingScreen'
import UpdateBanner from './components/UpdateBanner'

import Home     from './pages/Home'
import Lines    from './pages/Lines'
import Schedule from './pages/Schedule'
import About    from './pages/About'

const PAGE_TITLES: Record<AppView, string> = {
  home:     'Início',
  lines:    'Linhas',
  schedule: 'Horários',
  about:    'Sobre',
}

// Declaração de tipo para o Umami
declare global {
  interface Window {
    umami?: { track: (event: string, data?: object) => void }
  }
}

export default function App() {
  const [view, setView]                 = useState<AppView>('home')
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null)
  const [busLines, setBusLines]         = useState<BusLine[]>([])
  const [loading, setLoading]           = useState(true)
  const [erro, setErro]                 = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  const [retryKey, setRetryKey] = useState(0)
  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  // Escuta o evento de nova versão do SW disparado pelo main.tsx
  useEffect(() => {
    const handler = () => setUpdateAvailable(true)
    window.addEventListener('sw-update-available', handler)
    return () => window.removeEventListener('sw-update-available', handler)
  }, [])

  // Força a ativação do novo SW e recarrega a página
  const applyUpdate = useCallback(() => {
    navigator.serviceWorker.getRegistration().then(reg => {
      reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    })
  }, [])

  // Busca as linhas de ônibus do Supabase ao montar o componente
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErro(false)

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setErro(true)
        setLoading(false)
      }
    }, 10_000)

    const handleError = () => {
      clearTimeout(timeout)
      if (cancelled) return
      setErro(true)
      setLoading(false)
    }

    supabase.from('bus_lines').select('*')
      .then(({ data, error }) => {
        clearTimeout(timeout)
        if (cancelled) return

        if (error) {
          if (import.meta.env.DEV) console.error('[App] Erro ao buscar linhas:', error)
          setErro(true)
        } else {
          const lines = (data ?? []).filter(isBusLine)
          setBusLines(lines)

          setSelectedLine(prev => {
            if (prev) {
              const updated = lines.find(l => l.id === prev.id)
              return updated ?? lines[0] ?? null
            }
            return lines[0] ?? null
          })
        }
        setLoading(false)
      })
      .then(undefined, handleError)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [retryKey])

  const navigateTo = useCallback((newView: AppView) => {
    setView(newView)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // Rastreia a navegação no Umami
    if (typeof window.umami !== 'undefined') {
      window.umami.track('pageview', { url: `/${newView}`, title: PAGE_TITLES[newView] })
    }
  }, [])

  const handleSelectLine = useCallback((line: BusLine) => {
    setSelectedLine(line)
    navigateTo('schedule')
  }, [navigateTo])

  if (loading) return <LoadingScreen />
  if (erro)    return <ErrorScreen onRetry={retry} />

  return (
    <div className="min-h-screen pb-32 bg-gray-50">
      <Header title={PAGE_TITLES[view]} />

      {updateAvailable && (
        <UpdateBanner onUpdate={applyUpdate} onDismiss={() => setUpdateAvailable(false)} />
      )}

      <main className="max-w-lg mx-auto px-4 py-5">
        {view === 'home' && (
          <Home busLines={busLines} onNavigate={navigateTo} onSelectLine={handleSelectLine} />
        )}
        {view === 'lines' && (
          <Lines busLines={busLines} onSelectLine={handleSelectLine} />
        )}
        {view === 'schedule' && (
          busLines.length === 0
            ? <p className="text-center py-16 text-sm text-gray-400">
                Nenhuma linha disponível.{' '}
                <button onClick={() => navigateTo('home')} className="text-[#2ab76a] font-semibond underline">
                  Voltar ao início
                </button>
              </p>
            : <Schedule busLines={busLines} selectedLine={selectedLine} onSelectLine={setSelectedLine} />
        )}
        {view === 'about' && <About />}
      </main>
      <BottomNav view={view} onNavigate={navigateTo} alertCount={0} />
    </div>
  )
}