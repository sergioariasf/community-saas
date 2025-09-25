# 📊 CONTEXTO DEL PROYECTO
> Generado automáticamente el 2025-09-22 10:39:47

## 📈 MÉTRICAS DEL PROYECTO
- **Total archivos:** 748
- **Líneas de código:** 245,024
- **Archivos con encabezado:** 152
- **Archivos sin encabezado:** 596
- **Cobertura encabezados:** 20.3%

## 📁 ESTRUCTURA DEL PROYECTO
```
community-saas/
├── package.json
├── CLAUDE.md
├── README.md
├── .env.local
├── tailwind.config.js
├── src/
    ├── app/
    │   ├── (dynamic-pages)/
    │   │   ├── (login-pages)/
    │   │   │   └── (login-pages)/
    │   │   │       ├── ClientLayout.tsx
    │   │   │       ├── auth/
    │   │   │       ├── debug-auth/
    │   │   │       ├── forgot-password/
    │   │   │       ├── layout.tsx
    │   │   │       ├── login/
    │   │   │       ├── logout/
    │   │   │       ├── sign-up/
    │   │   │       └── update-password/
    │   │   ├── (main-pages)/
    │   │   │   ├── (logged-in-pages)/
    │   │   │   │   ├── chat-ia/
    │   │   │   │   ├── communities/
    │   │   │   │   ├── dashboard/
    │   │   │   │   ├── dashboard-test/
    │   │   │   │   ├── documents/
    │   │   │   │   ├── foro/
    │   │   │   │   ├── incidents/
    │   │   │   │   ├── layout.tsx
    │   │   │   │   ├── private-item/
    │   │   │   │   ├── profile/
    │   │   │   │   ├── settings/
    │   │   │   │   ├── users/
    │   │   │   │   └── usuarios/
    │   │   │   ├── CommunitiesList.tsx
    │   │   │   ├── item/
    │   │   │   │   ├── [itemId]/
    │   │   │   │   └── not-found.tsx
    │   │   │   ├── new/
    │   │   │   │   ├── ClientPage.tsx
    │   │   │   │   └── page.tsx
    │   │   │   └── page.tsx
    │   │   ├── DynamicLayoutProviders.tsx
    │   │   └── layout.tsx
    │   ├── (external-pages)/
    │   │   ├── about/
    │   │   │   └── page.tsx
    │   │   └── layout.tsx
    │   ├── Banner.tsx
    │   ├── ClientLayout.tsx
    │   ├── LoginNavLink.tsx
    │   ├── MobileNavigation.tsx
    │   ├── NavLink.tsx
    │   ├── Navbar.tsx
    │   ├── api/
    │   │   └── documents/
    │   │       ├── [id]/
    │   │       │   ├── download/
    │   │       │   └── route.ts
    │   │       └── clean-all/
    │   │           └── route.ts
    │   ├── layout.tsx
    │   └── test-comunicado/
    │       └── page.tsx
    ├── components/
    │   ├── Auth/
    │   │   ├── Email.tsx
    │   │   ├── EmailAndPassword.tsx
    │   │   ├── EmailConfirmationPendingCard.tsx
    │   │   ├── Icons.tsx
    │   │   ├── Password.tsx
    │   │   ├── RedirectingPleaseWaitCard.tsx
    │   │   └── RenderProviders.tsx
    │   ├── Button/
    │   │   ├── Button.tsx
    │   │   └── index.ts
    │   ├── Footer.tsx
    │   ├── PermissionsDebug.tsx
    │   ├── auth/
    │   │   ├── AuthCodeHandler.tsx
    │   │   ├── GoogleSignIn.tsx
    │   │   └── LogoutButton.tsx
    │   ├── documents/
    │   │   ├── DocumentDetailRenderer.tsx
    │   │   └── templates/
    │   │       ├── ActaDetailView.tsx
    │   │       ├── AlbaranDetailView.tsx
    │   │       ├── ComunicadoDetailView.tsx
    │   │       ├── ContratoDetailView.tsx
    │   │       ├── DefaultDetailView.tsx
    │   │       ├── EscrituraCompraventaDetailView.tsx
    │   │       ├── FacturaDetailView.tsx
    │   │       ├── PresupuestoDetailView.tsx
    │   │       ├── doc_templates.md
    │   │       └── index.ts
    │   ├── navigation/
    │   │   ├── AuthNavLinks.tsx
    │   │   ├── ConditionalNavigation.tsx
    │   │   └── UserDropdown.tsx
    │   └── ui/
    │       ├── Typography/
    │       │   ├── Blockquote.tsx
    │       │   ├── H1.tsx
    │       │   ├── H2.tsx
    │       │   ├── H3.tsx
    │       │   ├── H4.tsx
    │       │   ├── Large.tsx
    │       │   ├── List.tsx
    │       │   ├── P.tsx
    │       │   ├── Small.tsx
    │       │   ├── Subtle.tsx
    │       │   └── index.ts
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       └── collapsible.tsx
    │       └── ... (más archivos)
    ├── constants.ts
    ├── contexts/
    │   └── RouterProgressionContext.tsx
    ├── data/
    │   ├── anon/
    │   │   ├── communities.ts
    │   │   ├── documents.ts
    │   │   ├── incidents.ts
    │   │   ├── incidents_simple.ts
    │   │   └── users.ts
    │   ├── auth/
    │   │   └── auth.ts
    │   └── user/
    │       └── security.ts
    ├── environment.d.ts
    ├── hooks/
    │   ├── use-mobile.ts
    │   ├── use-toast.ts
    │   └── usePermissions.ts
    ├── lib/
    │   ├── auth/
    │   │   └── permissions.ts
    │   ├── database.types.ts
    │   ├── gemini/
    │   │   └── saasAgents.ts
    │   ├── ingesta/
    │   │   ├── config/
    │   │   │   └── agentConfig.ts
    │   │   ├── core/
    │   │   │   ├── RefactoredPipeline.ts
    │   │   │   ├── extraction/
    │   │   │   │   ├── BaseTextExtractor.ts
    │   │   │   │   ├── GeminiFlashExtractor.ts
    │   │   │   │   ├── GoogleVisionExtractor.ts
    │   │   │   │   ├── PdfParseExtractor.ts
    │   │   │   │   ├── TextExtractionFactory.ts
    │   │   │   │   └── index.ts
    │   │   │   ├── progressivePipelineSimple.ts
    │   │   │   ├── strategies/
    │   │   │   │   ├── ActaExtractor.ts
    │   │   │   │   ├── BaseDocumentExtractor.ts
    │   │   │   │   ├── ComunicadoExtractor.ts
    │   │   │   │   ├── ContratoExtractor.ts
    │   │   │   │   ├── DocumentClassifier.ts
    │   │   │   │   ├── DocumentExtractorFactory.ts
    │   │   │   │   ├── FacturaExtractor.ts
    │   │   │   │   └── index.ts
    │   │   │   └── types.ts
    │   │   ├── storage/
    │   │   │   ├── documentsStore.ts
    │   │   │   └── types.ts
    │   │   ├── test/
    │   │   │   ├── check-document-status.js
    │   │   │   ├── clean-all-documents.js
    │   │   │   ├── extract-document.js
    │   │   │   ├── fix-stuck-document.js
    │   │   │   ├── reprocess-document.js
    │   │   │   ├── test-all-real.ts
    │   │   │   ├── test-classification-real.ts
    │   │   │   ├── test-database-real-schema.js
    │   │   │   ├── test-metadata-extraction-only.ts
    │   │   │   ├── test-metadata-real.ts
    │   │   │   ├── test-simple-extraction.js
    │   │   │   ├── test-text-extraction-real.ts
    │   │   │   └── verify-templates-compatibility.ts
    │   │   └── utils/
    │   │       └── agentRetryLogic.ts
    │   ├── pdf/
    │   │   ├── googleVision.ts
    │   │   ├── googleVisionFixed.ts
    │   │   ├── googleVisionWorking.ts
    │   │   └── textExtraction.ts
    │   ├── safe-action.ts
    │   ├── storage/
    │   │   └── supabaseStorage.ts
    │   └── utils.ts
    ├── middleware.ts
    └── rsc-data/
        └── supabase.ts
    └── ... (más archivos)

├── scripts/
    ├── CONTEXTO_PROYECTO_OUT.md
    ├── apply-ai-prompts-migration.js
    ├── automate_schema.sh
    ├── automate_schema_api.sh
    ├── contexto_proyecto.js
    ├── contexto_proyecto_plan.md
    ├── create_test_users.js
    ├── create_test_users.sql
    ├── create_test_users_final.sql
    └── create_test_users_real.sql
    └── ... (más archivos)

├── supabase/
    ├── README.md
    ├── database_schema_current.md
    ├── docs/
    │   ├── get_schema.sql
    │   ├── migration_analysis.md
    │   └── status_supabase.md
    ├── instructions/
    │   ├── 010_organizations_migration_guide.md
    │   ├── APPLY_DATABASE_FIXES.md
    │   └── MIGRATION_009_FIX_SUMMARY.md
    ├── migrations/
    │   ├── 001_clean_and_create_communities.sql
    │   ├── 001_create_communities.sql
    │   ├── 002_progressive_pipeline_compatible.sql
    │   ├── 002_setup_new_project.sql
    │   ├── 003_extend_existing_documents.sql
    │   ├── 003_setup_fixed.sql
    │   ├── 004_add_missing_tables.sql
    │   ├── 005_add_tables_fixed.sql
    │   ├── 006_add_user_roles.sql
    │   ├── 007_add_missing_communities_columns.sql
    │   ├── 008_fix_incidents_rls_policies.sql
    │   ├── 009_create_comprehensive_test_data.sql
    │   ├── 009_create_test_data_fixed.sql
    │   ├── 010_create_organizations_multi_tenant.sql
    │   └── 010_rollback_organizations_multi_tenant.sql
    │   └── ... (más archivos)
    ├── schema/
    │   ├── ai_prompts.sql
    │   ├── document_chunks.sql
    │   ├── document_classifications.sql
    │   ├── document_metadata.sql
    │   └── documents.sql
    ├── schema.sql
    ├── scripts/
    │   ├── autoamtizar_estado_bbd.md
    │   ├── get_full_schema.sql
    │   └── update-database-schema.js
    ├── seed.sql
    └── status/
        └── Agentes existentes.md
        └── ... (más archivos)
    └── ... (más archivos)

├── e2e/
    ├── about.spec.ts
    ├── document-multi-user-rls-test.spec.ts
    ├── document-pipeline-complete-test.spec.ts
    ├── document-upload.spec.ts
    ├── instructions/
    ├── reports/
    │   ├── documents_test_20250914_161730/
    │   │   ├── screenshots/
    │   │   ├── traces/
    │   │   └── videos/
    │   │   └── ... (más archivos)
    │   ├── documents_test_20250914_161805/
    │   │   ├── screenshots/
    │   │   ├── traces/
    │   │   └── videos/
    │   │   └── ... (más archivos)
    │   ├── documents_test_20250914_170349/
    │   │   ├── screenshots/
    │   │   ├── traces/
    │   │   └── videos/
    │   │   └── ... (más archivos)
    │   └── integration_20250914_205143/
    │       └── ... (más archivos)
    ├── run-document-tests.sh
    ├── screenshots/
    │   ├── form-validation-working.png
    │   ├── integration-01-before-login.png
    │   ├── integration-04-before-submit.png
    │   ├── integration-error.png
    │   ├── login-after-submit.png
    │   ├── login-before-submit.png
    │   ├── multi-user-admin-01-login.png
    │   ├── multi-user-admin-ERROR.png
    │   ├── multi-user-manager-01-login.png
    │   ├── multi-user-manager-ERROR.png
    │   ├── multi-user-resident-01-login.png
    │   ├── multi-user-resident-ERROR.png
    │   ├── nivel1-pdf-editable-step1-upload-form.png
    │   ├── pipeline-test-01-login.png
    │   └── pipeline-test-02-documents-list.png
    │   └── ... (más archivos)
    ├── script/
    │   └── Script de Pruebas de UI.sh
    └── ui-tests/
        ├── README-ROLES-TESTING.md
        ├── README.md
        ├── quick-permission-test.js
        ├── role-manager.js
        ├── test-document-multi-user-rls.js
        ├── test-document-pipeline-complete.js
        ├── test-google-social-login.js
        ├── test-incident-creation-v2.js
        ├── test-incident-creation.js
        ├── test-production-social-login.js
        ├── test-production-social-simple.js
        ├── test-roles-permissions.spec.ts
        └── test-social-login-detailed.js
    └── ... (más archivos)

├── credenciales/
    ├── mi-saas-comunidades-ocr.json
    └── mi-saas-comunidades-vision-api.json
    └── ... (más archivos)

├── datos/
    ├── classification/
    │   ├── ACTA_18_NOVIEMBRE_2022_classification.json
    │   ├── ACTA_19_MAYO_2022_classification.json
    │   ├── Acta_junta_extraordinaria_02_06_25_classification.json
    │   ├── Comunicado-_INFORMACI_N_RELACIONADA_CONTADORES_LECTURA_DE_SUNFLOWER_C_P___AMARA_HOMES__classification.json
    │   ├── Contrato_OLAQUA_Piscinas_classification.json
    │   ├── GIMNASIO_2023-1-230230_classification.json
    │   ├── acta_prueba_classification.json
    │   ├── acta_prueba_v2_classification.json
    │   ├── acta_test_classification.json
    │   ├── albaran_classification.json
    │   ├── classification_summary_real.json
    │   ├── escritura_D102B_classification.json
    │   ├── factura_classification.json
    │   └── presupuesto_classification.json
    ├── extractions/
    │   ├── ACTA_18_NOVIEMBRE_2022_extraction.json
    │   ├── ACTA_19_MAYO_2022_extraction.json
    │   ├── Acta_junta_extraordinaria_02_06_25_extraction.json
    │   ├── Comunicado-_INFORMACI_N_RELACIONADA_CONTADORES_LECTURA_DE_SUNFLOWER_C_P___AMARA_HOMES__extraction.json
    │   ├── Contrato_OLAQUA_Piscinas_extraction.json
    │   ├── GIMNASIO_2023-1-230230_extraction.json
    │   ├── albaran_extraction.json
    │   ├── escritura_D102B_extraction.json
    │   └── presupuesto_extraction.json
    ├── failed/
    ├── metadata/
    │   ├── ACTA_18_NOVIEMBRE_2022_metadata_error.json
    │   ├── ACTA_19_MAYO_2022_metadata_error.json
    │   ├── Acta_junta_extraordinaria_02_06_25_metadata_error.json
    │   ├── Comunicado-_INFORMACI_N_RELACIONADA_CONTADORES_LECTURA_DE_SUNFLOWER_C_P___AMARA_HOMES__metadata_error.json
    │   ├── Contrato_OLAQUA_Piscinas_metadata_error.json
    │   ├── GIMNASIO_2023-1-230230_metadata_error.json
    │   ├── acta_prueba_metadata_error.json
    │   ├── acta_prueba_v2_metadata_error.json
    │   ├── acta_test_metadata_error.json
    │   ├── albaran_metadata_error.json
    │   ├── escritura_D102B_metadata_error.json
    │   ├── factura_metadata_error.json
    │   ├── metadata_summary_real.json
    │   └── presupuesto_metadata_error.json
    ├── ocr_ia/
    ├── pdf/
    │   ├── ACTA 18 NOVIEMBRE 2022.pdf
    │   ├── ACTA 19 MAYO 2022.pdf
    │   ├── Acta junta extraordinaria 02.06.25.pdf
    │   ├── Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf
    │   ├── Contrato OLAQUA Piscinas.pdf
    │   ├── GIMNASIO_2023-1-230230.pdf
    │   ├── acta_prueba.pdf
    │   ├── acta_prueba_v2.pdf
    │   ├── acta_test.pdf
    │   ├── albaran.pdf
    │   ├── escritura_D102B.pdf
    │   ├── factura.pdf
    │   └── presupuesto.pdf
    ├── pipeline_summary_complete.json
    ├── pruebas/
    │   └── follon.pdf
    │   └── ... (más archivos)
    └── txt/
        ├── ACTA_18_NOVIEMBRE_2022.txt
        ├── ACTA_19_MAYO_2022.txt
        ├── Acta_junta_extraordinaria_02_06_25.txt
        ├── Comunicado-_INFORMACI_N_RELACIONADA_CONTADORES_LECTURA_DE_SUNFLOWER_C_P___AMARA_HOMES_.txt
        ├── Contrato_OLAQUA_Piscinas.txt
        ├── GIMNASIO_2023-1-230230.txt
        ├── acta_prueba.txt
        ├── acta_prueba_v2.txt
        ├── acta_test.txt
        ├── albaran.txt
        ├── escritura_D102B.txt
        ├── extraction_summary.json
        ├── extraction_summary_real.json
        ├── factura.txt
        └── presupuesto.txt
    └── ... (más archivos)

```

