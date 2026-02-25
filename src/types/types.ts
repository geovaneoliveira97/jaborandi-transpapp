// ─────────────────────────────────────────────
//  types.ts — Tipos centrais do JaborandiTransp
// ─────────────────────────────────────────────

/** Status operacional de uma linha de ônibus */
export type LineStatus = 'normal' | 'delay' | 'suspended'

/** Uma entrada da tabela de horários (uma viagem) */
export interface ScheduleRow {
  de: string        // horário de partida da origem   ex: "06:00"
  colina: string | null  // horário em Colina — null se não parar
  ate: string       // horário de chegada ao destino  ex: "07:30"
}

/**
 * Horários detalhados agrupados por período.
 * ex: { "Seg–Sex": [...], "Sáb/Dom": [...] }
 */
export type ScheduleDetail = Record<string, ScheduleRow[]>

/**
 * Lista de períodos disponíveis (usada nos botões).
 * ex: { "Seg–Sex": "Seg–Sex", "Sáb/Dom": "Sáb/Dom" }
 */
export type Schedules = Record<string, string>

/** Uma linha de ônibus completa, como vem do Supabase */
export interface BusLine {
  id: number
  number: string          // ex: "01"
  name: string            // ex: "Jaborandi → Barretos"
  color: string           // ex: "#2ab76a"
  status: LineStatus
  frequency: string       // ex: "Ver horários"
  stops: string[]         // ex: ["Jaborandi", "Colina", "Barretos"]
  schedules: Schedules
  schedule_detail: ScheduleDetail
}

/** Tipo de alerta */
export type AlertType = 'danger' | 'warn' | 'info'

/** Um alerta do sistema */
export interface Alert {
  id: string
  type: AlertType
  title: string
  body: string
  date: string
  lineNumber?: string    // referência lógica a BusLine.number
}

/** Views disponíveis no app */
export type AppView = 'home' | 'lines' | 'schedule' | 'about'
