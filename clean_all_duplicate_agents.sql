-- ARCHIVO: clean_all_duplicate_agents.sql
-- PROPÓSITO: Eliminar todos los agentes duplicados manteniendo el más antiguo de cada tipo
-- ESTADO: ready_to_execute
-- DEPENDENCIAS: tabla agents
-- OUTPUTS: Elimina 18 registros duplicados
-- ACTUALIZADO: 2025-09-18

-- Verificar estado actual
SELECT name, count(*) as copies 
FROM agents 
WHERE is_active = true 
GROUP BY name 
HAVING count(*) > 1
ORDER BY name;

-- Limpiar duplicados de albaran_extractor_v1
DELETE FROM agents WHERE id IN ('190187b0-430a-488f-8717-b64bc69059a0', 'a79adedb-d5db-453f-a949-1c70517d4524', '5224f565-11e9-41b4-a33f-0f58a6168cb8');

-- Limpiar duplicados de comunicado_extractor_v1
DELETE FROM agents WHERE id IN ('b86aa692-4e7d-4305-9234-c5d3b4b1aa8c', 'c4ba0fd0-a1df-45bf-87af-fad40d2f7fdb', 'b4491d5b-aef5-4f7c-a0ce-ff8c59a67e41');

-- Limpiar duplicados de contrato_extractor_v1
DELETE FROM agents WHERE id IN ('b2dac9da-be24-4d38-9ea9-e79b8633fbe6', '639c58c2-156a-47ec-9fae-d69864c5da31', '08e25199-2fb9-4094-9629-55246c183ddb');

-- Limpiar duplicados de escritura_extractor_v1
DELETE FROM agents WHERE id IN ('95528e07-392a-4994-b2f5-4a7e12b8971e', '16f40d60-cc6f-4f76-98b7-89f2bbe694cc', 'c74eba11-8a7e-4c4a-8a30-47c86f2376a6');

-- Limpiar duplicados de factura_extractor_v2
DELETE FROM agents WHERE id IN ('5004c0e3-aa3c-41fd-a7ae-e65530572557', 'e466a072-8efc-48b0-b858-00a697a2ea05', 'd5ac9b39-98df-4d4a-ae06-058a68c54907');

-- Limpiar duplicados de presupuesto_extractor_v1
DELETE FROM agents WHERE id IN ('1e8a33bf-640c-4545-97b9-7009f3170b8d', '166d54ea-e9e3-4641-9843-7e6edbaeed88', '5c29d65d-40d0-4572-a9a3-e9ee56acef73');

-- Verificar resultado final
SELECT name, count(*) as copies 
FROM agents 
WHERE is_active = true 
GROUP BY name 
ORDER BY name;