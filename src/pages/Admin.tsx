// src/pages/Admin.tsx
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { BusLine, ScheduleRow } from '../types/types'
import { isBusLine } from '../types/types'
import type { User } from '@supabase/supabase-js'

function isValidTime(t: string): boolean {
  if (t === '') return true
  return /^\d{2}:\d{2}$/.test(t)
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail]     = useState('')
  const [senha, setSenha]     = useState('')
  const [erro, setErro]       = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setErro('')
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setLoading(false)
    if (error || !data.user) setErro('E-mail ou senha inválidos.')
    else onLogin(data.user)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-enter">
      <div className="card p-8 w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-[#2ab76a]">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Área Admin</h2>
          <p className="text-xs text-gray-400">Acesso restrito ao gestor</p>
        </div>
        <div className="space-y-3">
          <input type="email" placeholder="E-mail" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50
              focus:outline-none focus:border-[#2ab76a] transition-colors" />
          <input type="password" placeholder="Senha" value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm bg-gray-50
              focus:outline-none focus:border-[#2ab76a] transition-colors" />
        </div>
        {erro && <p className="text-xs text-red-500 text-center bg-red-50 rounded-xl py-2 px-3">{erro}</p>}
        <button onClick={handleLogin} disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#2ab76a]
            transition-all active:scale-95 disabled:opacity-60">
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}

// ─── EDITOR DE HORÁRIOS ───────────────────────────────────────────────────────
interface RowEditorProps {
  rows: ScheduleRow[]
  onChange: (rows: ScheduleRow[]) => void
  origem: string
  destino: string
  parada: string | null
}

function RowEditor({ rows, onChange, origem, destino, parada }: RowEditorProps) {
  function updateCell(i: number, field: keyof ScheduleRow, value: string) {
    onChange(rows.map((r, idx) =>
      idx === i ? { ...r, [field]: field === 'colina' && value === '' ? null : value } : r
    ))
  }

  const cellClass = (val: string) =>
    `w-full text-center border rounded-lg px-1 py-2 text-xs font-mono focus:outline-none focus:ring-2 transition-all
    ${!isValidTime(val) ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus:ring-[#2ab76a]/40 focus:border-[#2ab76a]'}`

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase">{origem}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">{parada ?? 'Direto'}</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">{destino}</span>
        <span />
      </div>

      {rows.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-3">Nenhum horário cadastrado.</p>
      )}

      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <input type="text" inputMode="numeric" maxLength={5} value={row.de}
            onChange={e => updateCell(i, 'de', e.target.value)}
            placeholder="HH:MM" className={cellClass(row.de)} />
          <input type="text" inputMode="numeric" maxLength={5} value={row.colina ?? ''}
            onChange={e => updateCell(i, 'colina', e.target.value)}
            placeholder={parada ? 'HH:MM' : '—'} disabled={!parada}
            className={`${cellClass(row.colina ?? '')} ${!parada ? 'opacity-40 cursor-not-allowed' : ''}`} />
          <input type="text" inputMode="numeric" maxLength={5} value={row.ate}
            onChange={e => updateCell(i, 'ate', e.target.value)}
            placeholder="HH:MM" className={cellClass(row.ate)} />
          <button onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
              hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}

      <button onClick={() => onChange([...rows, { de: '', colina: parada ? '' : null, ate: '' }])}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#2ab76a]/40
          text-xs font-bold text-[#2ab76a] hover:border-[#2ab76a] hover:bg-[#2ab76a]/5
          transition-all active:scale-95">
        + Adicionar horário
      </button>
    </div>
  )
}

// ─── EDITOR DE PREÇOS ─────────────────────────────────────────────────────────
interface PriceEditorProps {
  prices: Record<string, number>
  onChange: (prices: Record<string, number>) => void
}

