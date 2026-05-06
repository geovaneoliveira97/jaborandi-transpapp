export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando horários"
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f0f4f2]"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: '#2ab76a' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
          <path d="m3.3 7 8.7 5 8.7-5"/>
          <path d="M12 22V12"/>
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 h-6 border-[3px] border-[#2ab76a] border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-sm text-gray-400 mt-1">Carregando horários...</p>
      </div>
    </div>
  )
}

interface ErrorScreenProps {
  onRetry: () => void
}

export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <div
      role="alert"
      className="min-h-screen flex flex-col items-center justify-center gap-5 px-8 text-center bg-[#f0f4f2]"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-gray-900">Sem conexão</p>
        <p className="text-sm mt-1 text-gray-400">
          Não foi possível carregar os horários.<br />
          Verifique sua internet e tente novamente.
        </p>
      </div>
      <button onClick={onRetry} className="btn-primary">
        Tentar novamente
      </button>
    </div>
  )
}
