// supabase/functions/scan/index.ts
//
// Endpoint próprio (Edge Function) que registra a leitura de um QR code de
// ponto de ônibus. Recebe { line_id, session_id } e insere em 'qr_scans'
// usando a service role key — que só existe no ambiente da function, nunca
// no frontend — para não depender da policy de RLS de escrita anônima.
//
// Deploy: supabase functions deploy scan
// A function é pública por design (log de leitura de QR code, sem login) —
// verify_jwt está desligado para ela em supabase/config.toml, porque o
// preflight CORS (OPTIONS) que o navegador dispara não envia o header
// Authorization, e o gateway rejeitaria esse preflight se a verificação
// estivesse ligada.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  let body: { line_id?: unknown; session_id?: unknown }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Corpo da requisição inválido' }, 400)
  }

  const { line_id, session_id } = body

  if (typeof line_id !== 'number' || typeof session_id !== 'string' || !session_id) {
    return json({ error: 'line_id (number) e session_id (string) são obrigatórios' }, 400)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { error } = await supabase.from('qr_scans').insert({ line_id, session_id })

  if (error) return json({ error: error.message }, 500)

  return json({ ok: true }, 200)
})
