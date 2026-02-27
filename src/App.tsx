import { useState, useCallback, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { ALERTS } from './data/alerts'
import type { BusLine, AppView, Alert } from './types/types'
import { useTheme } from './context/ThemeContext'

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

const ALERT_COUNT = ALERTS.filter(
  (a: Alert) => a.type === 'danger' || a.type === 'warn'
).length

export default function App() {
  const { isDark } = useTheme()
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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSelectLine = useCallback((line: BusLine) => {
    setSelectedLine(line)
    navigateTo('schedule')
  }, [navigateTo])

  if (loading) return <LoadingScreen />

  if (erro) return <ErrorScreen onRetry={retry} />

  return (
    <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Header title={PAGE_TITLES[view]} />

      <main className="max-w-lg mx-auto px-4 py-5">
        {view === 'home' && (
          <Home
            busLines={busLines}
            alerts={ALERTS}
            onNavigate={navigateTo}
            onSelectLine={handleSelectLine}
          />
        )}
        {view === 'lines' && (
          <Lines busLines={busLines} onSelectLine={handleSelectLine} />
        )}
        {view === 'schedule' && (
          <Schedule
            busLines={busLines}
            selectedLine={selectedLine}
            onSelectLine={setSelectedLine}
          />
        )}
        {view === 'about' && <About />}
      </main>

      <BottomNav view={view} onNavigate={navigateTo} alertCount={ALERT_COUNT} />
    </div>
  )
}