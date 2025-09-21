-- ARCHIVO: supabase_migration_actas.sql
-- PROPÓSITO: Migración completa para sistema de agentes y extracción mejorada de actas
-- ESTADO: production
-- DEPENDENCIAS: tablas agents y extracted_minutes existentes
-- OUTPUTS: Agente acta_extractor_v2 + tabla extracted_minutes ampliada
-- ACTUALIZADO: 2025-09-16

-- ==========================================================================
-- PARTE 1: CREAR AGENTE EXTRACTOR DE ACTAS V2 EN TABLA AGENTS
-- ==========================================================================

-- Eliminar agente anterior si existe
DELETE FROM agents WHERE name IN ('acta_extractor_v2', 'minutes_extractor_v2');

-- Insertar agente mejorado para extracción completa de actas
INSERT INTO agents (
  name,
  purpose, 
  prompt_template,
  variables,
  is_active,
  created_at,
  updated_at
) VALUES (
  'acta_extractor_v2',
  'Extractor completo de metadatos de actas compatible con plantilla UI - incluye 15 temas, estructura detectada y todos los campos necesarios para búsquedas avanzadas',
  'Analiza este ACTA de junta de propietarios y extrae TODOS los metadatos en formato JSON EXACTO.

TEXTO DEL ACTA:
{document_text}

EXTRAE ESTOS METADATOS (JSON válido, sin texto adicional):

{
  "document_date": "YYYY-MM-DD",
  "tipo_reunion": "ordinaria|extraordinaria",
  "lugar": "lugar completo de la reunión",
  "comunidad_nombre": "nombre completo de la comunidad",
  "president_in": "nombre presidente entrante",
  "president_out": "nombre presidente saliente",
  "administrator": "nombre administrador",
  "summary": "resumen ejecutivo de la reunión",
  "decisions": "decisiones principales tomadas separadas por números (1. decisión 1, 2. decisión 2, etc.)",
  "orden_del_dia": ["punto 1", "punto 2", "punto 3"],
  "acuerdos": ["acuerdo 1", "acuerdo 2", "acuerdo 3"],
  "topic_keywords": ["palabra1", "palabra2", "palabra3"],
  "topic-presupuesto": true|false,
  "topic-mantenimiento": true|false,
  "topic-administracion": true|false,
  "topic-piscina": true|false,
  "topic-jardin": true|false,
  "topic-limpieza": true|false,
  "topic-balance": true|false,
  "topic-paqueteria": true|false,
  "topic-energia": true|false,
  "topic-normativa": true|false,
  "topic-proveedor": true|false,
  "topic-dinero": true|false,
  "topic-ascensor": true|false,
  "topic-incendios": true|false,
  "topic-porteria": true|false,
  "estructura_detectada": {
    "quorum_alcanzado": true|false,
    "propietarios_totales": numero,
    "capitulos": [
      {
        "numero": 1,
        "titulo": "Título capítulo",
        "pagina": 1,
        "subsecciones": [
          {"titulo": "Subsección", "pagina": 1}
        ]
      }
    ],
    "total_paginas": numero,
    "votaciones": [
      {"tema": "tema", "resultado": "aprobado|rechazado", "votos": "mayoría|unanimidad", "pagina": 1}
    ]
  }
}

REGLAS ESTRICTAS:
1. Devuelve SOLO el JSON, sin explicaciones antes ni después
2. Usa comillas dobles para todas las claves y valores string
3. Los campos topic-xxx DEBEN ser booleanos (true/false)
4. Si no encuentras un campo, usa valores por defecto apropiados
5. document_date en formato YYYY-MM-DD
6. Los arrays pueden estar vacíos [] si no hay información
7. estructura_detectada.capitulos debe reflejar la estructura real del documento
8. estructura_detectada.votaciones debe incluir todas las votaciones encontradas
9. Para topic-xxx analiza el contenido y marca true si el tema se menciona o trata
10. decisions debe ser un string con decisiones numeradas (1. decisión 1, 2. decisión 2, etc.)

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, empezando por { y terminando por }.',
  '{
    "document_text": {
      "type": "string",
      "required": true,
      "description": "Texto completo extraído del PDF del acta"
    }
  }'::jsonb,
  true,
  NOW(),
  NOW()
);

-- ==========================================================================
-- PARTE 2: AMPLIAR TABLA EXTRACTED_MINUTES CON CAMPOS NUEVOS
-- ==========================================================================

-- Añadir campos nuevos de plantilla UI
ALTER TABLE extracted_minutes 
ADD COLUMN IF NOT EXISTS document_date DATE,
ADD COLUMN IF NOT EXISTS tipo_reunion TEXT CHECK (tipo_reunion IN ('ordinaria', 'extraordinaria')),
ADD COLUMN IF NOT EXISTS lugar TEXT,
ADD COLUMN IF NOT EXISTS comunidad_nombre TEXT;

-- Añadir arrays como JSONB para mayor flexibilidad
ALTER TABLE extracted_minutes 
ADD COLUMN IF NOT EXISTS orden_del_dia JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS acuerdos JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS topic_keywords TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Añadir los 15 temas como campos booleanos para búsquedas rápidas
ALTER TABLE extracted_minutes 
ADD COLUMN IF NOT EXISTS topic_presupuesto BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_mantenimiento BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_administracion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_piscina BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_jardin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_limpieza BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_balance BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_paqueteria BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_energia BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_normativa BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_proveedor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_dinero BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_ascensor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_incendios BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS topic_porteria BOOLEAN DEFAULT false;

