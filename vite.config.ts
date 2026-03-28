// vite.config.ts
//
// Configuração do Vite — ferramenta de build e servidor de desenvolvimento.
//
// Variáveis de ambiente:
//   - Em desenvolvimento local: arquivo '.env' na raiz do projeto (padrão do Vite).
//   - Em produção no Render: defina as variáveis diretamente no painel "Environment"
//     do serviço, sem usar arquivo .env. O Vite lê process.env automaticamente
//     durante o build — não é necessário nenhuma lógica de path customizado.
//
// Variáveis necessárias:
//   VITE_SUPABASE_URL       → URL do projeto Supabase
//   VITE_SUPABASE_ANON_KEY  → Chave anônima pública do Supabase
//   VITE_GA_ID              → ID do Google Analytics (ex: G-XXXXXXXXXX)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
