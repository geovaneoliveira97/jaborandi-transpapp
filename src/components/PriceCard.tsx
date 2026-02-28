import { useTheme } from '../context/ThemeContext'

interface PriceCardProps {
  prices: Record<string, number>
  lineColor: string
}

export default function PriceCard({ prices, lineColor }: PriceCardProps) {
  const { isDark } = useTheme()
  const card = `border rounded-2xl overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`

  return (
    <div className={card}>
      <div className={`px-4 py-2.5 border-b ${isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          🎟️ &nbsp; Valor das passagens
        </p>
      </div>
      {Object.entries(prices).map(([trecho, valor], i) => (
        <div key={trecho} className={`flex items-center justify-between px-4 py-3 border-b last:border-0 ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full border-2 shrink-0" style={{ borderColor: lineColor, backgroundColor: i === 0 ? lineColor : 'transparent' }} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{trecho}</span>
          </div>
          <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className={`text-xs font-semibold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>R$ </span>
            {valor.toFixed(2).replace('.', ',')}
          </span>
        </div>
      ))}
    </div>
  )
}