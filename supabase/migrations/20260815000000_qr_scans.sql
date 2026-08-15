-- Tabela de leituras de QR code por linha (ponto de ônibus inteligente).
-- Guarda apenas um identificador de sessão anônimo (sem dado pessoal) e o
-- horário da leitura, para permitir estatística de uso por linha/horário.

create table if not exists qr_scans (
  id          uuid primary key default gen_random_uuid(),
  line_id     int8 not null references bus_lines(id),
  session_id  text not null,
  scanned_at  timestamptz not null default now()
);

alter table qr_scans enable row level security;

-- Qualquer visitante (chave anon) pode INSERIR uma leitura, mas não pode
-- listar/ler a tabela — evita expor quantos scans cada linha recebeu.
create policy "anon pode inserir leitura"
  on qr_scans for insert
  to anon
  with check (line_id is not null and session_id is not null);

-- Só usuários autenticados (Admin, via Supabase Auth) podem ler os dados agregados.
create policy "admin pode ler leituras"
  on qr_scans for select
  to authenticated
  using (true);
