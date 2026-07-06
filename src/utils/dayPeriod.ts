// src/utils/dayPeriod.ts
//
// Classifica um horário "HH:MM" em Manhã / Tarde / Noite, usado para agrupar
// visualmente a tabela de horários (ScheduleTable) sem alterar os dados ou a
// ordem/lógica de "próximo horário" já calculada em Schedule.tsx.

import { timeToMinutes } from './time'

export type DayPeriod = 'Manhã' | 'Tarde' | 'Noite'

export const DAY_PERIOD_ORDER: DayPeriod[] = ['Manhã', 'Tarde', 'Noite']

export function getDayPeriod(time: string | null | undefined): DayPeriod {
  const minutes = timeToMinutes(time) ?? 0
  if (minutes < 12 * 60) return 'Manhã'
  if (minutes < 18 * 60) return 'Tarde'
  return 'Noite'
}
