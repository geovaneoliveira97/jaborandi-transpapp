import type { ButtonHTMLAttributes } from 'react'

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

export default function Chip({ active, className = '', children, ...rest }: ChipProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`chip ${active ? 'chip-active' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
