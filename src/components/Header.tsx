import { useTheme } from '../context/ThemeContext'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { isDark, toggle } = useTheme()

  return (
    <header className={`sticky top-0 z-40 border-b px-5 py-4 flex items-center justify-between transition-colors duration-300
      ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
    >
      {/* Logo + Títulos */}
      <div className="flex items-center gap-3">
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

        <div>
          <p className="text-[10px] font-semibold text-[#2ab76a] uppercase tracking-widest leading-none">
            JaborandiTransp
          </p>
          <p className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </p>
        </div>
      </div>

      {/* Toggle dark mode */}
      <button
        onClick={toggle}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors
          ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
      >
        {isDark ? (
          /* Sol */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 w-[18px] h-[18px]">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          /* Lua */
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </button>
    </header>
  )
}
