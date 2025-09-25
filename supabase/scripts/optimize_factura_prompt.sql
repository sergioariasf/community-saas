-- ARCHIVO: optimize_factura_prompt.sql
-- PROPÓSITO: Optimizar prompt de factura_extractor_v2 para evitar exceso de tokens en facturas complejas
-- ESTADO: development
-- DEPENDENCIAS: tabla agents, factura_extractor_v2
-- OUTPUTS: Prompt optimizado para extraer datos esenciales sin detalle de productos
-- ACTUALIZADO: 2025-09-22

-- Actualizar el prompt del agente factura_extractor_v2 para optimizar extracción
UPDATE agents 
SET prompt_template = 'Eres un experto en análisis de documentos comerciales especializado en facturas. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para montos usar solo números decimales
6. Para arrays usar formato JSON válido
7. BUSCA ESPECIALMENTE datos bancarios en secciones como "Cuenta", "IBAN", "Datos bancarios", "Forma de pago", "Transferencia"
8. IMPORTANTE: Para facturas con muchos productos, extrae solo el RESUMEN GENERAL, NO el detalle individual

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
  "vendor_phone": "teléfono del vendedor",
  "vendor_email": "email del vendedor",
  "client_address": "dirección completa del cliente",
  "client_tax_id": "NIF/CIF del cliente",
  "client_phone": "teléfono del cliente",
  "client_email": "email del cliente",
  "products_summary": "RESUMEN GENERAL de productos/servicios (ej: Suministro eléctrico marzo 2024, Equipamiento deportivo gimnasio, etc.) - MÁXIMO 200 caracteres",
  "products_count": "número total de productos/líneas de factura",
  "payment_terms": "condiciones de pago",
  "bank_details": "BUSCA ESPECÍFICAMENTE: IBAN, número de cuenta, código SWIFT, datos bancarios que aparezcan en secciones como Cuenta, Datos bancarios, Transferencia, etc. Incluye TODOS los datos bancarios encontrados",
  "notes": "observaciones o notas adicionales"
}

IMPORTANTE: 
- Para facturas complejas con muchos productos: extrae solo products_summary y products_count
- NO extraigas el array detallado "products" con cada producto individual
- Para bank_details: busca minuciosamente cualquier IBAN, número de cuenta, datos bancarios, códigos SWIFT
- Revisa secciones como "Cuenta:", "IBAN:", "Datos bancarios:", "Transferencia:"
- Devuelve SOLO el JSON, sin texto adicional.',
  updated_at = NOW()
WHERE name = 'factura_extractor_v2';

-- Verificar que la actualización se realizó correctamente
SELECT 
    name,
    length(prompt_template) as prompt_length,
    updated_at
FROM agents 
WHERE name = 'factura_extractor_v2';