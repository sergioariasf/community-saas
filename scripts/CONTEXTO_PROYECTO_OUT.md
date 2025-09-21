# 📊 CONTEXTO DEL PROYECTO
> Generado automáticamente el 2025-09-16 14:08:38

## 📈 MÉTRICAS DEL PROYECTO
- **Total archivos:** 586
- **Líneas de código:** 159.449
- **Archivos con encabezado:** 79
- **Archivos sin encabezado:** 507
- **Cobertura encabezados:** 13.5%

## 📁 ESTRUCTURA DEL PROYECTO
```
community-saas/
├── package.json
├── CLAUDE.md
├── README.md
├── .env.local
├── tailwind.config.js
├── src/
    ├── hooks/
    │   ├── usePermissions.ts
    │   ├── use-toast.ts
    │   └── use-mobile.ts
    ├── middleware.ts
    ├── types.ts
    ├── scripts/
    │   └── assign-admin-role.sql
    ├── lib/
    │   ├── ingesta/
    │   │   ├── processes/
    │   │   ├── core/
    │   │   │   ├── types.ts
    │   │   │   ├── index.ts
    │   │   │   ├── progressivePipeline.ts
    │   │   │   ├── testProgressivePipeline.ts
    │   │   │   └── progressivePipelineSimple.ts
    │   │   ├── index.ts
    │   │   ├── Ingesta_doc.md
    │   │   ├── storage/
    │   │   │   ├── types.ts
    │   │   │   └── documentsStore.ts
    │   │   ├── test/
    │   │   │   ├── check-document-status.js
    │   │   │   ├── fix-stuck-document.js
    │   │   │   ├── extract-document.js
    │   │   │   ├── clean-all-documents.js
    │   │   │   ├── test-database-real-schema.js
    │   │   │   └── reprocess-document.js
    │   │   ├── utils/
    │   │   ├── database/
    │   │   │   └── migrations/
    │   │   │       └── 001_progressive_pipeline.sql
    │   │   ├── doc_documentos.md/
    │   │   ├── modules/
    │   │   │   ├── classification/
    │   │   │   │   ├── types.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   └── documentClassifier.ts
    │   │   │   ├── storage/
    │   │   │   ├── extraction/
    │   │   │   │   ├── types.ts
    │   │   │   │   ├── index.ts
    │   │   │   │   ├── pdfTextExtraction.ts
    │   │   │   │   └── ocrExtraction.ts
    │   │   │   ├── chunking/
    │   │   │   │   └── textChunker.ts
    │   │   │   ├── metadata/
    │   │   │   │   ├── contracts/
    │   │   │   │   └── extractors/
    │   │   │   └── processing/
    │   │   ├── Documentos_doc.md
    │   │   └── config/
    │   ├── gemini/
    │   │   └── saasAgents.ts
    │   ├── storage/
    │   │   └── supabaseStorage.ts
    │   ├── auth/
    │   │   └── permissions.ts
    │   ├── pdf/
    │   │   ├── googleVision.ts
    │   │   └── textExtraction.ts
    │   ├── utils.ts
    │   ├── database.types.ts
    │   └── safe-action.ts
    ├── app/
    │   ├── (external-pages)/
    │   │   ├── about/
    │   │   │   └── page.tsx
    │   │   └── layout.tsx
    │   ├── api/
    │   │   └── documents/
    │   │       ├── clean-all/
    │   │       │   └── route.ts
    │   │       └── [id]/
    │   │           ├── download/
    │   │           └── route.ts
    │   ├── Banner.tsx
    │   ├── MobileNavigation.tsx
    │   ├── Navbar.tsx
    │   ├── NavLink.tsx
    │   ├── LoginNavLink.tsx
    │   ├── layout.tsx
    │   ├── (dynamic-pages)/
    │   │   ├── (main-pages)/
    │   │   │   ├── PrivateItemsList.tsx
    │   │   │   ├── ItemsList.tsx
    │   │   │   ├── new/
    │   │   │   │   ├── ClientPage.tsx
    │   │   │   │   └── page.tsx
    │   │   │   ├── items/
    │   │   │   │   └── page.tsx
    │   │   │   ├── page.tsx
    │   │   │   ├── (logged-in-pages)/
    │   │   │   │   ├── private-items/
    │   │   │   │   ├── users/
    │   │   │   │   ├── dashboard/
    │   │   │   │   ├── dashboard-test/
    │   │   │   │   ├── incidents/
    │   │   │   │   ├── layout.tsx
    │   │   │   │   ├── private-item/
    │   │   │   │   ├── communities/
    │   │   │   │   └── documents/
    │   │   │   ├── item/
    │   │   │   │   ├── [itemId]/
    │   │   │   │   └── not-found.tsx
    │   │   │   └── CommunitiesList.tsx
    │   │   ├── (login-pages)/
    │   │   │   └── (login-pages)/
    │   │   │       ├── debug-auth/
    │   │   │       ├── forgot-password/
    │   │   │       ├── sign-up/
    │   │   │       ├── auth/
    │   │   │       ├── logout/
    │   │   │       ├── update-password/
    │   │   │       ├── login/
    │   │   │       ├── layout.tsx
    │   │   │       └── ClientLayout.tsx
    │   │   ├── layout.tsx
    │   │   └── DynamicLayoutProviders.tsx
    │   └── ClientLayout.tsx
    ├── constants.ts
    ├── environment.d.ts
    ├── styles/
    │   └── ... (más archivos)
    └── rsc-data/
        └── supabase.ts
    └── ... (más archivos)

├── scripts/
    ├── automate_schema_api.sh
    ├── automate_schema.sh
    ├── contexto_proyecto_plan.md
    ├── create_test_users_real.sql
    ├── step_by_step.sql
    ├── get_current_data.sql
    ├── create_test_users_final.sql
    ├── create_test_users.sql
    ├── contexto_proyecto.js
    └── schema_extractor_direct.js
    └── ... (más archivos)

├── supabase/
    ├── README.md
    ├── migrations/
    │   ├── 20230208104718_private_items.sql
    │   ├── 009_create_comprehensive_test_data.sql
    │   ├── add_missing_columns.sql
    │   ├── fix_rls_recursion.sql
    │   ├── fix_database_schema.sql
    │   ├── database_health_check.sql
    │   ├── 002_progressive_pipeline_compatible.sql
    │   ├── check_db_structure.sql
    │   ├── 010_create_organizations_multi_tenant.sql
    │   ├── 003_extend_existing_documents.sql
    │   ├── 20250911160551_create_documents_system.sql
    │   ├── fix_application_logic_issues.sql
    │   ├── create_incidents_table.sql
    │   ├── fix_database_schema_corrected.sql
    │   └── 010_rollback_organizations_multi_tenant.sql
    │   └── ... (más archivos)
    ├── scripts/
    │   ├── autoamtizar_estado_bbd.md
    │   └── get_full_schema.sql
    ├── instructions/
    │   ├── APPLY_DATABASE_FIXES.md
    │   ├── 010_organizations_migration_guide.md
    │   └── MIGRATION_009_FIX_SUMMARY.md
    ├── seed.sql
    ├── schema/
    │   ├── ai_prompts.sql
    │   ├── document_chunks.sql
    │   ├── document_classifications.sql
    │   ├── document_metadata.sql
    │   └── documents.sql
    ├── status/
    │   └── ... (más archivos)
    ├── tests/
    └── docs/
        ├── get_schema.sql
        ├── migration_analysis.md
        └── database_schema_actual.txt
    └── ... (más archivos)

├── e2e/
    ├── script/
    │   └── Script de Pruebas de UI.sh
    ├── run-document-tests.sh
    ├── about.spec.ts
    ├── document-pipeline-complete-test.spec.ts
    ├── reports/
    │   ├── documents_test_20250914_161730/
    │   │   ├── videos/
    │   │   ├── traces/
    │   │   └── screenshots/
    │   │   └── ... (más archivos)
    │   ├── documents_test_20250914_161805/
    │   │   ├── videos/
    │   │   ├── traces/
    │   │   └── screenshots/
    │   │   └── ... (más archivos)
    │   ├── integration_20250914_205143/
    │   │   └── ... (más archivos)
    │   └── documents_test_20250914_170349/
    │       ├── videos/
    │       ├── traces/
    │       └── screenshots/
    │       └── ... (más archivos)
    ├── document-multi-user-rls-test.spec.ts
    ├── instructions/
    ├── ui-tests/
    │   ├── README.md
    │   ├── test-roles-permissions.spec.ts
    │   ├── quick-permission-test.js
    │   ├── README-ROLES-TESTING.md
    │   ├── test-document-multi-user-rls.js
    │   ├── role-manager.js
    │   ├── test-incident-creation-v2.js
    │   ├── test-social-login-detailed.js
    │   ├── test-google-social-login.js
    │   ├── test-incident-creation.js
    │   ├── test-production-social-login.js
    │   ├── test-production-social-simple.js
    │   └── test-document-pipeline-complete.js
    ├── verify-test-users.js
    └── document-upload.spec.ts
    └── ... (más archivos)

├── credenciales/
    ├── mi-saas-comunidades-vision-api.json
    └── mi-saas-comunidades-ocr.json
    └── ... (más archivos)

├── datos/
    ├── ACTA 19 MAYO 2022.pdf
    ├── acta_prueba.pdf
    ├── acta_prueba_v2.pdf
    ├── ACTA 18 NOVIEMBRE 2022.pdf
    ├── GIMNASIO_2023-1-230230.pdf
    ├── acta_test.pdf
    └── Acta junta extraordinaria 02.06.25.pdf
    └── ... (más archivos)

```

