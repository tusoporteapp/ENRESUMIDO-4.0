-- ============================================================================
-- CLOUDFLARE D1 SCHEMA: ENRESUMIDO 4.0 (60,000+ AUDIOS)
-- Base de datos distribuida en el Edge con índices B-Tree y FTS5
-- ============================================================================

-- 1. Tabla Principal de Episodios
CREATE TABLE IF NOT EXISTS episodes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    raw_title TEXT,
    original_author TEXT,
    category TEXT DEFAULT 'Libros',
    description TEXT,
    duration TEXT DEFAULT '10:00',
    duration_seconds INTEGER DEFAULT 600,
    audio_url TEXT NOT NULL,
    cover_url TEXT,
    pub_date TEXT,
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Índices B-Tree para Búsquedas y Paginación Instantánea (< 2ms)
CREATE INDEX IF NOT EXISTS idx_episodes_category ON episodes(category);
CREATE INDEX IF NOT EXISTS idx_episodes_pub_date ON episodes(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_episodes_duration_seconds ON episodes(duration_seconds);
CREATE INDEX IF NOT EXISTS idx_episodes_author ON episodes(original_author);
CREATE INDEX IF NOT EXISTS idx_episodes_title ON episodes(title);

-- 3. Tabla Virtual FTS5 para Búsqueda de Texto Completo Ultra Rápida
CREATE VIRTUAL TABLE IF NOT EXISTS episodes_fts USING fts5(
    id UNINDEXED,
    title,
    original_author,
    category,
    description,
    content='episodes',
    content_rowid='rowid'
);

-- 4. Triggers para Mantener Sincronizado FTS5 con la Tabla Principal
CREATE TRIGGER IF NOT EXISTS episodes_ai AFTER INSERT ON episodes BEGIN
  INSERT INTO episodes_fts(rowid, id, title, original_author, category, description)
  VALUES (new.rowid, new.id, new.title, new.original_author, new.category, new.description);
END;

CREATE TRIGGER IF NOT EXISTS episodes_ad AFTER DELETE ON episodes BEGIN
  INSERT INTO episodes_fts(episodes_fts, rowid, id, title, original_author, category, description)
  VALUES('delete', old.rowid, old.id, old.title, old.original_author, old.category, old.description);
END;

CREATE TRIGGER IF NOT EXISTS episodes_au AFTER UPDATE ON episodes BEGIN
  INSERT INTO episodes_fts(episodes_fts, rowid, id, title, original_author, category, description)
  VALUES('delete', old.rowid, old.id, old.title, old.original_author, old.category, old.description);
  INSERT INTO episodes_fts(rowid, id, title, original_author, category, description)
  VALUES (new.rowid, new.id, new.title, new.original_author, new.category, new.description);
END;
