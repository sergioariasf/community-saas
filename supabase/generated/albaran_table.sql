-- Tabla para Albarán de Entrega
CREATE TABLE IF NOT EXISTS extracted_delivery_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  emisor_name text NOT NULL,
  receptor_name text NOT NULL,
  numero_albaran text NOT NULL,
  fecha_emision date NOT NULL,
  numero_pedido text,
  category text,
  emisor_direccion text,
  emisor_telefono text,
  emisor_email text,
  receptor_direccion text,
  receptor_telefono text,
  mercancia jsonb,
  cantidad_total numeric,
  peso_total numeric,
  observaciones text,
  estado_entrega text,
  firma_receptor boolean,
  transportista text,
  vehiculo_matricula text
);

CREATE INDEX IF NOT EXISTS idx_extracted_delivery_notes_document_id ON extracted_delivery_notes(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_delivery_notes_organization_id ON extracted_delivery_notes(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_delivery_notes_created_at ON extracted_delivery_notes(created_at);

COMMENT ON COLUMN extracted_delivery_notes.emisor_name IS 'Nombre de la empresa emisora';
COMMENT ON COLUMN extracted_delivery_notes.receptor_name IS 'Nombre del cliente receptor';
COMMENT ON COLUMN extracted_delivery_notes.numero_albaran IS 'Número del albarán';
COMMENT ON COLUMN extracted_delivery_notes.fecha_emision IS 'Fecha de emisión del albarán';
COMMENT ON COLUMN extracted_delivery_notes.numero_pedido IS 'Número de pedido asociado';
COMMENT ON COLUMN extracted_delivery_notes.category IS 'Categoría del albarán';
COMMENT ON COLUMN extracted_delivery_notes.emisor_direccion IS 'Dirección del emisor';
COMMENT ON COLUMN extracted_delivery_notes.emisor_telefono IS 'Teléfono del emisor';
COMMENT ON COLUMN extracted_delivery_notes.emisor_email IS 'Email del emisor';
COMMENT ON COLUMN extracted_delivery_notes.receptor_direccion IS 'Dirección del receptor';
COMMENT ON COLUMN extracted_delivery_notes.receptor_telefono IS 'Teléfono del receptor';
COMMENT ON COLUMN extracted_delivery_notes.mercancia IS 'Lista detallada de mercancía';
COMMENT ON COLUMN extracted_delivery_notes.cantidad_total IS 'Cantidad total de items';
COMMENT ON COLUMN extracted_delivery_notes.peso_total IS 'Peso total en kg';
COMMENT ON COLUMN extracted_delivery_notes.observaciones IS 'Observaciones del albarán';
COMMENT ON COLUMN extracted_delivery_notes.estado_entrega IS 'Estado de la entrega';
COMMENT ON COLUMN extracted_delivery_notes.firma_receptor IS 'Si hay firma del receptor';
COMMENT ON COLUMN extracted_delivery_notes.transportista IS 'Empresa de transporte';
COMMENT ON COLUMN extracted_delivery_notes.vehiculo_matricula IS 'Matrícula del vehículo de entrega';

-- RLS para extracted_delivery_notes
ALTER TABLE extracted_delivery_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extracted_delivery_notes_organization_isolation" ON extracted_delivery_notes
  FOR ALL USING (organization_id = get_user_organization_id());

