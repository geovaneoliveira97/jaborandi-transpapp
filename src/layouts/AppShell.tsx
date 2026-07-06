// src/layouts/AppShell.tsx
//
// Casca visual do app (header + conteúdo + navegação inferior). Extraída de
// App.tsx para separar layout de estado/lógica de dados — App.tsx continua
// dono de 100% do fetch/navegação, só passa a renderizar <AppShell>.

import { Suspense } from 'react'
import type { ReactNode } from 'react'
import type { AppView } from '../types/types'
import Header    from '../components/Header'
import BottomNav from '../components/BottomNav'

interface AppShellProps {
  title:         string
  onAdminAccess: () => void
  view:          AppView
  onNavigate:    (view: AppView) => void
  alertCount:    number
  banner?:       ReactNode
  children:      ReactNode
}

export default function AppShell({
  title, onAdminAccess, view, onNavigate, alertCount, banner, children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg">
      <Header title={title} onAdminAccess={onAdminAccess} />

      {banner}

      <Suspense fallback={null}>
        <main className="max-w-lg mx-auto px-4 py-5 pb-28">
          {children}
        </main>
      </Suspense>

      <BottomNav view={view} onNavigate={onNavigate} alertCount={alertCount} />
    </div>
  )
}
