// src/App.tsx
import { useState, useEffect, useCallback, lazy } from 'react'
import { supabase } from './lib/supabase'
import type { BusLine, AppView } from './types/types'
import { isBusLine } from './types/types'

import AppShell      from './layouts/AppShell'
import { LoadingScreen, ErrorScreen } from './components/LoadingScreen'
import UpdateBanner  from './components/UpdateBanner'

const Home     = lazy(() => import('./pages/Home'))
const Lines    = lazy(() => import('./pages/Lines'))
const Schedule = lazy(() => import('./pages/Schedule'))
const Admin    = lazy(() => import('./pages/Admin'))

const PAGE_TITLES: Record<AppView, string> = {
  home:     'Início',
  lines:    'Linhas',
  schedule: 'Horários',
  admin:    'Configurações',
}

declare global {
  interface Window {
    umami?: { track: (event: string, data?: object) => void }
  }
}

export default function App() {
  const [view, setView]                       = useState<AppView>('home')
  const [selectedLine, setSelectedLine]       = useState<BusLine | null>(null)
  const [busLines, setBusLines]               = useState<BusLine[]>([])
  const [loading, setLoading]                 = useState(true)
  const [erro, setErro]                       = useState(false)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [retryKey, setRetryKey]               = useState(0)

  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  useEffect(() => {
    const handler = () => setUpdateAvailable(true)
    window.addEventListener('sw-update-available', handler)
    return () => window.removeEventListener('sw-update-available', handler)
  }, [])

  const applyUpdate = useCallback(() => {
    navigator.serviceWorker.getRegistration().then(reg => {
      reg?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErro(false)

    const timeout = setTimeout(() => {
      if (!cancelled) { setErro(true); setLoading(false) }
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
            if (prev) return lines.find(l => l.id === prev.id) ?? lines[0] ?? null
            return lines[0] ?? null
          })
        }
        setLoading(false)
      })
      .then(undefined, handleError)

    return () => { cancelled = true; clearTimeout(timeout) }
  }, [retryKey])

  const navigateTo = useCallback((newView: AppView) => {
    setView(newView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    window.umami?.track('pageview', { url: `/${newView}`, title: PAGE_TITLES[newView] })
  }, [])

  const handleSelectLine = useCallback((line: BusLine) => {
    setSelectedLine(line)
    navigateTo('schedule')
  }, [navigateTo])

  const alertCount = busLines.filter(l => l.status === 'delay').length

  if (loading) return <LoadingScreen />
  if (erro)    return <ErrorScreen onRetry={retry} />

  return (
    <AppShell
      title={PAGE_TITLES[view]}
      onAdminAccess={() => navigateTo('admin')}
      view={view}
      onNavigate={navigateTo}
      alertCount={alertCount}
      banner={updateAvailable && (
        <UpdateBanner onUpdate={applyUpdate} onDismiss={() => setUpdateAvailable(false)} />
      )}
    >
      {view === 'home' && (
        <Home busLines={busLines} onNavigate={navigateTo} onSelectLine={handleSelectLine} />
      )}
      {view === 'lines' && (
        <Lines busLines={busLines} onSelectLine={handleSelectLine} />
      )}
      {view === 'schedule' && (
        busLines.length === 0
          ? (
            <p className="text-center py-16 text-sm text-muted">
              Nenhuma linha disponível.{' '}
              <button onClick={() => navigateTo('home')} className="text-brand font-semibold underline">
                Voltar ao início
              </button>
            </p>
          )
          : <Schedule busLines={busLines} selectedLine={selectedLine} onSelectLine={setSelectedLine} />
      )}
      {view === 'admin' && <Admin />}
    </AppShell>
  )
}
