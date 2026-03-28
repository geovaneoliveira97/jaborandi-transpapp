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
const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']

// Remove acentos para comparação de strings tolerante a variações de digitação.
function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

// Detecta qual período corresponde ao dia da semana atual.
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

function getNow() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

function ScheduleInner({
  busLines,
  line,
  onSelectLine,
}: {
  busLines:     BusLine[]
  line:         BusLine
  onSelectLine: (line: BusLine) => void
}) {
  const [manualPeriod, setManualPeriod] = useState<string | null>(null)

  const [nowMinutes, setNowMinutes] = useState(getNow)
  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNow()), 60_000)
    return () => clearInterval(id)
  }, [])

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

  const period = manualPeriod ?? getPeriodoPorDia(line.schedule_detail)

  const detail = useMemo(
    () => line.schedule_detail?.[period] ?? [],
    [line.schedule_detail, period]
  )

  // Calcula o próximo horário usando distância circular (corrige o bug de meia-noite).
  // A fórmula (t - now + 1440) % 1440 garante que qualquer horário futuro
  // seja sempre representado como um número positivo de 0 a 1439,
  // independente de cruzar a meia-noite. O menor valor positivo é o próximo horário.
  const nextIndex = useMemo(() => {
    if (!detail.length) return -1
    let bestIdx = -1
    let bestDist = Infinity
    detail.forEach((row, i) => {
      const t = timeToMinutes(row.de)
      if (t === null) return
      const dist = (t - nowMinutes + 1440) % 1440
      if (dist < bestDist) {
        bestDist = dist
        bestIdx  = i
      }
    })
    // Se a menor distância for 0 (horário exato agora) ou muito grande (>23h, todos passaram),
    // consideramos que não há próximo horário relevante para destacar.
    return bestDist > 1380 ? -1 : bestIdx
  }, [detail, nowMinutes])

  const lineColor      = line.color ?? DEFAULT_LINE_COLOR
  const stops          = line.stops ?? []
  const intermediarias = stops.slice(1, -1)
  const nameParts      = (line.name ?? '').split(' → ')

  return (
    <div className="space-y-5 animate-enter">
      <LineSelector busLines={busLines} line={line} onSelectLine={onSelectLine} intermediarias={intermediarias} />

      {line.prices && Object.keys(line.prices).length > 0 && (
        <PriceCard prices={line.prices} lineColor={lineColor} />
      )}

      {/* Abas de período usando semântica de tab para acessibilidade */}
      <div role="tablist" aria-label="Selecionar período" className="flex gap-2">
        {periods.length === 0 ? (
          <p className="text-xs text-gray-400 text-center w-full py-1">Horários não disponíveis.</p>
        ) : periods.map(p => (
          <button
            key={p}
            role="tab"
            onClick={() => setManualPeriod(p)}
            aria-selected={period === p}
            aria-controls="schedule-table"
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

      <div id="schedule-table" role="tabpanel">
        <ScheduleTable
          detail={detail}
          nextIndex={nextIndex}
          lineColor={lineColor}
          origem={nameParts[0] ?? 'Origem'}
          destino={nameParts[1] ?? 'Destino'}
          paradaIntermed={intermediarias[0] ?? null}
        />
      </div>
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
