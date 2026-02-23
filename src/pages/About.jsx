export default function About() {
  return (
    <div className="card p-6 space-y-4 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: 'linear-gradient(135deg, #2ab76a, #166e3c)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <rect x="3" y="5" width="18" height="13" rx="2" />
          <path d="M3 10h18M8 5V3M16 5V3" />
          <circle cx="7.5" cy="15" r="1" fill="white" stroke="none" />
          <circle cx="16.5" cy="15" r="1" fill="white" stroke="none" />
        </svg>
      </div>

      <h2 className="text-xl font-black text-gray-900">JaborandiTransp</h2>

      <p className="text-gray-500 text-sm leading-relaxed">
        Aplicativo que exibe os horários intermunicipais de ônibus da cidade de
        Jaborandi – SP, criado para atender à comunidade local com informações
        claras e acessíveis sobre as linhas da empresa Rápido do Oeste.
      </p>

      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-400">Desenvolvido como Projeto Integrador</p>
        <p className="text-xs font-semibold text-[#2ab76a] mt-1">UNIVESP 2025</p>
      </div>
    </div>
  )
}