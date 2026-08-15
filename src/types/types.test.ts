import { describe, it, expect } from 'vitest'
import { isBusLine } from './types'

describe('isBusLine', () => {
  it('aceita um objeto com os campos obrigatórios', () => {
    expect(isBusLine({
      id: 1,
      number: '101',
      name: 'Jaborandi → Barretos',
      status: 'normal',
      frequency: '2x ao dia',
    })).toBe(true)
  })

  it('rejeita objeto vazio', () => {
    expect(isBusLine({})).toBe(false)
  })

  it('rejeita null e valores primitivos', () => {
    expect(isBusLine(null)).toBe(false)
    expect(isBusLine(undefined)).toBe(false)
    expect(isBusLine('linha 101')).toBe(false)
    expect(isBusLine(101)).toBe(false)
  })

  it('rejeita quando falta algum campo obrigatório', () => {
    expect(isBusLine({ id: 1, number: '101', name: 'x', status: 'normal' })).toBe(false)
  })

  it('rejeita quando o tipo de um campo obrigatório está errado', () => {
    expect(isBusLine({ id: '1', number: '101', name: 'x', status: 'normal', frequency: 'y' })).toBe(false)
  })
})
