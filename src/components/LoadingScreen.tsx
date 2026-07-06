import BrandBusIcon from './icons/BrandBusIcon'
import { WifiOff } from './icons'
import Button from './ui/Button'

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Carregando horários"
      className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-brand animate-pop">
        <BrandBusIcon stroke="white" className="w-8 h-8" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-6 h-6 border-[3px] border-brand border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        <p className="text-sm text-muted mt-1">Carregando horários...</p>
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
      className="min-h-screen flex flex-col items-center justify-center gap-5 px-8 text-center bg-bg"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white shadow-card">
        <WifiOff className="w-8 h-8 text-danger" aria-hidden="true" />
      </div>
      <div>
        <p className="font-bold text-ink">Sem conexão</p>
        <p className="text-sm mt-1 text-muted">
          Não foi possível carregar os horários.<br />
          Verifique sua internet e tente novamente.
        </p>
      </div>
      <Button onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  )
}
