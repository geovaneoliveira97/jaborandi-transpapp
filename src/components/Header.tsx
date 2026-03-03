import BusIcon from './BusIcon'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-5 py-4 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: 'linear-gradient(135deg, #2ab76a, #166e3c)' }}
      >
        <BusIcon stroke="white" className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-[#2ab76a] uppercase tracking-widest leading-none">
          JaborandiTransp
        </p>
        <p className="text-base font-bold leading-snug text-gray-900">
          {title}
        </p>
      </div>
    </header>
  )
}
