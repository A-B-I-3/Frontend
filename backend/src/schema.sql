-- Schema uses the Swahili-pattern field names established in the project spec.
-- Replace with your real column names once your actual Postgres schema is available —
-- these are placeholders that follow the jina/taaluma/elimu/sekta naming convention.

CREATE TABLE IF NOT EXISTS interviewees (
  id SERIAL PRIMARY KEY,
  jina VARCHAR(255) NOT NULL,
  namba_ya_simu VARCHAR(32) NOT NULL,
  barua_pepe VARCHAR(255) UNIQUE NOT NULL,
  barua_pepe_imethibitishwa BOOLEAN NOT NULL DEFAULT FALSE,
  kiwango_cha_elimu VARCHAR(64),
  sekta VARCHAR(128),
  taaluma VARCHAR(128),
  ujuzi TEXT[],                -- max 5 enforced in application layer
  utaalamu VARCHAR(255),
  uzoefu VARCHAR(32),          -- years-of-experience bucket, e.g. "3-5"
  hali_ya_uthibitisho VARCHAR(32) NOT NULL DEFAULT 'inasubiri', -- 'inasubiri' | 'imethibitishwa' | 'imekataliwa'
  onboarding_step SMALLINT NOT NULL DEFAULT 1, -- 1 profile, 2 education, 3 documents, 4 complete
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interviewee_documents (
  id SERIAL PRIMARY KEY,
  interviewee_id INTEGER NOT NULL REFERENCES interviewees(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  mime_type VARCHAR(128) NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interviewers (
  id SERIAL PRIMARY KEY,
  jina_la_kampuni VARCHAR(255) NOT NULL,
  barua_pepe_ya_kampuni VARCHAR(255) UNIQUE NOT NULL,
  barua_pepe_ya_kampuni_imethibitishwa BOOLEAN NOT NULL DEFAULT FALSE,
  jina VARCHAR(255),
  barua_pepe_binafsi VARCHAR(255) UNIQUE,
  barua_pepe_binafsi_imethibitishwa BOOLEAN NOT NULL DEFAULT FALSE,
  nenosiri_hash VARCHAR(255),
  subscription_plan VARCHAR(64),      -- e.g. 'monthly' | 'quarterly' | 'annual'
  subscription_started_at TIMESTAMPTZ,
  subscription_expires_at TIMESTAMPTZ,
  onboarding_step SMALLINT NOT NULL DEFAULT 1, -- 1 company, 2 personal, 3 subscription, 4 complete
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_codes (
  id SERIAL PRIMARY KEY,
  owner_type VARCHAR(32) NOT NULL,   -- 'interviewee' | 'interviewer_company' | 'interviewer_personal'
  owner_id INTEGER NOT NULL,
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts SMALLINT NOT NULL DEFAULT 0,
  consumed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  interviewer_id INTEGER NOT NULL REFERENCES interviewers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sekta VARCHAR(128) NOT NULL,
  taaluma VARCHAR(128) NOT NULL,
  kiwango_cha_elimu_kinachohitajika VARCHAR(64),
  ujuzi_unaohitajika TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  interviewee_id INTEGER NOT NULL REFERENCES interviewees(id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'inaendelea', -- 'inaendelea' | 'imekamilika'
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
