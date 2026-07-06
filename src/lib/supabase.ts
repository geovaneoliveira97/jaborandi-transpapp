// src/lib/supabase.ts
//
// Cliente leve para leitura pública (usado por App.tsx para buscar as linhas
// de ônibus). Usa @supabase/postgrest-js diretamente em vez do pacote
// @supabase/supabase-js completo — este último sempre inclui auth-js,
// realtime-js, storage-js e functions-js no bundle, mesmo quando não usados,
// o que era ~90 KiB de JavaScript nunca executado por quem só consulta
// horários (apontado pelo relatório do PageSpeed). Esse peso agora só é
// baixado por quem abre o painel Admin — ver './supabaseAdmin.ts'.
//
// A chave 'anon' (anônima) é pública por design do Supabase: ela permite apenas
// leitura nos dados que o banco autoriza publicamente (neste caso, as linhas de ônibus).
// Mesmo assim, mantemos os valores em variáveis de ambiente para não expor
// a URL do projeto diretamente no código-fonte versionado no GitHub.
//
// Em desenvolvimento local: crie um arquivo '.env' na raiz com as variáveis abaixo.
// Em produção (Render): as variáveis são configuradas no painel do serviço.

import { PostgrestClient } from '@supabase/postgrest-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Validação explícita: se as variáveis não estiverem configuradas, o erro é
// detectado na inicialização — não em tempo de execução com mensagens confusas.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[supabase] Variáveis de ambiente não encontradas.\n' +
    'Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env (local) ' +
    'ou no painel de variáveis do Render (produção).'
  )
}

export const supabase = new PostgrestClient(`${supabaseUrl.replace(/\/$/, '')}/rest/v1`, {
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
  fetch: (...args) => fetch(...args),
})
