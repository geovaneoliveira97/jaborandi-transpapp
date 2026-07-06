// src/hooks/useCountdownTick.ts
//
// Relógio em minutos que se atualiza sozinho — extraído do setInterval que
// antes vivia só dentro de Schedule.tsx, para ser reutilizado por qualquer
// componente que precise saber "quantos minutos faltam" (ex: LineCard).

import { useState, useEffect } from 'react'
import { getNow } from '../utils/time'

export function useCountdownTick(intervalMs = 60_000): number {
  const [nowMinutes, setNowMinutes] = useState(getNow)

  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNow()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return nowMinutes
}
