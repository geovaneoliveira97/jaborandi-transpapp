// src/types/types.ts
export type AppView = 'home' | 'lines' | 'schedule' | 'about'
export type LineStatus = 'normal' | 'delay' | 'suspended'

export interface BusLine {
  id: string
  number: string
  name: string
  frequency: string
  status: LineStatus
  color?: string
}
export interface BusLine {
  id: string
  name: string
  stops: string[]
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