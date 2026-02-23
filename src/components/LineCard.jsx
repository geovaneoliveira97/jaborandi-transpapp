import Badge from './Badge'

const DEFAULT_COLOR = '#2ab76a'

const STATUS_LABEL = {
  normal:    'em operação normal',
  delay:     'com atraso',
  suspended: 'suspensa',
}

export default function LineCard({ line, onSelect }) {
  const isSuspended = line.status === 'suspended'
  const lineColor = line.color ?? DEFAULT_COLOR

  // ✅ Descrição completa para leitores de tela
  // Ex: "Linha 100 - Jaborandi → Colina, em operação normal"
  const ariaLabel = isSuspended
    ? `Linha ${line.number} - ${line.name}, suspensa. Indisponível para seleção.`
    : `Ver horários da linha ${line.number} - ${line.name}, ${STATUS_LABEL[line.status] ?? ''}`

  return (
    <button
      onClick={isSuspended ? undefined : () => onSelect(line)}
      // ✅ aria-disabled mantém o botão focável e explicativo para leitores de tela
      // enquanto disabled nativo o remove completamente do fluxo de acessibilidade
      aria-disabled={isSuspended}
      aria-label={ariaLabel}
      className={`w-full text-left p-4 flex items-center gap-4 rounded-2xl
        border transition-all duration-200 active:scale-[0.98]
        ${isSuspended
          ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
          : 'bg-gray-50 border-gray-200 hover:border-[#2ab76a]/50 hover:bg-[#2ab76a]/5'
        }`}
    >
      {/* ✅ aria-hidden nos elementos visuais decorativos */}
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-sm"
        style={{ backgroundColor: lineColor + '22', color: lineColor }}
      >
        {line.number}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm leading-snug truncate">{line.name}</p>
        <p className="text-gray-500 text-xs mt-0.5">{line.frequency}</p>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0" aria-hidden="true">
        <Badge status={line.status} />
        {!isSuspended && (
          <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 18l6-6-6-6" />
          </svg>
        )}
      </div>
    </button>
  )
}