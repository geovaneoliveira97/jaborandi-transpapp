// src/utils/whatsapp.ts
//
// Monta o texto de compartilhamento dos horários de uma linha via WhatsApp.
// Extraído de Schedule.tsx para reuso e testabilidade isolada.

import type { BusLine } from '../types/types'
import { sortPeriods } from './time'
import { formatPrice } from './currency'

export function buildWhatsAppText(line: BusLine): string {
  const scheduleDetail = line.schedule_detail ?? {}
  const periods = sortPeriods(Object.keys(scheduleDetail))

  const nameParts = (line.name ?? '').split(' → ')
  const origem = nameParts[0] ?? 'Origem'
  const destino = nameParts[1] ?? 'Destino'
  const paradaIntermed = (line.stops ?? []).slice(1, -1)[0] ?? null

  const lines: string[] = []
  lines.push(`🚌 *Linha ${line.number} — ${line.name}*`)
  lines.push(`Rápido do Oeste`)
  lines.push('')

  for (const period of periods) {
    const rows = scheduleDetail[period] ?? []
    if (rows.length === 0) continue
    lines.push(`📅 *${period}*`)
    for (const row of rows) {
      const meio = row.colina ? ` → ${paradaIntermed ?? 'Colina'} ${row.colina}` : ''
      lines.push(`  🕐 ${origem} ${row.de}${meio} → ${destino} ${row.ate}`)
    }
    lines.push('')
  }

  if (line.prices && Object.keys(line.prices).length > 0) {
    lines.push(`🎟️ *Passagens*`)
    for (const [trecho, valor] of Object.entries(line.prices)) {
      lines.push(`  ${trecho}: R$ ${formatPrice(valor as number)}`)
    }
    lines.push('')
  }

  lines.push(`_Compartilhado via JaborandiTransp_ 🟢`)
  return lines.join('\n')
}
