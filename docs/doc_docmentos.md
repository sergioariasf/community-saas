# 📄 MÓDULO DE DOCUMENTOS - CASO DE ÉXITO DOCUMENTADO

Completamente implementado y funcionando en `http://localhost:3001/documents`

## 1. PROPÓSITO DEL MÓDULO

### Objetivo Principal

Crear un **sistema completo de gestión inteligente de documentos PDF** para comunidades de propietarios que:

1. **Permita subida masiva** de documentos (actas, facturas, contratos, comunicados)
2. **Procese automáticamente** el contenido con IA para extraer información estructurada
3. **Organice y visualice** la información de manera intuitiva y profesional
4. **Mantenga aislamiento multi-tenant** por organización y comunidad
5. **Proporcione búsqueda avanzada** por metadatos extraídos automáticamente

## PROCESO

```mermaid

flowchart TD

    %% CAPA DE UPLOAD

    subgraph UPLOAD_LAYER ["📤 CAPA UPLOAD"]

        USER_ACTION[👤 Usuario sube PDF]

        UPLOAD_PAGE[🎨 upload/page.tsx<br/>Formulario subida]

        UPLOAD_FORM[🎨 UploadForm.tsx<br/>Componente upload]

        UPLOAD_ACTION[⚙️ actions.ts<br/>uploadAndProcessFormData]

    end



    %% PIPELINE DE PROCESAMIENTO

    subgraph PIPELINE_CORE ["🏭 PIPELINE PROCESAMIENTO"]

        MAIN_PIPELINE[⚙️ progressivePipelineSimple.ts<br/>🚀 Orquestador principal]

        subgraph PHASE1 ["📝 FASE 1: EXTRACCIÓN"]

            TEXT_FACTORY[⚙️ TextExtractionFactory.ts]

            PDF_PARSE[⚙️ PdfParseExtractor.ts]

            GOOGLE_VISION[⚙️ GoogleVisionExtractor.ts]

            OCR_IA[⚙️ GeminiFlashExtractor.ts]

        end



        subgraph PHASE2 ["🏷️ FASE 2: CLASIFICACIÓN"]

            DOC_CLASSIFIER[⚙️ DocumentClassifier.ts<br/>Detecta tipo: acta/factura/etc]

        end



        subgraph PHASE3 ["📊 FASE 3: METADATA"]

            DOC_FACTORY[⚙️ DocumentExtractorFactory.ts<br/>🟢 100% auto-discovery]

            AGENTES[⚙️ AgentOrchestrator.ts<br/>Elige agente + prompt → JSON]

            LIMPIADOR[⚙️ ResponseParser.ts<br/>Parse + validación]

            VALIDATORS[⚙️ xxxValidator.ts<br/>Limpia datos]

            PERSISTENCE[⚙️ xxxPersistence.ts<br/>Guarda en BD]

        end



        subgraph PHASE4 ["🧩 FASE 4: CHUNKING"]

            CHUNKER[⚙️ textChunker.ts<br/>Fragmenta para RAG]

        end

    end



    %% ALMACENAMIENTO

    subgraph STORAGE_LAYER ["💾 CAPA ALMACENAMIENTO"]

        SUPABASE_FILES[(📁 Supabase Storage<br/>PDFs originales)]

        DOCUMENTS_TABLE[(📋 documents<br/>Metadatos básicos)]

        EXTRACTED_TABLES[(📊 extracted_xxx<br/>Datos específicos)]

        CHUNKS_TABLE[(🧩 document_chunks<br/>Fragmentos RAG)]

    end



    %% CAPA DE DATOS UI

    subgraph DATA_LAYER ["📡 CAPA DATOS UI"]

        DOCUMENTS_STORE[⚙️ documentsStore.ts<br/>🔄 CRUD + Estados<br/>Lista documentos<br/>Filtros + paginación]

    end



    %% CAPA DE VISUALIZACIÓN

    subgraph UI_LAYER ["🎨 CAPA INTERFAZ"]

        %% Lista de documentos

        DOCUMENTS_PAGE[🎨 documents/page.tsx<br/>Página principal lista]

        DOCUMENTS_LIST[🎨 DocumentsList.tsx<br/>Componente lista + filtros]

        %% Detalle de documento

        DETAIL_PAGE["🎨 documents/[id]/page.tsx<br/>Página detalle documento"]

        DETAIL_RENDERER[🎨 DocumentDetailRenderer.tsx<br/>🚀 Router dinámico plantillas]

        %% Plantillas específicas

        ACTA_TEMPLATE[🎨 ActaDetailView.tsx<br/>Plantilla actas]


        DEFAULT_TEMPLATE[🎨 DefaultDetailView.tsx<br/>Plantilla fallback]

    end



    %% FUENTE DE VERDAD

    subgraph SCHEMA_LAYER ["🎯 FUENTE DE VERDAD"]

        SCHEMA_SOURCE[📋 document-types-schema.json<br/>🚀 ÚNICA FUENTE VERDAD<br/>Tipos + campos + UI config]

        SCHEMA_CONFIG[⚙️ schemaBasedConfig.ts<br/>Auto-discovery engine]

        TEMPLATES_INDEX[⚙️ templates/index.ts<br/>Registry dinámico plantillas]

    end



    %% FLUJO PRINCIPAL

    USER_ACTION --> UPLOAD_PAGE --> UPLOAD_FORM --> UPLOAD_ACTION

    UPLOAD_ACTION --> SUPABASE_FILES

    UPLOAD_ACTION --> DOCUMENTS_TABLE

    UPLOAD_ACTION --> MAIN_PIPELINE



    MAIN_PIPELINE --> TEXT_FACTORY --> PDF_PARSE --> GOOGLE_VISION --> OCR_IA

    MAIN_PIPELINE --> DOC_CLASSIFIER

    MAIN_PIPELINE --> DOC_FACTORY --> AGENTES --> LIMPIADOR --> VALIDATORS --> PERSISTENCE

    MAIN_PIPELINE --> CHUNKER

    PERSISTENCE --> EXTRACTED_TABLES

    CHUNKER --> CHUNKS_TABLE



    %% FLUJO UI - LISTA

    DOCUMENTS_PAGE --> DOCUMENTS_STORE

    DOCUMENTS_STORE --> DOCUMENTS_TABLE

    DOCUMENTS_STORE --> DOCUMENTS_LIST



    %% FLUJO UI - DETALLE

    DETAIL_PAGE --> DOCUMENTS_TABLE

    DETAIL_PAGE --> EXTRACTED_TABLES

    DETAIL_PAGE --> DETAIL_RENDERER

    DETAIL_RENDERER --> SCHEMA_CONFIG

    SCHEMA_CONFIG --> SCHEMA_SOURCE

    SCHEMA_CONFIG --> TEMPLATES_INDEX

    DETAIL_RENDERER --> ACTA_TEMPLATE

    DETAIL_RENDERER --> DEFAULT_TEMPLATE



    %% Estilos

    style SCHEMA_SOURCE fill:#ff6b6b,color:#fff

    style MAIN_PIPELINE fill:#4ecdc4,color:#fff

    style DOCUMENTS_STORE fill:#45b7d1,color:#fff

    style DETAIL_RENDERER fill:#96ceb4,color:#fff

    style TEMPLATES_INDEX fill:#feca57,color:#000

```

