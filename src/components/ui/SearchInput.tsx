import type { InputHTMLAttributes } from 'react'
import { Search, X } from '../icons'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value:    string
  onChange: (value: string) => void
}

export default function SearchInput({ value, onChange, placeholder = 'Buscar...', ...rest }: SearchInputProps) {
  return (
    <div className="relative">
      <Search
        className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-faint pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-line rounded-2xl pl-11 pr-11 py-3.5 text-sm
          text-ink placeholder-faint focus:outline-none focus:border-brand focus:ring-4
          focus:ring-brand-soft transition-all duration-200"
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
            flex items-center justify-center text-faint hover:text-muted hover:bg-black/5
            transition-colors active:scale-90"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
