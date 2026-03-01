interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-3">
      {/* Logo */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #2ab76a, #166e3c)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <rect x="3" y="5" width="18" height="13" rx="2" />
          <path d="M3 10h18M8 19v2M16 19v2M8 5V3M16 5V3" />
          <circle cx="7.5" cy="15" r="1" fill="white" stroke="none" />
          <circle cx="16.5" cy="15" r="1" fill="white" stroke="none" />
        </svg>
      </div>

      {/* Títulos */}
      <div>
        <p className="text-[10px] font-semibold text-[#2ab76a] uppercase tracking-widest leading-none">
          JaborandiTransp
        </p>
        <p className="text-base font-bold leading-snug text-gray-900">
          {title}
        </p>
      </div>
    </header>
  )
}
