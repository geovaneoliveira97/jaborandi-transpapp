import { useState, useCallback, useEffect } from 'react'
import { supabase } from './lib/supabase'

import { ALERTS } from './data/alerts'

import Header from './components/Header'
import BottomNav from './components/BottomNav'

import Home from './pages/Home'
import Lines from './pages/Lines'
import Schedule from './pages/Schedule'
import About from './pages/About'

const PAGE_TITLES = {
  home: 'Início',
  lines: 'Linhas',
  schedule: 'Horários',
  about: 'Sobre',
}

export default function App() {
  const [view, setView] = useState('home')
  const [selectedLine, setSelectedLine] = useState(null)
  const [busLines, setBusLines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLines() {
      const { data, error } = await supabase
        .from('bus_lines')
        .select('*')

      if (error) {
        console.error('Erro ao buscar linhas:', error)
      } else {
        setBusLines(data || [])
      }
      setLoading(false)
    }
    fetchLines()
  }, [])

  const navigateTo = useCallback((newView) => {
    setView(newView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSelectLine = useCallback((line) => {
    setSelectedLine(line)
    navigateTo('schedule')
  }, [navigateTo])

  const alertCount = ALERTS.filter(
    a => a.type === 'danger' || a.type === 'warn'
  ).length

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-[#2ab76a] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Carregando horários...</p>
    </div>
  )

  return (
    <div className="min-h-screen pb-32">

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
          <Lines
            busLines={busLines}
            onSelectLine={handleSelectLine}
          />
        )}

        {view === 'schedule' && (
          <Schedule
            busLines={busLines}
            selectedLine={selectedLine}
            onSelectLine={setSelectedLine}
          />
        )}

        {view === 'about' && (
          <About />
        )}

      </main>

      <BottomNav
        view={view}
        onNavigate={navigateTo}
        alertCount={alertCount}
      />
    </div>
  )
}