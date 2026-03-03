// src/types/types.ts
export type AppView = 'home' | 'lines' | 'schedule' | 'about'
export type LineStatus = 'normal' | 'delay' | 'suspended'

export const DEFAULT_LINE_COLOR = '#2ab76a'

export type AlertType = 'danger' | 'warn' | 'info'

export interface ScheduleRow {
  de: string
  colina: string | null
  ate: string
}

export interface BusLine {
  id: number
  number: string
  name: string
  frequency: string
  status: LineStatus
  color?: string
  stops?: string[]
  // [11] schedules mantido para compatibilidade, mas schedule_detail é a fonte primária
  schedules?: Record<string, string[]>
  schedule_detail?: Record<string, ScheduleRow[]>
  prices?: Record<string, number>
}

// [11] type guard — valida campos obrigatórios antes de usar dados do banco
// Evita cast cego 'as BusLine[]' e detecta mudanças de schema em runtime
export function isBusLine(x: unknown): x is BusLine {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id        === 'number' &&
    typeof o.number    === 'string' &&
    typeof o.name      === 'string' &&
    typeof o.status    === 'string' &&
    typeof o.frequency === 'string'
  )
}
