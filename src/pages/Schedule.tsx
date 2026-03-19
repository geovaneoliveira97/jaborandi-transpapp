// src/pages/Schedule.tsx
//
// Página de horários — exibe a tabela de partidas da linha selecionada.
//
// Funcionalidades:
//   • Seletor de linha (troca sem recarregar a página)
//   • Detecção automática do período (Seg–Sex / Sábado / Domingo) com base no dia atual
//   • Destaque visual do próximo horário disponível
//   • Tabela de preços por trecho
//   • Lista de paradas do trajeto

import { useState, useEffect, useMemo } from 'react'
import type { BusLine } from '../types/types'
import { DEFAULT_LINE_COLOR } from '../types/types'
import LineSelector  from '../components/LineSelector'
import PriceCard     from '../components/PriceCard'
import ScheduleTable from '../components/ScheduleTable'
import StopsList     from '../components/StopsList'

interface ScheduleProps {
  busLines:     BusLine[]
  selectedLine: BusLine | null
  onSelectLine: (line: BusLine) => void
}

// Ordem de exibição dos períodos nas abas de seleção.
// Garante que "Seg–Sex" sempre apareça primeiro, independente
// da ordem em que os dados vierem do banco.
const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']

// Remove acentos para comparação de strings (igual ao usado em Lines.tsx)
function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Detecta qual período corresponde ao dia da semana atual.
// Busca a chave no schedule_detail que começa com 'seg', 'sab' ou 'dom',
// tornando a detecção flexível mesmo se o banco usar nomes ligeiramente diferentes.
function getPeriodoPorDia(schedules: BusLine['schedule_detail'] | undefined): string {
  if (!schedules) return ''
  const periodos = Object.keys(schedules)
  const dia      = new Date().getDay()
  if (dia === 0) return periodos.find(p => normalize(p).startsWith('dom')) ?? periodos[0] ?? ''
  if (dia === 6) return periodos.find(p => normalize(p).startsWith('sab')) ?? periodos[0] ?? ''
  return periodos.find(p => normalize(p).startsWith('seg')) ?? periodos[0] ?? ''
}

// Converte "HH:MM" para minutos desde meia-noite (ex: "06:15" → 375).
// Retorna null se o formato for inválido, protegendo contra dados incompletos no banco.
function timeToMinutes(t: string | null | undefined): number | null {
  if (!t) return null
  const [h, m] = t.trim().split(':').map(Number)
  return isNaN(h) || isNaN(m) ? null : h * 60 + m
}

// Retorna o horário atual em minutos desde meia-noite.
// Separado em função própria para facilitar o intervalo de atualização periódica.
function getNow() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// ScheduleInner é separado do componente principal para aproveitar uma
// característica do React: quando a prop 'key' muda, o componente é
// completamente desmontado e remontado. Isso reseta o estado 'manualPeriod'
// automaticamente toda vez que o usuário troca de linha, sem precisar
// de useEffect ou lógica extra de reset.
function ScheduleInner({
  busLines,
  line,
  onSelectLine,
}: {
  busLines:     BusLine[]
  line:         BusLine
  onSelectLine: (line: BusLine) => void
}) {
  // null = período automático (detectado pelo dia da semana)
  // string = período escolhido manualmente pelo usuário
  const [manualPeriod, setManualPeriod] = useState<string | null>(null)

  // Atualiza o horário atual a cada minuto para que o "Próximo" se mova
  // automaticamente após um ônibus partir, sem precisar recarregar o app.
  const [nowMinutes, setNowMinutes] = useState(getNow)
  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Ordena os períodos conforme PERIOD_ORDER para exibição consistente nas abas.
  // Períodos não listados em PERIOD_ORDER são colocados ao final.
  const periods = useMemo(
    () =>
      Object.keys(line.schedule_detail ?? {}).sort((a, b) => {
        const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
        if (ia === -1 && ib === -1) return 0
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      }),
    [line.schedule_detail]
  )

  // Período efetivo: preferência manual do usuário, ou automático por dia da semana
  const period = manualPeriod ?? getPeriodoPorDia(line.schedule_detail)

  // Memoiza o array de horários para evitar que nextIndex recalcule
  // desnecessariamente quando outros estados mudam.
  const detail = useMemo(
    () => line.schedule_detail?.[period] ?? [],
    [line.schedule_detail, period]
  )

  // Encontra o índice do próximo horário disponível com base na hora atual.
  // O ajuste de +1440 minutos (equivalente a 24h) resolve o caso de linhas
  // que partem após meia-noite: se já são 21h (1260 min) e o próximo horário
  // é 01h (60 min), sem o ajuste ele pareceria "no passado".
  // Com o ajuste, 60 min vira 1500 min, que é corretamente identificado como futuro.
  const nextIndex = useMemo(() => {
    if (!detail.length) return -1
    return detail.findIndex(row => {
      const t = timeToMinutes(row.de)
      if (t === null) return false
      return (nowMinutes > 1200 && t < 360 ? t + 1440 : t) >= nowMinutes
    })
  }, [detail, nowMinutes])

  const lineColor      = line.color ?? DEFAULT_LINE_COLOR
  const stops          = line.stops ?? []
  const intermediarias = stops.slice(1, -1) // remove origem e destino, mantém apenas paradas do meio
  const nameParts      = (line.name ?? '').split(' → ')

  return (
    <div className="space-y-5 animate-enter">
      <LineSelector busLines={busLines} line={line} onSelectLine={onSelectLine} intermediarias={intermediarias} />

      {/* Tabela de preços: exibida apenas se a linha tiver preços cadastrados */}
      {line.prices && Object.keys(line.prices).length > 0 && (
        <PriceCard prices={line.prices} lineColor={lineColor} />
      )}

      {/* Abas de período: Seg–Sex / Sábado / Domingo */}
      <div className="flex gap-2" role="group" aria-label="Selecionar período">
        {periods.length === 0 ? (
          <p className="text-xs text-gray-400 text-center w-full py-1">Horários não disponíveis.</p>
        ) : periods.map(p => (
          <button
            key={p}
            onClick={() => setManualPeriod(p)}
            aria-pressed={period === p}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors
              ${period === p
                ? 'bg-[#2ab76a] text-white'
                : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      <ScheduleTable
        detail={detail}
        nextIndex={nextIndex}
        lineColor={lineColor}
        origem={nameParts[0] ?? 'Origem'}
        destino={nameParts[1] ?? 'Destino'}
        paradaIntermed={intermediarias[0] ?? null}
      />
      <StopsList stops={stops} lineColor={lineColor} />
    </div>
  )
}

export default function Schedule({ busLines, selectedLine, onSelectLine }: ScheduleProps) {
  const line = selectedLine ?? busLines[0] ?? null

  if (!line) return (
    <p className="text-center py-16 text-sm text-gray-400">
      Nenhuma linha disponível.
    </p>
  )

  // key={line.id} garante que ScheduleInner seja completamente recriado
  // ao trocar de linha, resetando manualPeriod sem lógica extra.
  return <ScheduleInner key={line.id} busLines={busLines} line={line} onSelectLine={onSelectLine} />
}
