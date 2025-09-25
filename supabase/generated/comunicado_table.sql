-- Tabla para Comunicado Vecinal
CREATE TABLE IF NOT EXISTS extracted_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  fecha date NOT NULL,
  comunidad text NOT NULL,
  remitente text NOT NULL,
  resumen text NOT NULL,
  category text,
  asunto text,
  tipo_comunicado text,
  urgencia text,
  comunidad_direccion text,
  remitente_cargo text,
  destinatarios jsonb,
  fecha_limite date,
  requiere_respuesta boolean,
  accion_requerida jsonb,
  anexos jsonb,
  contacto_info jsonb
);

CREATE INDEX IF NOT EXISTS idx_extracted_communications_document_id ON extracted_communications(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_communications_organization_id ON extracted_communications(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_communications_created_at ON extracted_communications(created_at);

COMMENT ON COLUMN extracted_communications.fecha IS 'Fecha del comunicado';
COMMENT ON COLUMN extracted_communications.comunidad IS 'Nombre de la comunidad';
COMMENT ON COLUMN extracted_communications.remitente IS 'Remitente';
COMMENT ON COLUMN extracted_communications.resumen IS 'Resumen del contenido';
COMMENT ON COLUMN extracted_communications.category IS 'Categoría';
COMMENT ON COLUMN extracted_communications.asunto IS 'Asunto del comunicado';
COMMENT ON COLUMN extracted_communications.tipo_comunicado IS 'Tipo de comunicado';
COMMENT ON COLUMN extracted_communications.urgencia IS 'Nivel de urgencia';
COMMENT ON COLUMN extracted_communications.comunidad_direccion IS 'Dirección de la comunidad';
COMMENT ON COLUMN extracted_communications.remitente_cargo IS 'Cargo del remitente';
COMMENT ON COLUMN extracted_communications.destinatarios IS 'Lista de destinatarios';
COMMENT ON COLUMN extracted_communications.fecha_limite IS 'Fecha límite';
COMMENT ON COLUMN extracted_communications.requiere_respuesta IS 'Si requiere respuesta';
COMMENT ON COLUMN extracted_communications.accion_requerida IS 'Acciones requeridas';
COMMENT ON COLUMN extracted_communications.anexos IS 'Documentos anexos';
COMMENT ON COLUMN extracted_communications.contacto_info IS 'Información de contacto';

-- RLS para extracted_communications
ALTER TABLE extracted_communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extracted_communications_organization_isolation" ON extracted_communications
  FOR ALL USING (organization_id = get_user_organization_id());

