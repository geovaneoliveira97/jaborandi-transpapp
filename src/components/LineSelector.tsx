import type { BusLine } from '../types/types'
import Badge from '../components/Badge'

interface LineSelectorProps {
  busLines: BusLine[]
  line: BusLine
  onSelectLine: (line: BusLine) => void
}

export default function LineSelector({ busLines, line, onSelectLine }: LineSelectorProps) {
  const lineColor      = line.color ?? '#2ab76a'
  const stops          = line.stops ?? []
  const intermediarias = stops.slice(1, -1)

  return (
    <div className="border border-gray-200 rounded-2xl bg-gray-50 p-4 space-y-3">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Selecionar linha
      </label>
      <select
        value={line.id}
        onChange={e => {
          const found = busLines.find(l => String(l.id) === e.target.value)
          if (found) onSelectLine(found)
        }}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white text-gray-900
          focus:outline-none focus:border-[#2ab76a] transition-colors"
      >
        {busLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <div className="flex items-center gap-3 pt-1">
        <div
          aria-hidden="true"
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
          style={{ backgroundColor: lineColor + '22', color: lineColor }}
        >
          {line.number}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{line.name}</p>
          {intermediarias.length > 0 && (
            <p className="text-xs text-gray-400">Passa por {intermediarias.join(', ')}</p>
          )}
        </div>
        <Badge status={line.status} />
      </div>
    </div>
  )
}
