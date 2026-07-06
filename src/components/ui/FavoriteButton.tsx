import { Star } from '../icons'

interface FavoriteButtonProps {
  active:   boolean
  onToggle: () => void
  label?:   string
}

export default function FavoriteButton({ active, onToggle, label = 'linha' }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); onToggle() }}
      aria-label={active ? `Remover ${label} dos favoritos` : `Favoritar ${label}`}
      aria-pressed={active}
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0
        transition-all active:scale-90 hover:bg-black/5"
    >
      <Star
        className={`w-[18px] h-[18px] transition-colors ${active ? 'text-warning' : 'text-faint'}`}
        fill={active ? 'currentColor' : 'none'}
      />
    </button>
  )
}
