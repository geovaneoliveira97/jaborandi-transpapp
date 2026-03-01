interface PriceCardProps {
  prices: Record<string, number>
  lineColor: string
}

export default function PriceCard({ prices, lineColor }: PriceCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
      <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          🎟️ &nbsp; Valor das passagens
        </p>
      </div>
      {Object.entries(prices).map(([trecho, valor], i) => (
        <div key={trecho} className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full border-2 shrink-0"
              style={{ borderColor: lineColor, backgroundColor: i === 0 ? lineColor : 'transparent' }}
            />
            <span className="text-sm text-gray-600">{trecho}</span>
          </div>
          <span className="text-sm font-black text-gray-900">
            <span className="text-xs font-semibold text-gray-400">R$ </span>
            {valor.toFixed(2).replace('.', ',')}
          </span>
        </div>
      ))}
    </div>
  )
}
