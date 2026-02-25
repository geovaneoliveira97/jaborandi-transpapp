import type { AppView } from '../types'

// Tipo do componente de ícone — função React sem props
type IconComponent = () => JSX.Element

interface NavItem {
  id: AppView
  label: string
  Icon: IconComponent
}

interface BottomNavProps {
  view: AppView
  onNavigate: (view: AppView) => void
  alertCount: number
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    label: 'Início',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: 'lines',
    label: 'Linhas',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="5" width="18" height="13" rx="2" />
        <path d="M3 10h18M8 5V3M16 5V3" />
        <circle cx="7.5" cy="15" r="1" fill="currentColor" />
        <circle cx="16.5" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'schedule',
    label: 'Horários',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    id: 'about',
    label: 'Sobre',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
]

export default function BottomNav({ view, onNavigate, alertCount }: BottomNavProps) {
  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        w-[92%] max-w-sm bg-[#1a2535]
        border border-[#243347] rounded-[2rem] px-2 py-2
        flex justify-around items-center shadow-2xl"
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = view === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-label={`Ir para ${label}`}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-1 py-2 px-3 rounded-2xl
              transition-all duration-200 active:scale-90
              ${isActive
                ? 'text-[#2ab76a] bg-[#2ab76a]/10'
                : 'text-[#4a6070] hover:text-[#7a90a8]'
              }`}
          >
            <Icon />
            <span aria-hidden="true" className="text-[9px] font-bold uppercase tracking-widest">
              {label}
            </span>
            {/* Badge de alertas na aba Linhas */}
            {id === 'lines' && alertCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500
                text-white text-[9px] font-black flex items-center justify-center">
                {alertCount}
              </span>
            )}
            {isActive && (
              <span aria-hidden="true" className="absolute bottom-1 w-1 h-1 bg-[#2ab76a] rounded-full" />
            )}
          </button>
        )
      })}
    </nav>
  )
}