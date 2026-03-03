interface BusIconProps {
  className?: string
  stroke?: string
  strokeWidth?: string | number
}

// Ícone único do ônibus — usado em Header, About, Home e BottomNav.
// Versão canônica: sem as "pernas" (M8 19v2 / M16 19v2), consistente com BottomNav e Home.
export default function BusIcon({ className = 'w-5 h-5', stroke = 'currentColor', strokeWidth = '2' }: BusIconProps) {
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
