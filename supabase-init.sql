-- Tabla de Leads
CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  country TEXT,
  program TEXT,
  source TEXT,
  stage TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Contactos Prospector
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  country TEXT,
  city TEXT,
  region TEXT,
  email TEXT,
  phone TEXT,
  web TEXT,
  notes TEXT,
  status TEXT DEFAULT 'nuevo',
  contacted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Configuración
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Historial
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  action TEXT,
  description TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (acceso público para demo)
CREATE POLICY "Allow public read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update leads" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete leads" ON leads FOR DELETE USING (true);

CREATE POLICY "Allow public read contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update contacts" ON contacts FOR UPDATE USING (true);

CREATE POLICY "Allow public read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert settings" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update settings" ON settings FOR UPDATE USING (true);

CREATE POLICY "Allow public read activity" ON activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert activity" ON activity_log FOR INSERT WITH CHECK (true);
