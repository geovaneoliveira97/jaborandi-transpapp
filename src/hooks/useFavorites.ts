// src/hooks/useFavorites.ts
//
// Preferência puramente de interface (favoritar linhas), persistida no
// localStorage do dispositivo. Não é regra de negócio nem dado do Supabase —
// cada usuário guarda suas próprias favoritas localmente.

import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'jaborandi:favorite-lines'

function readStored(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    } catch { /* localStorage indisponível (ex: modo privado) — ignora */ }
  }, [favorites])

  const isFavorite = useCallback(
    (id: number) => favorites.includes(id),
    [favorites]
  )

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }, [])

  return { favorites, isFavorite, toggleFavorite }
}
