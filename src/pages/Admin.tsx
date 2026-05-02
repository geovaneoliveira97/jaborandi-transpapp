// src/pages/Admin.tsx
//
// Página de Administração — permite que o gestor da empresa
// faça login e edite os horários das linhas de ônibus diretamente
// pelo app, sem precisar acessar o banco de dados manualmente.
//
// Fluxo:
//   1. Usuário vê tela de login (email + senha)
//   2. Após autenticação via Supabase Auth, vê o painel de edição
//   3. Seleciona uma linha e um período (Seg–Sex / Sábado / Domingo)
//   4. Edita os horários na tabela
//   5. Salva — o app chama supabase.update() e notifica o resultado

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { BusLine, ScheduleRow } from '../types/types'
import { isBusLine } from '../types/types'
import type { User } from '@supabase/supabase-js'

// ─── Utilitários ────────────────────────────────────────────────

// Valida o formato HH:MM (aceita string vazia para células opcionais)
function isValidTime(t: string): boolean {
  if (t === '') return true
  return /^\d{2}:\d{2}$/.test(t)
}

// ─── Sub-componente: Tela de Login ────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    setErro('')
    if (!email || !senha) { setErro('Preencha e-mail e senha.'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
    setLoading(false)
    if (error || !data.user) {
      setErro('E-mail ou senha inválidos.')
    } else {
      onLogin(data.user)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-enter">
      <div className="card p-8 w-full max-w-sm space-y-6">

        {/* Ícone de cadeado */}
        <div className="text-center space-y-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'linear-gradient(135deg, #1a2535, #2ab76a)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-gray-900">Área Admin</h2>
          <p className="text-xs text-gray-400">Acesso restrito ao gestor da empresa</p>
        </div>

        {/* Campos de login */}
        <div className="space-y-3">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-semibold text-gray-600 mb-1">
              E-mail
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
              placeholder="admin@exemplo.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#2ab76a]/40 focus:border-[#2ab76a]
                bg-gray-50 transition-all"
            />
          </div>
          <div>
            <label htmlFor="admin-senha" className="block text-xs font-semibold text-gray-600 mb-1">
              Senha
            </label>
            <input
              id="admin-senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={handleKey}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-[#2ab76a]/40 focus:border-[#2ab76a]
                bg-gray-50 transition-all"
            />
          </div>
        </div>

        {erro && (
          <p role="alert" className="text-xs text-red-500 text-center font-medium bg-red-50
            border border-red-100 rounded-xl py-2 px-3">
            {erro}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl text-sm font-bold text-white
            transition-all active:scale-95 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #2ab76a, #166e3c)' }}
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
    </div>
  )
}

// ─── Sub-componente: Editor de uma linha de horário ───────────

interface RowEditorProps {
  rows: ScheduleRow[]
  onChange: (rows: ScheduleRow[]) => void
  origem: string
  destino: string
  parada: string | null
}

function RowEditor({ rows, onChange, origem, destino, parada }: RowEditorProps) {
  function updateCell(i: number, field: keyof ScheduleRow, value: string) {
    const next = rows.map((r, idx) =>
      idx === i ? { ...r, [field]: field === 'colina' && value === '' ? null : value } : r
    )
    onChange(next)
  }

  function addRow() {
    onChange([...rows, { de: '', colina: parada ? '' : null, ate: '' }])
  }

  function removeRow(i: number) {
    onChange(rows.filter((_, idx) => idx !== i))
  }

  const cellClass = (val: string) =>
    `w-full text-center border rounded-lg px-1 py-2 text-xs font-mono
    focus:outline-none focus:ring-2 transition-all
    ${!isValidTime(val)
      ? 'border-red-400 bg-red-50 focus:ring-red-300'
      : 'border-gray-200 bg-white focus:ring-[#2ab76a]/40 focus:border-[#2ab76a]'
    }`

  return (
    <div className="space-y-3">
      {/* Cabeçalho */}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 text-center">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{origem}</span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
          {parada ?? 'Direto'}
        </span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">{destino}</span>
        <span />
      </div>

      {/* Linhas editáveis */}
      {rows.length === 0 && (
        <p className="text-center text-xs text-gray-400 py-3">
          Nenhum horário cadastrado para este período.
        </p>
      )}

      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={row.de}
            onChange={e => updateCell(i, 'de', e.target.value)}
            placeholder="HH:MM"
            aria-label={`Saída linha ${i + 1}`}
            className={cellClass(row.de)}
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={row.colina ?? ''}
            onChange={e => updateCell(i, 'colina', e.target.value)}
            placeholder={parada ? 'HH:MM' : '—'}
            disabled={!parada}
            aria-label={`Parada intermediária linha ${i + 1}`}
            className={`${cellClass(row.colina ?? '')} ${!parada ? 'opacity-40 cursor-not-allowed' : ''}`}
          />
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={row.ate}
            onChange={e => updateCell(i, 'ate', e.target.value)}
            placeholder="HH:MM"
            aria-label={`Chegada linha ${i + 1}`}
            className={cellClass(row.ate)}
          />
          <button
            onClick={() => removeRow(i)}
            aria-label={`Remover horário ${i + 1}`}
            className="w-8 h-8 flex items-center justify-center rounded-lg
              text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ))}

      <button
        onClick={addRow}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#2ab76a]/40
          text-xs font-bold text-[#2ab76a] hover:border-[#2ab76a] hover:bg-[#2ab76a]/5
          transition-all active:scale-95"
      >
        + Adicionar horário
      </button>
    </div>
  )
}

// ─── Sub-componente: Painel Admin principal ────────────────────

const PERIOD_ORDER = ['Seg–Sex', 'Sábado', 'Domingo']

function AdminPanel({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [busLines, setBusLines]       = useState<BusLine[]>([])
  const [selectedId, setSelectedId]   = useState<number | null>(null)
  const [editData, setEditData]       = useState<BusLine | null>(null)
  const [activePeriod, setActivePeriod] = useState<string>('')
  const [saving, setSaving]           = useState(false)
  const [loadingLines, setLoadingLines] = useState(true)
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null)

  // Busca as linhas ao montar
  useEffect(() => {
    supabase.from('bus_lines').select('*').then(({ data, error }) => {
      setLoadingLines(false)
      if (!error && data) {
        const lines = (data ?? []).filter(isBusLine)
        setBusLines(lines)
        if (lines.length > 0) {
          setSelectedId(lines[0].id)
        }
      }
    })
  }, [])

  // Carrega a linha selecionada no estado de edição
  useEffect(() => {
    if (selectedId === null) return
    const line = busLines.find(l => l.id === selectedId)
    if (!line) return
    // Deep clone para não mutar o estado original
    setEditData(JSON.parse(JSON.stringify(line)))
    const periods = Object.keys(line.schedule_detail ?? {})
    const ordered = periods.sort((a, b) => {
      const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
      if (ia === -1 && ib === -1) return 0
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    setActivePeriod(ordered[0] ?? '')
  }, [selectedId, busLines])

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }, [])

  async function handleSave() {
    if (!editData) return

    // Valida todos os horários antes de salvar
    const detail = editData.schedule_detail ?? {}
    for (const period of Object.keys(detail)) {
      for (const row of detail[period]) {
        if (!isValidTime(row.de) || !isValidTime(row.ate)) {
          showToast(`Horário inválido no período "${period}". Use o formato HH:MM.`, false)
          return
        }
      }
    }

    setSaving(true)
    const { error } = await supabase
      .from('bus_lines')
      .update({ schedule_detail: editData.schedule_detail })
      .eq('id', editData.id)
    setSaving(false)

    if (error) {
      showToast('Erro ao salvar. Tente novamente.', false)
    } else {
      // Atualiza o cache local
      setBusLines(prev => prev.map(l => l.id === editData.id ? { ...l, schedule_detail: editData.schedule_detail } : l))
      showToast('Horários salvos com sucesso!', true)
    }
  }

  function updatePeriodRows(rows: ScheduleRow[]) {
    if (!editData || !activePeriod) return
    setEditData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        schedule_detail: {
          ...prev.schedule_detail,
          [activePeriod]: rows,
        },
      }
    })
  }

  const line      = editData
  const periods   = line
    ? Object.keys(line.schedule_detail ?? {}).sort((a, b) => {
        const ia = PERIOD_ORDER.indexOf(a), ib = PERIOD_ORDER.indexOf(b)
        if (ia === -1 && ib === -1) return 0
        if (ia === -1) return 1
        if (ib === -1) return -1
        return ia - ib
      })
    : []
  const currentRows = (line?.schedule_detail ?? {})[activePeriod] ?? []
  const stops       = line?.stops ?? []
  const nameParts   = (line?.name ?? '').split(' → ')
  const parada      = stops.slice(1, -1)[0] ?? null

  return (
    <div className="space-y-4 animate-enter">

      {/* Cabeçalho admin */}
      <div className="card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1a2535, #2ab76a)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">Painel Admin</p>
            <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="text-xs font-semibold text-gray-400 hover:text-red-500
            bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
        >
          Sair
        </button>
      </div>

      {/* Seletor de linha */}
      <div className="card p-4 space-y-2">
        <label htmlFor="line-select" className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Linha
        </label>
        {loadingLines ? (
          <p className="text-xs text-gray-400 py-2">Carregando linhas…</p>
        ) : (
          <select
            id="line-select"
            value={selectedId ?? ''}
            onChange={e => setSelectedId(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#2ab76a]/40 focus:border-[#2ab76a]
              bg-gray-50 transition-all"
          >
            {busLines.map(l => (
              <option key={l.id} value={l.id}>{l.number} – {l.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Editor de horários */}
      {line && (
        <div className="card p-4 space-y-4">
          <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
            Editar Horários
          </p>

          {/* Abas de período */}
          {periods.length > 0 && (
            <div className="flex gap-2" role="tablist" aria-label="Período">
              {periods.map(p => (
                <button
                  key={p}
                  role="tab"
                  aria-selected={activePeriod === p}
                  onClick={() => setActivePeriod(p)}
                  className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors
                    ${activePeriod === p
                      ? 'bg-[#2ab76a] text-white'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <RowEditor
            rows={currentRows}
            onChange={updatePeriodRows}
            origem={nameParts[0] ?? 'Origem'}
            destino={nameParts[1] ?? 'Destino'}
            parada={parada}
          />

          {/* Dica de formato */}
          <p className="text-[10px] text-gray-400 text-center">
            Use o formato <span className="font-mono font-bold">HH:MM</span> (ex: 06:15). Campos em vermelho têm formato inválido.
          </p>

          {/* Botão salvar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white
              transition-all active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #2ab76a, #166e3c)' }}
          >
            {saving ? 'Salvando…' : 'Salvar Horários'}
          </button>
        </div>
      )}

      {/* Toast de feedback */}
      {toast && (
        <div
          role="alert"
          className={`fixed bottom-28 left-1/2 -translate-x-1/2 z-50
            px-5 py-3 rounded-2xl text-sm font-bold text-white shadow-lg
            animate-enter
            ${toast.ok ? 'bg-[#2ab76a]' : 'bg-red-500'}`}
        >
          {toast.ok ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal exportado ───────────────────────────

export default function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)

  // Verifica se já existe sessão ativa ao montar
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setChecking(false)
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#2ab76a]/30 border-t-[#2ab76a] animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginScreen onLogin={setUser} />
  return <AdminPanel user={user} onLogout={handleLogout} />
}
