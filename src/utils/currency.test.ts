import { describe, it, expect } from 'vitest'
import { formatPrice } from './currency'

describe('formatPrice', () => {
  it('formata valor com centavos no padrão pt-BR', () => {
    expect(formatPrice(12.5)).toBe('12,50')
  })

  it('formata valor inteiro com duas casas decimais', () => {
    expect(formatPrice(10)).toBe('10,00')
  })

  it('arredonda para duas casas decimais', () => {
    expect(formatPrice(12.567)).toBe('12,57')
  })
})
