-- Tabla para Presupuesto Comercial
CREATE TABLE IF NOT EXISTS extracted_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  numero_presupuesto text NOT NULL,
  emisor_name text NOT NULL,
  cliente_name text NOT NULL,
  fecha_emision date NOT NULL,
  fecha_validez date,
  total numeric NOT NULL,
  category text,
  titulo text,
  tipo_documento text,
  emisor_direccion text,
  emisor_telefono text,
  emisor_email text,
  emisor_identificacion_fiscal text,
  cliente_direccion text,
  cliente_identificacion_fiscal text,
  subtotal numeric,
  impuestos numeric,
  porcentaje_impuestos numeric,
  moneda text,
  descripcion_servicios jsonb,
  cantidades jsonb,
  precios_unitarios jsonb,
  importes_totales jsonb,
  descripciones_detalladas jsonb,
  condiciones_pago text,
  plazos_entrega text,
  pago_inicial_requerido boolean,
  notas_adicionales text,
  garantia text
);

CREATE INDEX IF NOT EXISTS idx_extracted_budgets_document_id ON extracted_budgets(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_budgets_organization_id ON extracted_budgets(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_budgets_created_at ON extracted_budgets(created_at);

COMMENT ON COLUMN extracted_budgets.numero_presupuesto IS 'Número del presupuesto';
COMMENT ON COLUMN extracted_budgets.emisor_name IS 'Nombre del emisor';
COMMENT ON COLUMN extracted_budgets.cliente_name IS 'Nombre del cliente';
COMMENT ON COLUMN extracted_budgets.fecha_emision IS 'Fecha de emisión';
COMMENT ON COLUMN extracted_budgets.fecha_validez IS 'Fecha de validez';
COMMENT ON COLUMN extracted_budgets.total IS 'Importe total';
COMMENT ON COLUMN extracted_budgets.category IS 'Categoría';
COMMENT ON COLUMN extracted_budgets.titulo IS 'Título del presupuesto';
COMMENT ON COLUMN extracted_budgets.tipo_documento IS 'Tipo de documento';
COMMENT ON COLUMN extracted_budgets.emisor_direccion IS 'Dirección del emisor';
COMMENT ON COLUMN extracted_budgets.emisor_telefono IS 'Teléfono del emisor';
COMMENT ON COLUMN extracted_budgets.emisor_email IS 'Email del emisor';
COMMENT ON COLUMN extracted_budgets.emisor_identificacion_fiscal IS 'CIF/NIF del emisor';
COMMENT ON COLUMN extracted_budgets.cliente_direccion IS 'Dirección del cliente';
COMMENT ON COLUMN extracted_budgets.cliente_identificacion_fiscal IS 'CIF/NIF del cliente';
COMMENT ON COLUMN extracted_budgets.subtotal IS 'Subtotal';
COMMENT ON COLUMN extracted_budgets.impuestos IS 'Importe de impuestos';
COMMENT ON COLUMN extracted_budgets.porcentaje_impuestos IS 'Porcentaje de impuestos';
COMMENT ON COLUMN extracted_budgets.moneda IS 'Moneda';
COMMENT ON COLUMN extracted_budgets.descripcion_servicios IS 'Descripción de servicios';
COMMENT ON COLUMN extracted_budgets.cantidades IS 'Cantidades de productos/servicios';
COMMENT ON COLUMN extracted_budgets.precios_unitarios IS 'Precios unitarios';
COMMENT ON COLUMN extracted_budgets.importes_totales IS 'Importes totales por línea';
COMMENT ON COLUMN extracted_budgets.descripciones_detalladas IS 'Descripciones detalladas';
COMMENT ON COLUMN extracted_budgets.condiciones_pago IS 'Condiciones de pago';
COMMENT ON COLUMN extracted_budgets.plazos_entrega IS 'Plazos de entrega';
COMMENT ON COLUMN extracted_budgets.pago_inicial_requerido IS 'Si requiere pago inicial';
COMMENT ON COLUMN extracted_budgets.notas_adicionales IS 'Notas adicionales';
COMMENT ON COLUMN extracted_budgets.garantia IS 'Garantía ofrecida';

-- RLS para extracted_budgets
ALTER TABLE extracted_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extracted_budgets_organization_isolation" ON extracted_budgets
  FOR ALL USING (organization_id = get_user_organization_id());

