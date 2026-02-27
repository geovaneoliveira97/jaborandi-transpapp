import { useState, useEffect, useMemo } from 'react'
import type { BusLine } from '../types/types'
import Badge from '../components/Badge'
import { useTheme } from '../context/ThemeContext'

interface ScheduleProps {
  busLines: BusLine[]
  selectedLine: BusLine | null
  onSelectLine: (line: BusLine) => void
}

const DEFAULT_COLOR = '#2ab76a'

function getPeriodoPorDia(schedules: BusLine['schedules'] | undefined): string {
  if (!schedules) return ''
  const periodos = Object.keys(schedules)
  const diaSemana = new Date().getDay() // 0=Dom, 1=Seg...6=Sáb

  if (diaSemana === 0) {
    const domingo = periodos.find(p => p.toLowerCase().startsWith('dom'))
    if (domingo) return domingo
  }
  if (diaSemana === 6) {
    const sabado = periodos.find(p => p.toLowerCase().startsWith('s\u00e1b') || p.toLowerCase().startsWith('sab'))
    if (sabado) return sabado
  }
  return periodos.find(p => p.toLowerCase().startsWith('seg')) ?? periodos[0] ?? ''
}

function timeToMinutes(timeStr: string | null | undefined): number | null {
  if (!timeStr) return null
  const parts = timeStr.trim().split(':')
  if (parts.length < 2) return null
  const hours   = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  if (isNaN(hours) || isNaN(minutes)) return null
  return hours * 60 + minutes
}

function getNowInMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export default function Schedule({ busLines, selectedLine, onSelectLine }: ScheduleProps) {
  const { isDark } = useTheme()
  const line = selectedLine ?? busLines[0] ?? null
  const [period, setPeriod]         = useState<string>(() => getPeriodoPorDia(line?.schedules))
  const [nowMinutes, setNowMinutes] = useState<number>(getNowInMinutes)

  useEffect(() => {
    const interval = setInterval(() => setNowMinutes(getNowInMinutes()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setPeriod(getPeriodoPorDia(line?.schedules))
  }, [line?.id])

  const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']
  const periods = line?.schedules
    ? Object.keys(line.schedules).sort((a, b) => {
        const ia = PERIOD_ORDER.indexOf(a)
        const ib = PERIOD_ORDER.indexOf(b)
        if (ia === -1 && ib === -1) return 0
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
    : []

  const detail = line?.schedule_detail?.[period] ?? []

  const nextIndex = useMemo(() => {
    if (!detail.length) return -1
    return detail.findIndex((row: { de: string; colina: string | null; ate: string }) => {
      const t = timeToMinutes(row.de)
      if (t === null) return false
      const tAjustado = nowMinutes > 1200 && t < 360 ? t + 1440 : t
      return tAjustado >= nowMinutes
    })
  }, [detail, nowMinutes])

  function handleLineChange(id: string): void {
    const found = busLines.find(l => String(l.id) === id)
    if (found) onSelectLine(found)
  }

  if (!line) return (
    <p className={`text-center py-16 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
      Nenhuma linha disponível.
    </p>
  )

  const lineColor      = line.color ?? DEFAULT_COLOR
  const nameParts      = (line.name ?? '').split(' → ')
  const origem         = nameParts[0] ?? 'Origem'
  const destino        = nameParts[1] ?? 'Destino'
  const stops          = line.stops ?? []
  const intermediarias = stops.slice(1, -1)
  const paradaIntermed = intermediarias[0] ?? null

  // Classes reutilizáveis
  const cardCls = `border rounded-2xl ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`
  const dividerCls = `border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`

  return (
    <div className="space-y-5 animate-enter">

      {/* Seletor de linha */}
      <div className={`${cardCls} p-4 space-y-3`}>
        <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Selecionar linha
        </label>
        <select
          value={line.id}
          onChange={e => handleLineChange(e.target.value)}
          className={`w-full border rounded-xl px-4 py-3 text-sm
            focus:outline-none focus:border-[#2ab76a] transition-colors
            ${isDark
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-900'
            }`}
        >
          {busLines.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
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
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {line.name}
            </p>
            {intermediarias.length > 0 && (
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Passa por {intermediarias.join(', ')}
              </p>
            )}
          </div>
          <Badge status={line.status} />
        </div>
      </div>

      {/* Preços por trecho */}
      {line.prices && Object.keys(line.prices).length > 0 && (
        <div className={`${cardCls} overflow-hidden`}>
          <div className={`px-4 py-2.5 border-b ${isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              🎟️ &nbsp; Valor das passagens
            </p>
          </div>
          {Object.entries(line.prices).map(([trecho, valor], i) => (
            <div
              key={trecho}
              className={`flex items-center justify-between px-4 py-3 border-b last:border-0
                ${isDark ? 'border-gray-800' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full border-2 shrink-0"
                  style={{
                    borderColor: lineColor,
                    backgroundColor: i === 0 ? lineColor : 'transparent',
                  }}
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {trecho}
                </span>
              </div>
              <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <span className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>R$ </span>
                {valor.toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Seletor de período */}
      <div className="flex gap-2" role="group" aria-label="Selecionar período">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors
              ${period === p
                ? 'bg-[#2ab76a] text-white'
                : isDark
                  ? 'bg-gray-800 text-gray-400 border border-gray-700'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Tabela de horários */}
      <div
        aria-live="polite"
        className={`${cardCls} overflow-hidden`}
      >
        <div
          className="grid grid-cols-3 text-center text-xs font-bold text-white py-3"
          style={{ backgroundColor: lineColor }}
          aria-hidden="true"
        >
          <span>Parte de<br />{origem}</span>
          <span>
            {paradaIntermed ? <>Passa em<br />{paradaIntermed}</> : <>Trajeto<br />direto</>}
          </span>
          <span>Chega em<br />{destino}</span>
        </div>

        {detail.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">🚫</p>
            <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sem operação neste dia
            </p>
          </div>
        ) : (
          <>
            {nextIndex === -1 && (
              <div className={`px-4 py-2 text-center ${dividerCls} ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Sem mais horários hoje para esta linha.
                </p>
              </div>
            )}
            {detail.map((row: { de: string; colina: string | null; ate: string }, i: number) => {
              const isPast = nextIndex === -1 ? true : i < nextIndex
              const isNext = i === nextIndex
              return (
                <div
                  key={i}
                  className={`grid grid-cols-3 text-center py-3 text-sm ${dividerCls} last:border-0
                    transition-opacity
                    ${isNext
                      ? isDark ? 'bg-gray-800' : 'bg-white'
                      : i % 2 === 0
                        ? isDark ? 'bg-gray-900' : 'bg-white'
                        : isDark ? 'bg-gray-900/60' : 'bg-gray-50'
                    }
                    ${isPast && !isNext ? 'opacity-35' : 'opacity-100'}`}
                  style={isNext ? { borderLeft: `4px solid ${lineColor}` } : {}}
                >
                  <span className={`font-bold flex flex-col items-center gap-1
                    ${isNext
                      ? isDark ? 'text-white' : 'text-gray-900'
                      : isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {row.de}
                    {isNext && (
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: lineColor + '22', color: lineColor }}
                      >
                        Próximo
                      </span>
                    )}
                  </span>
                  <span className={`self-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    {row.colina ?? '· · · · ·'}
                  </span>
                  <span
                    className="font-bold self-center"
                    style={{ color: isNext ? lineColor : isDark ? '#6b7280' : '#9ca3af' }}
                  >
                    {row.ate}
                  </span>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Paradas */}
      {stops.length > 0 ? (
        <div className={`${cardCls} p-4`}>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-3
            ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Trajeto · {stops.length} paradas
          </p>
          <ol className="space-y-0">
            {stops.map((stop: string, i: number) => (
              <li key={stop} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0" aria-hidden="true">
                  <div
                    className="w-2.5 h-2.5 rounded-full border-2 mt-1"
                    style={{
                      borderColor: lineColor,
                      backgroundColor: i === 0 || i === stops.length - 1 ? lineColor : 'transparent',
                    }}
                  />
                  {i < stops.length - 1 && (
                    <div className="w-0.5 h-6 mt-0.5" style={{ backgroundColor: lineColor + '40' }} />
                  )}
                </div>
                <p className={`text-sm pb-3 ${
                  i === 0 || i === stops.length - 1
                    ? isDark ? 'text-white font-semibold' : 'text-gray-900 font-semibold'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stop}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className={`${cardCls} p-4 text-center`}>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Informações de trajeto não disponíveis.
          </p>
        </div>
      )}

    </div>
  )
}
