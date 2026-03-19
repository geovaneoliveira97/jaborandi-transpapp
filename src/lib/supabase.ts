// src/lib/supabase.ts
//
// Inicializa o cliente Supabase que conecta o app ao banco de dados na nuvem.
//
// A chave 'anon' (anônima) é pública por design do Supabase: ela permite apenas
// leitura nos dados que o banco autoriza publicamente (neste caso, as linhas de ônibus).
// Mesmo assim, mantemos os valores em variáveis de ambiente para não expor
// a URL do projeto diretamente no código-fonte versionado no GitHub.
//
// Em desenvolvimento local: crie um arquivo '.env' na raiz com as variáveis abaixo.
// Em produção (Render): as variáveis são configuradas no painel do serviço.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY as string
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
