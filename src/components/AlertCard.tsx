import type { Alert, AlertType } from '../types/types'

interface AlertCardProps {
  alert: Alert
}

interface AlertConfig {
  bg: string
  border: string
  icon: string
  textColor: string
}

const ALERT_CONFIG: Record<AlertType, AlertConfig> = {
  danger: { bg: '#ff3b5c0d', border: '#ff3b5c30', icon: '🚫', textColor: '#ff3b5c' },
  warn:   { bg: '#ff95000d', border: '#ff950030', icon: '⚠️', textColor: '#ff9500' },
  info:   { bg: '#2ab76a0d', border: '#2ab76a30', icon: 'ℹ️', textColor: '#2ab76a' },
}

export default function AlertCard({ alert }: AlertCardProps) {
  const cfg = ALERT_CONFIG[alert.type] ?? ALERT_CONFIG.info
  return (
    <div
      className="rounded-2xl p-4 border"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: cfg.textColor }}>{alert.title}</p>
            <span className="text-[11px] text-gray-400 shrink-0">{alert.date}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1 leading-relaxed">{alert.body}</p>
          {alert.lineNumber && (
            <span
              className="tag mt-2 inline-block"
              style={{ backgroundColor: cfg.bg, color: cfg.textColor, border: `1px solid ${cfg.border}` }}
            >
              Linha {alert.lineNumber}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
