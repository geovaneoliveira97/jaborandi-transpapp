import { useState, useEffect, useMemo } from 'react'
import type { BusLine } from '../types/types'
import { DEFAULT_LINE_COLOR } from '../types/types'
import LineSelector from '../components/LineSelector'
import PriceCard from '../components/PriceCard'
import ScheduleTable from '../components/ScheduleTable'
import StopsList from '../components/StopsList'

interface ScheduleProps {
  busLines: BusLine[]
  selectedLine: BusLine | null
  onSelectLine: (line: BusLine) => void
}

const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function getPeriodoPorDia(schedules: BusLine['schedule_detail'] | undefined): string {
  if (!schedules) return ''
  // [7] derivar período a partir de schedule_detail (não de schedules) para garantir
  // que os keys são os mesmos usados para buscar 'detail' abaixo
  const periodos = Object.keys(schedules)
  const dia      = new Date().getDay()
  if (dia === 0) return periodos.find(p => normalize(p).startsWith('dom')) ?? periodos[0] ?? ''
  if (dia === 6) return periodos.find(p => normalize(p).startsWith('sab')) ?? periodos[0] ?? ''
  return periodos.find(p => normalize(p).startsWith('seg')) ?? periodos[0] ?? ''
}

function timeToMinutes(t: string | null | undefined): number | null {
  if (!t) return null
  const [h, m] = t.trim().split(':').map(Number)
  return isNaN(h) || isNaN(m) ? null : h * 60 + m
}

function getNow() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// [1] ScheduleInner recebe 'line' garantida e 'key={line.id}' no pai.
// Ao trocar de linha o React desmonta e remonta este componente,
// resetando manualPeriod automaticamente — sem setState no render,
// sem useRef, sem anti-pattern.
function ScheduleInner({
  busLines,
  line,
  onSelectLine,
}: {
  busLines: BusLine[]
  line: BusLine
  onSelectLine: (line: BusLine) => void
}) {
  const [manualPeriod, setManualPeriod] = useState<string | null>(null)
  const [nowMinutes, setNowMinutes]     = useState(getNow)

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

  // Período efetivo: escolha manual ou automático por dia da semana
  const period = manualPeriod ?? getPeriodoPorDia(line.schedule_detail)

  // [2] detail memoizado para evitar nova referência [] a cada render,
  // o que quebrava o useMemo de nextIndex
  const detail = useMemo(
    () => line.schedule_detail?.[period] ?? [],
    [line.schedule_detail, period]
  )

  const nextIndex = useMemo(() => {
    if (!detail.length) return -1
    return detail.findIndex(row => {
      const t = timeToMinutes(row.de)
      if (t === null) return false
      // 1200 = 20h00 | 360 = 06h00: ajuste para viradas de meia-noite
      return (nowMinutes > 1200 && t < 360 ? t + 1440 : t) >= nowMinutes
    })
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

  // key={line.id} garante que ScheduleInner é remontado ao trocar de linha,
  // resetando manualPeriod sem precisar de setState no render
  return <ScheduleInner key={line.id} busLines={busLines} line={line} onSelectLine={onSelectLine} />
}
