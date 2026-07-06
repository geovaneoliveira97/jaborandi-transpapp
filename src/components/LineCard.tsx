import type { KeyboardEvent } from 'react'
import type { BusLine } from '../types/types'
import { DEFAULT_LINE_COLOR } from '../types/types'
import { Clock, ChevronRight } from './icons'
import Badge from './Badge'
import FavoriteButton from './ui/FavoriteButton'
import { useNextDeparture } from '../hooks/useNextDeparture'
import { useFavorites } from '../hooks/useFavorites'
import { ensureContrastOnWhite } from '../utils/color'

interface LineCardProps {
  line:     BusLine
  onSelect: (line: BusLine) => void
}

export default function LineCard({ line, onSelect }: LineCardProps) {
  const isSuspended = line.status === 'suspended'
  // `line.color` vem do banco e pode não ter contraste suficiente atrás do
  // texto branco do número — corrigido automaticamente aqui (ver utils/color).
  const lineColor   = ensureContrastOnWhite(line.color ?? DEFAULT_LINE_COLOR)

  const { detail, nextIndex, nextLabel } = useNextDeparture(line.schedule_detail)
  const { isFavorite, toggleFavorite }   = useFavorites()
  const favorite = isFavorite(line.id)
  const proximo  = nextIndex !== -1 ? detail[nextIndex] : null

  const ariaLabel = isSuspended
    ? `Linha ${line.number} - ${line.name}, suspensa. Indisponível.`
    : `Ver horários da linha ${line.number} - ${line.name}`

  // Elemento raiz é <div role="button"> (não <button>) porque o card contém o
  // botão de favoritar — dois <button> aninhados são HTML inválido e quebram
  // a semântica de acessibilidade dos leitores de tela.
  const handleKeyDown = (e: KeyboardEvent) => {
    if (isSuspended) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect(line)
    }
  }

  return (
    <div
      role="button"
      tabIndex={isSuspended ? -1 : 0}
      onClick={() => !isSuspended && onSelect(line)}
      onKeyDown={handleKeyDown}
      aria-disabled={isSuspended}
      aria-label={ariaLabel}
      className={`w-full text-left p-3.5 flex items-center gap-3 rounded-2xl
        bg-white shadow-card transition-all duration-200 active:scale-[0.98]
        ${isSuspended
          ? 'opacity-45 cursor-not-allowed'
          : 'cursor-pointer hover:shadow-popover'
        }`}
    >
      {/* Número da linha — destaque com fundo colorido sólido */}
      <div
        aria-hidden="true"
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0
          font-bold text-[13px] text-white"
        style={{ backgroundColor: lineColor }}
      >
        {line.number}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-snug truncate text-ink">
          {line.name}
        </p>
        <p className="text-xs mt-0.5 text-muted flex items-center gap-1">
          <Clock className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
          {line.frequency}
        </p>

        {!isSuspended && proximo && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-xs font-bold text-ink">Próximo {proximo.de}</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(21,154,86,0.12)', color: '#0F7A44' }}
            >
              em {nextLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <FavoriteButton
          active={favorite}
          onToggle={() => toggleFavorite(line.id)}
          label={`linha ${line.number}`}
        />
        <Badge status={line.status} />
        {!isSuspended && (
          <ChevronRight className="w-4 h-4 text-line mt-1" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
