import type { BusLine } from '../types/types'
import { DEFAULT_LINE_COLOR } from '../types/types'
import Badge from './Badge'

interface LineSelectorProps {
  busLines:        BusLine[]
  line:            BusLine
  onSelectLine:    (line: BusLine) => void
  intermediarias?: string[]
}

export default function LineSelector({
  busLines, line, onSelectLine, intermediarias = [],
}: LineSelectorProps) {
  const lineColor = line.color ?? DEFAULT_LINE_COLOR

  return (
    <div className="bg-white rounded-2xl p-4 space-y-3">
      <label htmlFor="line-select" className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        Selecionar linha
      </label>
      <select
        id="line-select"
        value={line.id}
        onChange={e => {
          const found = busLines.find(l => String(l.id) === e.target.value)
          if (found) onSelectLine(found)
        }}
        className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-900
          focus:outline-none focus:border-[#2ab76a] transition-colors appearance-none"
      >
        {busLines.map(l => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>

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
          <p className="text-sm font-semibold text-gray-900 truncate">{line.name}</p>
          {intermediarias.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              Passa por {intermediarias.join(', ')}
            </p>
          )}
        </div>
        <Badge status={line.status} />
      </div>
    </div>
  )
}
