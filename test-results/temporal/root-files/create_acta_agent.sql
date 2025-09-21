-- ARCHIVO: create_acta_agent.sql
-- PROPÓSITO: Crear agente extractor de actas mejorado en tabla agents
-- ESTADO: production
-- DEPENDENCIAS: tabla agents
-- OUTPUTS: Agente acta_extractor_v2 con prompt completo
-- ACTUALIZADO: 2025-09-16

-- Eliminar agente anterior si existe
DELETE FROM agents WHERE name = 'acta_extractor_v2';

-- Insertar agente mejorado para extracción de actas
INSERT INTO agents (
  name,
  purpose, 
  prompt_template,
  variables,
  is_active,
  created_at,
  updated_at
) VALUES (
  'acta_extractor_v2',
  'Extractor completo de metadatos de actas compatible con plantilla UI - incluye 13 temas, estructura detectada y todos los campos necesarios',
  'Analiza este ACTA de junta de propietarios y extrae TODOS los metadatos en formato JSON EXACTO.

TEXTO DEL ACTA:
{document_text}

EXTRAE ESTOS METADATOS (JSON válido, sin texto adicional):

{
  "document_date": "YYYY-MM-DD",
  "tipo_reunion": "ordinaria|extraordinaria",
  "lugar": "lugar completo de la reunión",
  "comunidad_nombre": "nombre completo de la comunidad",
  "president_in": "nombre presidente entrante",
  "president_out": "nombre presidente saliente",
  "administrator": "nombre administrador",
  "summary": "resumen ejecutivo de la reunión",
  "decisions": "decisiones principales tomadas separadas por números (1. decisión 1, 2. decisión 2, etc.)",
  "orden_del_dia": ["punto 1", "punto 2", "punto 3"],
  "acuerdos": ["acuerdo 1", "acuerdo 2", "acuerdo 3"],
  "topic_keywords": ["palabra1", "palabra2", "palabra3"],
  "topic-presupuesto": true|false,
  "topic-mantenimiento": true|false,
  "topic-administracion": true|false,
  "topic-piscina": true|false,
  "topic-jardin": true|false,
  "topic-limpieza": true|false,
  "topic-balance": true|false,
  "topic-paqueteria": true|false,
  "topic-energia": true|false,
  "topic-normativa": true|false,
  "topic-proveedor": true|false,
  "topic-dinero": true|false,
  "topic-ascensor": true|false,
  "topic-incendios": true|false,
  "topic-porteria": true|false,
  "estructura_detectada": {
    "quorum_alcanzado": true|false,
    "propietarios_totales": numero,
    "capitulos": [
      {
        "numero": 1,
        "titulo": "Título capítulo",
        "pagina": 1,
        "subsecciones": [
          {"titulo": "Subsección", "pagina": 1}
        ]
      }
    ],
    "total_paginas": numero,
    "votaciones": [
      {"tema": "tema", "resultado": "aprobado|rechazado", "votos": "mayoría|unanimidad", "pagina": 1}
    ]
  }
}

REGLAS ESTRICTAS:
1. Devuelve SOLO el JSON, sin explicaciones antes ni después
2. Usa comillas dobles para todas las claves y valores string
3. Los campos topic-xxx DEBEN ser booleanos (true/false)
4. Si no encuentras un campo, usa valores por defecto apropiados
5. document_date en formato YYYY-MM-DD
6. Los arrays pueden estar vacíos [] si no hay información
7. estructura_detectada.capitulos debe reflejar la estructura real del documento
8. estructura_detectada.votaciones debe incluir todas las votaciones encontradas
9. Para topic-xxx analiza el contenido y marca true si el tema se menciona o trata
10. decisions debe ser un string con decisiones numeradas (1. decisión 1, 2. decisión 2, etc.)

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, empezando por { y terminando por }.',
  '{
    "document_text": {
      "type": "string",
      "required": true,
      "description": "Texto completo extraído del PDF del acta"
    }
  }',
  true,
  NOW(),
  NOW()
);

-- Verificar inserción
SELECT 
  name,
  purpose,
  LENGTH(prompt_template) as prompt_length,
  variables,
  is_active,
  created_at
FROM agents 
WHERE name = 'acta_extractor_v2';