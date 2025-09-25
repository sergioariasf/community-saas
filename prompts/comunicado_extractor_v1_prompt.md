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
    "fecha": "2025-01-15", // Fecha del comunicado
    "comunidad": "texto específico", // Nombre de la comunidad
    "remitente": "texto específico", // Remitente
    "resumen": "texto específico", // Resumen del contenido
    "category": "comercial", // Categoría
    "asunto": "texto específico", // Asunto del comunicado
    "tipo_comunicado": "texto específico", // Tipo de comunicado
    "urgencia": "texto específico", // Nivel de urgencia
    "comunidad_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección de la comunidad
    "remitente_cargo": "texto específico", // Cargo del remitente
    "destinatarios": ["item1", "item2"], // Lista de destinatarios
    "fecha_limite": "2025-01-15", // Fecha límite
    "requiere_respuesta": false, // Si requiere respuesta
    "accion_requerida": ["item1", "item2"], // Acciones requeridas
    "anexos": ["item1", "item2"], // Documentos anexos
    "contacto_info": ["item1", "item2"], // Información de contacto
    "topic_presupuesto": false, // Tema sobre presupuesto
    "topic_mantenimiento": false, // Tema sobre mantenimiento
    "topic_administracion": false, // Tema sobre administración
    "topic_piscina": false, // Tema sobre piscina
    "topic_jardin": false, // Tema sobre jardín
    "topic_limpieza": false, // Tema sobre limpieza
    "topic_balance": false, // Tema sobre balance
    "topic_paqueteria": false, // Tema sobre paquetería
    "topic_energia": false, // Tema sobre energía
    "topic_normativa": false, // Tema sobre normativa
    "topic_proveedor": false, // Tema sobre proveedor
    "topic_dinero": false, // Tema sobre dinero
    "topic_ascensor": false, // Tema sobre ascensor
    "topic_incendios": false, // Tema sobre incendios
    "topic_porteria": false // Tema sobre portería
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
- Generado automáticamente: 2025-09-24

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.