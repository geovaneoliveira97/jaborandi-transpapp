// src/components/AlertCard.tsx
//
// Componente de alerta — exibe avisos operacionais sobre as linhas de ônibus.
//
// STATUS: Componente pronto, aguardando integração da feature de alertas no App.tsx.
// Para ativar: implementar busca de alertas no Supabase (tabela 'alerts'),
// passar os dados via prop para as páginas que precisarem, e passar alertCount
// real para o BottomNav.
//
// Tipos de alerta suportados: 'danger' (suspensão), 'warn' (atraso), 'info' (aviso geral).

import type { AlertType } from '../types/types'

export interface Alert {
  id:          number
  title?:      string
  body:        string
  date?:       string
  lineNumber?: number
  type:        AlertType
}

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
      role="alert"
      className="rounded-2xl p-4 border"
      style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl leading-none mt-0.5" aria-hidden="true">{cfg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-bold text-sm" style={{ color: cfg.textColor }}>{alert.title}</p>
            {alert.date && (
              <time className="text-[11px] text-gray-400 shrink-0">{alert.date}</time>
            )}
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
