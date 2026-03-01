import type { LineStatus } from '../types/types'

interface BadgeProps {
  status: LineStatus
}

interface BadgeConfig {
  label: string
  bg: string
  text: string
}

const CONFIG: Record<LineStatus, BadgeConfig> = {
  normal:    { label: 'Normal',   bg: '#2ab76a18', text: '#2ab76a' },
  delay:     { label: 'Atraso',   bg: '#ff950018', text: '#ff9500' },
  suspended: { label: 'Suspenso', bg: '#ff3b5c18', text: '#ff3b5c' },
}

export default function Badge({ status }: BadgeProps) {
  const { label, bg, text } = CONFIG[status] ?? CONFIG.normal
  return (
    <span className="tag" style={{ backgroundColor: bg, color: text }}>
      {label}
    </span>
  )
}
