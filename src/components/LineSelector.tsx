import type { BusLine } from '../types/types'
import { DEFAULT_LINE_COLOR } from '../types/types'
import { ChevronDown } from './icons'
import Card from './ui/Card'
import Badge from './Badge'
import { ensureContrastOnWhite } from '../utils/color'

interface LineSelectorProps {
  busLines:        BusLine[]
  line:            BusLine
  onSelectLine:    (line: BusLine) => void
  intermediarias?: string[]
}

export default function LineSelector({
  busLines, line, onSelectLine, intermediarias = [],
}: LineSelectorProps) {
  const lineColor = ensureContrastOnWhite(line.color ?? DEFAULT_LINE_COLOR)

  return (
    <Card className="p-4 space-y-3">
      <label htmlFor="line-select" className="text-[10px] font-semibold uppercase tracking-widest text-muted">
        Selecionar linha
      </label>
      <div className="relative">
        <select
          id="line-select"
          value={line.id}
          onChange={e => {
            const found = busLines.find(l => String(l.id) === e.target.value)
            if (found) onSelectLine(found)
          }}
          className="w-full border border-line rounded-xl pl-4 pr-10 py-3.5 text-sm bg-bg text-ink
            focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft
            transition-all appearance-none"
        >
          {busLines.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
        <ChevronDown
          className="w-4 h-4 text-faint absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center gap-3 pt-0.5">
        {/* Número da linha com fundo colorido sólido */}
        <div
          aria-hidden="true"
          className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[13px] text-white shrink-0"
          style={{ backgroundColor: lineColor }}
        >
          {line.number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-ink truncate">{line.name}</p>
          {intermediarias.length > 0 && (
            <p className="text-xs text-muted mt-0.5 truncate">
              Passa por {intermediarias.join(', ')}
            </p>
          )}
        </div>
        <Badge status={line.status} />
      </div>
    </Card>
  )
}
