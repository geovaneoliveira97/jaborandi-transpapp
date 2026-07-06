// src/utils/color.ts
//
// `line.color` vem do banco (cadastrado por linha) e pode ser qualquer hex.
// Quando usamos essa cor como fundo atrás de texto/ícone branco (ou como cor
// de texto sobre fundo branco), não há garantia de que ela passe no
// contraste mínimo AA (4.5:1) exigido pelo WCAG — foi exatamente isso que o
// relatório do PageSpeed reportou para o verde padrão das linhas.
//
// `ensureContrastOnWhite` escurece a cor (mantendo o matiz) até garantir esse
// contraste, sem exigir que ninguém troque o valor cadastrado no Supabase.

type RGB = [number, number, number]
type HSL = [number, number, number]

const MIN_RATIO = 4.5
// Luminância relativa máxima que, contra branco (L=1), ainda garante 4.5:1:
// (1 + 0.05) / (L + 0.05) >= 4.5  =>  L <= 1.05/4.5 - 0.05
const MAX_LUMINANCE = 1.05 / MIN_RATIO - 0.05

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function toHex2(n: number): string {
  return Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')
}

function rgbToHex([r, g, b]: RGB): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`
}

function relativeLuminance([r, g, b]: RGB): number {
  const [rl, gl, bl] = [r, g, b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl
}

function rgbToHsl([r, g, b]: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0, s = 0
  const d = max - min
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1))
    switch (max) {
      case rn: h = ((gn - bn) / d) % 6; break
      case gn: h = (bn - rn) / d + 2; break
      default: h = (rn - gn) / d + 4
    }
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s, l]
}

function hslToRgb([h, s, l]: HSL): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let rgb: RGB = [0, 0, 0]
  if (h < 60) rgb = [c, x, 0]
  else if (h < 120) rgb = [x, c, 0]
  else if (h < 180) rgb = [0, c, x]
  else if (h < 240) rgb = [0, x, c]
  else if (h < 300) rgb = [x, 0, c]
  else rgb = [c, 0, x]
  return rgb.map(v => (v + m) * 255) as RGB
}

const cache = new Map<string, string>()

// Escurece `hex` (preservando matiz/saturação) até garantir contraste AA
// (>=4.5:1) contra texto/fundo branco. Cores já acessíveis voltam intactas.
export function ensureContrastOnWhite(hex: string): string {
  const cached = cache.get(hex)
  if (cached) return cached

  const rgb = hexToRgb(hex)
  if (relativeLuminance(rgb) <= MAX_LUMINANCE) {
    cache.set(hex, hex)
    return hex
  }

  let hsl = rgbToHsl(rgb)
  let current = rgb
  let guard = 0
  while (relativeLuminance(current) > MAX_LUMINANCE && hsl[2] > 0 && guard < 40) {
    hsl = [hsl[0], hsl[1], Math.max(0, hsl[2] - 0.03)]
    current = hslToRgb(hsl)
    guard++
  }

  const result = rgbToHex(current)
  cache.set(hex, result)
  return result
}
