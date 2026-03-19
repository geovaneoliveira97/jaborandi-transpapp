// src/App.tsx
//
// Componente raiz da aplicação — controla qual página está visível
// e gerencia o estado global compartilhado entre as páginas.
//
// Responsabilidades:
//   • Buscar as linhas de ônibus do banco (Supabase) ao iniciar
//   • Controlar a navegação entre as quatro páginas (home, lines, schedule, about)
//   • Manter a linha selecionada sincronizada mesmo após recarregamento dos dados
//   • Registrar visualizações de página no Google Analytics (apenas em produção)

import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import type { BusLine, AppView } from './types/types'
import { isBusLine } from './types/types'

import Header from './components/Header'
import BottomNav from './components/BottomNav'
import { LoadingScreen, ErrorScreen } from './components/LoadingScreen'

import Home     from './pages/Home'
import Lines    from './pages/Lines'
import Schedule from './pages/Schedule'
import About    from './pages/About'

// Títulos exibidos no cabeçalho para cada página
const PAGE_TITLES: Record<AppView, string> = {
  home:     'Início',
  lines:    'Linhas',
  schedule: 'Horários',
  about:    'Sobre',
}

// Envia evento de visualização de página ao Google Analytics.
// Executado apenas em produção para não poluir os dados de analytics
// com os acessos feitos durante o desenvolvimento.
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

  // retryKey é incrementado quando o usuário clica em "Tentar novamente",
  // forçando o useEffect a executar novamente e refazer a busca.
  const [retryKey, setRetryKey] = useState(0)
  const retry = useCallback(() => setRetryKey(k => k + 1), [])

  // Busca as linhas de ônibus do Supabase ao montar o componente
  // ou quando o usuário solicita uma nova tentativa (retryKey muda).
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setErro(false)

    // Timeout de 10 segundos: se o banco não responder,
    // exibe tela de erro em vez de deixar o usuário esperando indefinidamente.
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
          // Log de erro exibido apenas em desenvolvimento para facilitar depuração
          if (import.meta.env.DEV) console.error('Erro ao buscar linhas:', error)
          setErro(true)
        } else {
          // isBusLine valida cada objeto antes de usar, garantindo que o app
          // não quebre se o banco retornar um registro com campo faltando.
          const lines = (data ?? []).filter(isBusLine)
          setBusLines(lines)

          // Re-sincroniza a linha selecionada com os dados mais recentes do banco.
          // Necessário porque os preços ou horários podem ter mudado desde a última
          // vez que o usuário abriu o app.
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

    // Função de limpeza: cancela a atualização de estado se o componente
    // for desmontado antes da resposta chegar (evita vazamento de memória).
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [retryKey])

  // Navega para uma nova página, registra o evento no Analytics
  // e rola a tela para o topo para garantir boa experiência no celular.
  const navigateTo = useCallback((newView: AppView) => {
    setView(newView)
    trackPageView(newView)
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Ao selecionar uma linha (na tela Home ou Lines), navega automaticamente
  // para a tela de horários com a linha escolhida já carregada.
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
          // Proteção: se não houver linhas carregadas, exibe mensagem amigável
          // em vez de renderizar uma tela de horários vazia.
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
