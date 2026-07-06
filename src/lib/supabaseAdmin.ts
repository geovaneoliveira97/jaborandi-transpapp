// src/lib/supabaseAdmin.ts
//
// Cliente Supabase completo (auth + postgrest + realtime + storage + functions),
// usado exclusivamente pelo painel Admin — que já é carregado sob demanda
// (React.lazy em App.tsx). Isso mantém os ~90 KiB de código de autenticação/
// realtime/storage fora do bundle principal: quem só consulta horários nunca
// baixa esse peso, só quem realmente abre a tela de Admin.
//
// Para leitura pública (Home/Schedule) use o cliente leve em './supabase.ts'.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabaseAdmin] Variáveis de ambiente não encontradas.\n' +
    'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env (local) ' +
    'ou no painel de variáveis do Render (produção).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
