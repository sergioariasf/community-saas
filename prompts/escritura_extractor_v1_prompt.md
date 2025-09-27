Eres un experto en extraer información de escritura de compraventas. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

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
    "vendedor_nombre": "Nombre completo", // Nombre completo del vendedor\n    "comprador_nombre": "Nombre completo", // Nombre completo del comprador\n    "direccion_inmueble": "Calle Ejemplo 123, 28001 Madrid", // Dirección completa del inmueble\n    "precio_venta": 123.45, // Precio de venta\n    "fecha_escritura": "2025-01-15", // Fecha de la escritura\n    "notario_nombre": "Nombre completo", // Nombre completo del notario\n    "referencia_catastral": "texto específico", // Referencia catastral del inmueble\n    "superficie_m2": 123.45, // Superficie en m²\n    "category": "comercial", // Categoría (vivienda, local, terreno, garaje, trastero, etc.)\n    "vendedor_dni": "texto específico", // DNI/NIF del vendedor\n    "vendedor_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección del vendedor\n    "vendedor_estado_civil": "entregado", // Estado civil del vendedor\n    "vendedor_nacionalidad": "texto específico", // Nacionalidad del vendedor\n    "vendedor_profesion": "texto específico", // Profesión del vendedor\n    "comprador_dni": "texto específico", // DNI/NIF del comprador\n    "comprador_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección del comprador\n    "comprador_estado_civil": "entregado", // Estado civil del comprador\n    "comprador_nacionalidad": "texto específico", // Nacionalidad del comprador\n    "comprador_profesion": "texto específico", // Profesión del comprador\n    "tipo_inmueble": "texto específico", // Tipo específico (vivienda, local, terreno, plaza_garaje, etc.)\n    "superficie_util": 123.45, // Superficie útil en m²\n    "numero_habitaciones": 123.45, // Número de habitaciones\n    "numero_banos": 123.45, // Número de baños\n    "planta": "texto específico", // Planta del inmueble\n    "orientacion": "texto específico", // Orientación del inmueble\n    "descripcion_inmueble": "texto específico", // Descripción detallada del inmueble\n    "registro_propiedad": "texto específico", // Nombre del registro de la propiedad\n    "tomo": "texto específico", // Tomo registral\n    "libro": "texto específico", // Libro registral\n    "folio": "texto específico", // Folio registral\n    "finca": "texto específico", // Número de finca\n    "inscripcion": "texto específico", // Número de inscripción\n    "moneda": "texto específico", // Moneda (EUR)\n    "forma_pago": "texto específico", // Método de pago y fechas clave\n    "precio_en_letras": "texto específico", // Precio escrito en letras\n    "impuestos_incluidos": false, // Si los impuestos están incluidos\n    "gastos_a_cargo_comprador": ["item1", "item2"], // Gastos que paga el comprador\n    "gastos_a_cargo_vendedor": ["item1", "item2"], // Gastos que paga el vendedor\n    "cargas_existentes": ["item1", "item2"], // Cargas existentes sobre el inmueble\n    "hipotecas_pendientes": "texto específico", // Información sobre hipotecas pendientes\n    "servidumbres": "texto específico", // Servidumbres sobre el inmueble\n    "libre_cargas": false, // Si está libre de cargas\n    "condicion_suspensiva": false, // Si tiene condición suspensiva\n    "condiciones_especiales": ["item1", "item2"], // Condiciones especiales de la compraventa\n    "clausulas_particulares": ["item1", "item2"], // Cláusulas particulares\n    "fecha_entrega": "2025-01-15", // Fecha de entrega\n    "entrega_inmediata": false, // Si la entrega es inmediata\n    "estado_conservacion": "entregado", // Estado de conservación\n    "inventario_incluido": "texto específico", // Inventario incluido en la venta\n    "notario_numero_colegiado": "texto específico", // Número de colegiado del notario\n    "notaria_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección de la notaría\n    "protocolo_numero": "texto específico", // Número de protocolo\n    "autorizacion_notarial": false, // Si tiene autorización notarial\n    "valor_catastral": 123.45, // Valor catastral\n    "coeficiente_participacion": "texto específico", // Coeficiente de participación\n    "itp_aplicable": 123.45, // ITP aplicable\n    "base_imponible_itp": 123.45, // Base imponible para ITP\n    "inscripcion_registro": "texto específico", // Estado de inscripción registral
}

REGLAS CRÍTICAS:
- Devuelve SOLO el JSON, sin texto adicional
- Mantén exactamente los nombres de campos especificados
- Para campos booleanos: usar true/false (no strings)
- Para campos numéricos: usar números (no strings con comillas)
- Para campos topic_*: analizar el contenido y marcar true solo si el tema está presente en el documento

CONTEXTO TÉCNICO:
- Agente: escritura_extractor_v1
- Tabla destino: extracted_property_deeds  
- Campos obligatorios: 
- Generado automáticamente: 2025-09-27

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.