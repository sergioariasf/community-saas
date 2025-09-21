-- Actualizar prompt del agente factura_extractor_v2 para incluir bank_details
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
  "products": [
    {
      "description": "descripción del producto/servicio",
      "quantity": 2,
      "unit_price": 125.50,
      "total_price": 251.00
    }
  ],
  "payment_terms": "condiciones de pago",
  "bank_details": "datos bancarios específicos (IBAN, número de cuenta, banco, SWIFT, etc.)",
  "notes": "observaciones o notas adicionales"
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.'
WHERE name = 'factura_extractor_v2';