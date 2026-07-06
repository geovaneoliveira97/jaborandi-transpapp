import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant
  icon?:      ReactNode
  fullWidth?: boolean
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
}

export default function Button({
  variant = 'primary', icon, fullWidth, className = '', children, ...rest
}: ButtonProps) {
  return (
    <button
      className={`${VARIANT_CLASS[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
