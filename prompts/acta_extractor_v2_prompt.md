Analiza este ACTA de junta de propietarios y extrae TODOS los metadatos en formato JSON EXACTO.

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
  "topic_presupuesto": true|false,
  "topic_mantenimiento": true|false,
  "topic_administracion": true|false,
  "topic_piscina": true|false,
  "topic_jardin": true|false,
  "topic_limpieza": true|false,
  "topic_balance": true|false,
  "topic_paqueteria": true|false,
  "topic_energia": true|false,
  "topic_normativa": true|false,
  "topic_proveedor": true|false,
  "topic_dinero": true|false,
  "topic_ascensor": true|false,
  "topic_incendios": true|false,
  "topic_porteria": true|false,
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

CONTEXTO TÉCNICO:
- Agente: acta_extractor_v2
- Tabla destino: extracted_minutes  
- Campos obligatorios: document_date, tipo_reunion, comunidad_nombre, summary
- Generado automáticamente: 2025-09-23

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, empezando por { y terminando por }.