## 📋 ÍNDICE DE ARCHIVOS CON ENCABEZADO
| Archivo | Propósito | Estado | Dependencias | Outputs | Actualizado |
|---------|-----------|--------|--------------|---------|-------------|
| `check_documents_bd.js` | Verificar qué documentos hay en la BD con texto extraído | testing | supabase | Lista de documentos disponibles para testing | 2025-09-16 |
| `create_acta_agent.sql` | Crear agente extractor de actas mejorado en tabla agents | production | tabla agents | Agente acta_extractor_v2 con prompt completo | 2025-09-16 |
| `e2e\document-multi-user-rls-test.spec.ts` | Tests de RLS y permisos multi-usuario para módulo documentos | production | @playwright/test, usuarios test (admin/manager/resident) | Verificación completa de aislamiento por organización y roles | 2025-09-14 |
| `e2e\document-pipeline-complete-test.spec.ts` | Test automatizado completo del pipeline progresivo de 4 niveles con nueva UI | production | @playwright/test, datos/*.pdf, backend pipeline, SimpleSelect, pipeline status | Tests automatizados con screenshots, logs, verificación de pipeline status y botones | 2025-09-15 |
| `e2e\run-document-tests.sh` | Script automatizado para ejecutar tests completos del módulo documentos | production | playwright, npm, servidor Next.js | Reportes HTML, screenshots, logs detallados de testing | 2025-09-14 |
| `e2e\ui-tests\test-document-multi-user-rls.js` | Test RLS multi-usuario siguiendo patrón UI Guardian | production | playwright, usuarios test configurados | Verificación exhaustiva de aislamiento por organización | 2025-09-14 |
| `e2e\ui-tests\test-document-pipeline-complete.js` | Test completo del pipeline progresivo usando patrón UI Guardian | production | playwright, archivos PDF de prueba, servidor Next.js | Test exhaustivo con screenshots y validaciones paso a paso | 2025-09-14 |
| `e2e\verify-test-users.js` | Verificar que los usuarios de prueba existen y tienen acceso correcto | production | @supabase/supabase-js, .env.local | Verificación de usuarios y sus roles/comunidades | 2025-09-14 |
| `scripts\apply-ai-prompts-migration.js` | Aplicar migración de tabla ai_prompts para prompts de IA | production | @supabase/supabase-js, fs | Tabla ai_prompts creada con datos iniciales | 2025-09-15 |
| `scripts\contexto_proyecto_plan.md` | Documentación de la herramienta de contexto del proyecto para LLMs | production | contexto_proyecto.js, CLAUDE.md | Documentación técnica de la herramienta | 2025-09-14 |
| `scripts\contexto_proyecto.js` | Generar contexto completo del proyecto para LLMs de forma eficiente | production | fs, path, child_process (Node.js nativo) | scripts/CONTEXTO_PROYECTO_OUT.md con índice completo | 2025-09-14 |
| `scripts\create_test_users.js` | Testing de RLS (Row Level Security) en progressive pipeline | - | - | - | - |
| `scripts\create_test_users.sql` | Testing de RLS (Row Level Security) en progressive pipeline | - | - | - | - |
| `scripts\test-ai-prompts-table.js` | Verificar si la tabla ai_prompts ya existe y obtener el prompt de ACTA | testing | @supabase/supabase-js | Verificación de tabla ai_prompts existente | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\[id]\page-broken.tsx` | Vista detallada del documento con información del pipeline progresivo | production | @/components/ui, @/data/anon/documents | Vista completa del documento con metadatos y estado del pipeline | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\[id]\page.tsx` | Página simplificada para debug - sin DocumentDetailRenderer complejo | testing | supabase, datos básicos | Debug de la carga de documento | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\[id]\page.tsx.backup` | Vista detallada del documento con información del pipeline progresivo | production | @/components/ui, @/data/anon/documents | Vista completa del documento con metadatos y estado del pipeline | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\actions.ts` | Server Actions para upload y procesamiento progresivo de documentos | development | next-safe-action, supabase, progressive pipeline system | Upload a Storage + Pipeline progresivo nivel 1-4 + React 19 compatibility | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\CleanAllButton.tsx` | Botón para limpiar completamente todos los documentos (BD + Storage) | production | @/components/ui, lucide-react | Botón con confirmación para limpieza completa | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\DocumentsList.tsx` | Lista de documentos con información del pipeline progresivo | production | @/components/ui, @/data/anon/documents | Tabla de documentos con estado real del pipeline | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\page.tsx` | Página principal de gestión de documentos con botón "Borrar Todo" | production | @/components/ui, @/data/anon/documents, CleanAllButton | Vista principal de documentos con funcionalidades de limpieza y subida | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\templates\actas\page.tsx` | Vista detallada específica de la plantilla de ACTAS con demo completo | development | ActaDetailView, datos demo | Preview completo de plantilla de actas | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\templates\comunicados\page.tsx` | Vista detallada específica de la plantilla de COMUNICADOS con demo completo | development | DefaultDetailView, datos demo | Preview completo de plantilla de comunicados | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\templates\contratos\page.tsx` | Vista detallada específica de la plantilla de CONTRATOS con demo completo | development | DefaultDetailView, datos demo | Preview completo de plantilla de contratos | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\templates\facturas\page.tsx` | Vista detallada específica de la plantilla de FACTURAS con demo completo | development | FacturaDetailView, datos demo | Preview completo de plantilla de facturas | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\templates\page.tsx` | Vista de grid con cards de tipos de plantillas de documentos | development | templates registry, componentes UI | Página principal con cards navegables por tipo | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\templates\presupuestos\page.tsx` | Vista detallada específica de la plantilla de PRESUPUESTOS con demo completo | development | DefaultDetailView, datos demo | Preview completo de plantilla de presupuestos | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\test-acta\page.tsx` | Página de prueba para visualizar datos reales de extracted_minutes con plantilla UI | testing | ActaDetailView, supabase/server, extracted_minutes table | Visualización de datos reales del documento "ACTA 19 MAYO 2022.pdf" | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\test-simple\page.tsx` | Página de prueba ultra simple para debuggear autenticación | testing | supabase auth | Debug de autenticación básica | 2025-09-16 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\upload\ClientPage.tsx` | Componente cliente para upload de documentos con React 19 compatibility | development | react-hook-form, SimpleSelect, uploadAndProcessFormData action | UI upload con select nativo + pipeline progresivo | 2025-09-15 |
| `src\app\(dynamic-pages)\(main-pages)\(logged-in-pages)\documents\upload\SimpleSelect.tsx` | Select HTML nativo para bypass React 19 ref issues | development | React | Componente select funcional compatible con React 19 | 2025-09-15 |
| `src\app\api\documents\[id]\download\route.ts` | API para descargar archivos de documentos desde Supabase Storage | production | @/data/anon/documents, @/supabase-clients/server | Descarga directa del archivo PDF | 2025-09-15 |
| `src\app\api\documents\clean-all\route.ts` | API para limpiar completamente todos los documentos (BD + Storage) | production | @supabase/supabase-js | Limpieza completa de documentos para testing | 2025-09-15 |
| `src\components\documents\DocumentDetailRenderer.tsx` | Componente que selecciona y renderiza la plantilla adecuada según el tipo de documento | development | templates registry, tipos de documentos | Renderizado dinámico de plantillas específicas | 2025-09-16 |
| `src\components\documents\templates\ActaDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo ACTA | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para actas con campos específicos | 2025-09-16 |
| `src\components\documents\templates\DefaultDetailView.tsx` | Plantilla genérica para tipos de documento sin plantilla específica | development | @/components/ui | Vista detallada genérica con fallback profesional | 2025-09-16 |
| `src\components\documents\templates\FacturaDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo FACTURA | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para facturas con campos específicos | 2025-09-16 |
| `src\components\documents\templates\index.ts` | Registro centralizado de todas las plantillas de documentos | development | Templates individuales | Registry para mapear tipos de documento a componentes | 2025-09-16 |
| `src\lib\ingesta\core\index.ts` | Índice del core - exporta tipos y interfaces fundamentales | production | types.ts | Tipos centrales para todo el sistema de ingesta | 2025-09-14 |
| `src\lib\ingesta\core\progressivePipeline.ts` | Orquestador inteligente del pipeline progresivo de 4 niveles | Obsoleto por ser complicado y referencias circulares | documentsStore, extraction, classification, metadata, chunking | Pipeline completo con gestión automática de dependencias | 2025-09-15 |
| `src\lib\ingesta\core\progressivePipelineSimple.ts` | Pipeline simplificado para evitar errores de compilación | production | documentsStore, pdf-parse, supabase | Pipeline funcional básico | 2025-09-15 |
| `src\lib\ingesta\core\testProgressivePipeline.ts` | Test integrado completo del pipeline progresivo de 4 niveles | production | progressivePipeline.ts, documentsStore.ts, archivos PDF de prueba | Test exhaustivo con métricas de tiempo, tokens y calidad | 2025-09-14 |
| `src\lib\ingesta\core\types.ts` | Tipos centrales compartidos por todo el sistema de ingesta modular | production | Ninguna (tipos base) | Interfaces TypeScript para extracción, clasificación, metadata, chunking | 2025-09-14 |
| `src\lib\ingesta\Documentos_doc.md` | Documentacion completa del modulo de documentos - estado actual implementado | development | Modulo ingesta, Supabase, Gemini IA | Documentacion tecnica del sistema de gestion de documentos | 2025-09-15 |
| `src\lib\ingesta\index.ts` | Entry point principal del módulo de ingesta documental | production | core/, modules/extraction/, modules/classification | Exporta todas las funcionalidades del pipeline progresivo | 2025-09-14 |
| `src\lib\ingesta\modules\chunking\textChunker.ts` | Segmentación de texto en chunks para vectorización RAG | production | ../../core/types.ts | Texto segmentado con metadatos de posición y overlap | 2025-09-14 |
| `src\lib\ingesta\modules\classification\documentClassifier.ts` | Clasificación de documentos con IA usando Gemini API (optimizada en tokens) | production | @google/generative-ai, types.ts, GEMINI_API_KEY | Clasificación automática (acta/contrato/factura/comunicado/otros) | 2025-09-14 |
| `src\lib\ingesta\modules\classification\index.ts` | Índice del módulo de clasificación con IA | production | types.ts, documentClassifier.ts | Exporta clasificador de documentos y configuración optimizada | 2025-09-14 |
| `src\lib\ingesta\modules\classification\types.ts` | Tipos para clasificación de documentos (acta/contrato/factura/comunicado) | production | Ninguna (tipos base) | Interfaces para DocumentClassificationResult, DocumentType, ClassificationConfig | 2025-09-14 |
| `src\lib\ingesta\modules\extraction\index.ts` | Índice del módulo de extracción - PDF y OCR | production | types.ts, pdfTextExtraction.ts, ocrExtraction.ts | Exporta estrategias de extracción y configuración por defecto | 2025-09-14 |
| `src\lib\ingesta\modules\extraction\ocrExtraction.ts` | Extracción OCR con Google Vision API para PDFs escaneados | production | @google-cloud/vision, fs, credenciales/mi-saas-comunidades-vision-api.json | Texto extraído con scoring de calidad y detección de orientación | 2025-09-14 |
| `src\lib\ingesta\modules\extraction\pdfTextExtraction.ts` | Extracción de texto de PDFs editables con fallback a OCR | production | pdf-parse, fs, child_process, types.ts | Texto extraído con estrategia híbrida (pdf-parse + OCR) | 2025-09-14 |
| `src\lib\ingesta\modules\extraction\types.ts` | Tipos específicos para estrategias de extracción de texto (PDF, OCR) | production | ../../core/types.ts | Interfaces para ExtractionStrategy, DetailedExtractionResult, ExtractionContext | 2025-09-14 |
| `src\lib\ingesta\modules\metadata\contracts\actaContract.ts` | Contrato de validación para metadatos de actas de junta | production | types.ts | ActaMetadataStructure, validadores, extractores de metadatos | 2025-09-14 |
| `src\lib\ingesta\modules\metadata\contracts\index.ts` | Índice de contratos para validación de metadatos | production | types.ts, actaContract.ts | Exporta contratos de validación y estructuras de metadatos | 2025-09-14 |
| `src\lib\ingesta\modules\metadata\contracts\types.ts` | Tipos base para contratos de validación de metadatos | production | Ninguna (tipos base) | Interfaces para BaseMetadataStructure, MetadataExtractor, DocumentType | 2025-09-14 |
| `src\lib\ingesta\modules\metadata\extractors\actaMetadataExtractor.ts` | Extracción inteligente de metadatos de actas con Gemini AI | production | @google/generative-ai, contracts/actaContract.ts, types.ts | Metadatos estructurados (fecha, asistentes, acuerdos, keywords) | 2025-09-14 |
| `src\lib\ingesta\modules\metadata\extractors\types.ts` | Tipos para extractores de metadatos con IA | production | ../contracts/types.ts | Interfaces para extractores de metadatos especializados | 2025-09-14 |
| `src\lib\ingesta\storage\documentsStore.ts` | CRUD operations para las 4 tablas del pipeline progresivo | production | @supabase/supabase-js, types.ts | Funciones de base de datos con RLS por organization_id | 2025-09-14 |
| `src\lib\ingesta\storage\types.ts` | Tipos para almacenamiento en base de datos con pipeline progresivo | production | Schema Supabase (documents, document_metadata, document_chunks) | Interfaces compatibles con tablas existentes + organization_id | 2025-09-14 |
| `src\lib\ingesta\test\check-document-status.js` | Verificar estado completo del pipeline progresivo para un documento específico | production | @supabase/supabase-js, .env.local | Estado detallado de los 4 niveles del pipeline (extracción, clasificación, metadata, chunking) | 2025-09-15 |
| `src\lib\ingesta\test\clean-all-documents.js` | Limpiar completamente todos los documentos de BD y Storage | production | @supabase/supabase-js, .env.local | Base de datos y storage completamente limpio | 2025-09-15 |
| `src\lib\ingesta\test\extract-document.js` | Extraer texto de un documento específico usando pdf-parse (para llamada externa) | production | @supabase/supabase-js, pdf-parse, fs | Extracción de texto de PDF y actualización en BD | 2025-09-15 |
| `src\lib\ingesta\test\fix-stuck-document.js` | Procesar manualmente el documento atascado usando el pipeline progresivo simplificado | production | @supabase/supabase-js, pdf-parse, fs | Procesamiento manual del documento nivel 4 completo | 2025-09-15 |
| `src\lib\ingesta\test\reprocess-document.js` | Reprocesar documento específico usando el pipeline progresivo para debuggear errores | development | @supabase/supabase-js, ProgressivePipeline, .env.local | Reprocesamiento completo de documento con logs detallados | 2025-09-15 |
| `src\lib\ingesta\test\test-database-real-schema.js` | Test completo del pipeline progresivo de 4 niveles con BD real | production | @supabase/supabase-js, pdf-parse, datos/ACTA 19 MAYO 2022.pdf | Verificación completa de extracción, clasificación, metadatos y chunking | 2025-09-14 |
| `supabase_migration_actas.sql` | Migración completa para sistema de agentes y extracción mejorada de actas | production | tablas agents y extracted_minutes existentes | Agente acta_extractor_v2 + tabla extracted_minutes ampliada | 2025-09-16 |
| `supabase\migrations\create_ai_prompts_table.sql` | Crear tabla ai_prompts para gestionar prompts de IA de manera profesional | production | Ninguna (tabla independiente) | Tabla ai_prompts con prompt para extracción de metadatos de ACTA | 2025-09-15 |
| `supabase\schema\ai_prompts.sql` | Tabla para gestionar prompts de IA de manera profesional y versionada | production | Ninguna (tabla independiente) | Gestión centralizada de prompts para Gemini y otros LLMs | 2025-09-15 |
| `supabase\schema\document_chunks.sql` | - | - | Requiere documents.chunking_status = 'completed' | - | - |
| `supabase\schema\document_classifications.sql` | - | - | Requiere documents.classification_status = 'completed' | - | - |
| `supabase\schema\document_metadata.sql` | - | - | Requiere documents.metadata_status = 'completed' | - | - |
| `supabase\schema\documents.sql` | - | - | Tabla base sin dependencias | - | - |
| `test_agent_actas.js` | Test del nuevo agente acta_extractor_v2 desde tabla agents | testing | saasAgents.ts, tabla agents, PDF real | Verificación sistema agentes vs prompt hardcoded | 2025-09-16 |
| `test_agent_con_bd.js` | Test del agente acta_extractor_v2 usando texto ya extraído de BD | testing | saasAgents.ts, supabase, extracted_minutes ampliada | Verificación completa agente → BD → validación | 2025-09-16 |
| `test_agent_simple.js` | Test simple del agente usando solo Supabase y Gemini directo | testing | supabase, gemini, extracted_minutes ampliada | Verificación agente → BD → validación completa | 2025-09-16 |
| `test_extraccion_acta_real.js` | Test de extracción usando PDF real ACTA 19 MAYO 2022 con prompt mejorado | testing | pdf-parse, Gemini AI, datos/ACTA 19 MAYO 2022.pdf | Verificación extracción compatible con plantilla UI actas | 2025-09-16 |
| `test_extraccion_acta.js` | Test para verificar extracción de datos compatibles con plantilla UI actas | testing | actaMetadataExtractor.ts, Gemini AI | Comparación datos actuales vs esperados por UI | 2025-09-16 |
| `test-users-setup.js` | Testing de RLS (Row Level Security) en progressive pipeline | - | - | - | - |

## 🔢 ESTIMACIÓN DE TOKENS
- **Palabras en este reporte:** 3231
- **Tokens estimados:** ~4201
- **Costo aproximado GPT-4:** $0.1260

---
*Generado por contexto_proyecto.js - 2025-09-16 14:08:38*
