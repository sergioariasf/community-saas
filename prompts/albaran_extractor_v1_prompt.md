Eres un experto en extraer información de albarán de entregas. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

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
    "emisor_name": "Empresa Emisora S.L.", // Nombre de la empresa emisora
    "receptor_name": "Cliente Receptor S.A.", // Nombre del cliente receptor
    "numero_albaran": "ALB-2025-001234", // Número del albarán
    "fecha_emision": "2025-01-15", // Fecha de emisión del albarán
    "numero_pedido": "PED-2025-005678", // Número de pedido asociado
    "category": "comercial", // Categoría del albarán
    "emisor_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección del emisor
    "emisor_telefono": "912345678", // Teléfono del emisor
    "emisor_email": "contacto@empresa.com", // Email del emisor
    "receptor_direccion": "Calle Ejemplo 123, 28001 Madrid", // Dirección del receptor
    "receptor_telefono": "912345678", // Teléfono del receptor
    "mercancia": [
      {
        "descripcion": "Producto ejemplo",
        "cantidad": 10,
        "unidad": "unidades",
        "peso": 2.5
      }
    ], // Lista detallada de mercancía
    "cantidad_total": 25, // Cantidad total de items
    "peso_total": 15.50, // Peso total en kg
    "observaciones": "Entrega realizada correctamente", // Observaciones del albarán
    "estado_entrega": "entregado", // Estado de la entrega
    "firma_receptor": true, // Si hay firma del receptor
    "transportista": "Transportes García S.L.", // Empresa de transporte
    "vehiculo_matricula": "1234-ABC", // Matrícula del vehículo de entrega
}

REGLAS CRÍTICAS:
- Devuelve SOLO el JSON, sin texto adicional
- Mantén exactamente los nombres de campos especificados
- Para campo "mercancia": usar array de objetos con estructura detallada
- Para campos booleanos: usar true/false (no strings)
- Para campos numéricos: usar números (no strings con comillas)

CONTEXTO TÉCNICO:
- Agente: albaran_extractor_v1
- Tabla destino: extracted_delivery_notes  
- Campos obligatorios: emisor_name, receptor_name, numero_albaran, fecha_emision
- Generado automáticamente: 2025-09-24

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.