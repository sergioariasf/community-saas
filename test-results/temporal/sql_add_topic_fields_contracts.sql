-- ARCHIVO: sql_add_topic_fields_contracts.sql
-- PROPÓSITO: Agregar campos topic a tabla extracted_contracts
-- ESTADO: development
-- DEPENDENCIAS: extracted_contracts table
-- OUTPUTS: Migración de base de datos para topic fields
-- ACTUALIZADO: 2025-09-24

-- Agregar campos topic_fields a la tabla extracted_contracts
-- Basado en document-types-schema.json contratos.database_schema.topic_fields

-- Palabras clave del contrato (array de texto)
ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_keywords text[];

-- Temas booleanos específicos de contratos
ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_mantenimiento boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_jardines boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_ascensores boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_limpieza boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_emergencias boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_instalaciones boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_electricidad boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_seguridad boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_agua boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_gas boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_climatizacion boolean DEFAULT false;

ALTER TABLE extracted_contracts 
ADD COLUMN IF NOT EXISTS topic_parking boolean DEFAULT false;

-- Crear índices para optimizar consultas por temas
CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_keywords 
ON extracted_contracts USING gin(topic_keywords);

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_mantenimiento 
ON extracted_contracts (topic_mantenimiento) WHERE topic_mantenimiento = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_jardines 
ON extracted_contracts (topic_jardines) WHERE topic_jardines = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_ascensores 
ON extracted_contracts (topic_ascensores) WHERE topic_ascensores = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_limpieza 
ON extracted_contracts (topic_limpieza) WHERE topic_limpieza = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_emergencias 
ON extracted_contracts (topic_emergencias) WHERE topic_emergencias = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_instalaciones 
ON extracted_contracts (topic_instalaciones) WHERE topic_instalaciones = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_electricidad 
ON extracted_contracts (topic_electricidad) WHERE topic_electricidad = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_seguridad 
ON extracted_contracts (topic_seguridad) WHERE topic_seguridad = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_agua 
ON extracted_contracts (topic_agua) WHERE topic_agua = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_gas 
ON extracted_contracts (topic_gas) WHERE topic_gas = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_climatizacion 
ON extracted_contracts (topic_climatizacion) WHERE topic_climatizacion = true;

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_topic_parking 
ON extracted_contracts (topic_parking) WHERE topic_parking = true;

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN extracted_contracts.topic_keywords IS 'Palabras clave del contrato';
COMMENT ON COLUMN extracted_contracts.topic_mantenimiento IS 'Tema sobre mantenimiento';
COMMENT ON COLUMN extracted_contracts.topic_jardines IS 'Tema sobre jardines';
COMMENT ON COLUMN extracted_contracts.topic_ascensores IS 'Tema sobre ascensores';
COMMENT ON COLUMN extracted_contracts.topic_limpieza IS 'Tema sobre limpieza';
COMMENT ON COLUMN extracted_contracts.topic_emergencias IS 'Tema sobre emergencias';
COMMENT ON COLUMN extracted_contracts.topic_instalaciones IS 'Tema sobre instalaciones';
COMMENT ON COLUMN extracted_contracts.topic_electricidad IS 'Tema sobre electricidad';
COMMENT ON COLUMN extracted_contracts.topic_seguridad IS 'Tema sobre seguridad';
COMMENT ON COLUMN extracted_contracts.topic_agua IS 'Tema sobre agua';
COMMENT ON COLUMN extracted_contracts.topic_gas IS 'Tema sobre gas';
COMMENT ON COLUMN extracted_contracts.topic_climatizacion IS 'Tema sobre climatización';
COMMENT ON COLUMN extracted_contracts.topic_parking IS 'Tema sobre parking';