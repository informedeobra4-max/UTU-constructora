-- Ejecuta este script en el SQL Editor de tu panel de Supabase

-- Crear tabla de Gastos
CREATE TABLE gastos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('materiales', 'mano_obra', 'varios')),
  title TEXT NOT NULL,
  subtitle TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pagado', 'Pendiente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desactivar RLS por ahora para simplificar el acceso desde la app
ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;

-- Insertar datos de prueba
INSERT INTO gastos (type, title, subtitle, amount, status) VALUES 
('materiales', 'Hierro 8mm - Acindar', '05/02/2024 • Juan Pérez', 450000, 'Pagado'),
('mano_obra', 'Quincena Albañilería', '05/02/2024 • Carlos Gómez', 600000, 'Pendiente'),
('varios', 'Flete Volquete', '03/02/2024 • Juan Pérez', 10000, 'Pagado');
