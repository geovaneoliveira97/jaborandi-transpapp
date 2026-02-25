import type { BusLine } from '../types/types'
import Badge from './Badge'
import { useTheme } from '../context/ThemeContext'

interface LineCardProps {
  line: BusLine
  onSelect: (line: BusLine) => void
}

const DEFAULT_COLOR = '#2ab76a'

const STATUS_LABEL: Record<string, string> = {
  normal:    'em operação normal',
  delay:     'com atraso',
  suspended: 'suspensa',
}

export default function LineCard({ line, onSelect }: LineCardProps) {
  const { isDark } = useTheme()
  const isSuspended = line.status === 'suspended'
  const lineColor   = line.color ?? DEFAULT_COLOR

  const ariaLabel = isSuspended
    ? `Linha ${line.number} - ${line.name}, suspensa. Indisponível para seleção.`
    : `Ver horários da linha ${line.number} - ${line.name}, ${STATUS_LABEL[line.status] ?? ''}`

  return (
    <button
      onClick={isSuspended ? undefined : () => onSelect(line)}
      aria-disabled={isSuspended}
      aria-label={ariaLabel}
      className={`w-full text-left p-4 flex items-center gap-4 rounded-2xl
        border transition-all duration-200 active:scale-[0.98]
        ${isSuspended
          ? isDark
            ? 'opacity-40 cursor-not-allowed bg-gray-800 border-gray-700'
            : 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
          : isDark
            ? 'bg-gray-900 border-gray-800 hover:border-[#2ab76a]/50 hover:bg-[#2ab76a]/5'
            : 'bg-gray-50 border-gray-200 hover:border-[#2ab76a]/50 hover:bg-[#2ab76a]/5'
        }`}
    >
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
        style={{ backgroundColor: lineColor + '22', color: lineColor }}
      >
        {line.number}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm leading-snug truncate
          ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {line.name}
        </p>
        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {line.frequency}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0" aria-hidden="true">
        <Badge status={line.status} />
        {!isSuspended && (
          <svg viewBox="0 0 24 24" fill="none" stroke={isDark ? '#4b5563' : '#9ca3af'} strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </div>
    </button>
  )
}
