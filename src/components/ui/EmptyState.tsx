import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon:         ReactNode
  title:        string
  description?: string
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="py-14 flex flex-col items-center gap-3 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-card">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description && <p className="text-xs text-muted mt-1">{description}</p>}
      </div>
    </div>
  )
}
