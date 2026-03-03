import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import type { BusLine, AppView } from './types/types'
import { isBusLine } from './types/types'

import Header from './components/Header'
import BottomNav from './components/BottomNav'
import { LoadingScreen, ErrorScreen } from './components/LoadingScreen'

import Home from './pages/Home'
import Lines from './pages/Lines'
import Schedule from './pages/Schedule'
import About from './pages/About'

const PAGE_TITLES: Record<AppView, string> = {
  home:     'Início',
  lines:    'Linhas',
  schedule: 'Horários',
  about:    'Sobre',
}

function trackPageView(view: AppView) {
  if (import.meta.env.PROD && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_title:    PAGE_TITLES[view],
      page_location: `${window.location.origin}/${view}`,
    })
  }
}

export default function App() {
  const [view, setView]                 = useState<AppView>('home')
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null)
  const [busLines, setBusLines]         = useState<BusLine[]>([])
  const [loading, setLoading]           = useState(true)
  const [erro, setErro]                 = useState(false)
  const [retryKey, setRetryKey]         = useState(0)

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErro(false)

    const timeout = setTimeout(() => {
      if (!cancelled) {
        setErro(true)
        setLoading(false)
      }
    }, 10000)

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
          if (import.meta.env.DEV) console.error('Erro ao buscar linhas:', error)
          setErro(true)
        } else {
          const lines = (data ?? []).filter(isBusLine)
          setBusLines(lines)
          // [3] ao recarregar, re-sincroniza selectedLine com o objeto atualizado
          // do banco (mesmo id, mas pode ter preços/horários novos)
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
      .catch(handleError)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [retryKey])

  const navigateTo = useCallback((newView: AppView) => {
    setView(newView)
    trackPageView(newView)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
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
      <main className="max-w-lg mx-auto px-4 py-5">
        {view === 'home' && (
          <Home busLines={busLines} onNavigate={navigateTo} onSelectLine={handleSelectLine} />
        )}
        {view === 'lines' && (
          <Lines busLines={busLines} onSelectLine={handleSelectLine} />
        )}
        {view === 'schedule' && (
          // [4] se não há linhas, redireciona para home em vez de tela vazia
          busLines.length === 0
            ? <p className="text-center py-16 text-sm text-gray-400">
                Nenhuma linha disponível.{' '}
                <button onClick={() => navigateTo('home')} className="text-[#2ab76a] font-semibold underline">
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
