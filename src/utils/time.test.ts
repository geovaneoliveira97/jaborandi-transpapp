import { describe, it, expect } from 'vitest'
import { timeToMinutes, formatRemaining } from './time'

describe('timeToMinutes', () => {
  it('converte HH:MM em minutos desde 00:00', () => {
    expect(timeToMinutes('06:15')).toBe(375)
  })

  it('retorna null para valores ausentes', () => {
    expect(timeToMinutes(null)).toBeNull()
    expect(timeToMinutes(undefined)).toBeNull()
    expect(timeToMinutes('')).toBeNull()
  })

  it('retorna null para texto inválido', () => {
    expect(timeToMinutes('abc')).toBeNull()
  })
})

describe('formatRemaining', () => {
  it('formata horas e minutos', () => {
    expect(formatRemaining(125)).toBe('2h 5min')
  })

  it('formata só minutos quando menor que uma hora', () => {
    expect(formatRemaining(12)).toBe('12 min')
  })

  it('formata hora cheia sem minutos', () => {
    expect(formatRemaining(120)).toBe('2h')
  })

  it('retorna "agora" quando não há tempo restante', () => {
    expect(formatRemaining(0)).toBe('agora')
    expect(formatRemaining(-5)).toBe('agora')
  })
})
