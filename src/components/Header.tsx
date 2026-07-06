import { useState, useRef, useEffect, useCallback } from 'react'
import BrandBusIcon from './icons/BrandBusIcon'

interface HeaderProps {
  title: string
  onAdminAccess: () => void
}

export default function Header({ title, onAdminAccess }: HeaderProps) {
  const [tapCount, setTapCount] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const handleLogoTap = useCallback(() => {
    setTapCount(prev => {
      const next = prev + 1
      if (timerRef.current) clearTimeout(timerRef.current)
      if (next >= 5) {
        onAdminAccess()
        return 0
      }
      timerRef.current = setTimeout(() => setTapCount(0), 3000)
      return next
    })
  }, [onAdminAccess])

  return (
    <header
      className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <button
        onClick={handleLogoTap}
        aria-label="JaborandiTransp"
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0
          bg-brand transition-transform active:scale-90"
      >
        <BrandBusIcon stroke="white" className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-brand uppercase tracking-widest leading-none">
          JaborandiTransp
        </p>
        <p className="text-[15px] font-semibold leading-snug text-ink truncate">
          {title}
        </p>
      </div>
    </header>
  )
}
