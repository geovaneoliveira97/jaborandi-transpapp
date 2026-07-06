// src/pages/Schedule.tsx
import { useState, useMemo, useCallback } from 'react'
import type { BusLine } from '../types/types'
import { DEFAULT_LINE_COLOR } from '../types/types'
import LineSelector  from '../components/LineSelector'
import PriceCard     from '../components/PriceCard'
import ScheduleTable from '../components/ScheduleTable'
import StopsList     from '../components/StopsList'
import Card          from '../components/ui/Card'
import { Copy, Check, Share2, Clock } from '../components/icons'
import { useNextDeparture } from '../hooks/useNextDeparture'
import { getPeriodoPorDia } from '../utils/time'
import { buildWhatsAppText } from '../utils/whatsapp'

interface ScheduleProps {
  busLines:     BusLine[]
  selectedLine: BusLine | null
  onSelectLine: (line: BusLine) => void
}

function ShareWhatsAppButton({ line }: { line: BusLine }) {
  const [copied, setCopied] = useState(false)

  const whatsappText = useMemo(() => buildWhatsAppText(line), [line])

  const handleShare = useCallback(() => {
    const url = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`
    window.open(url, '_blank')
  }, [whatsappText])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(whatsappText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignora */ }
  }, [whatsappText])

  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-ink">Compartilhar horários</p>
        <p className="text-[11px] text-muted mt-0.5">Envie todos os horários desta linha</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleCopy}
          aria-label="Copiar horários"
          className="w-11 h-11 rounded-xl flex items-center justify-center
            bg-bg border border-line text-muted
            hover:bg-line/60 transition-colors active:scale-95"
        >
          {copied
            ? <Check className="w-4 h-4 text-success" aria-hidden="true" />
            : <Copy className="w-4 h-4" aria-hidden="true" />}
        </button>

        <button
          onClick={handleShare}
          aria-label="Compartilhar via WhatsApp"
          className="flex items-center gap-2 px-4 py-3 rounded-xl
            text-white text-sm font-semibold transition-colors active:scale-95"
          style={{ backgroundColor: '#25D366', minHeight: 44 }}
        >
          <Share2 className="w-4 h-4" aria-hidden="true" />
          WhatsApp
        </button>
      </div>
    </Card>
  )
}

function NextDepartureBanner({ lineColor, timeLabel, minutesLabel }: {
  lineColor: string
  timeLabel: string
  minutesLabel: string
}) {
  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3 text-white animate-pop"
      style={{ background: `linear-gradient(135deg, ${lineColor} 0%, ${lineColor}cc 100%)` }}
    >
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Clock className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-white/80">Próximo ônibus às {timeLabel}</p>
        <p className="text-base font-bold leading-tight">Em {minutesLabel}</p>
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

  const { periods, period, detail, nextIndex, nextLabel } =
    useNextDeparture(line.schedule_detail, manualPeriod)

  const isToday = period === getPeriodoPorDia(periods)
  const proximo = nextIndex !== -1 ? detail[nextIndex] : null

  const lineColor      = line.color ?? DEFAULT_LINE_COLOR
  const stops          = line.stops ?? []
  const intermediarias = stops.slice(1, -1)
  const nameParts      = (line.name ?? '').split(' → ')

  return (
    <div className="space-y-4 animate-enter">
      <LineSelector busLines={busLines} line={line} onSelectLine={onSelectLine} intermediarias={intermediarias} />

      {isToday && proximo && nextLabel && (
        <NextDepartureBanner lineColor={lineColor} timeLabel={proximo.de} minutesLabel={nextLabel} />
      )}

      <ShareWhatsAppButton line={line} />

      {line.prices && Object.keys(line.prices).length > 0 && (
        <PriceCard prices={line.prices} lineColor={lineColor} />
      )}

      <div role="tablist" aria-label="Selecionar período" className="flex gap-2">
        {periods.length === 0 ? (
          <p className="text-xs text-muted text-center w-full py-1">Horários não disponíveis.</p>
        ) : periods.map(p => (
          <button
            key={p}
            role="tab"
            onClick={() => setManualPeriod(p)}
            aria-selected={period === p}
            aria-controls="schedule-table"
            className={`flex-1 text-xs font-bold py-3 rounded-xl transition-colors
              ${period === p
                ? 'bg-brand text-white'
                : 'bg-white text-muted border border-line'
              }`}
            style={{ minHeight: 44 }}
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
    <p className="text-center py-16 text-sm text-muted">
      Nenhuma linha disponível.
    </p>
  )

  return <ScheduleInner key={line.id} busLines={busLines} line={line} onSelectLine={onSelectLine} />
}
