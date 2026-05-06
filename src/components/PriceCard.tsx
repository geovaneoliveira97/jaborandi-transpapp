interface PriceCardProps {
  prices:    Record<string, number>
  lineColor: string
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)

export default function PriceCard({ prices, lineColor }: PriceCardProps) {
  const entries = Object.entries(prices)

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke={lineColor} strokeWidth={2}
          strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0"
          aria-hidden="true">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Valor das passagens
        </p>
      </div>

      {entries.map(([trecho, valor], i) => (
        <div
          key={trecho}
          className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50 last:border-0"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full border-2 shrink-0"
              aria-hidden="true"
              style={{
                borderColor: lineColor,
                backgroundColor: i === 0 ? lineColor : 'transparent',
              }}
            />
            <span className="text-sm text-gray-600">{trecho}</span>
          </div>
          <span className="text-sm font-bold text-gray-900">
            <span className="text-xs font-normal text-gray-400 mr-0.5">R$</span>
            {fmt(valor)}
          </span>
        </div>
      ))}
    </div>
  )
}
