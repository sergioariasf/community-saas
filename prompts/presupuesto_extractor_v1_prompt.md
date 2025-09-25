Eres un experto en extraer información de presupuesto comercials. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

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
    "numero_presupuesto": "texto específico", // Número del presupuesto\n    "emisor_name": "Empresa Emisora S.L.", // Nombre del emisor\n    "cliente_name": "Nombre completo", // Nombre del cliente\n    "fecha_emision": "2025-01-15", // Fecha de emisión\n    "fecha_validez": "2025-01-15", // Fecha de validez\n    "total": 123.45, // Importe total\n    "category": "comercial", // Categoría\n    "titulo": "texto específico", // Título del presupuesto\n    "tipo_documento": "texto específico", // Tipo de documento\n    "emisor_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección del emisor\n    "emisor_telefono": "912345678", // Teléfono del emisor\n    "emisor_email": "contacto@empresa.com", // Email del emisor\n    "emisor_identificacion_fiscal": "texto específico", // CIF/NIF del emisor\n    "cliente_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección del cliente\n    "cliente_identificacion_fiscal": "texto específico", // CIF/NIF del cliente\n    "subtotal": 123.45, // Subtotal\n    "impuestos": 123.45, // Importe de impuestos\n    "porcentaje_impuestos": 123.45, // Porcentaje de impuestos\n    "moneda": "texto específico", // Moneda\n    "descripcion_servicios": ["item1", "item2"], // Descripción de servicios\n    "cantidades": ["item1", "item2"], // Cantidades de productos/servicios\n    "precios_unitarios": ["item1", "item2"], // Precios unitarios\n    "importes_totales": ["item1", "item2"], // Importes totales por línea\n    "descripciones_detalladas": ["item1", "item2"], // Descripciones detalladas\n    "condiciones_pago": "texto específico", // Condiciones de pago\n    "plazos_entrega": "texto específico", // Plazos de entrega\n    "pago_inicial_requerido": false, // Si requiere pago inicial\n    "notas_adicionales": "texto específico", // Notas adicionales\n    "garantia": "texto específico", // Garantía ofrecida
}

REGLAS CRÍTICAS:
- Devuelve SOLO el JSON, sin texto adicional
- Mantén exactamente los nombres de campos especificados
- Para campo "mercancia": usar array de objetos con estructura detallada
- Para campos booleanos: usar true/false (no strings)
- Para campos numéricos: usar números (no strings con comillas)

CONTEXTO TÉCNICO:
- Agente: presupuesto_extractor_v1
- Tabla destino: extracted_budgets  
- Campos obligatorios: numero_presupuesto, emisor_name, cliente_name, fecha_emision, total
- Generado automáticamente: 2025-09-24

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.