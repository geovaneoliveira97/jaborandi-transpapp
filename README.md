# JaborandiTransp

Aplicativo PWA para consulta de horários intermunicipais de ônibus de Jaborandi–SP.  
Desenvolvido como Projeto Integrador — UNIVESP 2026.

---

## Tecnologias

- **React 19** + **TypeScript**
- **Vite 7** (build)
- **Tailwind CSS 3**
- **Supabase** (banco de dados / API)
- **PWA** com Service Worker e suporte offline

---

## Configuração do ambiente

### 1. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

| Variável               | Onde encontrar                                        |
|------------------------|-------------------------------------------------------|
| `VITE_SUPABASE_URL`    | Supabase → Project Settings → API → Project URL       |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public    |
| `VITE_GA_ID`           | Google Analytics → Administrador → ID de Medição      |

> **⚠️ Nunca commite o arquivo `.env` com valores reais no Git.**

### 2. Instalar dependências

```bash
npm install
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

### 4. Build de produção

```bash
npm run build
```

---

## Deploy no Render

1. Crie um **Static Site** apontando para o repositório.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Em **Environment**, adicione as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_GA_ID` (opcional).

> Não use arquivo `.env` no Render — defina as variáveis diretamente no painel **Environment** do serviço. O Vite lê `process.env` automaticamente durante o build.

---

## Estrutura do projeto

```
src/
  components/   # Componentes reutilizáveis (Header, BottomNav, Cards...)
  pages/        # Páginas da aplicação (Home, Lines, Schedule, About)
  lib/          # Configuração do Supabase
  types/        # Tipos TypeScript centralizados
public/
  sw.js         # Service Worker (cache offline + estratégias por tipo de recurso)
  manifest.json # Manifesto PWA
```

---

## Estrutura esperada no Supabase

Tabela `bus_lines`:

| Campo             | Tipo      | Obrigatório |
|-------------------|-----------|-------------|
| `id`              | int8      | ✅           |
| `number`          | text      | ✅           |
| `name`            | text      | ✅           |
| `frequency`       | text      | ✅           |
| `status`          | text      | ✅ (`normal`/`delay`/`suspended`) |
| `color`           | text      | —           |
| `stops`           | text[]    | —           |
| `schedule_detail` | jsonb     | —           |
| `prices`          | jsonb     | —           |
