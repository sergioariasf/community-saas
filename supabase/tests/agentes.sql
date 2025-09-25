  SELECT
      agent_name,
      agent_prompt,
      length(agent_prompt) as prompt_length,
      created_at,
      updated_at
  FROM agents
  WHERE agent_name = 'factura_extractor_v2';