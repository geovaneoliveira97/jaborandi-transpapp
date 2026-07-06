// src/theme/tokens.ts
//
// Tokens de design centrais. Espelham as cores definidas em tailwind.config.js —
// usados apenas onde Tailwind não alcança (ex: valores dinâmicos em `style={}`,
// como a cor por linha de ônibus vinda do banco).

export const colors = {
  brand:      '#159A56',
  brandLight: '#2ab76a',
  brandDark:  '#0F7A44',
  brandSoft:  'rgba(21,154,86,0.12)',

  accent:     '#2B6CE0',
  accentSoft: 'rgba(43,108,224,0.12)',

  success:    '#159A56',
  successSoft: 'rgba(21,154,86,0.12)',
  warning:    '#B36E00',
  warningSoft: 'rgba(249,153,0,0.14)',
  danger:     '#DC2626',
  dangerSoft: 'rgba(220,38,38,0.12)',

  ink:   '#12181A',
  muted: '#5B6570',
  faint: '#94A0AA',
  line:  '#E7EBEE',
  surface: '#FFFFFF',
  bg:    '#F3F6F5',
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const
