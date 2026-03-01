import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import type { BusLine, AppView } from './types/types'

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
  if ((window as any).gtag) {
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

    supabase.from('bus_lines').select('*').then(({ data, error }) => {
      if (cancelled) return
      if (error) {
        if (import.meta.env.DEV) console.error('Erro ao buscar linhas:', error)
        setErro(true)
      } else {
        const lines = (data ?? []) as BusLine[]
        setBusLines(lines)
        setSelectedLine(prev => prev ?? lines[0] ?? null)
      }
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [retryKey])

  const navigateTo = useCallback((newView: AppView) => {
    setView(newView)
    trackPageView(newView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSelectLine = useCallback((line: BusLine) => {
    setSelectedLine(line)
    navigateTo('schedule')
  }, [navigateTo])

  if (loading) return <LoadingScreen />
  if (erro) return <ErrorScreen onRetry={retry} />

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
          <Schedule busLines={busLines} selectedLine={selectedLine} onSelectLine={setSelectedLine} />
        )}
        {view === 'about' && <About />}
      </main>
      <BottomNav view={view} onNavigate={navigateTo} alertCount={0} />
    </div>
  )
}
