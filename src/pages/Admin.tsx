// src/pages/Admin.tsx
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { BusLine, ScheduleRow } from '../types/types'
import { isBusLine } from '../types/types'
import type { User } from '@supabase/supabase-js'
import BrandBusIcon from '../components/icons/BrandBusIcon'
import { ChevronDown, Clock, Ticket, LogOut, Plus, Trash2 } from '../components/icons'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

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
      <Card className="p-8 w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-brand">
            <BrandBusIcon stroke="white" className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-ink">Área Admin</h2>
          <p className="text-xs text-muted">Acesso restrito ao gestor</p>
        </div>
        <div className="space-y-3">
          <input type="email" placeholder="E-mail" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-line rounded-xl px-4 py-3.5 text-sm bg-bg text-ink
              focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft transition-all" />
          <input type="password" placeholder="Senha" value={senha}
            onChange={e => setSenha(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full border border-line rounded-xl px-4 py-3.5 text-sm bg-bg text-ink
              focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft transition-all" />
        </div>
        {erro && <p className="text-xs text-danger text-center bg-danger-soft rounded-xl py-2 px-3">{erro}</p>}
        <Button onClick={handleLogin} disabled={loading} fullWidth>
          {loading ? 'Entrando…' : 'Entrar'}
        </Button>
      </Card>
    </div>
  )
}

// ─── EDITOR DE HORÁRIOS ───────────────────────────────────────────────────────
interface RowEditorProps {
  rows:     ScheduleRow[]
  onChange: (rows: ScheduleRow[]) => void
  origem:   string
  destino:  string
  parada:   string | null
}

