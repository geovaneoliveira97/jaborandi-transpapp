import { useState, useEffect, useMemo } from 'react'
import type { BusLine } from '../types/types'
import { useTheme } from '../context/ThemeContext'
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

function getPeriodoPorDia(schedules: BusLine['schedules'] | undefined): string {
  if (!schedules) return ''
  const periodos  = Object.keys(schedules)
  const dia       = new Date().getDay()
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

export default function Schedule({ busLines, selectedLine, onSelectLine }: ScheduleProps) {
  const { isDark }  = useTheme()
  const line        = selectedLine ?? busLines[0] ?? null
  const [period, setPeriod]         = useState(() => getPeriodoPorDia(line?.schedules))
  const [nowMinutes, setNowMinutes] = useState(getNow)

  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNow()), 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { setPeriod(getPeriodoPorDia(line?.schedules)) }, [line?.id])

  if (!line) return (
    <p className={`text-center py-16 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
      Nenhuma linha disponível.
    </p>
  )

  const periods = Object.keys(line.schedules ?? {}).sort((a, b) => {
    const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  const detail    = line.schedule_detail?.[period] ?? []
  const nameParts = (line.name ?? '').split(' → ')
  const stops     = line.stops ?? []

  const nextIndex = useMemo(() => {
    if (!detail.length) return -1
    return detail.findIndex(row => {
      const t = timeToMinutes(row.de)
      if (t === null) return false
      return (nowMinutes > 1200 && t < 360 ? t + 1440 : t) >= nowMinutes
    })
  }, [detail, nowMinutes])

  const lineColor      = line.color ?? '#2ab76a'
  const intermediarias = stops.slice(1, -1)

  return (
    <div className="space-y-5 animate-enter">
      <LineSelector busLines={busLines} line={line} onSelectLine={onSelectLine} />
      {line.prices && Object.keys(line.prices).length > 0 && (
        <PriceCard prices={line.prices} lineColor={lineColor} />
      )}
      <div className="flex gap-2" role="group" aria-label="Selecionar período">
        {periods.map(p => (
          <button key={p} onClick={() => setPeriod(p)} aria-pressed={period === p}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors
              ${period === p ? 'bg-[#2ab76a] text-white' : isDark ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
            {p}
          </button>
        ))}
      </div>
      <ScheduleTable detail={detail} nextIndex={nextIndex} lineColor={lineColor}
        origem={nameParts[0] ?? 'Origem'} destino={nameParts[1] ?? 'Destino'}
        paradaIntermed={intermediarias[0] ?? null} />
      <StopsList stops={stops} lineColor={lineColor} />
    </div>
  )
}