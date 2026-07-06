import type { AppView } from '../types/types'
import { Home, Bus, Clock } from './icons'

interface NavItem {
  id:    Exclude<AppView, 'admin'>
  label: string
  Icon:  typeof Home
}

interface BottomNavProps {
  view:       AppView
  onNavigate: (view: AppView) => void
  alertCount: number
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home',     label: 'Início',   Icon: Home },
  { id: 'lines',    label: 'Linhas',   Icon: Bus  },
  { id: 'schedule', label: 'Horários', Icon: Clock },
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
              className={`relative flex items-center gap-2 py-3 rounded-xl
                transition-all duration-200 active:scale-90
                ${isActive
                  ? 'bg-brand text-white px-4'
                  : 'text-faint px-4 hover:text-muted'
                }`}
              style={{ minHeight: 48 }}
            >
              <Icon className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
              {isActive && (
                <span className="text-xs font-bold whitespace-nowrap animate-pop">{label}</span>
              )}
              {id === 'lines' && alertCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-danger
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
