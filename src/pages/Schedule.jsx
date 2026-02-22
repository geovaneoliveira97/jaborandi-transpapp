/**
 * Schedule — Tabela de horários com seletor de linha e período.
 */

import { useState, useEffect } from 'react'
import Badge from '../components/Badge'

export default function Schedule({ busLines, selectedLine, onSelectLine }) {
  const [line, setLine] = useState(selectedLine ?? busLines[0] ?? null)
  const [period, setPeriod] = useState('')

  useEffect(() => {
    if (line?.schedules) {
      setPeriod(Object.keys(line.schedules)[0])
    }
  }, [line])

  const periods = line?.schedules ? Object.keys(line.schedules) : []
  const detail  = line?.schedule_detail?.[period] ?? []

  function handleLineChange(id) {
    const found = busLines.find(l => l.id === Number(id))
    if (found) {
      setLine(found)
      onSelectLine(found)
    }
  }

  if (!line) return (
    <p className="text-center text-gray-400 py-16 text-sm">Nenhuma linha disponível.</p>
  )

  const [origem, destino] = line.name.split(' → ')

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
            style={{ backgroundColor: line.color + '22', color: line.color }}
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
          style={{ backgroundColor: line.color }}
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
          detail.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 text-center py-3 text-sm border-b border-gray-200 last:border-0
                ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
            >
              <span className="font-bold text-gray-900">{row.de}</span>
              <span className="text-gray-500">{row.colina ?? '· · · · ·'}</span>
              <span className="font-bold" style={{ color: line.color }}>{row.ate}</span>
            </div>
          ))
        )}
      </div>

      {/* Paradas */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-3">
          Trajeto · {line.stops.length} paradas
        </p>
        <ol className="space-y-0">
          {line.stops.map((stop, i) => (
            <li key={stop} className="flex items-start gap-3">
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full border-2 mt-1"
                  style={{
                    borderColor: line.color,
                    backgroundColor: i === 0 || i === line.stops.length - 1 ? line.color : 'transparent'
                  }}
                />
                {i < line.stops.length - 1 && (
                  <div className="w-0.5 h-6 mt-0.5" style={{ backgroundColor: line.color + '40' }} />
                )}
              </div>
              <p className={`text-sm pb-3 ${i === 0 || i === line.stops.length - 1 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                {stop}
              </p>
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}