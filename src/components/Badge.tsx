import type { LineStatus } from '../types/types'

interface BadgeProps {
  status: LineStatus
}

interface BadgeConfig {
  label: string
  bg:    string
  text:  string
  dot:   string
}

const CONFIG: Record<LineStatus, BadgeConfig> = {
  normal:    { label: 'Operando', bg: 'rgba(21,154,86,0.12)',  text: '#0F7A44', dot: '#159A56' },
  delay:     { label: 'Atraso',   bg: 'rgba(249,153,0,0.14)',  text: '#8A5200', dot: '#B36E00' },
  suspended: { label: 'Suspensa', bg: 'rgba(220,38,38,0.12)',  text: '#B91C1C', dot: '#DC2626' },
}

export default function Badge({ status }: BadgeProps) {
  const { label, bg, text, dot } = CONFIG[status] ?? CONFIG.normal
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: bg, color: text }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === 'normal' ? 'dot-pulse' : ''}`}
        style={{ backgroundColor: dot }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
