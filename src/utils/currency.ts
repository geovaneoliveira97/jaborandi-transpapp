// src/utils/currency.ts
//
// Formatação de moeda usada em PriceCard e no texto de compartilhamento do WhatsApp.

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
