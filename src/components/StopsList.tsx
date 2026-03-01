interface StopsListProps {
  stops: string[]
  lineColor: string
}

export default function StopsList({ stops, lineColor }: StopsListProps) {
  if (stops.length === 0) return (
    <div className="border border-gray-200 rounded-2xl bg-gray-50 p-4 text-center">
      <p className="text-sm text-gray-400">Informações de trajeto não disponíveis.</p>
    </div>
  )

  return (
    <div className="border border-gray-200 rounded-2xl bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest mb-3 text-gray-400">
        Trajeto · {stops.length} paradas
      </p>
      <ol className="space-y-0">
        {stops.map((stop, i) => (
          <li key={stop} className="flex items-start gap-3">
            <div className="flex flex-col items-center shrink-0" aria-hidden="true">
              <div
                className="w-2.5 h-2.5 rounded-full border-2 mt-1"
                style={{
                  borderColor: lineColor,
                  backgroundColor: i === 0 || i === stops.length - 1 ? lineColor : 'transparent',
                }}
              />
              {i < stops.length - 1 && (
                <div className="w-0.5 h-6 mt-0.5" style={{ backgroundColor: lineColor + '40' }} />
              )}
            </div>
            <p className={`text-sm pb-3 ${
              i === 0 || i === stops.length - 1
                ? 'text-gray-900 font-semibold'
                : 'text-gray-500'
            }`}>
              {stop}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
