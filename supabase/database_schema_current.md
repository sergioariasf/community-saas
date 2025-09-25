# 🗄️ Database Schema - Community SaaS (COMPLETO)

**Última actualización:** 2025-09-22T18:28:54.965Z  
**Generado automáticamente por:** supabase/scripts/update-database-schema.js  
**Para:** Contexto completo de programación

---

## 📊 RESUMEN EJECUTIVO

- **17 tablas totales** (14 BASE TABLE + 2 VIEW)
- **238 columnas** en total
- **22 políticas RLS** activas
- **23 foreign keys** definidas
- **80 índices** para optimización
- **10 agentes IA** activos

## 📋 TODAS LAS TABLAS

| Tabla | Tipo | Insertable | Descripción |
|-------|------|------------|-------------|
| **------------------------** | ---------- | ------------------ |  |
| **agents** | BASE TABLE | YES | 🤖 Agentes IA |
| **communities** | BASE TABLE | YES | 🏘️ Comunidades |
| **document_chunks** | BASE TABLE | YES |  |
| **document_classifications** | BASE TABLE | YES |  |
| **document_metadata** | BASE TABLE | YES |  |
| **documents** | BASE TABLE | YES | 📄 Sistema de documentos |
| **extracted_invoices** | BASE TABLE | YES | 🎯 Metadatos extraídos |
| **extracted_minutes** | BASE TABLE | YES | 🎯 Metadatos extraídos |
| **incidents** | BASE TABLE | YES | ⚠️ Sistema incidencias |
| **incidents_summary** | VIEW | NO | ⚠️ Sistema incidencias |
| **items** | BASE TABLE | YES |  |
| **organization_dashboard** | VIEW | NO | 🏢 Multi-tenant |
| **organizations** | BASE TABLE | YES | 🏢 Multi-tenant |
| **private_items** | BASE TABLE | YES |  |
| **user_roles** | BASE TABLE | YES |  |
| **vector_embeddings** | BASE TABLE | YES |  |

## 📄 ESTRUCTURA CRÍTICA: documents

| Columna | Tipo | Nullable | Propósito |
|---------|------|----------|----------|
| id | string | NO |  |
| organization_id | string | NO |  |
| community_id | string | NO |  |
| filename | string | NO |  |
| file_path | string | NO |  |
| file_size | number | NO |  |
| file_hash | string | NO |  |
| document_type | string | NO |  |
| legacy_status | string | NO | 🔄 Estado del pipeline |
| created_at | string | NO |  |
| processed_at | object | YES |  |
| extracted_text | string | NO |  |
| text_length | number | NO |  |
| page_count | number | NO |  |
| processing_level | number | NO |  |
| processing_config | object | NO |  |
| extraction_status | string | NO | 🔄 Estado del pipeline |
| extraction_error | object | YES | ❌ Control de errores |
| extraction_method | object | YES | 📝 Extracción de texto |
| extraction_completed_at | object | YES | ⏱️ Timestamps de procesamiento |
| classification_status | string | NO | 🔄 Estado del pipeline |
| classification_error | object | YES | ❌ Control de errores |
| classification_completed_at | object | YES | ⏱️ Timestamps de procesamiento |
| metadata_status | string | NO | 🔄 Estado del pipeline |
| metadata_error | object | YES | ❌ Control de errores |
| metadata_completed_at | object | YES | ⏱️ Timestamps de procesamiento |
| chunking_status | string | NO | 🔄 Estado del pipeline |
| chunking_error | object | YES | ❌ Control de errores |
| chunking_completed_at | object | YES | ⏱️ Timestamps de procesamiento |
| chunks_count | number | NO |  |
| total_processing_time_ms | number | NO |  |
| total_tokens_used | number | NO |  |
| estimated_cost_usd | number | NO |  |
| processing_started_at | object | YES |  |
| processing_completed_at | object | YES | ⏱️ Timestamps de procesamiento |
| last_processed_by | object | YES |  |
| uploaded_by | string | NO |  |
| mime_type | string | NO |  |
| original_filename | string | NO |  |

## 🔐 POLÍTICAS RLS (Row Level Security)

| Tabla | Política | Comando | Rol | Condición |
|-------|----------|---------|-----|----------|
| undefined | **undefined** | undefined | -------- | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |
| undefined | **undefined** | undefined | {public} | `N/A` |

## 🔗 RELACIONES (Foreign Keys)

| Tabla Origen | Columna | → | Tabla Destino | Columna | Acción |
|--------------|---------|---|---------------|---------|--------|
| undefined | `undefined` | → | undefined | `undefined` | ----------- |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | NO ACTION |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | NO ACTION |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |
| undefined | `undefined` | → | undefined | `undefined` | CASCADE |

## ⚡ ÍNDICES DE RENDIMIENTO

| Tabla | Índice | Columnas | Único | Método |
|-------|--------|----------|-------|--------|
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |
| undefined | `undefined` | N/A | undefined | btree |

## 🤖 AGENTES IA ACTIVOS

### acta_extractor_v2
- **Creado:** 2025-09-16T09:37:20.454407+00:00
- **Estado:** ✅ Activo

### albaran_extractor_v1
- **Creado:** 2025-09-18T08:26:28.908577+00:00
- **Estado:** ✅ Activo

### comunicado_extractor_v1
- **Creado:** 2025-09-18T08:26:28.908577+00:00
- **Estado:** ✅ Activo

### contrato_extractor_v1
- **Creado:** 2025-09-18T08:26:28.908577+00:00
- **Estado:** ✅ Activo

### document_classifier
- **Creado:** 2025-09-11T14:09:20.053324+00:00
- **Estado:** ✅ Activo

### escritura_extractor_v1
- **Creado:** 2025-09-18T08:26:28.908577+00:00
- **Estado:** ✅ Activo

### factura_extractor_v2
- **Creado:** 2025-09-18T08:26:28.908577+00:00
- **Estado:** ✅ Activo

### invoice_extractor
- **Creado:** 2025-09-11T14:09:20.053324+00:00
- **Estado:** ✅ Activo

### minutes_extractor
- **Creado:** 2025-09-11T14:09:20.053324+00:00
- **Estado:** ✅ Activo

### presupuesto_extractor_v1
- **Creado:** 2025-09-18T08:26:28.908577+00:00
- **Estado:** ✅ Activo

## 🎯 METADATOS EXTRAÍDOS

- **extracted_minutes** - Metadatos estructurados
- **extracted_communications** - Metadatos estructurados
- **extracted_contracts** - Metadatos estructurados
- **extracted_invoices** - Metadatos estructurados

---

## 💡 NOTAS PARA PROGRAMACIÓN

1. **Pipeline de documentos:** documents → extracted_* (por tipo)
2. **Seguridad:** RLS activo en todas las tablas críticas
3. **Multi-tenant:** Via organization_id en tablas principales
4. **IA/RAG:** Agentes especializados + document_chunks + vector_embeddings
5. **Estado:** Tracking completo en columnas *_status y *_completed_at

*Este archivo se actualiza automáticamente. No editar manualmente.*
