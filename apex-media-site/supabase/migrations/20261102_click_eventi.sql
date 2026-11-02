-- Tracciamento click (WhatsApp, telefono, Prenota) dei siti clienti.
-- Nessun dato personale: niente IP, niente user agent completo, niente gclid in chiaro.
create table if not exists public.click_eventi (
  id           bigint generated always as identity primary key,
  creato_il    timestamptz not null default now(),
  sito         text not null,                                   -- es. 'essenzadoriente.it'
  azione       text not null check (azione in ('whatsapp','telefono','prenota')),
  pagina       text not null,                                   -- path, es. '/trattamenti/tuina-shiatsu.html'
  utm_source   text,
  utm_medium   text,
  gclid        boolean not null default false,                  -- solo presenza, mai il valore
  sorgente     text not null check (sorgente in ('google_ads','instagram','organico','altro')),
  dispositivo  text not null check (dispositivo in ('mobile','desktop'))
);

create index if not exists click_eventi_sito_data_idx on public.click_eventi (sito, creato_il desc);

-- Solo il server (service role) legge e scrive: nessuna policy per anon/authenticated.
alter table public.click_eventi enable row level security;

comment on table public.click_eventi is 'Click di conversione dei siti clienti Apex Media (WhatsApp, telefono, Prenota). Scritti da /api/track, letti da /admin.';
