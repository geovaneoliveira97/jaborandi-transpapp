// src/pages/Lines.tsx
//
// Página de listagem de todas as linhas de ônibus disponíveis.
//
// Funcionalidades:
//   • Campo de busca textual por número ou nome da linha
//   • Filtros rápidos por status (todas, em operação, com atraso, suspensas)
//   • Contagem de resultados exibida ao final da lista

import { useState, useMemo } from 'react'
import type { BusLine, LineStatus } from '../types/types'
import LineCard from '../components/LineCard'

interface LinesProps {
  busLines:     BusLine[]
  onSelectLine: (line: BusLine) => void
}

interface Filter {
  id:    'all' | LineStatus
  label: string
}

// Opções de filtro por status exibidas como botões acima da lista
const FILTERS: Filter[] = [
  { id: 'all',       label: 'Todas'        },
  { id: 'normal',    label: 'Em operação'  },
  { id: 'delay',     label: 'Com atraso'   },
  { id: 'suspended', label: 'Suspensas'    },
]

// Normaliza uma string para busca tolerante a acentos.
// Permite encontrar "Ribeirão Preto" digitando apenas "ribeirao",
// sem exigir que o usuário use caracteres especiais no teclado do celular.
function normalize(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export default function Lines({ busLines, onSelectLine }: LinesProps) {
  const [filter, setFilter] = useState<'all' | LineStatus>('all')
  const [search, setSearch] = useState('')

  // useMemo evita recalcular a lista filtrada a cada renderização.
  // A filtragem só roda novamente quando busLines, filter ou search mudam.
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

      {/* Campo de busca com ícone de lupa posicionado via CSS absoluto */}
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
          aria-label="Buscar linha por número ou nome"
          placeholder="Buscar por número ou nome..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm bg-gray-50
            text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#2ab76a] transition-colors"
        />
      </div>

      {/* Filtros de status — rolagem horizontal para caber em telas pequenas */}
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

      {/* Lista de linhas filtradas */}
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

      {/* Contador de resultados para orientar o usuário após filtrar */}
      <p className="text-center text-xs pb-2 text-gray-400">
        {filtered.length} {filtered.length === 1 ? 'linha encontrada' : 'linhas encontradas'}
      </p>

    </div>
  )
}
