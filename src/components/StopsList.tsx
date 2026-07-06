import { Route } from './icons'
import Card from './ui/Card'
import SectionLabel from './ui/SectionLabel'

interface StopsListProps {
  stops:     string[]
  lineColor: string
}

export default function StopsList({ stops, lineColor }: StopsListProps) {
  if (stops.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-muted">Informações de trajeto não disponíveis.</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <SectionLabel icon={<Route className="w-3.5 h-3.5 text-faint" aria-hidden="true" />} className="mb-4">
        Trajeto · {stops.length} paradas
      </SectionLabel>

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
                ${isEdge ? 'font-semibold text-ink' : 'text-muted'}`}
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
    </Card>
  )
}