function RowEditor({ rows, onChange, origem, destino, parada }: RowEditorProps) {
  function updateCell(i: number, field: keyof ScheduleRow, value: string) {
    onChange(rows.map((r, idx) =>
      idx === i ? { ...r, [field]: field === 'colina' && value === '' ? null : value } : r
    ))
  }

  const cellClass = (val: string) =>
    `w-full text-center border rounded-lg px-1 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 transition-all
    ${!isValidTime(val) ? 'border-danger bg-danger-soft' : 'border-line bg-white focus:ring-brand-soft focus:border-brand'}`

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-center">
        <span className="text-[10px] font-bold text-muted uppercase">{origem}</span>
        <span className="text-[10px] font-bold text-muted uppercase">{parada ?? 'Direto'}</span>
        <span className="text-[10px] font-bold text-muted uppercase">{destino}</span>
        <span />
      </div>

      {rows.length === 0 && (
        <p className="text-center text-xs text-muted py-3">Nenhum horário cadastrado.</p>
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
            aria-label="Remover horário"
            className="w-11 h-11 flex items-center justify-center rounded-lg text-muted
              hover:text-danger hover:bg-danger-soft transition-all active:scale-90">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button onClick={() => onChange([...rows, { de: '', colina: parada ? '' : null, ate: '' }])}
        className="w-full py-3 rounded-xl border-2 border-dashed border-brand/40
          text-xs font-bold text-brand hover:border-brand hover:bg-brand-soft
          transition-all active:scale-95 flex items-center justify-center gap-1.5"
        style={{ minHeight: 44 }}
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        Adicionar horário
      </button>
    </div>
  )
}

// ─── EDITOR DE PREÇOS ─────────────────────────────────────────────────────────
interface PriceEditorProps {
  prices:   Record<string, number>
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
        <span className="text-[10px] font-bold text-muted uppercase text-left">Trecho</span>
        <span className="text-[10px] font-bold text-muted uppercase">R$</span>
        <span />
      </div>

      {entries.length === 0 && (
        <p className="text-center text-xs text-muted py-3">Nenhum preço cadastrado.</p>
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
            className="border border-line rounded-lg px-3 py-2.5 text-xs bg-white
              focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition-all"
          />
          {/* Valor */}
          <input
            type="text"
            inputMode="decimal"
            defaultValue={val.toFixed(2).replace('.', ',')}
            onBlur={e => updateValor(key, e.target.value)}
            className="w-20 text-center border border-line rounded-lg px-2 py-2.5 text-xs
              font-mono bg-white focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-soft transition-all"
          />
          {/* Remover */}
          <button onClick={() => removeTrecho(key)}
            aria-label={`Remover trecho ${key}`}
            className="w-11 h-11 flex items-center justify-center rounded-lg text-muted
              hover:text-danger hover:bg-danger-soft transition-all active:scale-90">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}

      <button onClick={addTrecho}
        className="w-full py-3 rounded-xl border-2 border-dashed border-brand/40
          text-xs font-bold text-brand hover:border-brand hover:bg-brand-soft
          transition-all active:scale-95 flex items-center justify-center gap-1.5"
        style={{ minHeight: 44 }}
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        Adicionar trecho
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
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <BrandBusIcon stroke="white" className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-ink">Painel Admin</p>
            <p className="text-[10px] text-muted truncate max-w-[160px]">{user.email}</p>
          </div>
        </div>
        <button onClick={onLogout}
          aria-label="Sair da área admin"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-danger
            bg-bg hover:bg-danger-soft px-3 py-2.5 rounded-lg transition-all"
          style={{ minHeight: 44 }}
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          Sair
        </button>
      </Card>

      {/* Seletor de linha */}
      <Card className="p-4 space-y-2">
        <label className="text-xs font-bold text-muted uppercase tracking-wide">Linha</label>
        {loadingLines ? (
          <p className="text-xs text-muted py-2">Carregando linhas…</p>
        ) : (
          <div className="relative">
            <select value={selectedId ?? ''}
              onChange={e => setSelectedId(Number(e.target.value))}
              className="w-full border border-line rounded-xl pl-3 pr-10 py-3 text-sm bg-bg text-ink
                focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand-soft
                transition-all appearance-none">
              {busLines.map(l => (
                <option key={l.id} value={l.id}>{l.number} – {l.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-faint absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          </div>
        )}
      </Card>

      {/* Abas Horários / Preços */}
      {line && (
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('horarios')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              text-xs font-bold transition-colors
              ${activeTab === 'horarios' ? 'bg-brand text-white' : 'bg-white text-muted border border-line'}`}
            style={{ minHeight: 44 }}
          >
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Horários
          </button>
          <button
            onClick={() => setActiveTab('precos')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              text-xs font-bold transition-colors
              ${activeTab === 'precos' ? 'bg-brand text-white' : 'bg-white text-muted border border-line'}`}
            style={{ minHeight: 44 }}
          >
            <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
            Preços
          </button>
        </div>
      )}

      {/* Conteúdo da aba ativa */}
      {line && (
        <Card className="p-4 space-y-4">

          {activeTab === 'horarios' && (
            <>
              <p className="text-xs font-bold text-muted uppercase tracking-wide">
                Editar Horários
              </p>
              {periods.length > 0 && (
                <div className="flex gap-2" role="tablist">
                  {periods.map(p => (
                    <button key={p} role="tab" aria-selected={activePeriod === p}
                      onClick={() => setActivePeriod(p)}
                      className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors
                        ${activePeriod === p ? 'bg-brand text-white' : 'bg-bg text-muted border border-line'}`}>
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
              <p className="text-[10px] text-muted text-center">
                Formato <span className="font-mono font-bold">HH:MM</span> (ex: 06:15)
              </p>
            </>
          )}

          {activeTab === 'precos' && (
            <>
              <p className="text-xs font-bold text-muted uppercase tracking-wide">
                Editar Preços das Passagens
              </p>
              <p className="text-[11px] text-muted">
                Clique no valor para editar. Use vírgula ou ponto para centavos (ex: 12,50).
              </p>
              <PriceEditor
                prices={line.prices ?? {}}
                onChange={prices => setEditData(prev => !prev ? prev : { ...prev, prices })}
              />
            </>
          )}

          <Button onClick={handleSave} disabled={saving} fullWidth>
            {saving ? 'Salvando…' : activeTab === 'horarios' ? 'Salvar Horários' : 'Salvar Preços'}
          </Button>
        </Card>
      )}

      {/* Toast */}
      {toast && (
        <div role="alert"
          className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50
            px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-popover animate-pop
            ${toast.ok ? 'bg-brand' : 'bg-danger'}`}>
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
      <div className="w-8 h-8 rounded-full border-4 border-brand/30 border-t-brand animate-spin" />
    </div>
  )

  if (!user) return <LoginScreen onLogin={setUser} />
  return <AdminPanel user={user} onLogout={async () => { await supabase.auth.signOut(); setUser(null) }} />
}
