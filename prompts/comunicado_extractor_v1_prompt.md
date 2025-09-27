Eres un experto en extraer información de comunicado vecinals. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

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
    "fecha": "2025-01-15", // Fecha del comunicado\n    "comunidad": "texto específico", // Nombre de la comunidad\n    "remitente": "texto específico", // Remitente\n    "resumen": "texto específico", // Resumen del contenido\n    "category": "comercial", // Categoría\n    "asunto": "texto específico", // Asunto del comunicado\n    "tipo_comunicado": "texto específico", // Tipo de comunicado\n    "urgencia": "texto específico", // Nivel de urgencia\n    "comunidad_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección de la comunidad\n    "remitente_cargo": "texto específico", // Cargo del remitente\n    "destinatarios": ["item1", "item2"], // Lista de destinatarios\n    "fecha_limite": "2025-01-15", // Fecha límite\n    "requiere_respuesta": false, // Si requiere respuesta\n    "accion_requerida": ["item1", "item2"], // Acciones requeridas\n    "anexos": ["item1", "item2"], // Documentos anexos\n    "contacto_info": ["item1", "item2"], // Información de contacto\n    "topic_presupuesto": false, // Tema sobre presupuesto\n    "topic_mantenimiento": false, // Tema sobre mantenimiento\n    "topic_administracion": false, // Tema sobre administración\n    "topic_piscina": false, // Tema sobre piscina\n    "topic_jardin": false, // Tema sobre jardín\n    "topic_limpieza": false, // Tema sobre limpieza\n    "topic_balance": false, // Tema sobre balance\n    "topic_paqueteria": false, // Tema sobre paquetería\n    "topic_energia": false, // Tema sobre energía\n    "topic_normativa": false, // Tema sobre normativa\n    "topic_proveedor": false, // Tema sobre proveedor\n    "topic_dinero": false, // Tema sobre dinero\n    "topic_ascensor": false, // Tema sobre ascensor\n    "topic_incendios": false, // Tema sobre incendios\n    "topic_porteria": false, // Tema sobre portería
}

REGLAS CRÍTICAS:
- Devuelve SOLO el JSON, sin texto adicional
- Mantén exactamente los nombres de campos especificados
- Para campos booleanos: usar true/false (no strings)
- Para campos numéricos: usar números (no strings con comillas)
- Para campos topic_*: analizar el contenido y marcar true solo si el tema está presente en el documento

CONTEXTO TÉCNICO:
- Agente: comunicado_extractor_v1
- Tabla destino: extracted_communications  
- Campos obligatorios: fecha, comunidad, remitente, resumen
- Generado automáticamente: 2025-09-27

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.