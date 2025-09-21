/**
 * ARCHIVO: create_ai_prompts_table.sql
 * PROPÓSITO: Crear tabla ai_prompts para gestionar prompts de IA de manera profesional
 * ESTADO: production
 * DEPENDENCIAS: Ninguna (tabla independiente)
 * OUTPUTS: Tabla ai_prompts con prompt para extracción de metadatos de ACTA
 * ACTUALIZADO: 2025-09-15
 */

-- ===============================================================================
-- MIGRACIÓN: Crear tabla ai_prompts y datos iniciales
-- ===============================================================================

-- Crear la tabla si no existe
CREATE TABLE IF NOT EXISTS ai_prompts (
  -- ===== CAMPOS PRIMARIOS =====
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- ===== IDENTIFICACIÓN =====
  name TEXT NOT NULL UNIQUE,                    -- ej: 'acta_metadata_extraction'
  description TEXT,                             -- Descripción del propósito
  category TEXT NOT NULL DEFAULT 'general',    -- ej: 'metadata', 'classification', 'summarization'
  
  -- ===== VERSIONADO =====
  version TEXT NOT NULL DEFAULT '1.0',         -- Versión del prompt
  is_active BOOLEAN DEFAULT TRUE,              -- Si está activo para uso
  
  -- ===== CONFIGURACIÓN DEL PROMPT =====
  model TEXT NOT NULL DEFAULT 'gemini-1.5-flash',  -- Modelo de IA objetivo
  template TEXT NOT NULL,                       -- Template del prompt con variables
  variables JSONB DEFAULT '{}',                 -- Variables esperadas y sus tipos
  
  -- ===== CONFIGURACIÓN DEL MODELO =====
  model_config JSONB DEFAULT '{
    "temperature": 0.1,
    "max_output_tokens": 2000,
    "top_p": 0.9,
    "top_k": 40
  }',
  
  -- ===== VALIDACIÓN Y TESTING =====
  expected_output_format TEXT,                 -- ej: 'json', 'text', 'markdown'
  validation_schema JSONB,                     -- Schema JSON para validar outputs
  test_input_sample TEXT,                      -- Ejemplo de input para testing
  test_expected_output TEXT,                   -- Output esperado para testing
  
  -- ===== MÉTRICAS DE RENDIMIENTO =====
  avg_processing_time_ms INTEGER DEFAULT 0,    -- Tiempo promedio de procesamiento
  avg_tokens_used INTEGER DEFAULT 0,           -- Tokens promedio usados
  success_rate REAL DEFAULT 0.0,               -- Tasa de éxito (0.0-1.0)
  total_executions INTEGER DEFAULT 0,          -- Total de ejecuciones
  
  -- ===== AUDIT TRAIL =====
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- ===== CONSTRAINTS =====
  CONSTRAINT valid_success_rate CHECK (success_rate >= 0.0 AND success_rate <= 1.0),
  CONSTRAINT valid_version_format CHECK (version ~ '^\\d+\\.\\d+(\\.\\d+)?$'),
  CONSTRAINT non_empty_template CHECK (LENGTH(template) > 10)
);

-- ===============================================================================
-- ÍNDICES PARA RENDIMIENTO
-- ===============================================================================

-- Índice principal para búsqueda por nombre y versión
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_prompts_name_version 
ON ai_prompts(name, version);

-- Índice para prompts activos
CREATE INDEX IF NOT EXISTS idx_ai_prompts_active 
ON ai_prompts(is_active, category, created_at DESC);

-- ===============================================================================
-- TRIGGERS PARA GESTIÓN AUTOMÁTICA
-- ===============================================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_ai_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ai_prompts_updated_at_trigger ON ai_prompts;
CREATE TRIGGER ai_prompts_updated_at_trigger
  BEFORE UPDATE ON ai_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_prompts_updated_at();

-- ===============================================================================
-- RLS (ROW LEVEL SECURITY) PARA MULTI-TENANT
-- ===============================================================================

ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Admins pueden ver y gestionar todos los prompts
CREATE POLICY "Admins can manage all prompts" ON ai_prompts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Policy: Users pueden ver prompts activos
CREATE POLICY "Users can view active prompts" ON ai_prompts
  FOR SELECT USING (
    is_active = TRUE AND
    auth.uid() IS NOT NULL
  );

