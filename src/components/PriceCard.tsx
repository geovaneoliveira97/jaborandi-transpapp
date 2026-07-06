import { Ticket } from './icons'
import Card from './ui/Card'
import SectionLabel from './ui/SectionLabel'
import { formatPrice } from '../utils/currency'

interface PriceCardProps {
  prices:    Record<string, number>
  lineColor: string
}

export default function PriceCard({ prices, lineColor }: PriceCardProps) {
  const entries = Object.entries(prices)

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-3 border-b border-line">
        <SectionLabel icon={<Ticket className="w-4 h-4 shrink-0" style={{ color: lineColor }} aria-hidden="true" />}>
          Valor das passagens
        </SectionLabel>
      </div>

      {entries.map(([trecho, valor], i) => (
        <div
          key={trecho}
          className="flex items-center justify-between px-4 py-3.5 border-b border-line last:border-0"
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
            <span className="text-sm text-muted">{trecho}</span>
          </div>
          <span className="text-sm font-bold text-ink">
            <span className="text-xs font-normal text-faint mr-0.5">R$</span>
            {formatPrice(valor)}
          </span>
        </div>
      ))}
    </Card>
  )
}
