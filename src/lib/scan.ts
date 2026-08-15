// src/lib/scan.ts
//
// Gera/recupera um identificador de sessão anônimo (sem login, sem dado pessoal)
// e registra a leitura do QR code de uma linha via Edge Function própria
// ('supabase/functions/scan'), evitando registrar duas vezes a mesma linha
// na mesma sessão de navegador.

const SESSION_KEY = 'jt_session_id'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export async function logQrScan(lineId: number): Promise<void> {
  const flagKey = `jt_scanned_${lineId}`
  if (sessionStorage.getItem(flagKey)) return // já registrado nesta aba/sessão

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/functions/v1/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // A Edge Function mantém a verificação de JWT padrão do Supabase;
        // a chave anon (já pública no bundle) autentica a chamada.
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ line_id: lineId, session_id: getSessionId() }),
    })
    if (res.ok) sessionStorage.setItem(flagKey, '1')
    else if (import.meta.env.DEV) console.error('[scan] Falha ao registrar leitura:', res.status)
  } catch (err) {
    // Falha silenciosa em produção: não deve atrapalhar a experiência do
    // usuário por causa de uma falha no registro de estatística.
    if (import.meta.env.DEV) console.error('[scan] Erro ao registrar leitura:', err)
  }
}
