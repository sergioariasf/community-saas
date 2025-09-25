-- ARCHIVO: get_agent_prompts.sql
-- PROPÓSITO: Consultar prompts de agentes específicos para análisis y optimización
-- ESTADO: development
-- DEPENDENCIAS: tabla saas_agents
-- OUTPUTS: Prompts de agentes para revisión
-- ACTUALIZADO: 2025-09-22

-- Consultar el prompt del agente factura_extractor_v2
SELECT 
    agent_name,
    agent_prompt,
    length(agent_prompt) as prompt_length,
    created_at,
    updated_at
FROM saas_agents 
WHERE agent_name = 'factura_extractor_v2';

-- También consultar otros agentes relacionados para comparar
SELECT 
    agent_name,
    length(agent_prompt) as prompt_length,
    created_at,
    updated_at
FROM saas_agents 
WHERE agent_name IN (
    'acta_extractor_v2', 
    'contrato_extractor_v1', 
    'factura_extractor_v2',
    'comunicado_extractor_v1'
)
ORDER BY agent_name;