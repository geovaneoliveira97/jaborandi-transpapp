import type { ReactElement } from 'react'
import type { AppView } from '../types/types'
import BusIcon from './BusIcon'

type IconComponent = () => ReactElement

interface NavItem {
  id: Exclude<AppView, 'admin'>
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
]

export default function BottomNav({ view, onNavigate, alertCount }: BottomNavProps) {
  return (
    <nav
      role="navigation"
      aria-label="Navegação principal"
      className="fixed bottom-0 left-0 right-0 z-50 px-4"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className="flex justify-around items-center px-2 py-2 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 -1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.12)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}
      >
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const isActive = view === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              aria-label={`Ir para ${label}`}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center gap-2 py-2.5 rounded-xl
                transition-all duration-200 active:scale-90
                ${isActive
                  ? 'bg-[#2ab76a] text-white px-4'
                  : 'text-gray-400 px-4 hover:text-gray-600'
                }`}
            >
              <Icon />
              {isActive && (
                <span className="text-xs font-bold whitespace-nowrap">{label}</span>
              )}
              {id === 'lines' && alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500
                  text-white text-[9px] font-black flex items-center justify-center">
                  {alertCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
