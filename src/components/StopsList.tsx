interface StopsListProps {
  stops:     string[]
  lineColor: string
}

export default function StopsList({ stops, lineColor }: StopsListProps) {
  if (stops.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-400">Informações de trajeto não disponíveis.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-4 text-gray-400 flex items-center gap-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
        Trajeto · {stops.length} paradas
      </p>

      <ul className="space-y-0 list-none">
        {stops.map((stop, i) => {
          const isFirst = i === 0
          const isLast  = i === stops.length - 1
          const isEdge  = isFirst || isLast

          return (
            <li key={`${i}-${stop}`} className="flex items-start gap-3">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center shrink-0 mt-1" aria-hidden="true">
                <div
                  className="w-2.5 h-2.5 rounded-full border-2 flex-shrink-0"
                  style={{
                    borderColor: lineColor,
                    backgroundColor: isEdge ? lineColor : 'transparent',
                  }}
                />
                {!isLast && (
                  <div
                    className="w-0.5 h-6 mt-0.5"
                    style={{ backgroundColor: lineColor + '35' }}
                  />
                )}
              </div>

              {/* Stop name */}
              <p className={`text-sm pb-3 leading-tight
                ${isEdge ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
              >
                {stop}
                {isFirst && (
                  <span
                    className="ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: lineColor + '1a', color: lineColor }}
                  >
                    Origem
                  </span>
                )}
                {isLast && (
                  <span
                    className="ml-2 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: lineColor + '1a', color: lineColor }}
                  >
                    Destino
                  </span>
                )}
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
