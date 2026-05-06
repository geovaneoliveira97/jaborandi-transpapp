import type { BusLine, AppView } from '../types/types'
import LineCard from '../components/LineCard'
import BusIcon  from '../components/BusIcon'

interface HomeProps {
  busLines:     BusLine[]
  onNavigate:   (view: AppView) => void
  onSelectLine: (line: BusLine) => void
}

export default function Home({ busLines, onNavigate, onSelectLine }: HomeProps) {
  return (
    <div className="space-y-5 animate-enter">

      {/* Hero banner */}
      <section
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{ backgroundColor: '#2ab76a' }}
      >
        {/* Localização */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span className="text-[11px] font-semibold text-white">Jaborandi–SP</span>
        </div>

        <h1 className="text-[22px] font-bold text-white leading-tight mb-1">
          Para onde vamos<br />hoje?
        </h1>
        <p className="text-white/75 text-sm mb-5">
          Horários oficiais Rápido do Oeste
        </p>

        {/* Atalhos */}
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('lines')}
            className="flex-1 flex items-center justify-center gap-2
              bg-white/25 hover:bg-white/35
              text-white font-semibold py-2.5 rounded-2xl
              transition-colors active:scale-95 text-sm"
          >
            <BusIcon className="w-4 h-4" />
            Ver Linhas
          </button>
          <button
            onClick={() => onNavigate('schedule')}
            className="flex-1 flex items-center justify-center gap-2
              bg-white/25 hover:bg-white/35
              text-white font-semibold py-2.5 rounded-2xl
              transition-colors active:scale-95 text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
            Horários
          </button>
        </div>

        {/* Círculos decorativos */}
        <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
      </section>

      {/* Lista de linhas */}
      {busLines.length > 0 && (
        <section aria-label="Linhas disponíveis">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-3 text-gray-400 px-1">
            Linhas disponíveis
          </h2>
          <div className="space-y-2">
            {busLines.map(line => (
              <LineCard key={line.id} line={line} onSelect={onSelectLine} />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
