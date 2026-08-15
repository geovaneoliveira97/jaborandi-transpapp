# Resumo do Projeto — JaborandiTransp

PWA para consulta de horários de ônibus intermunicipais de Jaborandi–SP. Projeto Integrador — UNIVESP 2026.

## 1. Stack

Aplicação **frontend-only** (SPA/PWA): não há servidor de API próprio — o backend é o Supabase (BaaS), consumido diretamente do browser.

| Categoria | Tecnologia | Versão |
|---|---|---|
| Linguagem | TypeScript | ^5.9.3 |
| Runtime alvo | Node (dev/build) | 20.x |
| Framework UI | React | ^19.2.0 |
| Bundler/dev server | Vite | ^7.3.1 |
| Estilo | Tailwind CSS | ^3.4.4 |
| Ícones | lucide-react | ^1.23.0 |
| Banco de dados / Backend | Supabase (Postgres + PostgREST + Auth) | via `@supabase/postgrest-js` ^2.97.0 e `@supabase/supabase-js` ^2.97.0 |
| Lint | ESLint (flat config) + plugins react-hooks/react-refresh | ^9.39.1 |
| PWA | Service Worker próprio (`public/sw.js`) + `manifest.json` | — |
| Analytics | Umami (script externo, carregado via CSP) | — |

Observação de arquitetura: `src/lib/supabase.ts` usa apenas `@supabase/postgrest-js` (cliente leve, só leitura pública) para reduzir o bundle da Home/Schedule; `src/lib/supabaseAdmin.ts` usa o `@supabase/supabase-js` completo (auth + realtime + storage) e só é carregado sob demanda (via `React.lazy`) quando o usuário acessa a área Admin.

## 2. Estrutura de pastas

```
├── index.html                 # entry HTML, meta tags, CSP, script do Umami
├── render.yaml                # config de deploy no Render (static site)
├── src/
│   ├── App.tsx                 # componente raiz: roteamento por estado, fetch das linhas
│   ├── main.tsx                # bootstrap React + registro do Service Worker
│   ├── components/             # componentes reutilizáveis (Header, BottomNav, LineCard,
│   │   │                       #   PriceCard, ScheduleTable, StopsList, UpdateBanner...)
│   │   ├── icons/               # reexport centralizado de ícones lucide-react
│   │   └── ui/                  # primitivos de UI (Button, Card, Chip, SearchInput...)
│   ├── pages/                   # Home, Lines, Schedule, Admin
│   ├── layouts/                 # AppShell (casca visual com nav/topo)
│   ├── hooks/                   # useFavorites, useNextDeparture, useCountdownTick
│   ├── lib/                     # supabase.ts (leitura pública) / supabaseAdmin.ts (auth)
│   ├── theme/                   # tokens.ts (design tokens)
│   ├── types/                   # types.ts — tipos TS centralizados + type guards
│   ├── utils/                   # color, currency, dayPeriod, time, whatsapp (helpers puros)
│   └── styles/                  # index.css (Tailwind + estilos globais/acessibilidade)
├── public/
│   ├── sw.js                    # Service Worker (cache offline, estratégias por tipo)
│   ├── manifest.json            # manifesto PWA
│   ├── icon-192.png / icon-512.png
│   └── robots.txt
└── (config) vite.config.ts, tailwind.config.js, tsconfig*.json, eslint.config.js, postcss.config.js
```

## 3. Modelos / tabelas do banco de dados

Banco: **Supabase (Postgres)**. Única tabela usada pela aplicação: **`bus_lines`**.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | int8 | sim | Identificador único da linha |
| `number` | text | sim | Número da linha (ex.: "101") |
| `name` | text | sim | Trajeto (ex.: "Jaborandi → Barretos") |
| `frequency` | text | sim | Frequência textual (ex.: "2x ao dia") |
| `status` | text | sim | `normal` \| `delay` \| `suspended` |
| `color` | text | não | Cor hexadecimal de identidade visual da linha |
| `stops` | text[] | não | Lista ordenada de cidades do trajeto |
| `schedule_detail` | jsonb | não | Horários estruturados por período (Seg–Sex / Sábado / Domingo), cada item `{ de, colina, ate }` |
| `prices` | jsonb | não | Preços por trecho, ex.: `{"Jaborandi → Barretos": 12.50}` |
| `schedules` | jsonb/text (legado) | não | Campo legado mantido só por compatibilidade; novos registros usam `schedule_detail` |

O tipo TypeScript correspondente (`BusLine`) e o type guard de runtime `isBusLine()` estão em [src/types/types.ts](src/types/types.ts). Não há migrations versionadas no repositório — o schema vive no painel do Supabase.

Autenticação de usuários admin é gerenciada pelo módulo **Supabase Auth** (tabela interna do Supabase, fora do controle da aplicação).

