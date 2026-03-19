// src/types/types.ts
//
// Definições de tipos TypeScript usadas em todo o projeto.
//
// Centralizar os tipos em um único arquivo garante consistência:
// se o formato dos dados do banco mudar, basta atualizar aqui
// e o TypeScript indicará todos os lugares que precisam de ajuste.

// Páginas disponíveis no app — usadas para controlar a navegação
export type AppView = 'home' | 'lines' | 'schedule' | 'about'

// Possíveis estados operacionais de uma linha de ônibus
export type LineStatus = 'normal' | 'delay' | 'suspended'

// Cor padrão aplicada às linhas que não têm cor definida no banco
export const DEFAULT_LINE_COLOR = '#2ab76a'

// Tipos de alerta para notificações e avisos ao usuário
export type AlertType = 'danger' | 'warn' | 'info'

// Representa uma linha de horário da tabela de partidas.
// 'colina' é a parada intermediária (ex: Colina-SP) — pode ser nula
// em linhas sem parada intermediária (trajeto direto).
export interface ScheduleRow {
  de:     string       // horário de partida (ex: "06:15")
  colina: string | null // horário na parada intermediária, se houver
  ate:    string       // horário de chegada no destino (ex: "07:45")
}

// Estrutura completa de uma linha de ônibus conforme armazenada no Supabase.
// Os campos opcionais (marcados com '?') podem não estar preenchidos no banco
// dependendo do nível de detalhe cadastrado para cada linha.
export interface BusLine {
  id:        number
  number:    string      // identificador visual da linha (ex: "101")
  name:      string      // descrição do trajeto (ex: "Jaborandi → Barretos")
  frequency: string      // frequência textual (ex: "2x ao dia")
  status:    LineStatus
  color?:    string      // cor hexadecimal para identidade visual da linha
  stops?:    string[]    // lista ordenada de cidades no trajeto

  // 'schedules' mantido para compatibilidade com dados legados do banco.
  // Novos cadastros devem usar 'schedule_detail', que contém horários estruturados.
  schedules?:       Record<string, string[]>
  schedule_detail?: Record<string, ScheduleRow[]>

  // Tabela de preços por trecho (ex: { "Jaborandi → Barretos": 12.50 })
  prices?: Record<string, number>
}

// Type guard: valida se um objeto desconhecido (vindo do banco) é uma BusLine válida.
//
// Por que usar type guard em vez de 'data as BusLine[]'?
// O cast forçado ('as') ignora a estrutura real dos dados e pode causar falhas
// silenciosas em produção se o banco retornar um campo com nome diferente.
// O type guard verifica os campos obrigatórios em tempo de execução,
// garantindo que apenas objetos válidos cheguem aos componentes visuais.
export function isBusLine(x: unknown): x is BusLine {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id        === 'number' &&
    typeof o.number    === 'string' &&
    typeof o.name      === 'string' &&
    typeof o.status    === 'string' &&
    typeof o.frequency === 'string'
  )
}
