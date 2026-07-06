// src/components/UpdateBanner.tsx
//
// Banner exibido quando uma nova versão do PWA está disponível.
// Usa o azul de acento (informativo) — não o verde de marca/ação — porque é
// um aviso do sistema, não uma ação principal do usuário.

import { RefreshCw, X } from './icons'

interface UpdateBannerProps {
  onUpdate: () => void
  onDismiss: () => void
}

export default function UpdateBanner({ onUpdate, onDismiss }: UpdateBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-4 mt-2 mb-0 flex items-center justify-between gap-3
        bg-accent text-white rounded-2xl px-4 py-3 text-sm shadow-md animate-pop"
    >
      <div className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
        <span className="font-medium">Nova versão disponível!</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUpdate}
          className="bg-white text-accent font-bold text-xs px-3 py-2 rounded-xl
            hover:bg-white/90 transition-colors active:scale-95"
          style={{ minHeight: 36 }}
        >
          Atualizar
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dispensar notificação de atualização"
          className="text-white/70 hover:text-white transition-colors w-8 h-8 flex items-center justify-center"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
