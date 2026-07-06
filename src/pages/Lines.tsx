// src/pages/Lines.tsx
import { useState, useMemo } from 'react'
import type { BusLine, LineStatus } from '../types/types'
import LineCard from '../components/LineCard'
import SearchInput from '../components/ui/SearchInput'
import Chip from '../components/ui/Chip'
import EmptyState from '../components/ui/EmptyState'
import { Search } from '../components/icons'
import { normalize } from '../utils/time'

interface LinesProps {
  busLines:     BusLine[]
  onSelectLine: (line: BusLine) => void
}

interface Filter {
  id:    'all' | LineStatus
  label: string
}

const FILTERS: Filter[] = [
  { id: 'all',       label: 'Todas'       },
  { id: 'normal',    label: 'Em operação' },
  { id: 'delay',     label: 'Com atraso'  },
  { id: 'suspended', label: 'Suspensas'   },
]

export default function Lines({ busLines, onSelectLine }: LinesProps) {
  const [filter, setFilter] = useState<'all' | LineStatus>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    busLines.filter(l => {
      const matchStatus = filter === 'all' || l.status === filter
      const q           = normalize(search)
      const matchSearch = q === '' || l.number.includes(q) || normalize(l.name).includes(q)
      return matchStatus && matchSearch
    }),
    [busLines, filter, search]
  )

  return (
    <div className="space-y-4 animate-enter">

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número ou nome..."
        aria-label="Buscar linha por número ou nome"
      />

      {/* Filtros */}
      <div role="tablist" aria-label="Filtrar por status" className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {FILTERS.map(f => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search className="w-7 h-7 text-line" aria-hidden="true" />}
            title="Nenhuma linha encontrada"
            description="Tente buscar por outro número ou nome."
          />
        ) : (
          filtered.map(line => (
            <LineCard key={line.id} line={line} onSelect={onSelectLine} />
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-center text-xs pb-2 text-muted">
          {filtered.length} {filtered.length === 1 ? 'linha encontrada' : 'linhas encontradas'}
        </p>
      )}
    </div>
  )
}
