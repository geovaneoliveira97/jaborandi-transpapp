import type { ReactElement } from 'react'
import type { AppView } from '../types/types'
import BusIcon from './BusIcon'

type IconComponent = () => ReactElement

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
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    id: 'lines',
    label: 'Linhas',
    Icon: () => <BusIcon className="w-5 h-5" strokeWidth={2} />,
  },
  {
    id: 'schedule',
    label: 'Horários',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    Icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
]

export default function BottomNav({ view, onNavigate, alertCount }: BottomNavProps) {
  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-gray-100
        flex justify-around items-center
        px-2 py-2 pb-safe"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = view === id
        return (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-label={`Ir para ${label}`}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl
              transition-all duration-200 active:scale-90
              ${isActive
                ? 'text-[#2ab76a]'
                : 'text-gray-400 hover:text-gray-500'
              }`}
            style={isActive ? { backgroundColor: 'rgba(42,183,106,0.10)' } : {}}
          >
            <Icon />
            <span aria-hidden="true" className="text-[9px] font-semibold tracking-wide">
              {label}
            </span>
            {id === 'lines' && alertCount > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-red-500
                text-white text-[9px] font-black flex items-center justify-center">
                {alertCount}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
