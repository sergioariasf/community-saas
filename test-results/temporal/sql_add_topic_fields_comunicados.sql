-- ARCHIVO: sql_add_topic_fields_comunicados.sql
-- PROPÓSITO: Agregar campos topic a la tabla extracted_communications
-- ESTADO: production
-- DEPENDENCIAS: extracted_communications table
-- OUTPUTS: Migración de base de datos
-- ACTUALIZADO: 2025-09-24

-- Agregar campos topic_* a la tabla extracted_communications
ALTER TABLE extracted_communications
ADD COLUMN topic_presupuesto boolean DEFAULT false,
ADD COLUMN topic_mantenimiento boolean DEFAULT false,
ADD COLUMN topic_administracion boolean DEFAULT false,
ADD COLUMN topic_piscina boolean DEFAULT false,
ADD COLUMN topic_jardin boolean DEFAULT false,
ADD COLUMN topic_limpieza boolean DEFAULT false,
ADD COLUMN topic_balance boolean DEFAULT false,
ADD COLUMN topic_paqueteria boolean DEFAULT false,
ADD COLUMN topic_energia boolean DEFAULT false,
ADD COLUMN topic_normativa boolean DEFAULT false,
ADD COLUMN topic_proveedor boolean DEFAULT false,
ADD COLUMN topic_dinero boolean DEFAULT false,
ADD COLUMN topic_ascensor boolean DEFAULT false,
ADD COLUMN topic_incendios boolean DEFAULT false,
ADD COLUMN topic_porteria boolean DEFAULT false;

-- Agregar índices para mejorar el rendimiento de consultas por temas
CREATE INDEX idx_extracted_communications_topic_presupuesto ON extracted_communications (topic_presupuesto) WHERE topic_presupuesto = true;
CREATE INDEX idx_extracted_communications_topic_mantenimiento ON extracted_communications (topic_mantenimiento) WHERE topic_mantenimiento = true;
CREATE INDEX idx_extracted_communications_topic_administracion ON extracted_communications (topic_administracion) WHERE topic_administracion = true;
CREATE INDEX idx_extracted_communications_topic_piscina ON extracted_communications (topic_piscina) WHERE topic_piscina = true;
CREATE INDEX idx_extracted_communications_topic_jardin ON extracted_communications (topic_jardin) WHERE topic_jardin = true;
CREATE INDEX idx_extracted_communications_topic_limpieza ON extracted_communications (topic_limpieza) WHERE topic_limpieza = true;
CREATE INDEX idx_extracted_communications_topic_balance ON extracted_communications (topic_balance) WHERE topic_balance = true;
CREATE INDEX idx_extracted_communications_topic_paqueteria ON extracted_communications (topic_paqueteria) WHERE topic_paqueteria = true;
CREATE INDEX idx_extracted_communications_topic_energia ON extracted_communications (topic_energia) WHERE topic_energia = true;
CREATE INDEX idx_extracted_communications_topic_normativa ON extracted_communications (topic_normativa) WHERE topic_normativa = true;
CREATE INDEX idx_extracted_communications_topic_proveedor ON extracted_communications (topic_proveedor) WHERE topic_proveedor = true;
CREATE INDEX idx_extracted_communications_topic_dinero ON extracted_communications (topic_dinero) WHERE topic_dinero = true;
CREATE INDEX idx_extracted_communications_topic_ascensor ON extracted_communications (topic_ascensor) WHERE topic_ascensor = true;
CREATE INDEX idx_extracted_communications_topic_incendios ON extracted_communications (topic_incendios) WHERE topic_incendios = true;
CREATE INDEX idx_extracted_communications_topic_porteria ON extracted_communications (topic_porteria) WHERE topic_porteria = true;

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'extracted_communications' 
  AND column_name LIKE 'topic_%'
ORDER BY column_name;