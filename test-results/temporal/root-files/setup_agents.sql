-- Script para configurar los 3 agentes SaaS en la base de datos
-- Según L1.7_PLAN_SIMPLE.md

-- Primero, limpiar agentes existentes si los hay (solo los globales)
DELETE FROM agents WHERE organization_id IS NULL;

-- Insertar los 3 agentes principales como agentes globales (organization_id = NULL)
INSERT INTO agents (organization_id, name, purpose, prompt_template, variables, created_at) VALUES 

-- Agente 1: Clasificador de documentos
(NULL,
 'document_classifier',
 'Determinar si un documento es acta o factura',
 'Analiza el siguiente documento y determina si es un "acta" de reunión/junta o una "factura" comercial. 

Responde SOLO con la palabra "acta" o "factura", sin texto adicional.

Criterios:
- ACTA: menciona juntas, reuniones, presidentes, votaciones, decisiones, administradores de fincas
- FACTURA: menciona importes, proveedores, clientes, fechas de pago, conceptos facturados

Documento: {document_text}',
 '{"input_key": "document_text"}'::jsonb,
 NOW()),

-- Agente 2: Extractor de datos de actas
(NULL,
 'minutes_extractor', 
 'Extraer información clave de actas de juntas',
 'Extrae la información más importante del siguiente acta de junta/reunión.

Busca específicamente:
- Presidente entrante (nuevo presidente elegido)
- Presidente saliente (presidente anterior que deja el cargo)  
- Administrador (empresa o persona que administra la finca/comunidad)
- Resumen de los temas principales tratados
- Decisiones más importantes tomadas

Si algún dato no aparece en el acta, usa null para ese campo.

Acta: {document_text}',
 '{"input_key": "document_text"}'::jsonb,
 NOW()),

-- Agente 3: Extractor de datos de facturas
(NULL,
 'invoice_extractor',
 'Extraer información comercial de facturas',
 'Extrae los datos comerciales principales de la siguiente factura.

Busca específicamente:
- Nombre del proveedor (quien emite la factura)
- Nombre del cliente (quien recibe/paga la factura)
- Importe total (cantidad numérica, sin símbolo de moneda)
- Fecha de la factura (formato YYYY-MM-DD)
- Categoría o tipo de servicio/producto facturado

Si algún dato no aparece claramente, usa null para ese campo.

Factura: {document_text}',
 '{"input_key": "document_text"}'::jsonb,
 NOW());

-- Verificar que los agentes se han creado correctamente
SELECT 
  name,
  purpose,
  LEFT(prompt_template, 100) as prompt_preview,
  created_at
FROM agents 
WHERE organization_id IS NULL
ORDER BY created_at;

-- Mostrar estadísticas
SELECT COUNT(*) as total_agents FROM agents WHERE organization_id IS NULL;