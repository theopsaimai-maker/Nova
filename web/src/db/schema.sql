-- Nova AI Assistant — PostgreSQL Schema
-- Run: psql -U nova -d nova_db -f schema.sql

-- Enable pgvector for memory/RAG embeddings
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- Users
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  settings_json JSONB NOT NULL DEFAULT '{"theme":"system","memoryEnabled":true,"historyEnabled":true}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- Conversations
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL DEFAULT 'New conversation',
  pinned     BOOLEAN NOT NULL DEFAULT FALSE,
  model      TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id     ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at  ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned      ON conversations(pinned) WHERE pinned = TRUE;

-- Full-text search on conversation titles
CREATE INDEX IF NOT EXISTS idx_conversations_title_fts
  ON conversations USING GIN (to_tsvector('english', title));

-- ─────────────────────────────────────────
-- Messages
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content          TEXT NOT NULL DEFAULT '',
  attachments_json JSONB,
  citations_json   JSONB,
  token_count      INTEGER,
  feedback         TEXT CHECK (feedback IN ('up', 'down')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at      ON messages(created_at);

-- Full-text search across message content
CREATE INDEX IF NOT EXISTS idx_messages_content_fts
  ON messages USING GIN (to_tsvector('english', content));

-- ─────────────────────────────────────────
-- Attachments
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  message_id     UUID REFERENCES messages(id) ON DELETE CASCADE,
  type           TEXT NOT NULL,          -- image | pdf | docx | txt | csv | other
  url            TEXT NOT NULL,
  mime           TEXT NOT NULL,
  size_bytes     BIGINT NOT NULL,
  extracted_text TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON attachments(message_id);

-- ─────────────────────────────────────────
-- Memory (long-term facts with embeddings)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS memories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  embedding  VECTOR(768),     -- dimension matches text-embedding-004
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
-- Vector similarity index (cosine distance)
CREATE INDEX IF NOT EXISTS idx_memories_embedding
  ON memories USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ─────────────────────────────────────────
-- Usage tracking
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usage (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_in   INTEGER NOT NULL DEFAULT 0,
  tokens_out  INTEGER NOT NULL DEFAULT 0,
  requests    INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_usage_user_date ON usage(user_id, date);

-- ─────────────────────────────────────────
-- Auto-update updated_at triggers
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