-- ===============================================================================
-- DATOS INICIALES
-- ===============================================================================

-- Prompt para extracción de metadatos de ACTAS
INSERT INTO ai_prompts (
  name,
  description,
  category,
  version,
  template,
  variables,
  model_config,
  expected_output_format,
  validation_schema
) VALUES (
  'acta_metadata_extraction',
  'Extracción de metadatos estructurados de actas de junta de propietarios',
  'metadata',
  '1.0',
  'Analiza este documento de ACTA y extrae los metadatos en formato JSON EXACTO:

ARCHIVO: {{filename}}
TEXTO DEL ACTA:
{{document_text}}

EXTRAE ESTOS METADATOS (JSON válido, sin texto adicional):
{
  "fecha_documento": "fecha en formato YYYYMMDD",
  "tipo_junta": "ordinaria|extraordinaria", 
  "comunidad_nombre": "nombre completo de la comunidad",
  "direccion": "dirección del inmueble",
  "presidente_entrante": "nombre del presidente que asume",
  "presidente_saliente": "nombre del presidente que deja el cargo",
  "administrador": "nombre del administrador de fincas",
  "secretario": "nombre del secretario",
  "propietarios_asistentes": número_de_propietarios_presentes,
  "propietarios_totales": número_total_de_propietarios,
  "cuotas_asistentes": "porcentaje de participación (ej: 65.5%)",
  "quorum_alcanzado": true_o_false,
  "orden_del_dia": ["punto 1", "punto 2", "punto 3"],
  "acuerdos": ["acuerdo 1", "acuerdo 2"],
  "temas_tratados": ["tema 1", "tema 2"],
  "votaciones": [{"tema": "descripción", "resultado": "aprobado/rechazado", "votos_favor": 0, "votos_contra": 0}],
  "topic_keywords": ["mantenimiento", "presupuesto", "obras"],
  "presupuesto_mencionado": ["presupuesto 1", "presupuesto 2"],
  "gastos_aprobados": ["gasto 1", "gasto 2"], 
  "derrama_extraordinaria": ["derrama 1 si aplica"]
}

REGLAS ESTRICTAS:
1. Devuelve SOLO el JSON, sin explicaciones
2. Si no encuentras un campo, usa valor por defecto ("", 0, [], false)
3. fecha_documento en formato YYYYMMDD (ej: 20220519)
4. tipo_junta DEBE ser "ordinaria" o "extraordinaria"
5. Números como enteros, no strings
6. Arrays vacíos [] si no hay información
7. Nombres sin títulos, solo "Nombre Apellido"
8. topic_keywords máximo 10 palabras clave relevantes

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido.',
  '{
    "filename": {"type": "string", "required": true, "description": "Nombre del archivo del documento"},
    "document_text": {"type": "string", "required": true, "description": "Texto completo extraído del documento"}
  }',
  '{
    "temperature": 0.1,
    "max_output_tokens": 2000,
    "top_p": 0.9,
    "top_k": 40
  }',
  'json',
  '{
    "type": "object",
    "required": ["fecha_documento", "tipo_junta", "comunidad_nombre"],
    "properties": {
      "fecha_documento": {"type": "string", "pattern": "^\\\\d{8}$"},
      "tipo_junta": {"type": "string", "enum": ["ordinaria", "extraordinaria"]},
      "comunidad_nombre": {"type": "string", "minLength": 1},
      "propietarios_asistentes": {"type": "integer", "minimum": 0},
      "propietarios_totales": {"type": "integer", "minimum": 0},
      "quorum_alcanzado": {"type": "boolean"},
      "orden_del_dia": {"type": "array", "items": {"type": "string"}},
      "acuerdos": {"type": "array", "items": {"type": "string"}},
      "topic_keywords": {"type": "array", "items": {"type": "string"}}
    }
  }'
) ON CONFLICT (name) DO NOTHING;

-- ===============================================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ===============================================================================

COMMENT ON TABLE ai_prompts IS 'Gestión centralizada y versionada de prompts para IA con métricas de rendimiento';
COMMENT ON COLUMN ai_prompts.template IS 'Template del prompt con variables {{variable_name}} para reemplazar';
COMMENT ON COLUMN ai_prompts.variables IS 'JSON con definición de variables esperadas: {name: {type, required, description}}';