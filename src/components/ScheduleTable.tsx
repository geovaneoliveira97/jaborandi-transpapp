import { useTheme } from '../context/ThemeContext'

export interface ScheduleRow { de: string; colina: string | null; ate: string }

interface ScheduleTableProps {
  detail: ScheduleRow[]
  nextIndex: number
  lineColor: string
  origem: string
  destino: string
  paradaIntermed: string | null
}

export default function ScheduleTable({ detail, nextIndex, lineColor, origem, destino, paradaIntermed }: ScheduleTableProps) {
  const { isDark } = useTheme()
  const card    = `border rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`
  const divider = `border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`

  return (
    <div aria-live="polite" className={card}>
      <div className="grid grid-cols-3 text-center text-xs font-bold text-white py-3" style={{ backgroundColor: lineColor }} aria-hidden="true">
        <span>Parte de<br />{origem}</span>
        <span>{paradaIntermed ? <>Passa em<br />{paradaIntermed}</> : <>Trajeto<br />direto</>}</span>
        <span>Chega em<br />{destino}</span>
      </div>
      {detail.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-3xl mb-2">🚫</p>
          <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sem operação neste dia</p>
        </div>
      ) : (
        <>
          {nextIndex === -1 && (
            <div className={`px-4 py-2 text-center ${divider} ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sem mais horários hoje para esta linha.</p>
            </div>
          )}
          {detail.map((row, i) => {
            const isPast = nextIndex === -1 ? true : i < nextIndex
            const isNext = i === nextIndex
            return (
              <div key={i}
                className={`grid grid-cols-3 text-center py-3 text-sm ${divider} last:border-0 transition-opacity
                  ${isNext ? isDark ? 'bg-gray-800' : 'bg-white' : i % 2 === 0 ? isDark ? 'bg-gray-900' : 'bg-white' : isDark ? 'bg-gray-900/60' : 'bg-gray-50'}
                  ${isPast && !isNext ? 'opacity-35' : 'opacity-100'}`}
                style={isNext ? { borderLeft: `4px solid ${lineColor}` } : {}}>
                <span className={`font-bold flex flex-col items-center gap-1 ${isNext ? isDark ? 'text-white' : 'text-gray-900' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {row.de}
                  {isNext && (
                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: lineColor + '22', color: lineColor }}>Próximo</span>
                  )}
                </span>
                <span className={`self-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{row.colina ?? '· · · · ·'}</span>
                <span className="font-bold self-center" style={{ color: isNext ? lineColor : isDark ? '#6b7280' : '#9ca3af' }}>{row.ate}</span>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}