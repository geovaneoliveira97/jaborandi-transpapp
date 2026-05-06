import BusIcon from './BusIcon'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: '#2ab76a' }}
      >
        <BusIcon stroke="white" className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-[#2ab76a] uppercase tracking-widest leading-none">
          JaborandiTransp
        </p>
        <p className="text-[15px] font-semibold leading-snug text-gray-900 truncate">
          {title}
        </p>
      </div>
      <button
        aria-label="Notificações"
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400
          hover:bg-gray-100 transition-colors active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      </button>
    </header>
  )
}