## ORGANIZACION ARHIVOS

```
src/
├── app/
│   └── (dynamic-pages)/(main-pages)/(logged-in-pages)/documents/
│       ├── actions.ts                        # 🔧 PROCESO - Server Actions para upload
│       ├── page.tsx                          # 🎨 UI - Lista de documentos
│       ├── upload/
│       │   └── page.tsx                      # 🎨 UI - Página de subida de documentos
│       ├── templates/
│       │   └── page.tsx                      # 🎨 UI - Página de plantillas
│       └── [id]/
│           └── page.tsx                      # 🎨 UI - Página detalle de documento
├── components/
│   └── documents/
│       ├── templates/
│       │   ├── FacturaDetailView.tsx         # 🎨 UI - Vista detalle para facturas
│       │   ├── AlbaranDetailView.tsx         # 🎨 UI - Vista detalle para albaranes
│       │   ├── PresupuestoDetailView.tsx     # 🎨 UI - Vista detalle para presupuestos
│       │   ├── ActaDetailView.tsx            # 🎨 UI - Vista detalle para actas
│       │   ├── ContratoDetailView.tsx        # 🎨 UI - Vista detalle para contratos
│       │   ├── ComunicadoDetailView.tsx      # 🎨 UI - Vista detalle para comunicados
│       │   ├── EscrituraCompraventaDetailView.tsx # 🎨 UI - Vista detalle para escrituras
│       │   ├── DefaultDetailView.tsx         # 🎨 UI - Vista genérica para documentos
│       │   └── index.ts                      # 🎨 UI - Exporta vistas detalle
│       ├── DocumentDetailRenderer.tsx        # 🎨 UI - Renderiza vista según tipo
│       ├── DocumentsList.tsx                 # 🎨 UI - Lista de documentos
│       └── UploadForm.tsx                    # 🎨 UI - Formulario de subida
├── lib/
│   ├── ingesta/
│   │   ├── doc_documentos.md                 # 📚 DOC - Documentación del sistema
│   │   ├── core/
│   │   │   ├── progressivePipelineSimple.ts  # 🔧 PROCESO - Pipeline principal (1272 líneas)
│   │   │   ├── strategies/                   # 📁 MÓDULO ESTRATEGIAS DOCUMENTO
│   │   │   │   ├── BaseDocumentExtractor.ts  # 🔧 PROCESO - Interfaz base (65 líneas)
│   │   │   │   ├── ActaExtractor.ts          # 🔧 PROCESO - Estrategia actas (70 líneas)
│   │   │   │   ├── ComunicadoExtractor.ts    # 🔧 PROCESO - Estrategia comunicados (70 líneas)
│   │   │   │   ├── FacturaExtractor.ts       # 🔧 PROCESO - Estrategia facturas (70 líneas)
│   │   │   │   ├── ContratoExtractor.ts      # 🔧 PROCESO - Estrategia contratos (70 líneas)
│   │   │   │   ├── DocumentExtractorFactory.ts # 🔧 PROCESO - Factory Pattern (45 líneas)
│   │   │   │   ├── DocumentClassifier.ts     # 🤖 IA - Clasificador inteligente (275 líneas)
│   │   │   │   └── index.ts                  # 🔧 PROCESO - Exports (18 líneas)
│   │   │   ├── extraction/                   # 📁 MÓDULO EXTRACCIÓN TEXTO
│   │   │   │   ├── BaseTextExtractor.ts      # 🔧 PROCESO - Interfaz base extracción (120 líneas)
│   │   │   │   ├── PdfParseExtractor.ts      # 🔧 PROCESO - PDF-parse strategy (140 líneas)
│   │   │   │   ├── GoogleVisionExtractor.ts  # 🔧 PROCESO - Google Vision OCR (80 líneas)
│   │   │   │   ├── GeminiFlashExtractor.ts   # 🤖 IA - Gemini Flash TODO-EN-UNO (200 líneas)
│   │   │   │   ├── TextExtractionFactory.ts  # 🔧 PROCESO - Factory extracción (150 líneas)
│   │   │   │   └── index.ts                  # 🔧 PROCESO - Exports (12 líneas)
│   │   │   └── types.ts                      # 📋 TIPOS - Tipos del pipeline
│   │   ├── storage/
│   │   │   ├── documentsStore.ts             # 💾 BD - CRUD documentos + metadata
│   │   │   └── types.ts                      # 📋 TIPOS - Tipos del storage
│   │   └── test/
│   │       ├── check-document-status.js      # 🧪 TEST - Revisar estado documentos
│   │       ├── clean-all-documents.js        # 🧪 TEST - Limpiar documentos
│   │       ├── extract-document.js           # 🧪 TEST - Extraer datos documento
│   │       ├── fix-stuck-document.js         # 🧪 TEST - Reparar documentos
│   │       ├── reprocess-document.js         # 🧪 TEST - Reprocesar documentos
│   │       └── test-database-real-schema.js  # 🧪 TEST - Test esquema BD
│   ├── storage/
│   │   └── supabaseStorage.ts                # 💾 BD - Interacción Supabase Storage
│   ├── auth/
│   │   └── permissions.ts                    # 🔐 AUTH - Permisos usuario
│   ├── pdf/
│   │   ├── googleVision.ts                   # 🔧 PROCESO - Google Vision OCR
│   │   ├── googleVisionWorking.ts            # 🔧 PROCESO - Versión funcional
│   │   ├── googleVisionFixed.ts              # 🔧 PROCESO - Versión corregida
│   │   └── textExtraction.ts                 # 🔧 PROCESO - Extracción texto PDFs
│   ├── gemini/
│   │   └── saasAgents.ts                     # 🤖 IA - Agentes SaaS Gemini
│   ├── utils.ts                              # 🛠️ UTIL - Utilidades generales
│   ├── database.types.ts                     # 📋 TIPOS - Tipos BD Supabase
│   └── safe-action.ts                        # 🔐 AUTH - Acciones seguras
```