## 4. Rotas / endpoints

Não existe um backend de API próprio (sem Express/Fastify/Next API routes etc.). Todas as "rotas" são chamadas diretas ao **Supabase REST (PostgREST) e Auth**, feitas do client:

| Client | Método | Recurso | O que faz | Onde |
|---|---|---|---|---|
| PostgREST (`supabase` leve) | `GET` (via `.select('*')`) | `bus_lines` | Carrega todas as linhas de ônibus ao iniciar o app | [src/App.tsx](src/App.tsx) |
| Supabase JS (`supabaseAdmin`) | `POST` (via `.auth.signInWithPassword`) | Auth | Login do gestor na área Admin | [src/pages/Admin.tsx](src/pages/Admin.tsx) |
| Supabase JS (`supabaseAdmin`) | — (`.auth.getSession`) | Auth | Verifica sessão ativa ao carregar o Admin | [src/pages/Admin.tsx](src/pages/Admin.tsx) |
| Supabase JS (`supabaseAdmin`) | — (`.auth.signOut`) | Auth | Logout do gestor | [src/pages/Admin.tsx](src/pages/Admin.tsx) |
| PostgREST (`supabaseAdmin`) | `GET` (via `.select('*')`) | `bus_lines` | Recarrega linhas dentro do painel Admin | [src/pages/Admin.tsx](src/pages/Admin.tsx) |
| PostgREST (`supabaseAdmin`) | `UPDATE`/`INSERT` (via `.update()`/`.upsert()`, no fluxo de edição) | `bus_lines` | Salva alterações de horários e preços feitas pelo gestor | [src/pages/Admin.tsx](src/pages/Admin.tsx) |

**Navegação interna do SPA** (não é API, é estado de UI controlado em `App.tsx` via `AppView`): `home`, `lines`, `schedule`, `admin`.

Acesso de leitura é liberado via RLS (Row Level Security) do Supabase para a chave `anon`; escrita/edição exige sessão autenticada (Admin).

## 5. Deploy

- **Plataforma:** Render, como **Static Site** (`render.yaml`, `runtime: static`).
- **Build:** `npm run build` (Vite) → publica o diretório `dist/`.
- **Headers de segurança** aplicados via `render.yaml` a todas as rotas (`/*`): `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`.
- **Variáveis de ambiente** (definidas no painel Environment do Render, não versionadas — ver `.env.example`):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_GA_ID` (opcional)
- Não se usa arquivo `.env` em produção — o Vite injeta as variáveis no build a partir do painel do Render.

## 6. Testes automatizados

Não há testes automatizados configurados no projeto (nenhum script de teste em `package.json`, nenhum framework como Jest/Vitest/Playwright instalado, nenhum arquivo `*.test.*`/`*.spec.*` fora de `node_modules`). Existe apenas `npm run lint` (ESLint) como verificação estática.

## 7. Git e CI

- **Git:** sim, repositório Git ativo (branch atual: `branch-limpo`, branch principal: `master`).
- **CI:** não há workflow configurado (nenhum diretório `.github/workflows`). Não foi encontrada integração de CI (GitHub Actions, etc.) no repositório.

## 8. Acessibilidade já implementada

- `lang="pt-BR"` definido no `<html>` ([index.html](index.html)).
- Uso extenso de `aria-label` em botões/ícones sem texto visível (navegação inferior, busca, compartilhar, copiar, remover item, sair, logo).
- `aria-hidden="true"` em ícones puramente decorativos (lucide-react) para não poluir a leitura por leitor de tela.
- `aria-live="polite"` + `role="status"` no banner de atualização do PWA (`UpdateBanner`).
- Padrão de abas acessível (`role="tablist"` / `role="tab"` / `aria-selected`) em seletor de período (Schedule, Admin) e filtro de status (Lines).
- `role="tabpanel"` associado ao conteúdo da tabela de horários.
- `role="navigation"` + `aria-label="Navegação principal"` na barra inferior, com `aria-current="page"` indicando a aba ativa.
- `role="alert"` para mensagens de erro no Admin.
- `role="button"` + `aria-label` descritivo em cards clicáveis que não são `<button>` nativo (`LineCard`), já que contêm elementos interativos internos.
- Estado de skeleton/loading marcado com `aria-hidden="true"` (não lido como conteúdo real).
- Estilo de foco visível customizado via `:focus-visible` (contorno azul, 2px) em [src/styles/index.css](src/styles/index.css).
- Suporte a `prefers-reduced-motion: reduce`, desativando animações (`animate-enter`, `animate-pop`, `dot-pulse`, skeleton) para quem configurou essa preferência no sistema.
- Metadados PWA (`manifest.json`) com `lang`, ícones em múltiplos tamanhos e `theme-color`, favorecendo uso como app instalável em qualquer contexto de acessibilidade do SO.
