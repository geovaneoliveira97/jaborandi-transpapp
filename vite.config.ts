// vite.config.ts
//
// Configuração do Vite — ferramenta de build e servidor de desenvolvimento.
//
// Este arquivo resolve um desafio específico de deploy no Render (hospedagem):
// no Render, variáveis de ambiente ficam em '/etc/secrets/.env' por questões
// de segurança da plataforma. Em desenvolvimento local, o Vite lê o '.env'
// da raiz do projeto seguindo o comportamento padrão.
//
// O 'existsSync' detecta automaticamente em qual ambiente o código está rodando
// e aponta o Vite para o local correto das variáveis, sem precisar de dois
// arquivos de configuração diferentes.

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'fs'

export default defineConfig(({ mode }) => {
  // Detecta se está no Render (produção) ou no ambiente local (desenvolvimento)
  const envDir = existsSync('/etc/secrets/.env')
    ? '/etc/secrets'   // caminho do Render em produção
    : process.cwd()    // raiz do projeto em desenvolvimento local

  const env = loadEnv(mode, envDir, '')

  return {
    plugins: [react()],
    // Injeta as variáveis de ambiente no bundle para uso com import.meta.env
    define: {
      'import.meta.env.VITE_SUPABASE_URL':      JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  }
})
