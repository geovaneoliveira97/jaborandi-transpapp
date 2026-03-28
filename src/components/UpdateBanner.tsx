// src/components/UpdateBanner.tsx
//
// Banner exibido quando uma nova versão do PWA está disponível.
// Permite que o usuário aplique a atualização sem precisar fechar o app.

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
        bg-[#2ab76a] text-white rounded-2xl px-4 py-3 text-sm shadow-md"
    >
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0" aria-hidden="true">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span className="font-medium">Nova versão disponível!</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onUpdate}
          className="bg-white text-[#2ab76a] font-bold text-xs px-3 py-1.5 rounded-xl
            hover:bg-white/90 transition-colors active:scale-95"
        >
          Atualizar
        </button>
        <button
          onClick={onDismiss}
          aria-label="Dispensar notificação de atualização"
          className="text-white/70 hover:text-white transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
