// src/hooks/useNextDeparture.ts
//
// Generaliza o cálculo de "próximo horário" que antes existia só dentro de
// Schedule.tsx, para que LineCard também possa mostrar próximo horário e
// tempo restante sem duplicar a lógica. Mesmo algoritmo, mesmo comportamento.

import { useMemo } from 'react'
import type { ScheduleRow } from '../types/types'
import { sortPeriods, getPeriodoPorDia, timeToMinutes, formatRemaining } from '../utils/time'
import { useCountdownTick } from './useCountdownTick'

interface UseNextDepartureResult {
  periods:          string[]
  period:           string
  detail:           ScheduleRow[]
  nextIndex:        number
  nowMinutes:       number
  minutesUntilNext: number | null
  nextLabel:        string | null
}

export function useNextDeparture(
  scheduleDetail?: Record<string, ScheduleRow[]>,
  manualPeriod?: string | null
): UseNextDepartureResult {
  const nowMinutes = useCountdownTick()

  const periods = useMemo(
    () => sortPeriods(Object.keys(scheduleDetail ?? {})),
    [scheduleDetail]
  )

  const period = manualPeriod ?? getPeriodoPorDia(periods)

  const detail = useMemo(
    () => scheduleDetail?.[period] ?? [],
    [scheduleDetail, period]
  )

  const { nextIndex, minutesUntilNext } = useMemo(() => {
    if (!detail.length) return { nextIndex: -1, minutesUntilNext: null }
    let bestIdx = -1
    let bestDist = Infinity
    detail.forEach((row, i) => {
      const t = timeToMinutes(row.de)
      if (t === null) return
      const dist = (t - nowMinutes + 1440) % 1440
      if (dist < bestDist) { bestDist = dist; bestIdx = i }
    })
    if (bestDist > 1380) return { nextIndex: -1, minutesUntilNext: null }
    return { nextIndex: bestIdx, minutesUntilNext: bestDist }
  }, [detail, nowMinutes])

  const nextLabel = minutesUntilNext === null ? null : formatRemaining(minutesUntilNext)

  return { periods, period, detail, nextIndex, nowMinutes, minutesUntilNext, nextLabel }
}
