// src/types/types.ts
export type AppView = 'home' | 'lines' | 'schedule' | 'about'
export type LineStatus = 'normal' | 'delay' | 'suspended'

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
  schedules?: Record<string, string[]>
  schedule_detail?: Record<string, ScheduleRow[]>
}

export type AlertType = 'danger' | 'warn' | 'info'

export interface Alert {
  id: number
  title?: string
  body: string
  date?: string
  lineNumber?: number
  type: AlertType
}
