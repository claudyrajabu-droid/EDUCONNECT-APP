CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  jina TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  nywila_hash TEXT NOT NULL,
  jukumu TEXT NOT NULL CHECK (jukumu IN ('admin','mwalimu','mzazi')),
  simu TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS madarasa (
  id SERIAL PRIMARY KEY,
  jina TEXT UNIQUE NOT NULL,
  created_by INTEGER REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS wanafunzi (
  id SERIAL PRIMARY KEY,
  jina TEXT NOT NULL,
  namba_usajili TEXT,
  darasa_id INTEGER REFERENCES madarasa(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS masomo (
  id SERIAL PRIMARY KEY,
  jina TEXT NOT NULL,
  kifupi TEXT,
  darasa_id INTEGER REFERENCES madarasa(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mahudhurio (
  id SERIAL PRIMARY KEY,
  mwanafunzi_id INTEGER REFERENCES wanafunzi(id) ON DELETE CASCADE,
  tarehe DATE NOT NULL DEFAULT CURRENT_DATE,
  hali TEXT NOT NULL CHECK (hali IN ('hapo','hayupo')),
  UNIQUE(mwanafunzi_id, tarehe)
);

CREATE TABLE IF NOT EXISTS matokeo (
  id SERIAL PRIMARY KEY,
  mwanafunzi_id INTEGER REFERENCES wanafunzi(id) ON DELETE CASCADE,
  somo_id INTEGER REFERENCES masomo(id) ON DELETE CASCADE,
  alama INTEGER NOT NULL,
  mtihani TEXT,
  tarehe TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ujumbe (
  id SERIAL PRIMARY KEY,
  aina TEXT,
  tuma_kwa TEXT,
  maudhui TEXT NOT NULL,
  mtumaji_id INTEGER REFERENCES users(id),
  tarehe TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS malipo (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  njia TEXT,
  namba_muamala TEXT,
  simu TEXT,
  hali TEXT NOT NULL DEFAULT 'pending' CHECK (hali IN ('pending','confirmed','rejected')),
  code TEXT UNIQUE,
  tarehe TIMESTAMP DEFAULT NOW(),
  tarehe_kuisha TIMESTAMP
);
