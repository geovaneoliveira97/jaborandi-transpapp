import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(`Variáveis ausentes: URL=${supabaseUrl}, KEY=${supabaseAnonKey ? 'ok' : 'ausente'}`)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


































































