import type { ScheduleRow } from '../types/types'
import { Clock } from './icons'
import Card from './ui/Card'
import { getDayPeriod, DAY_PERIOD_ORDER } from '../utils/dayPeriod'

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
      <Card className="p-10 text-center">
        <p className="text-3xl mb-2" aria-hidden="true">🚫</p>
        <p className="text-sm font-semibold text-muted">Sem operação neste dia</p>
      </Card>
    )
  }

  // Agrupa as linhas por período do dia (Manhã/Tarde/Noite) sem alterar a
  // ordem original nem o índice usado para destacar o "próximo horário" —
  // cada linha guarda seu índice real dentro de `detail`.
  const groups = DAY_PERIOD_ORDER
    .map(bucket => ({
      bucket,
      rows: detail
        .map((row, i) => ({ row, i }))
        .filter(({ row }) => getDayPeriod(row.de) === bucket),
    }))
    .filter(g => g.rows.length > 0)

  return (
    <Card
      role="table"
      aria-live="polite"
      aria-label={`Horários de ${origem} a ${destino}`}
      className="overflow-hidden"
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
        <div className="px-4 py-2 text-center border-b border-line bg-bg/60">
          <p className="text-xs text-muted">Sem mais horários hoje para esta linha.</p>
        </div>
      )}

      {groups.map(({ bucket, rows }) => (
        <div key={bucket}>
          <div className="px-4 py-2 bg-bg/60 flex items-center gap-1.5 border-b border-line">
            <Clock className="w-3 h-3 text-faint" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{bucket}</span>
          </div>

          {rows.map(({ row, i }) => {
            const rowKey = `${row.de}-${row.ate}-${i}`
            const isPast = nextIndex === -1 ? true : i < nextIndex
            const isNext = i === nextIndex

            return (
              <div
                key={rowKey}
                role="row"
                className={`grid grid-cols-3 text-center py-3.5 border-b border-line last:border-0 transition-opacity
                  ${isPast && !isNext ? 'opacity-35' : 'opacity-100'}`}
                style={isNext ? { borderLeft: `3px solid ${lineColor}` } : {}}
              >
                {/* Coluna: Saída */}
                <span role="cell" className="flex flex-col items-center gap-1">
                  <span className={`flex items-center gap-1 font-bold text-sm
                    ${isNext ? 'text-ink' : 'text-muted'}`}>
                    <Clock
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: isNext ? lineColor : '#94A0AA' }}
                      aria-hidden="true"
                    />
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
                <span role="cell" className="self-center text-sm text-faint">
                  {row.colina ?? '· · ·'}
                </span>

                {/* Coluna: Chegada */}
                <span
                  role="cell"
                  className="self-center text-sm font-bold"
                  style={{ color: isNext ? lineColor : '#94A0AA' }}
                >
                  {row.ate}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </Card>
  )
}
