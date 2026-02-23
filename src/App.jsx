import { useState, useCallback, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { ALERTS } from './data/alerts'

import Header from './components/Header'
import BottomNav from './components/BottomNav'
import { LoadingScreen, ErrorScreen } from './components/LoadingScreen'

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

  // ✅ selectedLine começa null e é preenchido assim que as linhas carregam
  // ou quando o usuário clica em uma linha específica
  const [selectedLine, setSelectedLine] = useState(null)

  const [busLines, setBusLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)

  async function fetchLines() {
    setLoading(true)
    setErro(false)
    const { data, error } = await supabase.from('bus_lines').select('*')
    if (error) {
      console.error('Erro ao buscar linhas:', error)
      setErro(true)
    } else {
      const lines = data || []
      setBusLines(lines)

      // ✅ Se ainda não há linha selecionada, usa a primeira por padrão
      setSelectedLine(prev => prev ?? lines[0] ?? null)
    }
    setLoading(false)
  }

  useEffect(() => { fetchLines() }, [])

  const navigateTo = useCallback((newView) => {
    setView(newView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ✅ handleSelectLine agora é a única função que atualiza selectedLine
  const handleSelectLine = useCallback((line) => {
    setSelectedLine(line)
    navigateTo('schedule')
  }, [navigateTo])

  const alertCount = ALERTS.filter(
    a => a.type === 'danger' || a.type === 'warn'
  ).length

  if (loading) return <LoadingScreen />
  if (erro) return <ErrorScreen onRetry={fetchLines} />

  return (
    <div className="min-h-screen pb-32">
      <Header title={PAGE_TITLES[view]} />

      <main className="max-w-lg mx-auto px-4 py-5">
        {view === 'home' && (
          <Home busLines={busLines} alerts={ALERTS}
            onNavigate={navigateTo} onSelectLine={handleSelectLine} />
        )}
        {view === 'lines' && (
          <Lines busLines={busLines} onSelectLine={handleSelectLine} />
        )}
        {view === 'schedule' && (
          // ✅ selectedLine é a única fonte de verdade — Schedule não precisa de estado local
          <Schedule
            busLines={busLines}
            selectedLine={selectedLine}
            onSelectLine={setSelectedLine}
          />
        )}
        {view === 'about' && <About />}
      </main>

      <BottomNav view={view} onNavigate={navigateTo} alertCount={alertCount} />
    </div>
  )
}