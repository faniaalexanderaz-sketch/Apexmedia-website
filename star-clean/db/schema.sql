-- Tabella dei lead. Viene creata in automatico al primo invio del form (lib/db.ts);
-- questo file serve come riferimento o per crearla a mano dalla console di Vercel Postgres.
CREATE TABLE IF NOT EXISTS leads (
  id            BIGSERIAL PRIMARY KEY,
  creato_il     TIMESTAMPTZ NOT NULL DEFAULT now(),
  servizio      TEXT NOT NULL,
  comune        TEXT NOT NULL,
  mq            TEXT NOT NULL,
  nome          TEXT NOT NULL,
  telefono      TEXT NOT NULL,
  email         TEXT,
  pagina        TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  utm_term      TEXT,
  utm_content   TEXT
);
