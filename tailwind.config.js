/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Marca / ação principal — verde (mantido: já é o ícone do PWA publicado).
        // DEFAULT escurecido para #0F7A44: o tom antigo (#159A56) reprova no
        // teste de contraste AA (4.5:1) do PageSpeed/Lighthouse quando usado
        // como texto sobre branco ou como fundo atrás de texto branco.
        brand: {
          DEFAULT: '#0F7A44',
          light:   '#2ab76a',
          dark:    '#0B5E36',
          soft:    'rgba(15,122,68,0.12)',
        },
        // Acento informativo — azul (usado em mensagens de info/atualização, nunca em ações de marca)
        accent: {
          DEFAULT: '#2B6CE0',
          soft:    'rgba(43,108,224,0.12)',
        },
        success: { DEFAULT: '#159A56', soft: 'rgba(21,154,86,0.12)' },
        warning: { DEFAULT: '#B36E00', soft: 'rgba(249,153,0,0.14)' },
        danger:  { DEFAULT: '#DC2626', soft: 'rgba(220,38,38,0.12)' },
        // Texto e superfícies — contraste AA garantido sobre branco
        ink:      '#12181A',
        muted:    '#5B6570',
        faint:    '#94A0AA',
        line:     '#E7EBEE',
        surface:  '#FFFFFF',
        bg:       '#F3F6F5',
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
      },
      boxShadow: {
        card:     '0 1px 2px rgba(16,24,32,0.04), 0 1px 1px rgba(16,24,32,0.03)',
        elevated: '0 8px 24px rgba(21,154,86,0.22)',
        nav:      '0 -1px 0 rgba(0,0,0,0.04), 0 8px 32px rgba(16,24,32,0.12)',
        popover:  '0 12px 32px rgba(16,24,32,0.14)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
}
