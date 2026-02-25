export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-[#2ab76a] border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Carregando horários...</p>
    </div>
  )
}
interface ErrorScreenProps{
  onRetry:() => void
}
export function ErrorScreen({ onRetry }: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-gray-900">Sem conexão</p>
        <p className="text-gray-400 text-sm mt-1">
          Não foi possível carregar os horários. Verifique sua internet e tente novamente.
        </p>
      </div>
      <button onClick={onRetry} className="btn-primary mt-2">
        Tentar novamente
      </button>
    </div>
  )
}