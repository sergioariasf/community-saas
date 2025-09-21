-- ARCHIVO: update_contrato_agent_keywords.sql
-- PROPÓSITO: Actualizar prompt del agente contrato_extractor_v1 para detectar keywords específicas
-- ESTADO: development
-- DEPENDENCIAS: tabla agents
-- OUTPUTS: Agente mejorado con detección de temas
-- ACTUALIZADO: 2025-09-20

-- Actualizar prompt del agente contrato_extractor_v1 para incluir detección de keywords/temas
UPDATE agents 
SET prompt_template = 'Eres un experto en análisis legal especializado en contratos. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para montos usar solo números decimales - si hay múltiples importes, usar el IMPORTE PRINCIPAL más alto del contrato
6. Para arrays usar formato JSON válido
7. DETECTA automáticamente TEMAS/KEYWORDS presentes en el documento

TEMAS A DETECTAR (marcar como true si aparecen en el documento):
- mantenimiento: Servicios de mantenimiento, conservación, reparaciones
- jardines: Jardinería, zonas verdes, plantas, césped
- ascensores: Elevadores, ascensores, montacargas
- limpieza: Servicios de limpieza, higiene, desinfección
- emergencias: Servicios de emergencia, urgencias, 24h
- instalaciones: Instalaciones generales, infraestructura
- electricidad: Servicios eléctricos, instalación eléctrica
- seguridad: Servicios de seguridad, vigilancia, alarmas
- agua: Servicios de agua, fontanería, piscinas, riego
- gas: Servicios de gas, calefacción a gas
- climatizacion: Aire acondicionado, calefacción, climatización
- parking: Garajes, aparcamientos, parking

CAMPOS A EXTRAER:
{
  "titulo_contrato": "título completo del contrato",
  "parte_a": "nombre completo de la parte A",
  "parte_b": "nombre completo de la parte B",
  "objeto_contrato": "descripción del objeto del contrato",
  "duracion": "duración del contrato",
  "importe_total": 1250.50,
  "fecha_inicio": "fecha de inicio (YYYY-MM-DD)",
  "fecha_fin": "fecha de finalización (YYYY-MM-DD)",
  "category": "categoría del contrato (servicios, productos, etc.)",
  "tipo_contrato": "tipo específico de contrato",
  "parte_a_direccion": "dirección completa de la parte A",
  "parte_a_identificacion_fiscal": "NIF/CIF de la parte A",
  "parte_a_representante": "representante de la parte A",
  "parte_b_direccion": "dirección completa de la parte B",
  "parte_b_identificacion_fiscal": "NIF/CIF de la parte B",
  "parte_b_representante": "representante de la parte B",
  "descripcion_detallada": "descripción detallada del contrato",
  "alcance_servicios": ["servicio 1", "servicio 2"],
  "obligaciones_parte_a": ["obligación 1", "obligación 2"],
  "obligaciones_parte_b": ["obligación 1", "obligación 2"],
  "moneda": "EUR",
  "forma_pago": "forma de pago especificada",
  "plazos_pago": ["plazo 1", "plazo 2"],
  "penalizaciones": "penalizaciones especificadas",
  "confidencialidad": false,
  "condiciones_terminacion": "condiciones de terminación",
  "legislacion_aplicable": "legislación aplicable",
  "jurisdiccion": "jurisdicción competente",
  "fecha_firma": "fecha de firma (YYYY-MM-DD)",
  "lugar_firma": "lugar de firma",
  "firmas_presentes": false,
  "topic_keywords": ["keyword1", "keyword2", "keyword3"],
  "topic_mantenimiento": false,
  "topic_jardines": false,
  "topic_ascensores": false,
  "topic_limpieza": false,
  "topic_emergencias": false,
  "topic_instalaciones": false,
  "topic_electricidad": false,
  "topic_seguridad": false,
  "topic_agua": false,
  "topic_gas": false,
  "topic_climatizacion": false,
  "topic_parking": false
}

IMPORTANTE: 
- Analiza el texto y detecta automáticamente los temas presentes
- Marca topic_* como true solo si el tema aparece claramente en el documento
- En topic_keywords incluye las palabras clave más relevantes del documento
- ESPECÍFICAMENTE: Si menciona "PISCINAS" → topic_agua: true, topic_keywords debe incluir "piscinas"
- ESPECÍFICAMENTE: Si menciona "MANTENIMIENTO" → topic_mantenimiento: true, topic_keywords debe incluir "mantenimiento"
- Busca TODOS los importes en el documento y usa el PRINCIPAL (más alto)
- Devuelve SOLO el JSON, sin texto adicional.'
WHERE name = 'contrato_extractor_v1';

-- Verificar que se actualizó
SELECT name, LEFT(prompt_template, 300) as prompt_preview
FROM agents 
WHERE name = 'contrato_extractor_v1';