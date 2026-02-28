import type { BusLine } from '../types/types'
import Badge from '../components/Badge'
import { useTheme } from '../context/ThemeContext'

interface LineSelectorProps {
  busLines: BusLine[]
  line: BusLine
  onSelectLine: (line: BusLine) => void
}

export default function LineSelector({ busLines, line, onSelectLine }: LineSelectorProps) {
  const { isDark } = useTheme()
  const card = `border rounded-2xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`
  const lineColor = line.color ?? '#2ab76a'
  const stops = line.stops ?? []
  const intermediarias = stops.slice(1, -1)

  return (
    <div className={`${card} p-4 space-y-3`}>
      <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Selecionar linha
      </label>
      <select value={line.id}
        onChange={e => { const found = busLines.find(l => String(l.id) === e.target.value); if (found) onSelectLine(found) }}
        className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2ab76a] transition-colors
          ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        {busLines.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <div className="flex items-center gap-3 pt-1">
        <div aria-hidden="true" className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
          style={{ backgroundColor: lineColor + '22', color: lineColor }}>{line.number}</div>
        <div className="flex-1">
          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{line.name}</p>
          {intermediarias.length > 0 && (
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Passa por {intermediarias.join(', ')}</p>
          )}
        </div>
        <Badge status={line.status} />
      </div>
    </div>
  )
}