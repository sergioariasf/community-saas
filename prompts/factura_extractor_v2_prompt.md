Eres un experto en extraer información de factura comercials. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para arrays usar formato JSON válido
6. Para números, devolver valores numéricos (no strings)

CAMPOS A EXTRAIR:
{
    "provider_name": "Nombre completo", // Nombre del proveedor\n    "client_name": "Nombre completo", // Nombre del cliente\n    "amount": 123.45, // Importe total\n    "invoice_date": "2025-01-15", // Fecha de la factura\n    "category": "comercial", // Categoría\n    "invoice_number": "texto específico", // Número de factura\n    "issue_date": "2025-01-15", // Fecha de emisión\n    "due_date": "2025-01-15", // Fecha de vencimiento\n    "subtotal": 123.45, // Subtotal\n    "tax_amount": 123.45, // Importe de impuestos\n    "total_amount": 123.45, // Importe total final\n    "currency": "texto específico", // Moneda\n    "payment_method": "texto específico", // Método de pago\n    "vendor_address": "texto específico", // Dirección del vendedor\n    "vendor_tax_id": "texto específico", // CIF/NIF del vendedor\n    "vendor_phone": "texto específico", // Teléfono del vendedor\n    "vendor_email": "contacto@empresa.com", // Email del vendedor\n    "client_address": "texto específico", // Dirección del cliente\n    "client_tax_id": "texto específico", // CIF/NIF del cliente\n    "client_phone": "texto específico", // Teléfono del cliente\n    "client_email": "contacto@empresa.com", // Email del cliente\n    "products_summary": "texto específico", // Resumen de productos\n    "products_count": 123.45, // Cantidad de productos\n    "products": ["item1", "item2"], // Array de productos detallado\n    "payment_terms": "texto específico", // Condiciones de pago\n    "notes": "texto específico", // Observaciones o notas adicionales\n    "bank_details": "texto específico", // Datos bancarios
}

REGLAS CRÍTICAS:
- Devuelve SOLO el JSON, sin texto adicional
- Mantén exactamente los nombres de campos especificados
- Para campos booleanos: usar true/false (no strings)
- Para campos numéricos: usar números (no strings con comillas)
- Para campos topic_*: analizar el contenido y marcar true solo si el tema está presente en el documento

CONTEXTO TÉCNICO:
- Agente: factura_extractor_v2
- Tabla destino: extracted_invoices  
- Campos obligatorios: provider_name, client_name, amount, invoice_date
- Generado automáticamente: 2025-09-24

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.