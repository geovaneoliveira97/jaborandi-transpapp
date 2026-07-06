import type { BusLine, AppView } from '../types/types'
import LineCard from '../components/LineCard'
import SectionLabel from '../components/ui/SectionLabel'
import { Bus, Clock, MapPin } from '../components/icons'

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
        style={{ background: 'linear-gradient(135deg, #159A56 0%, #0F7A44 100%)' }}
      >
        {/* Localização */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mb-4">
          <MapPin className="w-3 h-3 text-white" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-white">Jaborandi–SP</span>
        </div>

        <h1 className="text-[24px] font-bold text-white leading-tight mb-1">
          Para onde vamos<br />hoje?
        </h1>
        <p className="text-white/70 text-sm mb-5">
          Horários oficiais Rápido do Oeste
        </p>

        {/* Atalhos */}
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('lines')}
            className="flex-1 flex items-center justify-center gap-2
              bg-white text-brand-dark font-bold py-3 rounded-2xl
              shadow-md transition-all active:scale-95 text-sm"
            style={{ minHeight: 48 }}
          >
            <Bus className="w-4 h-4" aria-hidden="true" />
            Ver Linhas
          </button>
          <button
            onClick={() => onNavigate('schedule')}
            className="flex-1 flex items-center justify-center gap-2
              bg-white/20 hover:bg-white/30
              text-white font-bold py-3 rounded-2xl
              border border-white/25
              transition-all active:scale-95 text-sm"
            style={{ minHeight: 48 }}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            Horários
          </button>
        </div>

        {/* Círculos decorativos */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute -right-4 -bottom-8 w-28 h-28 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute left-1/2 -bottom-12 w-20 h-20 rounded-full bg-black/5 pointer-events-none" />
      </section>

      {/* Lista de linhas */}
      {busLines.length > 0 && (
        <section aria-label="Linhas disponíveis">
          <SectionLabel className="mb-3 px-1">
            Linhas disponíveis
          </SectionLabel>
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