## 📋 ÍNDICE DE ARCHIVOS CON ENCABEZADO
| Archivo | Propósito | Estado | Dependencias | Outputs | Actualizado |
|---------|-----------|--------|--------------|---------|-------------|
| `check_contracts_status_fixed.sql` | Verificar estado completo de soporte para contratos (sin agent_type) | development | extracted_contracts, agents | Status de tabla y agente de contratos | 2025-09-20 |
| `check_contracts_status.sql` | Verificar estado completo de soporte para contratos | development | extracted_contracts, agents | Status de tabla y agente de contratos | 2025-09-20 |
| `clean_all_duplicate_agents.sql` | Eliminar todos los agentes duplicados manteniendo el más antiguo de cada tipo | ready_to_execute | tabla agents | Elimina 18 registros duplicados | 2025-09-18 |
| `debug_rls_invoices.js` | Verificar y arreglar RLS policies para extracted_invoices | debugging | supabase | Análisis de políticas RLS y propuesta de fix | 2025-09-20 |
| `docs/doc_documentos.md` | Documentación completa del exitoso desarrollo del módulo de documentos para uso en futuros desarrollos | production | Sistema completamente implementado y validado en http://localhost:3001/documents | Guía completa de implementación paso a paso como referencia para futuros módulos | 2025-09-16 |
| `e2e/document-multi-user-rls-test.spec.ts` | Tests de RLS y permisos multi-usuario para módulo documentos | production | @playwright/test, usuarios test (admin/manager/resident) | Verificación completa de aislamiento por organización y roles | 2025-09-14 |
| `e2e/document-pipeline-complete-test.spec.ts` | Test automatizado completo del pipeline progresivo de 4 niveles con nueva UI | production | @playwright/test, datos/*.pdf, backend pipeline, SimpleSelect, pipeline status | Tests automatizados con screenshots, logs, verificación de pipeline status y botones | 2025-09-15 |
| `e2e/run-document-tests.sh` | Script automatizado para ejecutar tests completos del módulo documentos | production | playwright, npm, servidor Next.js | Reportes HTML, screenshots, logs detallados de testing | 2025-09-14 |
| `e2e/ui-tests/test-document-multi-user-rls.js` | Test RLS multi-usuario siguiendo patrón UI Guardian | production | playwright, usuarios test configurados | Verificación exhaustiva de aislamiento por organización | 2025-09-14 |
| `e2e/ui-tests/test-document-pipeline-complete.js` | Test completo del pipeline progresivo usando patrón UI Guardian | production | playwright, archivos PDF de prueba, servidor Next.js | Test exhaustivo con screenshots y validaciones paso a paso | 2025-09-14 |
| `e2e/verify-test-users.js` | Verificar que los usuarios de prueba existen y tienen acceso correcto | production | @supabase/supabase-js, .env.local | Verificación de usuarios y sus roles/comunidades | 2025-09-14 |
| `fix_document_types_constraint.sql` | Actualizar constraint de document_type para permitir todos los tipos nuevos | testing | tabla documents | Constraint actualizado para permitir todos los tipos de documentos | 2025-09-18 |
| `fix_extraction_method_constraint.js` | Arreglar constraint extraction_method para permitir nuevos valores | fixing | supabase | SQL para actualizar constraint | 2025-09-20 |
| `fix_facturas_complete.js` | Corregir tabla extracted_invoices y agente para campos faltantes de plantilla | fixing | supabase | SQL para añadir campos + prompt actualizado | 2025-09-20 |
| `get_extracted_communications_structure.sql` | Ver estructura completa de la tabla extracted_communications | development | Supabase database | Información detallada de columnas y estructura | 2025-09-19 |
| `get_extracted_invoices_structure.sql` | Ver estructura completa de la tabla extracted_invoices | development | Supabase database | Información detallada de columnas y estructura | 2025-09-19 |
| `scripts/apply-ai-prompts-migration.js` | Aplicar migración de tabla ai_prompts para prompts de IA | production | @supabase/supabase-js, fs | Tabla ai_prompts creada con datos iniciales | 2025-09-15 |
| `scripts/contexto_proyecto_plan.md` | Documentación de la herramienta de contexto del proyecto para LLMs | production | contexto_proyecto.js, CLAUDE.md | Documentación técnica de la herramienta | 2025-09-14 |
| `scripts/contexto_proyecto.js` | Generar contexto completo del proyecto para LLMs de forma eficiente | production | fs, path, child_process (Node.js nativo) | scripts/CONTEXTO_PROYECTO_OUT.md con índice completo | 2025-09-14 |
| `scripts/create_test_users.js` | Testing de RLS (Row Level Security) en progressive pipeline | - | - | - | - |
| `scripts/create_test_users.sql` | Testing de RLS (Row Level Security) en progressive pipeline | - | - | - | - |
| `scripts/test-ai-prompts-table.js` | Verificar si la tabla ai_prompts ya existe y obtener el prompt de ACTA | testing | @supabase/supabase-js | Verificación de tabla ai_prompts existente | 2025-09-15 |
| `src/app/(dynamic-pages)/(login-pages)/(login-pages)/auth/Auth.tsx` | Componente unificado de autenticación con toggle login/registro | development | Auth components, data/auth/auth, UI components | Interface de autenticación unificada | 2025-09-16 |
| `src/app/(dynamic-pages)/(login-pages)/(login-pages)/auth/page.tsx` | Página unificada de autenticación con toggle entre login/registro | development | Auth.tsx, zod, search params | Página de autenticación unificada | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/chat-ia/ChatIAContent.tsx` | Componente placeholder para Chat IA con información de desarrollo futuro | development | UI components, User data | Interface placeholder de Chat IA | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/chat-ia/page.tsx` | Página placeholder para Chat IA - desarrollo futuro | development | UI components | Página placeholder de Chat IA | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/[id]/page-broken.tsx` | Vista detallada del documento con información del pipeline progresivo | production | @/components/ui, @/data/anon/documents | Vista completa del documento con metadatos y estado del pipeline | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/[id]/page.tsx` | Página simplificada para debug - sin DocumentDetailRenderer complejo | testing | supabase, datos básicos | Debug de la carga de documento | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/[id]/page.tsx.backup` | Vista detallada del documento con información del pipeline progresivo | production | @/components/ui, @/data/anon/documents | Vista completa del documento con metadatos y estado del pipeline | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/actions.ts` | Server Actions para upload y procesamiento progresivo de documentos | development | next-safe-action, supabase, progressive pipeline system | Upload a Storage + Pipeline progresivo nivel 1-4 + React 19 compatibility | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/CleanAllButton.tsx` | Botón para limpiar completamente todos los documentos (BD + Storage) | production | @/components/ui, lucide-react | Botón con confirmación para limpieza completa | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/DocumentsList.tsx` | Lista de documentos con información del pipeline progresivo | production | @/components/ui, @/data/anon/documents | Tabla de documentos con estado real del pipeline | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/page.tsx` | Página principal de gestión de documentos con botón "Borrar Todo" | production | @/components/ui, @/data/anon/documents, CleanAllButton | Vista principal de documentos con funcionalidades de limpieza y subida | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/actas/page.tsx` | Vista detallada específica de la plantilla de ACTAS con demo completo | development | ActaDetailView, datos demo | Preview completo de plantilla de actas | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/albaranes/page.tsx` | Vista detallada específica de la plantilla de ALBARANES con demo completo | development | AlbaranDetailView, datos demo | Preview completo de plantilla de albaranes | 2025-09-18 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/comunicados/page.tsx` | Vista detallada específica de la plantilla de COMUNICADOS VECINOS con demo completo | development | ComunicadoDetailView, datos demo | Preview completo de plantilla de comunicados | 2025-09-18 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/contratos/page.tsx` | Vista detallada específica de la plantilla de CONTRATOS con demo completo | development | ContratoDetailView, datos demo | Preview completo de plantilla de contratos | 2025-09-18 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/escrituras/page.tsx` | Vista detallada específica de la plantilla de ESCRITURAS DE COMPRAVENTA con demo completo | development | EscrituraCompraventaDetailView, datos demo | Preview completo de plantilla de escrituras de compraventa | 2025-09-18 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/facturas/page.tsx` | Vista detallada específica de la plantilla de FACTURAS con demo completo | development | FacturaDetailView, datos demo | Preview completo de plantilla de facturas | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/page.tsx` | Vista de grid con cards de tipos de plantillas de documentos | development | templates registry, componentes UI | Página principal con cards navegables por tipo | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/templates/presupuestos/page.tsx` | Vista detallada específica de la plantilla de PRESUPUESTOS con demo completo | development | PresupuestoDetailView, datos demo | Preview completo de plantilla de presupuestos | 2025-09-18 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/test-acta/page.tsx` | Página de prueba para visualizar datos reales de extracted_minutes con plantilla UI | testing | ActaDetailView, supabase/server, extracted_minutes table | Visualización de datos reales del documento "ACTA 19 MAYO 2022.pdf" | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/test-comunicado-simple/page.tsx` | Página de test simple para comunicado SIN autenticación | testing | Ninguna - datos hardcoded del test exitoso | Vista simple de datos extraídos por el agente | 2025-09-18 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/test-comunicado/page.tsx` | Página de test para comunicado siguiendo metodología exitosa de actas | testing | ComunicadoDetailView, datos reales de extracted_communications | Validación UI con datos reales de comunicado | 2025-09-18 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/test-simple/page.tsx` | Página de prueba ultra simple para debuggear autenticación | testing | supabase auth | Debug de autenticación básica | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/upload/ClientPage.tsx` | Componente cliente para upload de documentos con React 19 compatibility | development | react-hook-form, SimpleSelect, uploadAndProcessFormData action | UI upload con select nativo + pipeline progresivo | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/upload/SimpleSelect.tsx` | Select HTML nativo para bypass React 19 ref issues | development | React | Componente select funcional compatible con React 19 | 2025-09-15 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/foro/ForoContent.tsx` | Componente placeholder para Foro con información de desarrollo futuro | development | UI components, User data | Interface placeholder de Foro | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/foro/page.tsx` | Página placeholder para Foro - desarrollo futuro | development | UI components | Página placeholder de Foro | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/profile/page.tsx` | Página de perfil de usuario con información personal y roles | development | Supabase, UI components | Página de perfil del usuario | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/profile/ProfileContent.tsx` | Componente de contenido del perfil de usuario | development | UI components, User data | Interface de perfil de usuario | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/settings/page.tsx` | Página de configuración de la herramienta y preferencias de usuario | development | Supabase, UI components | Página de configuración del sistema | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/settings/SettingsContent.tsx` | Componente de configuración de la herramienta y preferencias | development | UI components, User data | Interface de configuración del sistema | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/usuarios/page.tsx` | Página principal de gestión de usuarios y roles | development | Supabase, UI components | Página de gestión de usuarios | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/usuarios/UsuariosContent.tsx` | Componente principal de gestión de usuarios con tabla y acciones | development | UI components, User data | Interface completa de gestión de usuarios | 2025-09-16 |
| `src/app/(dynamic-pages)/(main-pages)/page.tsx` | Landing page principal con estrategia de conversión de IA | development | UI components, Lucide icons | Página de aterrizaje optimizada para conversión | 2025-09-16 |
| `src/app/api/documents/[id]/download/route.ts` | API para descargar archivos de documentos desde Supabase Storage | production | @/data/anon/documents, @/supabase-clients/server | Descarga directa del archivo PDF | 2025-09-15 |
| `src/app/api/documents/clean-all/route.ts` | API para limpiar completamente todos los documentos (BD + Storage) | production | @supabase/supabase-js | Limpieza completa de documentos para testing | 2025-09-15 |
| `src/app/test-comunicado/page.tsx` | Página de test pública para comunicado - sin autenticación | testing | Ninguna - datos hardcoded del test exitoso | Vista simple de datos extraídos por el agente | 2025-09-19 |
| `src/components/documents/DocumentDetailRenderer.tsx` | Componente que selecciona y renderiza la plantilla adecuada según el tipo de documento | development | templates registry, tipos de documentos | Renderizado dinámico de plantillas específicas | 2025-09-16 |
| `src/components/documents/templates/ActaDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo ACTA | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para actas con campos específicos | 2025-09-16 |
| `src/components/documents/templates/AlbaranDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo ALBARÁN | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para albaranes con campos específicos | 2025-09-18 |
| `src/components/documents/templates/ComunicadoDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo COMUNICADO VECINOS | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para comunicados con campos específicos | 2025-09-18 |
| `src/components/documents/templates/ContratoDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo CONTRATO | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para contratos con campos específicos | 2025-09-18 |
| `src/components/documents/templates/DefaultDetailView.tsx` | Plantilla genérica para tipos de documento sin plantilla específica | development | @/components/ui | Vista detallada genérica con fallback profesional | 2025-09-16 |
| `src/components/documents/templates/EscrituraCompraventaDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo ESCRITURA DE COMPRAVENTA | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para escrituras de compraventa con campos específicos | 2025-09-18 |
| `src/components/documents/templates/FacturaDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo FACTURA | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para facturas con campos específicos | 2025-09-16 |
| `src/components/documents/templates/index.ts` | Registro centralizado de todas las plantillas de documentos | development | Templates individuales | Registry para mapear tipos de documento a componentes | 2025-09-16 |
| `src/components/documents/templates/PresupuestoDetailView.tsx` | Plantilla específica para mostrar detalles de documentos tipo PRESUPUESTO | development | @/components/ui, @/data/anon/documents | Vista detallada optimizada para presupuestos con campos específicos | 2025-09-18 |
| `src/components/navigation/ConditionalNavigation.tsx` | Muestra ExternalNavigation solo cuando el usuario NO está logueado | development | Supabase client, ExternalNavigation | Navegación condicional basada en estado de autenticación | 2025-09-16 |
| `src/components/navigation/UserDropdown.tsx` | Dropdown de usuario con opciones de perfil, configuración y logout | development | UI components, auth actions, supabase client | Menú dropdown de usuario | 2025-09-16 |
| `src/lib/ingesta/config/agentConfig.ts` | Configuración centralizada para agentes, tokens y timeouts - compartida entre test y producción | production | ninguna | Configuraciones consistentes para todo el sistema | 2025-09-22 |
| `src/lib/ingesta/core/extraction/BaseTextExtractor.ts` | Interfaz base para todas las estrategias de extracción de texto | development | Ninguna (interfaz base) | Interfaz común para extractores de texto | 2025-09-21 |
| `src/lib/ingesta/core/extraction/GeminiFlashExtractor.ts` | Extractor TODO-EN-UNO usando Gemini Flash para OCR + Classification + Metadata | development | BaseTextExtractor, saasAgents | Procesamiento completo directo a BD (bypass pipeline normal) | 2025-09-21 |
| `src/lib/ingesta/core/extraction/GoogleVisionExtractor.ts` | Extractor de texto usando Google Vision OCR para PDFs escaneados | development | BaseTextExtractor, @google-cloud/vision | Texto extraído usando OCR de Google Vision | 2025-09-21 |
| `src/lib/ingesta/core/extraction/index.ts` | Exportación central de todas las estrategias de extracción de texto | development | Todos los extractores y factory | Interfaz unificada para el sistema de extracción de texto | 2025-09-21 |
| `src/lib/ingesta/core/extraction/PdfParseExtractor.ts` | Extractor de texto usando pdf-parse con proceso externo | development | BaseTextExtractor, fs, child_process | Texto extraído de PDFs usando pdf-parse | 2025-09-21 |
| `src/lib/ingesta/core/extraction/TextExtractionFactory.ts` | Factory para crear y orquestar extractores de texto | development | BaseTextExtractor, extractores específicos | Selección automática de estrategia de extracción óptima | 2025-09-21 |
| `src/lib/ingesta/core/progressivePipelineSimple.ts` | Pipeline simplificado para evitar errores de compilación | production | documentsStore, pdf-parse, supabase | Pipeline funcional básico | 2025-09-15 |
| `src/lib/ingesta/core/RefactoredPipeline.ts` | Versión refactorizada del pipeline usando Strategy + Factory pattern | development | DocumentsStore, strategies, supabase | Pipeline modular y mantenible | 2025-09-21 |
| `src/lib/ingesta/core/strategies/ActaExtractor.ts` | Estrategia de extracción específica para documentos de tipo Acta | development | BaseDocumentExtractor, saasAgents | Procesamiento de metadatos para Actas | 2025-09-21 |
| `src/lib/ingesta/core/strategies/BaseDocumentExtractor.ts` | Interfaz base para estrategias de extracción de documentos | development | ninguna | Interfaz base para Strategy pattern | 2025-09-21 |
| `src/lib/ingesta/core/strategies/ComunicadoExtractor.ts` | Estrategia de extracción específica para documentos de tipo Comunicado | development | BaseDocumentExtractor, saasAgents | Procesamiento de metadatos para Comunicados | 2025-09-21 |
| `src/lib/ingesta/core/strategies/ContratoExtractor.ts` | Estrategia de extracción específica para documentos de tipo Contrato | development | BaseDocumentExtractor, saasAgents | Procesamiento de metadatos para Contratos | 2025-09-21 |
| `src/lib/ingesta/core/strategies/DocumentClassifier.ts` | Clasificador inteligente de documentos usando texto extraído y agentes IA | development | saasAgents, createSupabaseClient | Tipo de documento clasificado con alta precisión | 2025-09-21 |
| `src/lib/ingesta/core/strategies/DocumentExtractorFactory.ts` | Factory para crear extractores específicos por tipo de documento | development | BaseDocumentExtractor, estrategias específicas | Instancias de extractores según el tipo de documento | 2025-09-21 |
| `src/lib/ingesta/core/strategies/FacturaExtractor.ts` | Estrategia de extracción específica para documentos de tipo Factura | development | BaseDocumentExtractor, saasAgents | Procesamiento de metadatos para Facturas | 2025-09-21 |
| `src/lib/ingesta/core/strategies/index.ts` | Exportación central de todas las estrategias de extracción | development | Todas las estrategias y factory | Interfaz unificada para el sistema de estrategias | 2025-09-21 |
| `src/lib/ingesta/core/types.ts` | Tipos centrales compartidos por todo el sistema de ingesta modular | production | Ninguna (tipos base) | Interfaces TypeScript para extracción, clasificación, metadata, chunking | 2025-09-14 |
| `src/lib/ingesta/storage/documentsStore.ts` | CRUD operations para las 4 tablas del pipeline progresivo | production | @supabase/supabase-js, types.ts | Funciones de base de datos con RLS por organization_id | 2025-09-14 |
| `src/lib/ingesta/storage/types.ts` | Tipos para almacenamiento en base de datos con pipeline progresivo | production | Schema Supabase (documents, document_metadata, document_chunks) | Interfaces compatibles con tablas existentes + organization_id | 2025-09-14 |
| `src/lib/ingesta/test/check-document-status.js` | Verificar estado completo del pipeline progresivo para un documento específico | production | @supabase/supabase-js, .env.local | Estado detallado de los 4 niveles del pipeline (extracción, clasificación, metadata, chunking) | 2025-09-15 |
| `src/lib/ingesta/test/clean-all-documents.js` | Limpiar completamente todos los documentos de BD y Storage | production | @supabase/supabase-js, .env.local | Base de datos y storage completamente limpio | 2025-09-15 |
| `src/lib/ingesta/test/extract-document.js` | Extraer texto de un documento específico usando pdf-parse (para llamada externa) | production | @supabase/supabase-js, pdf-parse, fs | Extracción de texto de PDF y actualización en BD | 2025-09-15 |
| `src/lib/ingesta/test/fix-stuck-document.js` | Procesar manualmente el documento atascado usando el pipeline progresivo simplificado | production | @supabase/supabase-js, pdf-parse, fs | Procesamiento manual del documento nivel 4 completo | 2025-09-15 |
| `src/lib/ingesta/test/reprocess-document.js` | Reprocesar documento específico usando el pipeline progresivo para debuggear errores | development | @supabase/supabase-js, ProgressivePipeline, .env.local | Reprocesamiento completo de documento con logs detallados | 2025-09-15 |
| `src/lib/ingesta/test/test-all-real.ts` | Test COMPLETO ejecutando toda la cadena: EXTRACCIÓN → CLASIFICACIÓN → METADATA | testing | test-text-extraction-real.ts, test-classification-real.ts, test-metadata-real.ts | Ejecuta secuencialmente todos los tests y genera reporte final | 2025-09-22 |
| `src/lib/ingesta/test/test-classification-real.ts` | Test REAL usando DocumentClassifier completo con tsx | testing | DocumentClassifier, tsx, archivos TXT en datos/txt | datos/classification/*.json, classification_summary.json | 2025-09-22 |
| `src/lib/ingesta/test/test-database-real-schema.js` | Test completo del pipeline progresivo de 4 niveles con BD real | production | @supabase/supabase-js, pdf-parse, datos/ACTA 19 MAYO 2022.pdf | Verificación completa de extracción, clasificación, metadatos y chunking | 2025-09-14 |
| `src/lib/ingesta/test/test-metadata-extraction-only.ts` | Test SOLO de extracción de metadata, sin guardado en BD | testing | DocumentExtractorFactory, tsx, archivos TXT+classification | datos/metadata/*.json con datos extraídos (SIN guardado en BD) | 2025-09-22 |
| `src/lib/ingesta/test/test-metadata-real.ts` | Test REAL usando extractores de metadata completos con tsx | testing | DocumentExtractorFactory, tsx, archivos TXT+classification en datos | datos/metadata/*.json, metadata_summary.json | 2025-09-22 |
| `src/lib/ingesta/test/test-simple-extraction.js` | Test simple para generar archivos TXT con PDF-parse y validar estructura propuesta | testing | pdf-parse, archivos PDF en datos/pdf | datos/txt/*.txt, datos/txt/extraction_summary.json | 2025-09-22 |
| `src/lib/ingesta/test/test-text-extraction-real.ts` | Test REAL usando TextExtractionFactory completo con tsx | testing | TextExtractionFactory, tsx, archivos PDF en datos/pdf | datos/txt/*.txt, datos/txt/extraction_summary.json, datos/failed/*.txt | 2025-09-22 |
| `src/lib/ingesta/test/verify-templates-compatibility.ts` | Verificar compatibilidad entre extractores y templates | testing | Templates, datos extraídos | Reporte de compatibilidad | 2025-09-22 |
| `src/lib/ingesta/utils/agentRetryLogic.ts` | Lógica común de retry para llamadas a agentes SaaS con manejo de errores JSON | production | saasAgents.ts | Utility function para llamadas robustas a agentes | 2025-09-22 |
| `supabase/migrations/create_ai_prompts_table.sql` | Crear tabla ai_prompts para gestionar prompts de IA de manera profesional | production | Ninguna (tabla independiente) | Tabla ai_prompts con prompt para extracción de metadatos de ACTA | 2025-09-15 |
| `supabase/schema/ai_prompts.sql` | Tabla para gestionar prompts de IA de manera profesional y versionada | production | Ninguna (tabla independiente) | Gestión centralizada de prompts para Gemini y otros LLMs | 2025-09-15 |
| `supabase/schema/document_chunks.sql` | - | - | Requiere documents.chunking_status = 'completed' | - | - |
| `supabase/schema/document_classifications.sql` | - | - | Requiere documents.classification_status = 'completed' | - | - |
| `supabase/schema/document_metadata.sql` | - | - | Requiere documents.metadata_status = 'completed' | - | - |
| `supabase/schema/documents.sql` | - | - | Tabla base sin dependencias | - | - |
| `supabase/scripts/update-database-schema.js` | Genera automáticamente documentación COMPLETA del esquema de BD para contexto de programación | production | @supabase/supabase-js, dotenv, fs, supabase/status/*.csv | supabase/database_schema_current.md con esquema completo, tablas, RLS, triggers, etc. | 2025-09-22 |
| `test_all_extractors.js` | Test general para todos los agentes extractores especializados | testing | saasAgents.ts, tabla agents, documentos reales | Verificación de todos los sistemas de extracción | 2025-09-18 |
| `test_classifier_debug.js` | Debug del agente clasificador document_classifier | testing | .env.local, supabase, gemini | Test del clasificador con diferentes tipos de texto | 2025-09-19 |
| `test_complete_pipeline_real.js` | Test COMPLETO del pipeline con los 7 tipos de documentos siguiendo metodología exitosa de actas | testing | pdf-parse, Google Gemini, Supabase | Análisis detallado de calidad de prompts y verificación para integración en pipeline | 2025-09-18 |
| `test_corrected_flow.js` | Test con correcciones aplicadas - usar .first() y tipos corregidos | testing | Pipeline real, constraint corregido | Test exitoso para crear páginas UI | 2025-09-18 |
| `test_extractors_simple.js` | Test simplificado de extracción de texto para validar calidad OCR | testing | pdf-parse, fs | Análisis de calidad de extracción de PDFs reales | 2025-09-18 |
| `test_full_pipeline.js` | Test completo del pipeline: PDF → OCR → Agentes → Tablas | testing | pdf-parse, agentes simulados, tablas simuladas | Verificación completa del pipeline de extracción | 2025-09-18 |
| `test_intelligent_classification.js` | Probar el sistema de clasificación inteligente | development | DocumentClassifier, dotenv | Test de clasificación con diferentes tipos de documentos | 2025-09-21 |
| `test_ocr_direct.js` | Test directo de Google Vision OCR con PDF vacío | testing | google-cloud/vision, pdf-parse | Test de funcionalidad OCR | 2025-09-20 |
| `test_real_pipeline.js` | Test REAL del pipeline completo con agentes y tablas de Supabase | testing | pdf-parse, saasAgents.ts, Supabase real | Verificación completa con datos reales en BD | 2025-09-18 |
| `test_real_schema_all_docs.js` | Test de los 7 tipos de documentos usando el pipeline real existente | testing | Pipeline real de ingesta, @supabase/supabase-js, pdf-parse | Verificación completa de agentes y tablas reales con datos reales | 2025-09-18 |
| `test_simple_flow.js` | Test simple del flujo completo con OCR integrado para documentos que funcionan | testing | Pipeline real de ingesta, OCR implementado en src/lib/pdf | Verificación que todo funciona antes de crear páginas UI de test | 2025-09-18 |
| `test_single_document.js` | Test de UN solo documento para análisis detallado de calidad | testing | pdf-parse, Google Gemini, Supabase | Análisis completo de calidad de prompts y extracción | 2025-09-18 |
| `test_standalone_pipeline.js` | Test REAL independiente del pipeline con llamadas directas a APIs | testing | pdf-parse, Google Gemini, Supabase | Verificación completa y análisis de calidad de prompts | 2025-09-18 |
| `test-results/temporal/Documentos_doc.md` | Documentacion completa del modulo de documentos - estado actual implementado | development | Modulo ingesta, Supabase, Gemini IA | Documentacion tecnica del sistema de gestion de documentos | 2025-09-15 |
| `test-results/temporal/index.ts` | Entry point principal del módulo de ingesta documental | production | core/, modules/extraction/, modules/classification | Exporta todas las funcionalidades del pipeline progresivo | 2025-09-14 |
| `test-results/temporal/modules/chunking/textChunker.ts` | Segmentación de texto en chunks para vectorización RAG | production | ../../core/types.ts | Texto segmentado con metadatos de posición y overlap | 2025-09-14 |
| `test-results/temporal/modules/classification/documentClassifier.ts` | Clasificación de documentos con IA usando Gemini API (optimizada en tokens) | production | @google/generative-ai, types.ts, GEMINI_API_KEY | Clasificación automática (acta/contrato/factura/comunicado/otros) | 2025-09-14 |
| `test-results/temporal/modules/classification/index.ts` | Índice del módulo de clasificación con IA | production | types.ts, documentClassifier.ts | Exporta clasificador de documentos y configuración optimizada | 2025-09-14 |
| `test-results/temporal/modules/classification/types.ts` | Tipos para clasificación de documentos (acta/contrato/factura/comunicado) | production | Ninguna (tipos base) | Interfaces para DocumentClassificationResult, DocumentType, ClassificationConfig | 2025-09-14 |
| `test-results/temporal/modules/extraction/index.ts` | Índice del módulo de extracción - PDF y OCR | production | types.ts, pdfTextExtraction.ts, ocrExtraction.ts | Exporta estrategias de extracción y configuración por defecto | 2025-09-14 |
| `test-results/temporal/modules/extraction/ocrExtraction.ts` | Extracción OCR con Google Vision API para PDFs escaneados | production | @google-cloud/vision, fs, credenciales/mi-saas-comunidades-vision-api.json | Texto extraído con scoring de calidad y detección de orientación | 2025-09-14 |
| `test-results/temporal/modules/extraction/pdfTextExtraction.ts` | Extracción de texto de PDFs editables con fallback a OCR | production | pdf-parse, fs, child_process, types.ts | Texto extraído con estrategia híbrida (pdf-parse + OCR) | 2025-09-14 |
| `test-results/temporal/modules/extraction/types.ts` | Tipos específicos para estrategias de extracción de texto (PDF, OCR) | production | ../../core/types.ts | Interfaces para ExtractionStrategy, DetailedExtractionResult, ExtractionContext | 2025-09-14 |
| `test-results/temporal/modules/metadata/contracts/actaContract.ts` | Contrato de validación para metadatos de actas de junta | production | types.ts | ActaMetadataStructure, validadores, extractores de metadatos | 2025-09-14 |
| `test-results/temporal/modules/metadata/contracts/index.ts` | Índice de contratos para validación de metadatos | production | types.ts, actaContract.ts | Exporta contratos de validación y estructuras de metadatos | 2025-09-14 |
| `test-results/temporal/modules/metadata/contracts/types.ts` | Tipos base para contratos de validación de metadatos | production | Ninguna (tipos base) | Interfaces para BaseMetadataStructure, MetadataExtractor, DocumentType | 2025-09-14 |
| `test-results/temporal/modules/metadata/extractors/actaMetadataExtractor.ts` | Extracción inteligente de metadatos de actas con Gemini AI | production | @google/generative-ai, contracts/actaContract.ts, types.ts | Metadatos estructurados (fecha, asistentes, acuerdos, keywords) | 2025-09-14 |
| `test-results/temporal/modules/metadata/extractors/types.ts` | Tipos para extractores de metadatos con IA | production | ../contracts/types.ts | Interfaces para extractores de metadatos especializados | 2025-09-14 |
| `test-results/temporal/progressivePipeline.ts` | Orquestador inteligente del pipeline progresivo de 4 niveles | Obsoleto por ser complicado y referencias circulares | documentsStore, extraction, classification, metadata, chunking | Pipeline completo con gestión automática de dependencias | 2025-09-15 |
| `test-results/temporal/root-files/check_documents_bd.js` | Verificar qué documentos hay en la BD con texto extraído | testing | supabase | Lista de documentos disponibles para testing | 2025-09-16 |
| `test-results/temporal/root-files/create_acta_agent.sql` | Crear agente extractor de actas mejorado en tabla agents | production | tabla agents | Agente acta_extractor_v2 con prompt completo | 2025-09-16 |
| `test-results/temporal/root-files/supabase_migration_actas.sql` | Migración completa para sistema de agentes y extracción mejorada de actas | production | tablas agents y extracted_minutes existentes | Agente acta_extractor_v2 + tabla extracted_minutes ampliada | 2025-09-16 |
| `test-results/temporal/root-files/test_agent_actas.js` | Test del nuevo agente acta_extractor_v2 desde tabla agents | testing | saasAgents.ts, tabla agents, PDF real | Verificación sistema agentes vs prompt hardcoded | 2025-09-16 |
| `test-results/temporal/root-files/test_agent_con_bd.js` | Test del agente acta_extractor_v2 usando texto ya extraído de BD | testing | saasAgents.ts, supabase, extracted_minutes ampliada | Verificación completa agente → BD → validación | 2025-09-16 |
| `test-results/temporal/root-files/test_agent_simple.js` | Test simple del agente usando solo Supabase y Gemini directo | testing | supabase, gemini, extracted_minutes ampliada | Verificación agente → BD → validación completa | 2025-09-16 |
| `test-results/temporal/root-files/test_extraccion_acta_real.js` | Test de extracción usando PDF real ACTA 19 MAYO 2022 con prompt mejorado | testing | pdf-parse, Gemini AI, datos/ACTA 19 MAYO 2022.pdf | Verificación extracción compatible con plantilla UI actas | 2025-09-16 |
| `test-results/temporal/root-files/test_extraccion_acta.js` | Test para verificar extracción de datos compatibles con plantilla UI actas | testing | actaMetadataExtractor.ts, Gemini AI | Comparación datos actuales vs esperados por UI | 2025-09-16 |
| `test-results/temporal/root-files/test-users-setup.js` | Testing de RLS (Row Level Security) en progressive pipeline | - | - | - | - |
| `test-results/temporal/testProgressivePipeline.ts` | Test integrado completo del pipeline progresivo de 4 niveles | production | progressivePipeline.ts, documentsStore.ts, archivos PDF de prueba | Test exhaustivo con métricas de tiempo, tokens y calidad | 2025-09-14 |
| `update_contrato_agent_keywords.sql` | Actualizar prompt del agente contrato_extractor_v1 para detectar keywords específicas | development | tabla agents | Agente mejorado con detección de temas | 2025-09-20 |

## 🔢 ESTIMACIÓN DE TOKENS
- **Palabras en este reporte:** 5,889
- **Tokens estimados:** ~7,656
- **Costo aproximado GPT-4:** $0.2297

---
*Generado por contexto_proyecto.js - 2025-09-22 10:39:47*