## TABLAS

| Tipo                | Tablas            | Propósito                             | Campos Clave                            |
| ------------------- | ----------------- | ------------------------------------- | --------------------------------------- |
| **📄 Control**      | `documents`       | Estado pipeline, timestamps, métricas | `*_status`, `*_completed_at`, `total_*` |
| **📊 Metadatos**    | `extracted_*`     | Datos estructurados por tipo          | Específicos por documento               |
| **🤖 IA**           | `agents`          | Prompts Gemini centralizados          | `name`, `prompt_template`, `variables`  |
| **🧩 RAG**          | `document_chunks` | Fragmentos para búsqueda              | `content`, `embedding`, `metadata`      |
| **🏢 Multi-tenant** | `organizations`   | Separación por cliente                | Relaciones FK en todas las tablas       |

```mermaid
erDiagram
    organizations {
        uuid id PK
        text name
        timestamp created_at
        timestamp updated_at
    }

    documents {
        uuid id PK
        uuid organization_id FK
        uuid community_id FK
        text filename
        text file_path
        int file_size
        text file_hash
        text document_type
        text extraction_status
        text classification_status
        text metadata_status
        text chunking_status
        timestamp created_at
        timestamp processed_at
        timestamp extraction_completed_at
        timestamp classification_completed_at
        timestamp metadata_completed_at
        timestamp chunking_completed_at
        numeric total_processing_time_ms
        numeric total_tokens_used
        numeric estimated_cost_usd
    }

    extracted_invoices {
        uuid id PK
        uuid document_id FK
        uuid organization_id FK
        text provider_name
        text client_name
        numeric amount
        date invoice_date
        text category
        text invoice_number
        date issue_date
        date due_date
        numeric subtotal
        numeric tax_amount
        numeric total_amount
        text currency
        text payment_method
        text vendor_address
        text vendor_tax_id
        text client_address
        text client_tax_id
        jsonb products
        text products_summary
        int products_count
        text payment_terms
        text bank_details
        text notes
        timestamp created_at
    }

    extracted_minutes {
        uuid id PK
        uuid document_id FK
        uuid organization_id FK
        text president_in
        text president_out
        text administrator
        text summary
        text decisions
        date document_date
        text tipo_reunion
        text lugar
        text comunidad_nombre
        jsonb orden_del_dia
        jsonb acuerdos
        jsonb topic_keywords
        boolean topic_presupuesto
        boolean topic_mantenimiento
        boolean topic_administracion
        jsonb estructura_detectada
        timestamp created_at
    }

    extracted_communications {
        uuid id PK
        uuid document_id FK
        uuid organization_id FK
        date fecha
        text comunidad
        text remitente
        text resumen
        text category
        text asunto
        text tipo_comunicado
        text urgencia
        text comunidad_direccion
        text remitente_cargo
        jsonb destinatarios
        date fecha_limite
        boolean requiere_respuesta
        jsonb accion_requerida
        jsonb anexos
        jsonb contacto_info
        timestamp created_at
    }

    extracted_contracts {
        uuid id PK
        uuid document_id FK
        uuid organization_id FK
        text titulo_contrato
        text parte_a
        text parte_b
        text objeto_contrato
        text duracion
        numeric importe_total
        date fecha_inicio
        date fecha_fin
        text category
        text tipo_contrato
        text parte_a_direccion
        text parte_a_identificacion_fiscal
        text parte_b_direccion
        text parte_b_identificacion_fiscal
        jsonb alcance_servicios
        jsonb obligaciones_parte_a
        jsonb obligaciones_parte_b
        text moneda
        text forma_pago
        jsonb plazos_pago
        boolean confidencialidad
        text legislacion_aplicable
        date fecha_firma
        text lugar_firma
        boolean firmas_presentes
        jsonb topic_keywords
        boolean topic_mantenimiento
        boolean topic_jardines
        boolean topic_ascensores
        boolean topic_limpieza
        timestamp created_at
    }

    extracted_property_deeds {
        uuid id PK
        uuid document_id FK
        uuid organization_id FK
        text vendedor_nombre
        text comprador_nombre
        text direccion_inmueble
        numeric precio_venta
        date fecha_escritura
        text notario_nombre
        text referencia_catastral
        numeric superficie_m2
        text category
        text vendedor_dni
        text vendedor_direccion
        text vendedor_estado_civil
        text vendedor_nacionalidad
        text vendedor_profesion
        text comprador_dni
        text comprador_direccion
        text comprador_estado_civil
        text comprador_nacionalidad
        text comprador_profesion
        text tipo_inmueble
        numeric superficie_util
        int numero_habitaciones
        int numero_banos
        text planta
        text orientacion
        text descripcion_inmueble
        text registro_propiedad
        text tomo
        text libro
        text folio
        text finca
        text inscripcion
        text moneda
        text forma_pago
        text precio_en_letras
        boolean impuestos_incluidos
        jsonb gastos_a_cargo_comprador
        jsonb gastos_a_cargo_vendedor
        jsonb cargas_existentes
        jsonb condiciones_especiales
        jsonb clausulas_particulares
        text hipotecas_pendientes
        text servidumbres
        text estado_conservacion
        text inventario_incluido
        boolean libre_cargas
        boolean condicion_suspensiva
        boolean entrega_inmediata
        boolean autorizacion_notarial
        date fecha_entrega
        text notario_numero_colegiado
        text notaria_direccion
        text protocolo_numero
        numeric valor_catastral
        numeric coeficiente_participacion
        text itp_aplicable
        numeric base_imponible_itp
        text inscripcion_registro
        timestamp created_at
    }

    agents {
        uuid id PK
        uuid organization_id FK
        text name
        text purpose
        text prompt_template
        jsonb variables
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    document_chunks {
        uuid id PK
        uuid document_id FK
        text content
        vector embedding
        jsonb metadata
        int chunk_index
        timestamp created_at
    }

    organizations ||--o{ documents : "owns"
    organizations ||--o{ agents : "has"
    documents ||--o{ extracted_invoices : "extracts_to"
    documents ||--o{ extracted_minutes : "extracts_to"
    documents ||--o{ extracted_communications : "extracts_to"
    documents ||--o{ extracted_contracts : "extracts_to"
    documents ||--o{ extracted_property_deeds : "extracts_to"
    documents ||--o{ document_chunks : "chunks_to"
```

