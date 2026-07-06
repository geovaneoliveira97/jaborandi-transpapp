import type { ReactNode } from 'react'

interface SectionLabelProps {
  children:  ReactNode
  icon?:     ReactNode
  className?: string
}

export default function SectionLabel({ children, icon, className = '' }: SectionLabelProps) {
  return (
    <p className={`text-[10px] font-semibold uppercase tracking-widest text-muted flex items-center gap-1.5 ${className}`}>
      {icon}
      {children}
    </p>
  )
}
