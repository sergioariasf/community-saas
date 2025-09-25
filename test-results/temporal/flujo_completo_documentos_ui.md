<!--
ARCHIVO: flujo_completo_documentos_ui.md
PROPÓSITO: Diagrama completo del flujo de documentos desde upload hasta visualización UI
ESTADO: development
DEPENDENCIAS: pipeline procesamiento + UI components
OUTPUTS: Documentación arquitectura completa
ACTUALIZADO: 2025-09-24
-->

# 🔄 FLUJO COMPLETO: PROCESAMIENTO + VISUALIZACIÓN UI

## 🎯 ARQUITECTURA END-TO-END

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
        DETAIL_PAGE[🎨 documents/[id]/page.tsx<br/>Página detalle documento]
        DETAIL_RENDERER[🎨 DocumentDetailRenderer.tsx<br/>🚀 Router dinámico plantillas]
        
        %% Plantillas específicas
        ACTA_TEMPLATE[🎨 ActaDetailView.tsx<br/>Plantilla actas]
        ESCRITURA_TEMPLATE[🎨 EscrituraCompraventaDetailView.tsx<br/>Plantilla escrituras]
        FACTURA_TEMPLATE[🎨 FacturaDetailView.tsx<br/>Plantilla facturas]
        COMUNICADO_TEMPLATE[🎨 ComunicadoDetailView.tsx<br/>Plantilla comunicados]
        CONTRATO_TEMPLATE[🎨 ContratoDetailView.tsx<br/>Plantilla contratos]
        ALBARAN_TEMPLATE[🎨 AlbaranDetailView.tsx<br/>Plantilla albaranes]
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
    DETAIL_RENDERER --> ESCRITURA_TEMPLATE
    DETAIL_RENDERER --> FACTURA_TEMPLATE
    DETAIL_RENDERER --> COMUNICADO_TEMPLATE
    DETAIL_RENDERER --> CONTRATO_TEMPLATE
    DETAIL_RENDERER --> ALBARAN_TEMPLATE
    DETAIL_RENDERER --> DEFAULT_TEMPLATE

    %% Estilos
    style SCHEMA_SOURCE fill:#ff6b6b,color:#fff
    style MAIN_PIPELINE fill:#4ecdc4,color:#fff
    style DOCUMENTS_STORE fill:#45b7d1,color:#fff
    style DETAIL_RENDERER fill:#96ceb4,color:#fff
    style TEMPLATES_INDEX fill:#feca57,color:#000
```

## 📊 ROLES Y RESPONSABILIDADES

### 🔄 **PROCESAMIENTO (Backend)**

| Componente | Rol | Input | Output |
|------------|-----|-------|---------|
| **progressivePipelineSimple.ts** | 🚀 Orquestador maestro | PDF uploadado | Documento procesado completo |
| **DocumentClassifier.ts** | 🏷️ Clasificador inteligente | Texto extraído | `document_type` (acta/factura/etc) |
| **AgentOrchestrator.ts** | 🤖 Selector de agentes | Tipo documento + texto | JSON estructurado |
| **ResponseParser.ts** | 🧹 Limpiador y validador | JSON crudo agente | Datos validados |
| **xxxPersistence.ts** | 💾 Guardador específico | Datos validados | Registro en `extracted_xxx` |

### 🎨 **VISUALIZACIÓN (Frontend)**

| Componente | Rol | Input | Output |
|------------|-----|-------|---------|
| **documentsStore.ts** | 📡 Estado global documentos | Queries Supabase | Lista documentos + filtros |
| **DocumentsList.tsx** | 📋 Lista interactiva | documentsStore state | UI lista con filtros |
| **documents/[id]/page.tsx** | 🔍 Cargador de datos | Document ID | Datos completos documento |
| **DocumentDetailRenderer.tsx** | 🚀 Router dinámico | Tipo documento | Plantilla específica |
| **xxxDetailView.tsx** | 🎨 Plantilla específica | Datos extraídos | UI rica tipo-específica |

### 🎯 **FUENTE DE VERDAD**

| Componente | Rol | Controla |
|------------|-----|----------|
| **document-types-schema.json** | 🎯 Configuración maestra | Tipos, campos, UI, tablas, agentes |
| **schemaBasedConfig.ts** | ⚙️ Auto-discovery | Mapeo dinámico schema → código |
| **templates/index.ts** | 📚 Registry plantillas | Mapeo tipo → componente React |

## 🔄 FLUJOS ESPECÍFICOS

### 📤 **FLUJO UPLOAD**
```
Usuario → upload/page.tsx → UploadForm.tsx → actions.ts → 
progressivePipelineSimple.ts → [4 fases] → extracted_xxx table
```

### 📋 **FLUJO LISTA**
```
documents/page.tsx → documentsStore.ts → documents table → 
DocumentsList.tsx → Filtros + paginación
```

### 🔍 **FLUJO DETALLE**
```
documents/[id]/page.tsx → documents + extracted_xxx tables →
DocumentDetailRenderer.tsx → schemaBasedConfig.ts → 
templates/index.ts → xxxDetailView.tsx → UI rica
```

## 🚀 **INNOVACIONES ARQUITECTÓNICAS**

### ✅ **Zero Hardcoding**
- **Schema único** controla pipeline + UI + BD
- **Auto-discovery** elimina switch statements
- **Registry dinámico** de plantillas React

### ✅ **Separación de Responsabilidades**
- **Pipeline**: Procesa y extrae datos
- **Store**: Maneja estado y CRUD
- **Renderer**: Enruta a plantillas específicas  
- **Templates**: UI rica tipo-específica

### ✅ **Escalabilidad Automática**
- **Nuevo tipo**: Solo agregar entrada en schema
- **master-generator**: Genera código automáticamente
- **Pipeline se adapta**: Sin cambios manuales

## 🎯 **PUNTOS CLAVE INTEGRACIÓN**

1. **documentsStore.ts** ↔ **documents table**: Lista y metadatos básicos
2. **[id]/page.tsx** ↔ **extracted_xxx tables**: Datos específicos por tipo
3. **DocumentDetailRenderer.tsx** ↔ **schema**: Routing dinámico plantillas
4. **xxxDetailView.tsx** ↔ **extracted_xxx data**: UI rica datos reales
5. **Schema** → **Pipeline** + **UI**: Configuración unificada

Esta arquitectura garantiza **coherencia total** entre procesamiento y visualización, con **zero hardcoding** y **escalabilidad automática**.