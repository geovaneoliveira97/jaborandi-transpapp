interface BrandBusIconProps {
  className?: string
  stroke?: string
  strokeWidth?: number
}

// Ícone de marca (logo) — usado só no Header e na tela de carregamento.
// Mantido como SVG próprio (não lucide) de propósito: é a identidade visual
// do app, não um ícone de interface genérico.
export default function BrandBusIcon({ className = 'w-5 h-5', stroke = 'currentColor', strokeWidth = 2 }: BrandBusIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="13" rx="2" />
      <path d="M3 10h18M8 5V3M16 5V3" />
      <circle cx="7.5" cy="15" r="1" fill={stroke} stroke="none" />
      <circle cx="16.5" cy="15" r="1" fill={stroke} stroke="none" />
    </svg>
  )
}
