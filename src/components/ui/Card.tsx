import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export default function Card({ interactive, className = '', children, ...rest }: CardProps) {
  return (
    <div className={`${interactive ? 'card-interactive' : 'card'} ${className}`} {...rest}>
      {children}
    </div>
  )
}
