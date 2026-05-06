import type { ScheduleRow } from '../types/types'

interface ScheduleTableProps {
  detail:         ScheduleRow[]
  nextIndex:      number
  lineColor:      string
  origem:         string
  destino:        string
  paradaIntermed: string | null
}

export default function ScheduleTable({
  detail, nextIndex, lineColor, origem, destino, paradaIntermed,
}: ScheduleTableProps) {

  if (detail.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center">
        <p className="text-3xl mb-2" aria-hidden="true">🚫</p>
        <p className="text-sm font-semibold text-gray-500">Sem operação neste dia</p>
      </div>
    )
  }

  return (
    <div
      role="table"
      aria-live="polite"
      aria-label={`Horários de ${origem} a ${destino}`}
      className="bg-white rounded-2xl overflow-hidden"
    >
      {/* Cabeçalho colorido */}
      <div
        className="grid grid-cols-3 text-center text-xs font-bold text-white py-3"
        style={{ backgroundColor: lineColor }}
        role="row"
      >
        <span role="columnheader">
          Parte de<br />
          <span className="font-semibold opacity-90">{origem}</span>
        </span>
        <span role="columnheader">
          {paradaIntermed
            ? <>Passa em<br /><span className="font-semibold opacity-90">{paradaIntermed}</span></>
            : <>Trajeto<br /><span className="font-semibold opacity-90">direto</span></>}
        </span>
        <span role="columnheader">
          Chega em<br />
          <span className="font-semibold opacity-90">{destino}</span>
        </span>
      </div>

      {nextIndex === -1 && (
        <div className="px-4 py-2 text-center border-b border-gray-50 bg-gray-50/60">
          <p className="text-xs text-gray-400">Sem mais horários hoje para esta linha.</p>
        </div>
      )}

      {detail.map((row, i) => {
        const rowKey = `${row.de}-${row.ate}-${i}`
        const isPast = nextIndex === -1 ? true : i < nextIndex
        const isNext = i === nextIndex

        return (
          <div
            key={rowKey}
            role="row"
            className={`grid grid-cols-3 text-center py-3.5 border-b border-gray-50 last:border-0 transition-opacity
              ${isPast && !isNext ? 'opacity-35' : 'opacity-100'}`}
            style={isNext ? { borderLeft: `3px solid ${lineColor}` } : {}}
          >
            {/* Coluna: Saída */}
            <span role="cell" className="flex flex-col items-center gap-1">
              <span className={`flex items-center gap-1 font-bold text-sm
                ${isNext ? 'text-gray-900' : 'text-gray-600'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke={isNext ? lineColor : '#9ca3af'}
                  strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  className="w-3 h-3 flex-shrink-0" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                {row.de}
              </span>
              {isNext && (
                <span
                  className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: lineColor + '1a', color: lineColor }}
                >
                  Próximo
                </span>
              )}
            </span>

            {/* Coluna: Parada intermediária */}
            <span role="cell" className="self-center text-sm text-gray-400">
              {row.colina ?? '· · ·'}
            </span>

            {/* Coluna: Chegada */}
            <span
              role="cell"
              className="self-center text-sm font-bold"
              style={{ color: isNext ? lineColor : '#9ca3af' }}
            >
              {row.ate}
            </span>
          </div>
        )
      })}
    </div>
  )
}
