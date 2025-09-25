-- Tabla para Contrato Legal
CREATE TABLE IF NOT EXISTS extracted_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  titulo_contrato text NOT NULL,
  parte_a text NOT NULL,
  parte_b text NOT NULL,
  objeto_contrato text NOT NULL,
  duracion text,
  importe_total numeric,
  fecha_inicio date,
  fecha_fin date,
  category text,
  tipo_contrato text,
  parte_a_direccion text,
  parte_a_identificacion_fiscal text,
  parte_a_representante text,
  parte_b_direccion text,
  parte_b_identificacion_fiscal text,
  parte_b_representante text,
  alcance_servicios jsonb,
  obligaciones_parte_a jsonb,
  obligaciones_parte_b jsonb,
  moneda text,
  forma_pago text,
  plazos_pago jsonb,
  confidencialidad boolean,
  legislacion_aplicable text,
  fecha_firma date,
  lugar_firma text
);

CREATE INDEX IF NOT EXISTS idx_extracted_contracts_document_id ON extracted_contracts(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_contracts_organization_id ON extracted_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_contracts_created_at ON extracted_contracts(created_at);

COMMENT ON COLUMN extracted_contracts.titulo_contrato IS 'Título del contrato';
COMMENT ON COLUMN extracted_contracts.parte_a IS 'Parte A del contrato';
COMMENT ON COLUMN extracted_contracts.parte_b IS 'Parte B del contrato';
COMMENT ON COLUMN extracted_contracts.objeto_contrato IS 'Objeto del contrato';
COMMENT ON COLUMN extracted_contracts.duracion IS 'Duración';
COMMENT ON COLUMN extracted_contracts.importe_total IS 'Importe total';
COMMENT ON COLUMN extracted_contracts.fecha_inicio IS 'Fecha de inicio';
COMMENT ON COLUMN extracted_contracts.fecha_fin IS 'Fecha de fin';
COMMENT ON COLUMN extracted_contracts.category IS 'Categoría';
COMMENT ON COLUMN extracted_contracts.tipo_contrato IS 'Tipo de contrato';
COMMENT ON COLUMN extracted_contracts.parte_a_direccion IS 'Dirección parte A';
COMMENT ON COLUMN extracted_contracts.parte_a_identificacion_fiscal IS 'CIF/NIF parte A';
COMMENT ON COLUMN extracted_contracts.parte_a_representante IS 'Representante parte A';
COMMENT ON COLUMN extracted_contracts.parte_b_direccion IS 'Dirección parte B';
COMMENT ON COLUMN extracted_contracts.parte_b_identificacion_fiscal IS 'CIF/NIF parte B';
COMMENT ON COLUMN extracted_contracts.parte_b_representante IS 'Representante parte B';
COMMENT ON COLUMN extracted_contracts.alcance_servicios IS 'Alcance de servicios';
COMMENT ON COLUMN extracted_contracts.obligaciones_parte_a IS 'Obligaciones parte A';
COMMENT ON COLUMN extracted_contracts.obligaciones_parte_b IS 'Obligaciones parte B';
COMMENT ON COLUMN extracted_contracts.moneda IS 'Moneda';
COMMENT ON COLUMN extracted_contracts.forma_pago IS 'Forma de pago';
COMMENT ON COLUMN extracted_contracts.plazos_pago IS 'Plazos de pago';
COMMENT ON COLUMN extracted_contracts.confidencialidad IS 'Confidencialidad';
COMMENT ON COLUMN extracted_contracts.legislacion_aplicable IS 'Legislación aplicable';
COMMENT ON COLUMN extracted_contracts.fecha_firma IS 'Fecha de firma';
COMMENT ON COLUMN extracted_contracts.lugar_firma IS 'Lugar de firma';

-- RLS para extracted_contracts
ALTER TABLE extracted_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extracted_contracts_organization_isolation" ON extracted_contracts
  FOR ALL USING (organization_id = get_user_organization_id());

