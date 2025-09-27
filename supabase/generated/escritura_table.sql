-- Tabla para Escritura de Compraventa
CREATE TABLE IF NOT EXISTS extracted_property_deeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  vendedor_nombre text,
  comprador_nombre text,
  direccion_inmueble text,
  precio_venta numeric,
  fecha_escritura date,
  notario_nombre text,
  referencia_catastral text,
  superficie_m2 numeric,
  category text,
  vendedor_dni text,
  vendedor_direccion text,
  vendedor_estado_civil text,
  vendedor_nacionalidad text,
  vendedor_profesion text,
  comprador_dni text,
  comprador_direccion text,
  comprador_estado_civil text,
  comprador_nacionalidad text,
  comprador_profesion text,
  tipo_inmueble text,
  superficie_util numeric,
  numero_habitaciones integer,
  numero_banos integer,
  planta text,
  orientacion text,
  descripcion_inmueble text,
  registro_propiedad text,
  tomo text,
  libro text,
  folio text,
  finca text,
  inscripcion text,
  moneda text,
  forma_pago text,
  precio_en_letras text,
  impuestos_incluidos boolean,
  gastos_a_cargo_comprador jsonb,
  gastos_a_cargo_vendedor jsonb,
  cargas_existentes jsonb,
  hipotecas_pendientes text,
  servidumbres text,
  libre_cargas boolean,
  condicion_suspensiva boolean,
  condiciones_especiales jsonb,
  clausulas_particulares jsonb,
  fecha_entrega date,
  entrega_inmediata boolean,
  estado_conservacion text,
  inventario_incluido text,
  notario_numero_colegiado text,
  notaria_direccion text,
  protocolo_numero text,
  autorizacion_notarial boolean,
  valor_catastral numeric,
  coeficiente_participacion text,
  itp_aplicable numeric,
  base_imponible_itp numeric,
  inscripcion_registro text
);

CREATE INDEX IF NOT EXISTS idx_extracted_property_deeds_document_id ON extracted_property_deeds(document_id);
CREATE INDEX IF NOT EXISTS idx_extracted_property_deeds_organization_id ON extracted_property_deeds(organization_id);
CREATE INDEX IF NOT EXISTS idx_extracted_property_deeds_created_at ON extracted_property_deeds(created_at);