function PriceEditor({ prices, onChange }: PriceEditorProps) {
  const entries = Object.entries(prices)

  function updateTrecho(oldKey: string, newKey: string) {
    const next: Record<string, number> = {}
    for (const [k, v] of Object.entries(prices)) {
      next[k === oldKey ? newKey : k] = v
    }
    onChange(next)
  }

  function updateValor(key: string, raw: string) {
    const val = parseFloat(raw.replace(',', '.'))
    onChange({ ...prices, [key]: isNaN(val) ? 0 : val })
  }

  function addTrecho() {
    const novoTrecho = 'Novo trecho'
    // Evita duplicatas
    const key = prices[novoTrecho] !== undefined ? `Novo trecho ${entries.length + 1}` : novoTrecho
    onChange({ ...prices, [key]: 0 })
  }

  function removeTrecho(key: string) {
    const next = { ...prices }
    delete next[key]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-center">
        <span className="text-[10px] font-bold text-gray-400 uppercase text-left">Trecho</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase">R$</span>
        <span />
      </div>

      {entries.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-3">Nenhum preço cadastrado.</p>
      )}

      {entries.map(([key, val]) => (
        <div key={key} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
          {/* Nome do trecho */}
          <input
            type="text"
            defaultValue={key}
            onBlur={e => {
              if (e.target.value.trim() && e.target.value !== key) {
                updateTrecho(key, e.target.value.trim())
              }
            }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white
              focus:outline-none focus:border-[#2ab76a] transition-colors"
          />
          {/* Valor */}
          <input
            type="text"
            inputMode="decimal"
            defaultValue={val.toFixed(2).replace('.', ',')}
            onBlur={e => updateValor(key, e.target.value)}
            className="w-20 text-center border border-gray-200 rounded-lg px-2 py-2 text-xs
              font-mono bg-white focus:outline-none focus:border-[#2ab76a] transition-colors"
          />
          {/* Remover */}
          <button onClick={() => removeTrecho(key)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
              hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}

      <button onClick={addTrecho}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#2ab76a]/40
          text-xs font-bold text-[#2ab76a] hover:border-[#2ab76a] hover:bg-[#2ab76a]/5
          transition-all active:scale-95">
        + Adicionar trecho
      </button>
    </div>
  )
}

// ─── PAINEL ADMIN ─────────────────────────────────────────────────────────────
const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']
type AdminTab = 'horarios' | 'precos'

function AdminPanel({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [busLines, setBusLines]         = useState<BusLine[]>([])
  const [selectedId, setSelectedId]     = useState<number | null>(null)
  const [editData, setEditData]         = useState<BusLine | null>(null)
  const [activePeriod, setActivePeriod] = useState<string>('')
  const [activeTab, setActiveTab]       = useState<AdminTab>('horarios')
  const [saving, setSaving]             = useState(false)
  const [loadingLines, setLoadingLines] = useState(true)
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    supabase.from('bus_lines').select('*').then(({ data, error }) => {
      setLoadingLines(false)
      if (!error && data) {
        const lines = (data ?? []).filter(isBusLine)
        setBusLines(lines)
        if (lines.length > 0) setSelectedId(lines[0].id)
      }
    })
  }, [])

  useEffect(() => {
    if (selectedId === null) return
    const line = busLines.find(l => l.id === selectedId)
    if (!line) return
    setEditData(JSON.parse(JSON.stringify(line)))
    const periods = Object.keys(line.schedule_detail ?? {}).sort((a, b) => {
      const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return 0
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    setActivePeriod(periods[0] ?? '')
  }, [selectedId, busLines])

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }, [])

  async function handleSave() {
    if (!editData) return

    // Valida horários
    if (activeTab === 'horarios') {
      const detail = editData.schedule_detail ?? {}
      for (const period of Object.keys(detail)) {
        for (const row of detail[period]) {
          if (!isValidTime(row.de) || !isValidTime(row.ate)) {
            showToast(`Horário inválido em "${period}". Use HH:MM.`, false)
            return
          }
        }
      }
    }

    setSaving(true)

    const updatePayload = activeTab === 'horarios'
      ? { schedule_detail: editData.schedule_detail }
      : { prices: editData.prices }

    const { error } = await supabase
      .from('bus_lines')
      .update(updatePayload)
      .eq('id', editData.id)

    setSaving(false)

    if (error) {
      showToast('Erro ao salvar. Tente novamente.', false)
    } else {
      setBusLines(prev => prev.map(l => l.id === editData.id ? { ...l, ...updatePayload } : l))
      showToast(activeTab === 'horarios' ? 'Horários salvos!' : 'Preços salvos!', true)
    }
  }

  const line       = editData
  const periods    = line
    ? Object.keys(line.schedule_detail ?? {}).sort((a, b) => {
        const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
        if (ia === -1 && ib === -1) return 0; if (ia === -1) return 1; if (ib === -1) return -1
        return ia - ib
      })
    : []
  const currentRows = (line?.schedule_detail ?? {})[activePeriod] ?? []
  const stops       = line?.stops ?? []
  const nameParts   = (line?.name ?? '').split(' → ')
  const parada      = stops.slice(1, -1)[0] ?? null

  return (
    <div className="space-y-4 animate-enter">

      {/* Cabeçalho */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2ab76a] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Painel Admin</p>
            <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout}
          className="text-xs font-semibold text-gray-400 hover:text-red-500
            bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
          Sair
        </button>
      </div>

      {/* Seletor de linha */}
      <div className="card p-4 space-y-2">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Linha</label>
        {loadingLines ? (
          <p className="text-xs text-gray-400 py-2">Carregando linhas…</p>
        ) : (
          <select value={selectedId ?? ''}
            onChange={e => setSelectedId(Number(e.target.value))}
            className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50
              focus:outline-none focus:border-[#2ab76a] transition-colors">
            {busLines.map(l => (
              <option key={l.id} value={l.id}>{l.number} – {l.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Abas Horários / Preços */}
      {line && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('horarios')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-xs font-bold transition-colors
              ${activeTab === 'horarios' ? 'bg-[#2ab76a] text-white' : 'bg-white text-gray-500 border border-gray-100'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
            </svg>
            Horários
          </button>
          <button
            onClick={() => setActiveTab('precos')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-xs font-bold transition-colors
              ${activeTab === 'precos' ? 'bg-[#2ab76a] text-white' : 'bg-white text-gray-500 border border-gray-100'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            Preços
          </button>
        </div>
      )}

      {/* Conteúdo da aba ativa */}
      {line && (
        <div className="card p-4 space-y-4">

          {activeTab === 'horarios' && (
            <>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Editar Horários
              </p>
              {periods.length > 0 && (
                <div className="flex gap-2" role="tablist">
                  {periods.map(p => (
                    <button key={p} role="tab" aria-selected={activePeriod === p}
                      onClick={() => setActivePeriod(p)}
                      className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors
                        ${activePeriod === p ? 'bg-[#2ab76a] text-white' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
              <RowEditor
                rows={currentRows}
                onChange={rows => {
                  if (!activePeriod) return
                  setEditData(prev => !prev ? prev : {
                    ...prev,
                    schedule_detail: { ...prev.schedule_detail, [activePeriod]: rows },
                  })
                }}
                origem={nameParts[0] ?? 'Origem'}
                destino={nameParts[1] ?? 'Destino'}
                parada={parada}
              />
              <p className="text-[10px] text-gray-400 text-center">
                Formato <span className="font-mono font-bold">HH:MM</span> (ex: 06:15)
              </p>
            </>
          )}

          {activeTab === 'precos' && (
            <>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                Editar Preços das Passagens
              </p>
              <p className="text-[11px] text-gray-400">
                Clique no valor para editar. Use vírgula ou ponto para centavos (ex: 12,50).
              </p>
              <PriceEditor
                prices={line.prices ?? {}}
                onChange={prices => setEditData(prev => !prev ? prev : { ...prev, prices })}
              />
            </>
          )}

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-[#2ab76a]
              transition-all active:scale-95 disabled:opacity-60">
            {saving ? 'Salvando…' : activeTab === 'horarios' ? 'Salvar Horários' : 'Salvar Preços'}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div role="alert"
          className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50
            px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-lg animate-enter
            ${toast.ok ? 'bg-[#2ab76a]' : 'bg-red-500'}`}>
          {toast.ok ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export default function Admin() {
  const [user, setUser]       = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setChecking(false)
    })
  }, [])

  if (checking) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-[#2ab76a]/30 border-t-[#2ab76a] animate-spin" />
    </div>
  )

  if (!user) return <LoginScreen onLogin={setUser} />
  return <AdminPanel user={user} onLogout={async () => { await supabase.auth.signOut(); setUser(null) }} />
}
