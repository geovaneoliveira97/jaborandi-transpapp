import type { BusLine } from '../types/types'
import { DEFAULT_LINE_COLOR } from '../types/types'
import Badge from './Badge'

interface LineCardProps {
  line: BusLine
  onSelect: (line: BusLine) => void
}

export default function LineCard({ line, onSelect }: LineCardProps) {
  const isSuspended = line.status === 'suspended'
  const lineColor   = line.color ?? DEFAULT_LINE_COLOR

  const ariaLabel = isSuspended
    ? `Linha ${line.number} - ${line.name}, suspensa. Indisponível.`
    : `Ver horários da linha ${line.number} - ${line.name}`

  return (
    <button
      onClick={() => onSelect(line)}
      disabled={isSuspended}
      aria-label={ariaLabel}
      className={`w-full text-left p-3.5 flex items-center gap-3 rounded-2xl
        bg-white transition-all duration-200 active:scale-[0.98]
        ${isSuspended
          ? 'opacity-45 cursor-not-allowed'
          : 'hover:shadow-sm'
        }`}
    >
      {/* Número da linha — destaque com fundo colorido sólido */}
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0
          font-bold text-[13px] text-white"
        style={{ backgroundColor: lineColor }}
      >
        {line.number}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug truncate text-gray-900">
          {line.name}
        </p>
        <p className="text-xs mt-0.5 text-gray-400 flex items-center gap-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 flex-shrink-0"
            aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
          </svg>
          {line.frequency}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <Badge status={line.status} />
        {!isSuspended && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </div>
    </button>
  )
}