-- Añadir estructura compleja como JSONB
ALTER TABLE extracted_minutes 
ADD COLUMN IF NOT EXISTS estructura_detectada JSONB DEFAULT '{}'::jsonb;

-- Añadir constraint única para un solo registro por documento
DO $$ BEGIN
    ALTER TABLE extracted_minutes 
    ADD CONSTRAINT unique_minutes_per_document UNIQUE(document_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ==========================================================================
-- PARTE 3: CREAR ÍNDICES PARA BÚSQUEDAS EFICIENTES
-- ==========================================================================

-- Índices para búsquedas por administrador (muy común)
CREATE INDEX IF NOT EXISTS idx_minutes_administrator ON extracted_minutes(administrator) WHERE administrator IS NOT NULL;

-- Índices para búsquedas por tipo de reunión
CREATE INDEX IF NOT EXISTS idx_minutes_tipo_reunion ON extracted_minutes(tipo_reunion) WHERE tipo_reunion IS NOT NULL;

-- Índices para búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_minutes_document_date ON extracted_minutes(document_date) WHERE document_date IS NOT NULL;

-- Índices para búsquedas por comunidad
CREATE INDEX IF NOT EXISTS idx_minutes_comunidad_nombre ON extracted_minutes(comunidad_nombre) WHERE comunidad_nombre IS NOT NULL;

-- Índices para los temas más buscados (presupuesto, administración, piscina)
CREATE INDEX IF NOT EXISTS idx_minutes_topic_presupuesto ON extracted_minutes(topic_presupuesto) WHERE topic_presupuesto = true;
CREATE INDEX IF NOT EXISTS idx_minutes_topic_administracion ON extracted_minutes(topic_administracion) WHERE topic_administracion = true;
CREATE INDEX IF NOT EXISTS idx_minutes_topic_piscina ON extracted_minutes(topic_piscina) WHERE topic_piscina = true;

-- Índice compuesto para búsquedas por organización y fecha
CREATE INDEX IF NOT EXISTS idx_minutes_org_date ON extracted_minutes(organization_id, document_date DESC);

-- Índice para búsquedas por keywords (usando GIN para arrays)
CREATE INDEX IF NOT EXISTS idx_minutes_topic_keywords ON extracted_minutes USING GIN(topic_keywords);

-- Índice para búsquedas en estructura_detectada (usando GIN para JSONB)
CREATE INDEX IF NOT EXISTS idx_minutes_estructura_detectada ON extracted_minutes USING GIN(estructura_detectada);

-- ==========================================================================
-- PARTE 4: COMENTARIOS EN COLUMNAS PARA DOCUMENTACIÓN
-- ==========================================================================

COMMENT ON COLUMN extracted_minutes.document_date IS 'Fecha del acta extraída por IA';
COMMENT ON COLUMN extracted_minutes.tipo_reunion IS 'Tipo: ordinaria o extraordinaria';
COMMENT ON COLUMN extracted_minutes.lugar IS 'Lugar donde se celebró la reunión';
COMMENT ON COLUMN extracted_minutes.comunidad_nombre IS 'Nombre completo de la comunidad';
COMMENT ON COLUMN extracted_minutes.orden_del_dia IS 'Array JSON con puntos del orden del día';
COMMENT ON COLUMN extracted_minutes.acuerdos IS 'Array JSON con acuerdos tomados';
COMMENT ON COLUMN extracted_minutes.topic_keywords IS 'Array de palabras clave detectadas';
COMMENT ON COLUMN extracted_minutes.topic_presupuesto IS 'TRUE si se trató tema presupuesto/dinero';
COMMENT ON COLUMN extracted_minutes.topic_piscina IS 'TRUE si se trató tema piscina/agua';
COMMENT ON COLUMN extracted_minutes.topic_administracion IS 'TRUE si se trató cambio/tema administrativo';
COMMENT ON COLUMN extracted_minutes.estructura_detectada IS 'JSON con capítulos, votaciones y estructura del acta';

-- ==========================================================================
-- PARTE 5: VERIFICACIÓN FINAL
-- ==========================================================================

-- Verificar que el agente se creó correctamente
SELECT 
  name,
  purpose,
  LENGTH(prompt_template) as prompt_length,
  jsonb_pretty(variables) as variables,
  is_active,
  created_at
FROM agents 
WHERE name = 'acta_extractor_v2';

-- Verificar que las columnas se añadieron correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'extracted_minutes' 
  AND column_name IN (
    'document_date', 'tipo_reunion', 'lugar', 'comunidad_nombre',
    'orden_del_dia', 'acuerdos', 'topic_keywords',
    'topic_presupuesto', 'topic_piscina', 'topic_administracion',
    'estructura_detectada'
  )
ORDER BY ordinal_position;

-- Verificar índices creados
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'extracted_minutes' 
  AND indexname LIKE 'idx_minutes_%'
ORDER BY indexname;