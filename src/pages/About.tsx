import BusIcon from '../components/BusIcon'

export default function About() {
  return (
    <div className="space-y-4 animate-enter">

      <div className="card p-6 space-y-4 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: 'linear-gradient(135deg, #2ab76a, #166e3c)' }}
        >
          <BusIcon stroke="white" className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-black text-gray-900">JaborandiTransp</h2>

        <p className="text-gray-500 text-sm leading-relaxed">
          Aplicativo que exibe os horários intermunicipais de ônibus da cidade de
          Jaborandi – SP, criado para atender à comunidade local com informações
          claras e acessíveis sobre as linhas da empresa Rápido do Oeste.
        </p>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-400">Desenvolvido como Projeto Integrador</p>
          <p className="text-xs font-semibold text-[#2ab76a] mt-1">UNIVESP 2026</p>
        </div>
      </div>

      {/* Polo */}
      <div className="card p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2ab76a]/10 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2ab76a" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
        </div>
        <div>
          <p className="text-xs text-gray-400">Polo UNIVESP</p>
          <p className="text-sm font-semibold text-gray-700">Jaborandi – SP</p>
        </div>
      </div>

    </div>
  )
}
