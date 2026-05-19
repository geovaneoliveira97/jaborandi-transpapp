# JaborandiTransp

Aplicativo PWA para consulta de horários intermunicipais de ônibus de Jaborandi–SP.  
Desenvolvido como Projeto Integrador — UNIVESP 2026.

## Tecnologias

- React 19 + TypeScript
- Vite 7 (build)
- Tailwind CSS 3
- Supabase (banco de dados / API / autenticação)
- PWA com Service Worker e suporte offline

## Configuração do ambiente

### 1. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env
```

| Variável | Onde encontrar |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `VITE_GA_ID` | Google Analytics → Administrador → ID de Medição |

> ⚠️ Nunca commite o arquivo `.env` com valores reais no Git.

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

## Deploy no Render

1. Crie um **Static Site** apontando para este repositório.
2. Configure:
   - **Comando de build:** `npm run build`
   - **Diretório de publicação:** `dist`
3. Em **Environment**, adicione as variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` e `VITE_GA_ID` (opcional).

> Não use arquivo `.env` no Render — defina as variáveis diretamente no painel
> **Environment** do serviço. O Vite lê as variáveis automaticamente durante o build.

## Estrutura do projeto
src/
components/   # Componentes reutilizáveis (Header, BottomNav, Cards...)
pages/        # Páginas da aplicação (Home, Lines, Schedule, Admin)
lib/          # Configuração do Supabase
types/        # Tipos TypeScript centralizados
public/
sw.js         # Service Worker (cache offline + estratégias por tipo de recurso)
manifest.json # Manifesto PWA

## Estrutura do banco de dados no Supabase

Tabela `bus_lines`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | int8 | ✅ | Identificador único da linha |
| `number` | text | ✅ | Número da linha (ex: "101") |
| `name` | text | ✅ | Trajeto (ex: "Jaborandi → Barretos") |
| `frequency` | text | ✅ | Frequência (ex: "2x ao dia") |
| `status` | text | ✅ | Estado: `normal` / `delay` / `suspended` |
| `color` | text | — | Cor hexadecimal da linha |
| `stops` | text[] | — | Lista de cidades do trajeto (incluindo parada intermediária) |
| `schedule_detail` | jsonb | — | Horários estruturados por período (Seg–Sex, Sábado, Domingo) |
| `prices` | jsonb | — | Preços por trecho (ex: `{"Jaborandi → Barretos": 12.50}`) |

### Formato de `schedule_detail`

```json
{
  "Seg–Sex": [
    { "de": "06:15", "colina": "07:00", "ate": "07:45" }
  ],
  "Sábado": [
    { "de": "08:00", "colina": null, "ate": "09:30" }
  ]
}
```

O campo `colina` representa a parada intermediária (ex: Colina-SP). Use `null` para trajetos diretos sem parada.

## Área administrativa

O app possui uma área admin acessível pela aba **Admin** na navegação inferior.  
O acesso é protegido por login via **Supabase Authentication**.

Para liberar acesso a um gestor:
1. Acesse o painel do Supabase → **Authentication → Users**
2. Clique em **Invite user** e informe o e-mail do gestor
3. O gestor recebe um e-mail e define sua senha

Funcionalidades disponíveis no painel admin:
- Editar horários por período (Seg–Sex, Sábado, Domingo)
- Editar preços das passagens por trecho
- Salvar alterações diretamente no banco de dados
