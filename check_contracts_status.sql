-- ARCHIVO: check_contracts_status.sql
-- PROPÓSITO: Verificar estado completo de soporte para contratos
-- ESTADO: development
-- DEPENDENCIAS: extracted_contracts, agents
-- OUTPUTS: Status de tabla y agente de contratos
-- ACTUALIZADO: 2025-09-20

-- 1. Verificar estructura de tabla extracted_contracts
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'extracted_contracts' 
ORDER BY ordinal_position;

-- 2. Verificar si existe agente extractor de contratos
SELECT 
    name, 
    agent_type,
    LEFT(prompt_template, 200) as prompt_preview
FROM agents 
WHERE name ILIKE '%contrato%' 
   OR agent_type ILIKE '%contrato%';

-- 3. Verificar todos los agentes extractores disponibles
SELECT 
    name, 
    agent_type
FROM agents 
WHERE agent_type ILIKE '%extractor%'
ORDER BY name;

-- 4. Contar registros en tabla extracted_contracts
SELECT COUNT(*) as total_contracts FROM extracted_contracts;

-- 5. Ver un ejemplo de registro si existe
SELECT 
    id,
    document_id,
    titulo_contrato,
    parte_a,
    parte_b,
    importe_total,
    created_at
FROM extracted_contracts 
ORDER BY created_at DESC 
LIMIT 1;