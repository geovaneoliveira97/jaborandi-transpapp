import type { LineStatus } from '../types/types'

interface BadgeProps {
  status: LineStatus
}

interface BadgeConfig {
  label: string
  bg: string
  text: string
  dot: string
}

const CONFIG: Record<LineStatus, BadgeConfig> = {
  normal:    { label: 'Operando',  bg: 'rgba(42,183,106,0.12)',  text: '#1e9e57', dot: '#2ab76a' },
  delay:     { label: 'Atraso',    bg: 'rgba(249,153,0,0.12)',   text: '#b36e00', dot: '#f99900' },
  suspended: { label: 'Suspensa',  bg: 'rgba(239,68,68,0.12)',   text: '#b91c1c', dot: '#ef4444' },
}

export default function Badge({ status }: BadgeProps) {
  const { label, bg, text, dot } = CONFIG[status] ?? CONFIG.normal
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
      style={{ backgroundColor: bg, color: text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: dot }}
        aria-hidden="true"
      />
      {label}
    </span>
  )
}
