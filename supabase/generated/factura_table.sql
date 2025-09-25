-- Tabla para Factura Comercial
CREATE TABLE IF NOT EXISTS extracted_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  provider_name text NOT NULL,
  client_name text NOT NULL,
  amount numeric NOT NULL,
  invoice_date date NOT NULL,
  category text,
  invoice_number text,
  issue_date date,
  due_date date,
  subtotal numeric,
  tax_amount numeric,
  total_amount numeric,
  currency text,
  payment_method text,
  vendor_address text,
  vendor_tax_id text,
  vendor_phone text,
  vendor_email text,
  client_address text,
  client_tax_id text,
  client_phone text,
  client_email text,
  products_summary text,
  products_count integer,
  products jsonb,
  payment_terms text,
  notes text,
  bank_details text
);

CREATE INDEX IF NOT EXISTS idx_extracted_invoices_document_id ON extracted_invoices(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_organization_id ON extracted_invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_invoices_created_at ON extracted_invoices(created_at);

COMMENT ON COLUMN extracted_invoices.provider_name IS 'Nombre del proveedor';
COMMENT ON COLUMN extracted_invoices.client_name IS 'Nombre del cliente';
COMMENT ON COLUMN extracted_invoices.amount IS 'Importe total';
COMMENT ON COLUMN extracted_invoices.invoice_date IS 'Fecha de la factura';
COMMENT ON COLUMN extracted_invoices.category IS 'Categoría';
COMMENT ON COLUMN extracted_invoices.invoice_number IS 'Número de factura';
COMMENT ON COLUMN extracted_invoices.issue_date IS 'Fecha de emisión';
COMMENT ON COLUMN extracted_invoices.due_date IS 'Fecha de vencimiento';
COMMENT ON COLUMN extracted_invoices.subtotal IS 'Subtotal';
COMMENT ON COLUMN extracted_invoices.tax_amount IS 'Importe de impuestos';
COMMENT ON COLUMN extracted_invoices.total_amount IS 'Importe total final';
COMMENT ON COLUMN extracted_invoices.currency IS 'Moneda';
COMMENT ON COLUMN extracted_invoices.payment_method IS 'Método de pago';
COMMENT ON COLUMN extracted_invoices.vendor_address IS 'Dirección del vendedor';
COMMENT ON COLUMN extracted_invoices.vendor_tax_id IS 'CIF/NIF del vendedor';
COMMENT ON COLUMN extracted_invoices.vendor_phone IS 'Teléfono del vendedor';
COMMENT ON COLUMN extracted_invoices.vendor_email IS 'Email del vendedor';
COMMENT ON COLUMN extracted_invoices.client_address IS 'Dirección del cliente';
COMMENT ON COLUMN extracted_invoices.client_tax_id IS 'CIF/NIF del cliente';
COMMENT ON COLUMN extracted_invoices.client_phone IS 'Teléfono del cliente';
COMMENT ON COLUMN extracted_invoices.client_email IS 'Email del cliente';
COMMENT ON COLUMN extracted_invoices.products_summary IS 'Resumen de productos';
COMMENT ON COLUMN extracted_invoices.products_count IS 'Cantidad de productos';
COMMENT ON COLUMN extracted_invoices.products IS 'Array de productos detallado';
COMMENT ON COLUMN extracted_invoices.payment_terms IS 'Condiciones de pago';
COMMENT ON COLUMN extracted_invoices.notes IS 'Observaciones o notas adicionales';
COMMENT ON COLUMN extracted_invoices.bank_details IS 'Datos bancarios';

-- RLS para extracted_invoices
ALTER TABLE extracted_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extracted_invoices_organization_isolation" ON extracted_invoices
  FOR ALL USING (organization_id = get_user_organization_id());

