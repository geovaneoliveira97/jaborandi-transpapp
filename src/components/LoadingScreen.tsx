import { useTheme } from '../context/ThemeContext'

export function LoadingScreen() {
  const { isDark } = useTheme()
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-3
      ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#2ab76a] border-t-transparent rounded-full animate-spin" />
      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Carregando horários...
      </p>
    </div>
  )
}

interface ErrorScreenProps {
  onRetry: () => void
}

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  const { isDark } = useTheme()
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center
      ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center
        ${isDark ? 'bg-red-950' : 'bg-red-50'}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sem conexão</p>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Não foi possível carregar os horários. Verifique sua internet e tente novamente.
        </p>
      </div>
      <button onClick={onRetry} className="btn-primary mt-2">
        Tentar novamente
      </button>
    </div>
  )
}
