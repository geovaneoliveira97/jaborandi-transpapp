/**
 * Schedule — Tabela de horários com seletor de linha e período.
 */

import { useState, useEffect, useMemo } from 'react'
import Badge from '../components/Badge'

const DEFAULT_COLOR = '#2ab76a'

function getPeriodoPadrao(schedules) {
  if (!schedules) return ''
  const periodos = Object.keys(schedules)
  return periodos.find(p => p.toLowerCase().startsWith('seg')) ?? periodos[0]
}

// ✅ Converte "HH:MM" em minutos totais para facilitar comparação
function timeToMinutes(timeStr) {
  if (!timeStr) return null
  const parts = timeStr.trim().split(':')
  if (parts.length < 2) return null
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  if (isNaN(hours) || isNaN(minutes)) return null
  return hours * 60 + minutes
}

// ✅ Retorna os minutos atuais desde meia-noite
function getNowInMinutes() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

export default function Schedule({ busLines, selectedLine, onSelectLine }) {
  const line = selectedLine ?? busLines[0] ?? null
  const [period, setPeriod] = useState(() => getPeriodoPadrao(line?.schedules))

  // ✅ Atualiza o relógio a cada minuto para o destaque ficar sempre correto
  const [nowMinutes, setNowMinutes] = useState(getNowInMinutes)
  useEffect(() => {
    const interval = setInterval(() => setNowMinutes(getNowInMinutes()), 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setPeriod(getPeriodoPadrao(line?.schedules))
  }, [line?.id])

  const periods = line?.schedules
    ? Object.keys(line.schedules).sort((a, b) =>
        a.toLowerCase().startsWith('seg') ? -1 : 1
      )
    : []

  const detail = line?.schedule_detail?.[period] ?? []

  // ✅ Calcula qual é o índice do próximo horário
  const nextIndex = useMemo(() => {
    if (!detail.length) return -1
    return detail.findIndex(row => {
      const t = timeToMinutes(row.de)
      return t !== null && t >= nowMinutes
    })
  }, [detail, nowMinutes])

  function handleLineChange(id) {
    const found = busLines.find(l => l.id === Number(id))
    if (found) onSelectLine(found)
  }

  if (!line) return (
    <p className="text-center text-gray-400 py-16 text-sm">Nenhuma linha disponível.</p>
  )

  const lineColor = line.color ?? DEFAULT_COLOR
  const nameParts = (line.name ?? '').split(' → ')
  const origem = nameParts[0] ?? 'Origem'
  const destino = nameParts[1] ?? 'Destino'
  const stops = line.stops ?? []

  return (
    <div className="space-y-5 animate-enter">

      {/* Seletor de linha */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Selecionar linha
        </label>
        <select
          value={line.id}
          onChange={e => handleLineChange(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl
            px-4 py-3 text-sm text-gray-900
            focus:outline-none focus:border-[#2ab76a] transition-colors"
        >
          {busLines.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <div className="flex items-center gap-3 pt-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0"
            style={{ backgroundColor: lineColor + '22', color: lineColor }}
          >
            {line.number}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{line.name}</p>
            <p className="text-xs text-gray-400">Passa por Colina</p>
          </div>
          <Badge status={line.status} />
        </div>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2">
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors
              ${period === p
                ? 'bg-[#2ab76a] text-white'
                : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Tabela de horários */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
        <div
          className="grid grid-cols-3 text-center text-xs font-bold text-white py-3"
          style={{ backgroundColor: lineColor }}
        >
          <span>Parte de<br />{origem}</span>
          <span>Passa em<br />Colina</span>
          <span>Chega em<br />{destino}</span>
        </div>

        {detail.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-3xl mb-2">🚫</p>
            <p className="text-gray-500 text-sm font-semibold">Sem operação neste dia</p>
          </div>
        ) : (
          <>
            {/* ✅ Aviso se todos os horários já passaram */}
            {nextIndex === -1 && (
              <div className="px-4 py-2 text-center bg-gray-100 border-b border-gray-200">
                <p className="text-xs text-gray-400">Sem mais horários hoje para esta linha.</p>
              </div>
            )}

            {detail.map((row, i) => {
              const isPast = nextIndex === -1
                ? true
                : i < nextIndex
              const isNext = i === nextIndex

              return (
                <div
                  key={i}
                  className={`grid grid-cols-3 text-center py-3 text-sm border-b border-gray-200 last:border-0
                    transition-opacity
                    ${isNext ? 'bg-white' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    ${isPast && !isNext ? 'opacity-35' : 'opacity-100'}
                  `}
                  // ✅ Borda lateral colorida no próximo horário
                  style={isNext ? { borderLeft: `4px solid ${lineColor}` } : {}}
                >
                  <span className={`font-bold ${isNext ? 'text-gray-900' : 'text-gray-600'} flex flex-col items-center gap-1`}>
                    {row.de}
                    {/* ✅ Badge "Próximo" apenas na linha destacada */}
                    {isNext && (
                      <span
                        className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: lineColor + '22', color: lineColor }}
                      >
                        Próximo
                      </span>
                    )}
                  </span>
                  <span className="text-gray-500 self-center">{row.colina ?? '· · · · ·'}</span>
                  <span className={`font-bold self-center`} style={{ color: isNext ? lineColor : '#9ca3af' }}>
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
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
            Trajeto · {stops.length} paradas
          </p>
          <ol className="space-y-0">
            {stops.map((stop, i) => (
              <li key={stop} className="flex items-start gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full border-2 mt-1"
                    style={{
                      borderColor: lineColor,
                      backgroundColor: i === 0 || i === stops.length - 1 ? lineColor : 'transparent'
                    }}
                  />
                  {i < stops.length - 1 && (
                    <div className="w-0.5 h-6 mt-0.5" style={{ backgroundColor: lineColor + '40' }} />
                  )}
                </div>
                <p className={`text-sm pb-3 ${i === 0 || i === stops.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                  {stop}
                </p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
          <p className="text-gray-400 text-sm">Informações de trajeto não disponíveis.</p>
        </div>
      )}

    </div>
  )
}