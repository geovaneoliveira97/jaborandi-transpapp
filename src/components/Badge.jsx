/** @param {{ status: import('../types').LineStatus }} props */
export default function Badge({ status }) {
  const config = {
    normal:    { label: 'Normal',   bg: '#2ab76a18', text: '#2ab76a' },
    delay:     { label: 'Atraso',   bg: '#ff950018', text: '#ff9500' },
    suspended: { label: 'Suspenso', bg: '#ff3b5c18', text: '#ff3b5c' },
  }
  const { label, bg, text } = config[status] ?? config.normal
  return (
    <span className="tag" style={{ backgroundColor: bg, color: text }}>
      {label}
    </span>
  )
}
