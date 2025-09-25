-- =====================================================
-- AGENTES ESPECIALIZADOS PARA PLANTILLAS DE DOCUMENTOS
-- =====================================================
-- Ejecuta este SQL en Supabase SQL Editor para crear los agentes

-- 1. AGENTE PARA COMUNICADOS VECINOS
INSERT INTO agents (
    organization_id,
    name,
    purpose,
    prompt_template,
    variables,
    is_active
) VALUES (
    NULL,
    'comunicado_extractor_v1',
    'Extrae información estructurada de comunicados vecinales para la tabla extracted_communications',
    'Eres un experto en extraer información de comunicados de comunidades de propietarios. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para arrays usar formato JSON válido
6. Para urgencia usar: "baja", "media", "alta", "urgente"

CAMPOS A EXTRAER:
{
  "fecha": "fecha del comunicado (YYYY-MM-DD o null)",
  "comunidad": "nombre completo de la comunidad",
  "remitente": "persona o cargo que emite el comunicado",
  "resumen": "resumen del contenido principal en 2-3 frases",
  "category": "categoría del comunicado (mantenimiento, informativo, urgente, etc.)",
  "asunto": "asunto o título del comunicado",
  "tipo_comunicado": "tipo específico (aviso, notificación, circular, etc.)",
  "urgencia": "nivel de urgencia (baja/media/alta/urgente)",
  "comunidad_direccion": "dirección de la comunidad si aparece",
  "remitente_cargo": "cargo específico del remitente",
  "destinatarios": ["lista de destinatarios si se especifica"],
  "fecha_limite": "fecha límite si hay alguna (YYYY-MM-DD)",
  "categoria_comunicado": "categoría específica del comunicado",
  "requiere_respuesta": true/false,
  "accion_requerida": ["lista de acciones que deben tomar los vecinos"],
  "anexos": ["lista de documentos anexos mencionados"],
  "contacto_info": {
    "telefono": "teléfono de contacto",
    "email": "email de contacto",
    "horario_atencion": "horario de atención"
  }
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.',
    '{"document_text": "Texto del comunicado a analizar"}',
    true
) ON CONFLICT (name) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template,
    variables = EXCLUDED.variables,
    is_active = EXCLUDED.is_active;

-- 2. AGENTE PARA ALBARANES
INSERT INTO agents (
    organization_id,
    name,
    purpose,
    prompt_template,
    variables,
    is_active
) VALUES (
    NULL,
    'albaran_extractor_v1',
    'Extrae información estructurada de albaranes y notas de entrega para la tabla extracted_delivery_notes',
    'Eres un experto en extraer información de albaranes y notas de entrega. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para arrays usar formato JSON válido

CAMPOS A EXTRAER:
{
  "emisor_name": "nombre completo del emisor/remitente",
  "receptor_name": "nombre completo del receptor/destinatario",
  "numero_albaran": "número del albarán",
  "fecha_emision": "fecha de emisión (YYYY-MM-DD)",
  "numero_pedido": "número de pedido asociado",
  "category": "categoría del albarán (industrial, comercial, servicios, etc.)",
  "emisor_direccion": "dirección completa del emisor",
  "emisor_telefono": "teléfono del emisor",
  "emisor_email": "email del emisor",
  "receptor_direccion": "dirección completa del receptor",
  "receptor_telefono": "teléfono del receptor",
  "mercancia": [
    {
      "descripcion": "descripción del producto/servicio",
      "cantidad": "cantidad numérica",
      "unidad": "unidad de medida",
      "peso": "peso si aplica"
    }
  ],
  "cantidad_total": "cantidad total de productos",
  "peso_total": "peso total si aplica",
  "observaciones": "observaciones o notas del albarán",
  "estado_entrega": "estado de la entrega (entregado, pendiente, etc.)",
  "firma_receptor": true/false,
  "transportista": "empresa o persona transportista",
  "vehiculo_matricula": "matrícula del vehículo de transporte"
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.',
    '{"document_text": "Texto del albarán a analizar"}',
    true
) ON CONFLICT (name) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template,
    variables = EXCLUDED.variables,
    is_active = EXCLUDED.is_active;

-- 3. AGENTE PARA CONTRATOS
INSERT INTO agents (
    organization_id,
    name,
    purpose,
    prompt_template,
    variables,
    is_active
) VALUES (
    NULL,
    'contrato_extractor_v1',
    'Extrae información estructurada de contratos para la tabla extracted_contracts',
    'Eres un experto en análisis legal especializado en contratos. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para arrays usar formato JSON válido
6. Para montos usar solo números decimales

CAMPOS A EXTRAER:
{
  "titulo_contrato": "título completo del contrato",
  "parte_a": "nombre de la primera parte contratante",
  "parte_b": "nombre de la segunda parte contratante",
  "objeto_contrato": "objeto o propósito del contrato en 1-2 frases",
  "duracion": "duración del contrato (ej: 24 meses, 2 años)",
  "importe_total": 25000.50,
  "fecha_inicio": "fecha de inicio (YYYY-MM-DD)",
  "fecha_fin": "fecha de fin (YYYY-MM-DD)",
  "category": "categoría del contrato (servicios, suministro, obra, etc.)",
  "tipo_contrato": "tipo específico del contrato",
  "parte_a_direccion": "dirección de la parte A",
  "parte_a_identificacion_fiscal": "NIF/CIF de la parte A",
  "parte_a_representante": "representante legal de la parte A",
  "parte_b_direccion": "dirección de la parte B",
  "parte_b_identificacion_fiscal": "NIF/CIF de la parte B",
  "parte_b_representante": "representante legal de la parte B",
  "descripcion_detallada": "descripción detallada del objeto contractual",
  "alcance_servicios": ["lista de servicios o trabajos incluidos"],
  "obligaciones_parte_a": ["obligaciones específicas de la parte A"],
  "obligaciones_parte_b": ["obligaciones específicas de la parte B"],
  "moneda": "EUR",
  "forma_pago": "forma de pago acordada",
  "plazos_pago": ["detalles de los plazos de pago"],
  "penalizaciones": "cláusulas de penalización",
  "confidencialidad": true/false,
  "condiciones_terminacion": "condiciones para terminar el contrato",
  "legislacion_aplicable": "legislación aplicable",
  "jurisdiccion": "jurisdicción competente",
  "fecha_firma": "fecha de firma (YYYY-MM-DD)",
  "lugar_firma": "lugar de firma",
  "firmas_presentes": true/false
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.',
    '{"document_text": "Texto del contrato a analizar"}',
    true
) ON CONFLICT (name) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template,
    variables = EXCLUDED.variables,
    is_active = EXCLUDED.is_active;

-- 4. AGENTE PARA PRESUPUESTOS
INSERT INTO agents (
    organization_id,
    name,
    purpose,
    prompt_template,
    variables,
    is_active
) VALUES (
    NULL,
    'presupuesto_extractor_v1',
    'Extrae información estructurada de presupuestos y cotizaciones para la tabla extracted_budgets',
    'Eres un experto en análisis financiero especializado en presupuestos y cotizaciones. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para montos usar solo números decimales (sin símbolos de moneda)
6. Para arrays usar formato JSON válido

CAMPOS A EXTRAER:
{
  "numero_presupuesto": "número del presupuesto",
  "emisor_name": "nombre completo del emisor",
  "cliente_name": "nombre completo del cliente",
  "fecha_emision": "fecha de emisión (YYYY-MM-DD)",
  "fecha_validez": "fecha de validez/caducidad (YYYY-MM-DD)",
  "subtotal": 10500.00,
  "impuestos": 2205.00,
  "total": 12705.00,
  "category": "categoría del presupuesto (obra, servicios, suministro, etc.)",
  "titulo": "título del presupuesto",
  "tipo_documento": "tipo específico (presupuesto, cotización, etc.)",
  "emisor_direccion": "dirección completa del emisor",
  "emisor_telefono": "teléfono del emisor",
  "emisor_email": "email del emisor",
  "emisor_identificacion_fiscal": "NIF/CIF del emisor",
  "cliente_direccion": "dirección completa del cliente",
  "cliente_identificacion_fiscal": "NIF/CIF del cliente",
  "descripcion_servicios": ["lista de servicios/productos incluidos"],
  "cantidades": [1, 10, 5],
  "precios_unitarios": [1500.00, 250.00, 100.00],
  "importes_totales": [1500.00, 2500.00, 500.00],
  "descripciones_detalladas": ["descripciones detalladas de cada partida"],
  "porcentaje_impuestos": 21.0,
  "importe_impuestos": 2205.00,
  "moneda": "EUR",
  "condiciones_pago": "condiciones de pago detalladas",
  "plazos_entrega": "plazos de entrega especificados",
  "pago_inicial_requerido": true/false,
  "notas_adicionales": "notas adicionales del presupuesto",
  "garantia": "información sobre garantía ofrecida"
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.',
    '{"document_text": "Texto del presupuesto a analizar"}',
    true
) ON CONFLICT (name) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template,
    variables = EXCLUDED.variables,
    is_active = EXCLUDED.is_active;

-- 5. AGENTE PARA ESCRITURAS DE COMPRAVENTA
INSERT INTO agents (
    organization_id,
    name,
    purpose,
    prompt_template,
    variables,
    is_active
) VALUES (
    NULL,
    'escritura_extractor_v1',
    'Extrae información estructurada de escrituras de compraventa inmobiliaria para la tabla extracted_property_deeds',
    'Eres un experto en derecho inmobiliario especializado en escrituras de compraventa. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para montos usar solo números decimales
6. Para arrays usar formato JSON válido

CAMPOS A EXTRAER:
{
  "vendedor_nombre": "nombre completo del vendedor",
  "comprador_nombre": "nombre completo del comprador",
  "direccion_inmueble": "dirección completa del inmueble",
  "precio_venta": 385000.00,
  "fecha_escritura": "fecha de la escritura (YYYY-MM-DD)",
  "notario_nombre": "nombre completo del notario",
  "referencia_catastral": "referencia catastral del inmueble",
  "superficie_m2": 95.5,
  "category": "categoría (vivienda, local, terreno, etc.)",
  "vendedor_dni": "DNI/NIF del vendedor",
  "vendedor_direccion": "dirección del vendedor",
  "vendedor_estado_civil": "estado civil del vendedor",
  "vendedor_nacionalidad": "nacionalidad del vendedor",
  "vendedor_profesion": "profesión del vendedor",
  "comprador_dni": "DNI/NIF del comprador",
  "comprador_direccion": "dirección del comprador",
  "comprador_estado_civil": "estado civil del comprador",
  "comprador_nacionalidad": "nacionalidad del comprador",
  "comprador_profesion": "profesión del comprador",
  "tipo_inmueble": "tipo específico del inmueble",
  "superficie_util": 85.5,
  "numero_habitaciones": 3,
  "numero_banos": 2,
  "planta": "planta del inmueble",
  "orientacion": "orientación del inmueble",
  "descripcion_inmueble": "descripción detallada del inmueble",
  "registro_propiedad": "nombre del registro de la propiedad",
  "tomo": "tomo registral",
  "libro": "libro registral",
  "folio": "folio registral",
  "finca": "número de finca",
  "inscripcion": "número de inscripción",
  "moneda": "EUR",
  "forma_pago": "forma de pago especificada",
  "precio_en_letras": "precio escrito en letras",
  "impuestos_incluidos": true/false,
  "gastos_a_cargo_comprador": ["gastos que asume el comprador"],
  "gastos_a_cargo_vendedor": ["gastos que asume el vendedor"],
  "cargas_existentes": ["cargas existentes sobre el inmueble"],
  "hipotecas_pendientes": "información sobre hipotecas",
  "servidumbres": "servidumbres existentes",
  "libre_cargas": true/false,
  "condicion_suspensiva": true/false,
  "condiciones_especiales": ["condiciones especiales del contrato"],
  "clausulas_particulares": ["cláusulas particulares"],
  "fecha_entrega": "fecha de entrega (YYYY-MM-DD)",
  "entrega_inmediata": true/false,
  "estado_conservacion": "estado de conservación",
  "inventario_incluido": "inventario de elementos incluidos",
  "notario_numero_colegiado": "número de colegiado del notario",
  "notaria_direccion": "dirección de la notaría",
  "protocolo_numero": "número de protocolo",
  "autorizacion_notarial": true/false,
  "valor_catastral": 298450.00,
  "coeficiente_participacion": "1,25%",
  "itp_aplicable": 6.0,
  "base_imponible_itp": 385000.00,
  "inscripcion_registro": "estado de inscripción registral"
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.',
    '{"document_text": "Texto de la escritura a analizar"}',
    true
) ON CONFLICT (name) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template,
    variables = EXCLUDED.variables,
    is_active = EXCLUDED.is_active;

-- 6. ACTUALIZAR AGENTE DE FACTURAS (para coincidir con la plantilla mejorada)
INSERT INTO agents (
    organization_id,
    name,
    purpose,
    prompt_template,
    variables,
    is_active
) VALUES (
    NULL,
    'factura_extractor_v2',
    'Extrae información estructurada detallada de facturas para la tabla extracted_invoices actualizada',
    'Eres un experto en análisis de documentos comerciales especializado en facturas. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para montos usar solo números decimales
6. Para arrays usar formato JSON válido

CAMPOS A EXTRAER:
{
  "provider_name": "nombre completo del proveedor/emisor",
  "client_name": "nombre completo del cliente/receptor",
  "amount": 1250.00,
  "invoice_date": "fecha de la factura (YYYY-MM-DD)",
  "category": "categoría de la factura (servicios, productos, etc.)",
  "invoice_number": "número de factura",
  "issue_date": "fecha de emisión (YYYY-MM-DD)",
  "due_date": "fecha de vencimiento (YYYY-MM-DD)",
  "subtotal": 1033.06,
  "tax_amount": 216.94,
  "total_amount": 1250.00,
  "currency": "EUR",
  "payment_method": "método de pago",
  "vendor_address": "dirección completa del vendedor",
  "vendor_tax_id": "NIF/CIF del vendedor",
  "client_address": "dirección completa del cliente",
  "client_tax_id": "NIF/CIF del cliente",
  "products": [
    {
      "description": "descripción del producto/servicio",
      "quantity": 2,
      "unit_price": 125.50,
      "total_price": 251.00
    }
  ],
  "payment_terms": "condiciones de pago",
  "notes": "observaciones o notas adicionales"
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.',
    '{"document_text": "Texto de la factura a analizar"}',
    true
) ON CONFLICT (name) DO UPDATE SET
    prompt_template = EXCLUDED.prompt_template,
    variables = EXCLUDED.variables,
    is_active = EXCLUDED.is_active;

-- Verificar que se crearon correctamente
SELECT name, purpose, is_active, created_at 
FROM agents 
WHERE name IN (
  'comunicado_extractor_v1',
  'albaran_extractor_v1', 
  'contrato_extractor_v1',
  'presupuesto_extractor_v1',
  'escritura_extractor_v1',
  'factura_extractor_v2'
)
ORDER BY created_at DESC;