# Supabase - Community SaaS

## 📁 Estructura de Directorios

```
supabase/
├── docs/                    # Documentación y análisis
│   ├── database_schema_actual.txt   # Schema actual de tu DB
│   └── get_schema.sql              # Queries para obtener info
├── scripts/                 # Scripts de utilidad y análisis
│   ├── get_full_schema.sql         # Obtener schema completo
│   ├── test_connection.sql         # Test conexión DB
│   └── backup_data.sql             # Backup datos antes migración
├── migrations/              # Migraciones SQL (orden cronológico)
│   ├── [existentes...]            # Tus migraciones actuales
│   └── 001_progressive_pipeline.sql # Nueva migración pipeline
├── schema/                  # Esquemas individuales por tabla
│   ├── documents.sql              # Tabla principal
│   ├── document_classifications.sql # Clasificaciones (nivel≥2)
│   ├── document_metadata.sql      # Metadatos JSON (nivel≥3)
│   └── document_chunks.sql        # Chunks + RAG (nivel≥4)
├── tests/                   # Tests de BD
│   ├── test_pipeline_integration.sql # Test completo pipeline
│   ├── test_rls_policies.sql         # Test permisos
│   └── test_performance.sql          # Test rendimiento
└── config.toml              # Config Supabase CLI
```

## 🚀 Comandos Útiles

### Obtener Schema Actual
```bash
# En Supabase SQL Editor:
# Ejecutar: supabase/scripts/get_full_schema.sql
# Pegar resultados en: docs/database_schema_actual.txt
```

### Aplicar Migración Nueva
```bash
# 1. Revisar compatibilidad
cat supabase/docs/database_schema_actual.txt

# 2. Aplicar migración pipeline progresivo
# En SQL Editor ejecutar: supabase/migrations/001_progressive_pipeline.sql
```

### Test de Funcionalidad
```bash
# Test RLS policies
psql -f supabase/tests/test_rls_policies.sql

# Test pipeline completo
psql -f supabase/tests/test_pipeline_integration.sql
```

## 📋 Estado Actual

- ✅ **pgvector habilitado** (funciones vector detectadas)
- ✅ **Tablas base:** communities, user_roles, incidents, organizations
- ✅ **RLS activo** (policies detectadas)
- 🔄 **Schema analysis:** Pendiente completar info en database_schema_actual.txt
- 📋 **Migration ready:** 001_progressive_pipeline.sql preparada

## 🎯 Próximos Pasos

1. Completar schema analysis (ejecutar get_full_schema.sql)
2. Revisar compatibilidad de migración
3. Aplicar progressive pipeline migration
4. Crear storage layer TypeScript
5. Implementar progressive pipeline logic