import { useState, useMemo } from 'react'
import type { BusLine, LineStatus } from '../types/types'
import LineCard from '../components/LineCard'

interface LinesProps {
  busLines: BusLine[]
  onSelectLine: (line: BusLine) => void
}

interface Filter {
  id: 'all' | LineStatus
  label: string
}

const FILTERS: Filter[] = [
  { id: 'all',       label: 'Todas' },
  { id: 'normal',    label: 'Em operação' },
  { id: 'delay',     label: 'Com atraso' },
  { id: 'suspended', label: 'Suspensas' },
]

export default function Lines({ busLines, onSelectLine }: LinesProps) {
  const [filter, setFilter] = useState<'all' | LineStatus>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    busLines.filter(l => {
      const matchStatus = filter === 'all' || l.status === filter
      const q = search.toLowerCase()
      const matchSearch = q === '' || l.number.includes(q) || l.name.toLowerCase().includes(q)
      return matchStatus && matchSearch
    }),
    [busLines, filter, search]
  )

  return (
    <div className="space-y-4 animate-enter">

      {/* Busca */}
      <div className="relative">
        <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round"
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4-4" />
        </svg>
        <input
          type="text"
          placeholder="Buscar por número ou nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm bg-gray-50
            text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ab76a] transition-colors"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors
              ${filter === f.id
                ? 'bg-[#2ab76a] text-white'
                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-[#2ab76a]/40'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-sm py-10 text-gray-400">
            Nenhuma linha encontrada.
          </p>
        ) : (
          filtered.map(line => (
            <LineCard key={line.id} line={line} onSelect={onSelectLine} />
          ))
        )}
      </div>

      <p className="text-center text-xs pb-2 text-gray-400">
        {filtered.length} {filtered.length === 1 ? 'linha encontrada' : 'linhas encontradas'}
      </p>
    </div>
  )
}
