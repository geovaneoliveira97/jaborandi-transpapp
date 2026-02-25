import type { BusLine, Alert, AppView } from '../types'
import LineCard from '../components/LineCard'

interface HomeProps {
  busLines: BusLine[]
  alerts: Alert[]
  onNavigate: (view: AppView) => void
  onSelectLine: (line: BusLine) => void
}

export default function Home({ busLines, onNavigate, onSelectLine }: HomeProps) {
  return (
    <div className="space-y-6 animate-enter">

      {/* ── Hero ── */}
      <section
        className="rounded-3xl p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2ab76a 0%, #1a7a47 100%)' }}
      >
        {/* Badge cidade */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mb-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span className="text-[11px] font-bold text-white uppercase tracking-widest">Jaborandi–SP</span>
        </div>

        <h1 className="text-2xl font-black text-white leading-tight">
          Para onde vamos<br />hoje?
        </h1>
        <p className="text-white/80 text-sm mt-2">
          Consulte os horários oficiais da Rápido do Oeste de forma simples.
        </p>

        {/* Botões rápidos */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => onNavigate('lines')}
            className="flex-1 flex flex-col items-center gap-2 bg-white/20 hover:bg-white/30
              text-white font-bold py-3 rounded-2xl transition-colors active:scale-95 text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <rect x="3" y="5" width="18" height="13" rx="2" />
              <path d="M3 10h18M8 5V3M16 5V3" />
              <circle cx="7.5" cy="15" r="1" fill="currentColor" />
              <circle cx="16.5" cy="15" r="1" fill="currentColor" />
            </svg>
            Ver Linhas
          </button>
          <button
            onClick={() => onNavigate('about')}
            className="flex-1 flex flex-col items-center gap-2 bg-white/20 hover:bg-white/30
              text-white font-bold py-3 rounded-2xl transition-colors active:scale-95 text-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Sobre
          </button>
        </div>

        {/* Decoração */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-4 -bottom-6 w-20 h-20 rounded-full bg-white/5" />
      </section>

      {/* ── Linhas disponíveis ── */}
      {busLines.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Linhas disponíveis
          </p>
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