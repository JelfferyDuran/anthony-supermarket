-- Supabase Schema for Anthony's Supermarket

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  restaurant_slug TEXT NOT NULL DEFAULT 'anthonys',
  items JSONB NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  moneda TEXT DEFAULT 'USD',
  tipo_entrega TEXT NOT NULL CHECK (tipo_entrega IN ('pickup', 'delivery')),
  cliente JSONB NOT NULL,
  notas TEXT,
  estado TEXT NOT NULL DEFAULT 'recibido' CHECK (estado IN ('recibido', 'preparando', 'listo', 'completado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Menus table (optional, for caching)
CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  restaurant_slug TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_orders_restaurant ON orders(restaurant_slug);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS (Row Level Security) for public read access
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read, authenticated write
CREATE POLICY "Orders are viewable by everyone" ON orders FOR SELECT USING (true);
CREATE POLICY "Orders are insertable by everyone" ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Menus are viewable by everyone" ON menus FOR SELECT USING (true);
CREATE POLICY "Menus are insertable by authenticated users" ON menus FOR INSERT TO authenticated USING (true);

-- View for recent orders (helpful for kitchen dashboard)
CREATE OR REPLACE VIEW recent_orders_view AS
SELECT 
  id,
  restaurant_slug,
  items,
  total,
  tipo_entrega,
  cliente,
  estado,
  created_at
FROM orders
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
