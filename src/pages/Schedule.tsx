// src/pages/Schedule.tsx
import { useState, useEffect, useMemo, useCallback } from 'react'
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

const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']

function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function getPeriodoPorDia(schedules: BusLine['schedule_detail'] | undefined): string {
  if (!schedules) return ''
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

function buildWhatsAppText(line: BusLine): string {
  const scheduleDetail = line.schedule_detail ?? {}
  const periods = Object.keys(scheduleDetail).sort((a, b) => {
    const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })

  const lines: string[] = []
  lines.push(`🚌 *Linha ${line.number} — ${line.name}*`)
  lines.push(`Rápido do Oeste`)
  lines.push('')

  for (const period of periods) {
    const rows = scheduleDetail[period] ?? []
    if (rows.length === 0) continue
    lines.push(`📅 *${period}*`)
    for (const row of rows) {
      const meio = row.colina ? ` → ${row.colina}` : ''
      lines.push(`  🕐 ${row.de}${meio} → ${row.ate}`)
    }
    lines.push('')
  }

  if (line.prices && Object.keys(line.prices).length > 0) {
    lines.push(`🎟️ *Passagens*`)
    for (const [trecho, valor] of Object.entries(line.prices)) {
      const valorFmt = new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      }).format(valor as number)
      lines.push(`  ${trecho}: R$ ${valorFmt}`)
    }
    lines.push('')
  }

  lines.push(`_Compartilhado via JaborandiTransp_ 🟢`)
  return lines.join('\n')
}

function ShareWhatsAppButton({ line }: { line: BusLine }) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const text = buildWhatsAppText(line)
    const url  = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }, [line])

  const handleCopy = useCallback(async () => {
    const text = buildWhatsAppText(line)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignora */ }
  }, [line])

  return (
    <div className="bg-white rounded-2xl p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900">Compartilhar horários</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Envie todos os horários desta linha</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          aria-label="Copiar horários"
          className="w-9 h-9 rounded-xl flex items-center justify-center
            bg-gray-50 border border-gray-100 text-gray-400
            hover:bg-gray-100 transition-colors active:scale-95"
        >
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="#2ab76a" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>

        <button
          onClick={handleShare}
          aria-label="Compartilhar via WhatsApp"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            text-white text-sm font-semibold transition-colors active:scale-95"
          style={{ backgroundColor: '#25D366' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>
      </div>
    </div>
  )
}

function ScheduleInner({
  busLines, line, onSelectLine,
}: {
  busLines:     BusLine[]
  line:         BusLine
  onSelectLine: (line: BusLine) => void
}) {
  const [manualPeriod, setManualPeriod] = useState<string | null>(null)

  const [nowMinutes, setNowMinutes] = useState(getNow)
  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNow), 60_000)
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

  const nextIndex = useMemo(() => {
    if (!detail.length) return -1
    let bestIdx = -1
    let bestDist = Infinity
    detail.forEach((row, i) => {
      const t = timeToMinutes(row.de)
      if (t === null) return
      const dist = (t - nowMinutes + 1440) % 1440
      if (dist < bestDist) { bestDist = dist; bestIdx = i }
    })
    return bestDist > 1380 ? -1 : bestIdx
  }, [detail, nowMinutes])

  const lineColor      = line.color ?? DEFAULT_LINE_COLOR
  const stops          = line.stops ?? []
  const intermediarias = stops.slice(1, -1)
  const nameParts      = (line.name ?? '').split(' → ')

  return (
    <div className="space-y-4 animate-enter">
      <LineSelector busLines={busLines} line={line} onSelectLine={onSelectLine} intermediarias={intermediarias} />

      <ShareWhatsAppButton line={line} />

      {line.prices && Object.keys(line.prices).length > 0 && (
        <PriceCard prices={line.prices} lineColor={lineColor} />
      )}

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
                : 'bg-white text-gray-500 border border-gray-100'
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

  return <ScheduleInner key={line.id} busLines={busLines} line={line} onSelectLine={onSelectLine} />
}