## HERRAMIENTAS

### TEST DE COHERENCIA

`node src/lib/ingesta/test/coherence-validator.js`

### CREACION DE DOCUMENTO

```bash
node src/lib/generators/master-generator.js albaran
```

- Desde fuente de la verdad `document-types-schema.json`
  Generará automáticamente:

- ✅ SQL table
- ✅ React component
- ✅ Strategy extractor
- ✅ Persistence layer
- ✅ Template validation
- ✅ Pipeline config
- ✅ IA prompt
- ✅ Validador de datos ← NUEVO
- ✅ Integración en ResponseParser ← NUEVO
- ✏️ ESCRIBE en el pipeline ✨ NUEVO updatePipelineSwitch

### TEST E2E MODERNIZADO ✅

**Propósito:** Validar el pipeline completo usando el mismo código de producción

**Pipeline de 6 Pasos:**
1. 📄 **Extracción** - PDF → Texto (Google Vision OCR + PDF-parse)
2. 🏷️ **Clasificación** - Identificar tipo documento (95% confianza) 
3. 📊 **Metadata** - IA extrae campos estructurados (27 campos)
4. 🔍 **Validación** - Verificar integridad datos 
5. 🎨 **Templates** - Compatibilidad con UI (100%)
6. 🔧 **Schema BD** - Validación contra document-types-schema.json

**Comandos principales:**
```bash
# Test completo con logs
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --verbose

# Pasos específicos con auto-dependency
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts acta --steps=3-6

# Test todos los tipos
for doc in acta factura comunicado contrato; do
  GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts $doc
done
```

**Características:**
- ✅ **Single Source of Truth** - Usa document-types-schema.json
- ✅ **Auto-dependency resolution** - Ejecuta pasos prerequisitos automáticamente  
- ✅ **Pasos selectivos** - `--steps=1`, `--steps=2-4`, `--steps=1,3,5`
- ✅ **7 tipos soportados** - acta, factura, comunicado, contrato, escritura, albaran, presupuesto
- ✅ **Reportes JSON** - Guardados en `datos/e2e-reports/`

**Documentación completa:** `src/lib/ingesta/test/README-E2E-TEST.md`
