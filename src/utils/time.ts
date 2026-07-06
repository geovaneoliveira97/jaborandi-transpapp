// src/utils/time.ts
//
// Helpers de data/hora reutilizados entre a tela de Horários e os cards de linha.
// Extraídos de Schedule.tsx para evitar lógica duplicada.

export const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']

const DIACRITICS_RANGE = new RegExp(
  '[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36f) + ']', 'g'
)

export function normalize(s: string) {
  return s.normalize('NFD').replace(DIACRITICS_RANGE, '').toLowerCase()
}

export function sortPeriods(periods: string[]) {
  return [...periods].sort((a, b) => {
    const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

export function getPeriodoPorDia(periods: string[]): string {
  if (periods.length === 0) return ''
  const dia = new Date().getDay()
  if (dia === 0) return periods.find(p => normalize(p).startsWith('dom')) ?? periods[0] ?? ''
  if (dia === 6) return periods.find(p => normalize(p).startsWith('sab')) ?? periods[0] ?? ''
  return periods.find(p => normalize(p).startsWith('seg')) ?? periods[0] ?? ''
}

export function timeToMinutes(t: string | null | undefined): number | null {
  if (!t) return null
  const [h, m] = t.trim().split(':').map(Number)
  return isNaN(h) || isNaN(m) ? null : h * 60 + m
}

export function getNow() {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

// Formata minutos restantes em texto curto: "12 min", "1h 20min", "agora".
export function formatRemaining(minutes: number): string {
  if (minutes <= 0) return 'agora'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}
