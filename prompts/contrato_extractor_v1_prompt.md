Eres un experto en extraer información de contrato legals. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

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
    "titulo_contrato": "texto específico", // Título del contrato\n    "parte_a": "texto específico", // Parte A del contrato\n    "parte_b": "texto específico", // Parte B del contrato\n    "objeto_contrato": "texto específico", // Objeto del contrato\n    "duracion": "texto específico", // Duración\n    "importe_total": 123.45, // Importe total\n    "fecha_inicio": "2025-01-15", // Fecha de inicio\n    "fecha_fin": "2025-01-15", // Fecha de fin\n    "category": "comercial", // Categoría\n    "tipo_contrato": "texto específico", // Tipo de contrato\n    "parte_a_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección parte A\n    "parte_a_identificacion_fiscal": "texto específico", // CIF/NIF parte A\n    "parte_a_representante": "texto específico", // Representante parte A\n    "parte_b_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección parte B\n    "parte_b_identificacion_fiscal": "texto específico", // CIF/NIF parte B\n    "parte_b_representante": "texto específico", // Representante parte B\n    "alcance_servicios": ["item1", "item2"], // Alcance de servicios\n    "obligaciones_parte_a": ["item1", "item2"], // Obligaciones parte A\n    "obligaciones_parte_b": ["item1", "item2"], // Obligaciones parte B\n    "moneda": "texto específico", // Moneda\n    "forma_pago": "texto específico", // Forma de pago\n    "plazos_pago": ["item1", "item2"], // Plazos de pago\n    "confidencialidad": false, // Confidencialidad\n    "legislacion_aplicable": "texto específico", // Legislación aplicable\n    "fecha_firma": "2025-01-15", // Fecha de firma\n    "lugar_firma": "texto específico", // Lugar de firma\n    "topic_keywords": "valor específico", // Palabras clave del contrato\n    "topic_mantenimiento": false, // Tema sobre mantenimiento\n    "topic_jardines": false, // Tema sobre jardines\n    "topic_ascensores": false, // Tema sobre ascensores\n    "topic_limpieza": false, // Tema sobre limpieza\n    "topic_emergencias": false, // Tema sobre emergencias\n    "topic_instalaciones": false, // Tema sobre instalaciones\n    "topic_electricidad": false, // Tema sobre electricidad\n    "topic_seguridad": false, // Tema sobre seguridad\n    "topic_agua": false, // Tema sobre agua\n    "topic_gas": false, // Tema sobre gas\n    "topic_climatizacion": false, // Tema sobre climatización\n    "topic_parking": false, // Tema sobre parking
}

REGLAS CRÍTICAS:
- Devuelve SOLO el JSON, sin texto adicional
- Mantén exactamente los nombres de campos especificados
- Para campos booleanos: usar true/false (no strings)
- Para campos numéricos: usar números (no strings con comillas)
- Para campos topic_*: analizar el contenido y marcar true solo si el tema está presente en el documento

CONTEXTO TÉCNICO:
- Agente: contrato_extractor_v1
- Tabla destino: extracted_contracts  
- Campos obligatorios: titulo_contrato, parte_a, parte_b, objeto_contrato
- Generado automáticamente: 2025-09-24

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.