COMMENT ON COLUMN extracted_property_deeds.vendedor_nombre IS 'Nombre completo del vendedor';
COMMENT ON COLUMN extracted_property_deeds.comprador_nombre IS 'Nombre completo del comprador';
COMMENT ON COLUMN extracted_property_deeds.direccion_inmueble IS 'Dirección completa del inmueble';
COMMENT ON COLUMN extracted_property_deeds.precio_venta IS 'Precio de venta';
COMMENT ON COLUMN extracted_property_deeds.fecha_escritura IS 'Fecha de la escritura';
COMMENT ON COLUMN extracted_property_deeds.notario_nombre IS 'Nombre completo del notario';
COMMENT ON COLUMN extracted_property_deeds.referencia_catastral IS 'Referencia catastral del inmueble';
COMMENT ON COLUMN extracted_property_deeds.superficie_m2 IS 'Superficie en m²';
COMMENT ON COLUMN extracted_property_deeds.category IS 'Categoría (vivienda, local, terreno, garaje, trastero, etc.)';
COMMENT ON COLUMN extracted_property_deeds.vendedor_dni IS 'DNI/NIF del vendedor';
COMMENT ON COLUMN extracted_property_deeds.vendedor_direccion IS 'Dirección del vendedor';
COMMENT ON COLUMN extracted_property_deeds.vendedor_estado_civil IS 'Estado civil del vendedor';
COMMENT ON COLUMN extracted_property_deeds.vendedor_nacionalidad IS 'Nacionalidad del vendedor';
COMMENT ON COLUMN extracted_property_deeds.vendedor_profesion IS 'Profesión del vendedor';
COMMENT ON COLUMN extracted_property_deeds.comprador_dni IS 'DNI/NIF del comprador';
COMMENT ON COLUMN extracted_property_deeds.comprador_direccion IS 'Dirección del comprador';
COMMENT ON COLUMN extracted_property_deeds.comprador_estado_civil IS 'Estado civil del comprador';
COMMENT ON COLUMN extracted_property_deeds.comprador_nacionalidad IS 'Nacionalidad del comprador';
COMMENT ON COLUMN extracted_property_deeds.comprador_profesion IS 'Profesión del comprador';
COMMENT ON COLUMN extracted_property_deeds.tipo_inmueble IS 'Tipo específico (vivienda, local, terreno, plaza_garaje, etc.)';
COMMENT ON COLUMN extracted_property_deeds.superficie_util IS 'Superficie útil en m²';
COMMENT ON COLUMN extracted_property_deeds.numero_habitaciones IS 'Número de habitaciones';
COMMENT ON COLUMN extracted_property_deeds.numero_banos IS 'Número de baños';
COMMENT ON COLUMN extracted_property_deeds.planta IS 'Planta del inmueble';
COMMENT ON COLUMN extracted_property_deeds.orientacion IS 'Orientación del inmueble';
COMMENT ON COLUMN extracted_property_deeds.descripcion_inmueble IS 'Descripción detallada del inmueble';
COMMENT ON COLUMN extracted_property_deeds.registro_propiedad IS 'Nombre del registro de la propiedad';
COMMENT ON COLUMN extracted_property_deeds.tomo IS 'Tomo registral';
COMMENT ON COLUMN extracted_property_deeds.libro IS 'Libro registral';
COMMENT ON COLUMN extracted_property_deeds.folio IS 'Folio registral';
COMMENT ON COLUMN extracted_property_deeds.finca IS 'Número de finca';
COMMENT ON COLUMN extracted_property_deeds.inscripcion IS 'Número de inscripción';
COMMENT ON COLUMN extracted_property_deeds.moneda IS 'Moneda (EUR)';
COMMENT ON COLUMN extracted_property_deeds.forma_pago IS 'Método de pago y fechas clave';
COMMENT ON COLUMN extracted_property_deeds.precio_en_letras IS 'Precio escrito en letras';
COMMENT ON COLUMN extracted_property_deeds.impuestos_incluidos IS 'Si los impuestos están incluidos';
COMMENT ON COLUMN extracted_property_deeds.gastos_a_cargo_comprador IS 'Gastos que paga el comprador';
COMMENT ON COLUMN extracted_property_deeds.gastos_a_cargo_vendedor IS 'Gastos que paga el vendedor';
COMMENT ON COLUMN extracted_property_deeds.cargas_existentes IS 'Cargas existentes sobre el inmueble';
COMMENT ON COLUMN extracted_property_deeds.hipotecas_pendientes IS 'Información sobre hipotecas pendientes';
COMMENT ON COLUMN extracted_property_deeds.servidumbres IS 'Servidumbres sobre el inmueble';
COMMENT ON COLUMN extracted_property_deeds.libre_cargas IS 'Si está libre de cargas';
COMMENT ON COLUMN extracted_property_deeds.condicion_suspensiva IS 'Si tiene condición suspensiva';
COMMENT ON COLUMN extracted_property_deeds.condiciones_especiales IS 'Condiciones especiales de la compraventa';
COMMENT ON COLUMN extracted_property_deeds.clausulas_particulares IS 'Cláusulas particulares';
COMMENT ON COLUMN extracted_property_deeds.fecha_entrega IS 'Fecha de entrega';
COMMENT ON COLUMN extracted_property_deeds.entrega_inmediata IS 'Si la entrega es inmediata';
COMMENT ON COLUMN extracted_property_deeds.estado_conservacion IS 'Estado de conservación';
COMMENT ON COLUMN extracted_property_deeds.inventario_incluido IS 'Inventario incluido en la venta';
COMMENT ON COLUMN extracted_property_deeds.notario_numero_colegiado IS 'Número de colegiado del notario';
COMMENT ON COLUMN extracted_property_deeds.notaria_direccion IS 'Dirección de la notaría';
COMMENT ON COLUMN extracted_property_deeds.protocolo_numero IS 'Número de protocolo';
COMMENT ON COLUMN extracted_property_deeds.autorizacion_notarial IS 'Si tiene autorización notarial';
COMMENT ON COLUMN extracted_property_deeds.valor_catastral IS 'Valor catastral';
COMMENT ON COLUMN extracted_property_deeds.coeficiente_participacion IS 'Coeficiente de participación';
COMMENT ON COLUMN extracted_property_deeds.itp_aplicable IS 'ITP aplicable';
COMMENT ON COLUMN extracted_property_deeds.base_imponible_itp IS 'Base imponible para ITP';
COMMENT ON COLUMN extracted_property_deeds.inscripcion_registro IS 'Estado de inscripción registral';

-- RLS para extracted_property_deeds
ALTER TABLE extracted_property_deeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "extracted_property_deeds_organization_isolation" ON extracted_property_deeds
  FOR ALL USING (organization_id = get_user_organization_id());

