<!--
ARCHIVO: Documentos_doc.md
PROPOSITO: Documentacion completa del modulo de documentos - estado actual implementado
ESTADO: development
DEPENDENCIAS: Modulo ingesta, Supabase, Gemini IA
OUTPUTS: Documentacion tecnica del sistema de gestion de documentos
ACTUALIZADO: 2025-09-15
-->

# MODULO DE DOCUMENTOS - ESTADO ACTUAL IMPLEMENTADO

## PROPOSITO DEL MODULO

El modulo de documentos (/documents) es un **sistema completo de gestion e ingesta inteligente de documentos PDF** para comunidades de propietarios. Su proposito principal es:

### Funcionalidades Principales Implementadas:

1. **Subida de Documentos**

   - Upload de archivos PDF a Supabase Storage
   - Validacion de tipos de archivo y tamanos
   - Generacion automatica de hash para evitar duplicados
   - Organizacion jerarquica por organizacion/comunidad/fecha

2. **Procesamiento Inteligente con IA**

   - **Pipeline Progresivo de 4 Niveles:**
     - **Nivel 1:** Extraccion de texto PDF (usando pdf-parse)
     - **Nivel 2:** Clasificacion automatica del tipo de documento
     - **Nivel 3:** Extraccion de metadatos estructurados con Gemini IA
     - **Nivel 4:** Chunking inteligente para busquedas vectoriales

3. **Visualizacion y Gestion**

   - Lista de documentos con informacion del estado del pipeline
   - Vista detallada de cada documento con metadatos extraidos
   - Indicadores visuales del progreso de procesamiento
   - Limpieza masiva de documentos y storage

4. **Multi-tenancy y Seguridad**
   - Aislamiento por organizacion y comunidad
   - Row Level Security (RLS) en todas las tablas
   - Control de acceso basado en roles de usuario

### Tecnologias Utilizadas:

- **Backend:** Next.js 15 Server Actions + Supabase
- **IA:** Google Gemini 1.5 Flash para extraccion de metadatos
- **Storage:** Supabase Storage para archivos PDF
- **Base de Datos:** PostgreSQL con tablas especializadas
- **Frontend:** React 19 + Tailwind CSS + shadcn/ui

### Tipos de Documentos Soportados:

- **Actas de Junta** - Extraccion completa de metadatos (presidentes, asistentes, acuerdos, etc.)
- **Documentos Generales** - Clasificacion y extraccion basica
- **Extensible** - Sistema modular para agregar nuevos tipos

---

## TABLAS DE SUPABASE UTILIZADAS

El modulo de documentos utiliza **8 tablas principales** en Supabase para gestionar todo el ciclo de vida de los documentos:

### 1. **documents** (Tabla Principal)

**Proposito:** Registro principal de cada documento subido y su estado de procesamiento.

**Campos Principales:**

- `id` (uuid, PK) - Identificador unico del documento
- `organization_id` (uuid, FK) - Organizacion propietaria (multi-tenancy)
- `community_id` (uuid, FK) - Comunidad especifica
- `filename` (text) - Nombre original del archivo
- `file_path` (text) - Ruta en Supabase Storage
- `file_size` (bigint) - Tamano del archivo en bytes
- `file_hash` (text) - Hash SHA-256 para evitar duplicados
- `document_type` (text) - Tipo detectado: 'acta', 'factura', 'contrato', etc.
- `processing_level` (integer) - Nivel de procesamiento: 1-4
- `mime_type` (text) - Tipo MIME del archivo

**Estados del Pipeline:**

- `extraction_status` (text) - Estado nivel 1: 'pending', 'processing', 'completed', 'failed'
- `classification_status` (text) - Estado nivel 2: 'pending', 'processing', 'completed', 'failed'
- `metadata_status` (text) - Estado nivel 3: 'pending', 'processing', 'completed', 'failed'
- `chunking_status` (text) - Estado nivel 4: 'pending', 'processing', 'completed', 'failed'

**Metricas y Timing:**

- `text_length` (integer) - Caracteres extraidos del PDF
- `page_count` (integer) - Numero de paginas del documento
- `chunks_count` (integer) - Numero de chunks generados
- `total_processing_time_ms` (integer) - Tiempo total de procesamiento
- `total_tokens_used` (integer) - Tokens consumidos en IA
- `estimated_cost_usd` (numeric) - Coste estimado en USD

### 2. **document_metadata** (Metadatos Estructurados)

**Proposito:** Almacena metadatos extraidos por Gemini IA para busquedas avanzadas.

**Campos Principales:**

- `id` (uuid, PK) - Identificador unico de los metadatos
- `document_id` (uuid, FK) - Referencia al documento
- `organization_id` (uuid, FK) - Organizacion (multi-tenancy)
- `metadata` (jsonb) - **Estructura JSON completa de metadatos**
- `confidence` (real) - Confianza de la extraccion (0.0-1.0)
- `extraction_method` (text) - Metodo usado: 'gemini', 'fallback', 'manual'

**Campos Optimizados para Busqueda:**

- `document_type` (text) - Extraido de metadata.doc_type
- `document_date` (date) - Extraido de metadata.document_date
- `topic_keywords` (text[]) - Array de palabras clave

**Metadatos y Calidad:**

- `processing_time_ms` (integer) - Tiempo de procesamiento
- `tokens_used` (integer) - Tokens consumidos
- `validation_status` (text) - 'valid', 'warnings', 'invalid'
- `raw_response` (text) - Respuesta cruda de Gemini para debugging

### 3. **document_classifications** (Clasificaciones)

**Proposito:** Historial de clasificaciones automaticas de documentos.

**Campos Principales:**

- `id` (uuid, PK) - Identificador de la clasificacion
- `document_id` (uuid, FK) - Referencia al documento
- `organization_id` (uuid, FK) - Organizacion (multi-tenancy)
- `document_type` (text) - Tipo clasificado: 'acta', 'factura', 'contrato'
- `confidence` (real) - Confianza de la clasificacion
- `classification_method` (text) - Metodo: 'gemini', 'filename', 'content'
- `is_current` (boolean) - Si es la clasificacion actual

### 4. **document_chunks** (Fragmentos para Busqueda)

**Proposito:** Fragmentos de texto para busquedas vectoriales y RAG.

**Campos Principales:**

- `id` (uuid, PK) - Identificador del chunk
- `document_id` (uuid, FK) - Referencia al documento
- `organization_id` (uuid, FK) - Organizacion (multi-tenancy)
- `chunk_number` (integer) - Numero secuencial del fragmento
- `content` (text) - Contenido del fragmento
- `content_length` (integer) - Longitud en caracteres
- `chunk_type` (text) - Tipo: 'paragraph', 'section', 'page'
- `page_numbers` (integer[]) - Paginas que abarca el chunk
- `embedding` (vector) - Vector embedding para busquedas semanticas

### 5. **vector_embeddings** (Embeddings Vectoriales)

**Proposito:** Embeddings adicionales para busquedas semanticas avanzadas.

**Campos Principales:**

- `id` (uuid, PK) - Identificador del embedding
- `document_id` (uuid, FK) - Referencia al documento
- `organization_id` (uuid, FK) - Organizacion (multi-tenancy)
- `content` (text) - Texto del embedding
- `embedding` (vector) - Vector numerico para busquedas
- `chunk_index` (integer) - Indice del fragmento
- `chunk_size` (integer) - Tamano del fragmento

### 6. **agents** (Agentes de IA)

**Proposito:** Definicion de agentes especializados con sus prompts y variables.
**Estado:** **TABLA CREADA** - Sistema implementado y funcional.

**Campos Principales:**

- `id` (uuid, PK) - Identificador del agente
- `organization_id` (uuid, FK) - Organizacion propietaria
- `name` (text) - Nombre del agente (ej: 'acta_extractor')
- `purpose` (text) - Proposito del agente
- `prompt_template` (text) - Template del prompt con variables {variable}
- `variables` (jsonb) - Variables esperadas: {name: {type, required, description}}
- `is_active` (boolean) - Si el agente esta activo
- `created_at` (timestamp) - Fecha de creacion
- `updated_at` (timestamp) - Ultima actualizacion

**AGENTES IMPLEMENTADOS ACTUALMENTE:**

#### **1. `document_classifier` (Clasificador de Documentos)**

**Proposito:** Clasifica documentos en tipos: 'acta' o 'factura'

**Prompt Template:**

```
Analiza este documento y clasifica su tipo.

Documento: {filename}
Contenido: {document_text}

Responde SOLO con "acta" o "factura", sin texto adicional.
```

**Variables Esperadas:**

- `filename` (string) - Nombre del archivo
- `document_text` (string) - Texto extraido del PDF

**Salida:** String simple: 'acta', 'factura' o null
**Tabla Destino:** `document_classifications` + `documents.document_type`

#### **2. `minutes_extractor` (Extractor de Metadatos de Actas)**

**Proposito:** Extrae datos especificos de actas de junta

**Prompt Template:**

```
Analiza esta ACTA de junta y extrae los datos clave.

Archivo: {filename}
Texto del acta: {document_text}

Extrae:
- Presidente entrante
- Presidente saliente
- Administrador
- Resumen
- Decisiones principales
```

**Variables Esperadas:**

- `filename` (string) - Nombre del archivo
- `document_text` (string) - Texto del acta

**Salida:** JSON estructurado
**Tabla Destino:** `extracted_minutes`

#### **3. `invoice_extractor` (Extractor de Metadatos de Facturas)**

**Proposito:** Extrae datos especificos de facturas

**Prompt Template:**

```
Analiza esta FACTURA y extrae los datos comerciales.

Archivo: {filename}
Texto de la factura: {document_text}

Extrae:
- Nombre del proveedor
- Nombre del cliente
- Importe total
- Fecha de factura
- Categoria de gasto
```

**Variables Esperadas:**

- `filename` (string) - Nombre del archivo
- `document_text` (string) - Texto de la factura

**Salida:** JSON estructurado
**Tabla Destino:** `extracted_invoices`

**IMPORTANTE:** Este sistema de agentes esta implementado en `src/lib/gemini/saasAgents.ts` pero **NO esta integrado** en el pipeline principal. Actualmente se usa un sistema paralelo con prompts hardcoded.

### 7. **extracted_minutes** (Datos Especificos de Actas)

**Proposito:** Campos especificos extraidos de actas de junta.

**Campos Principales:**

- `id` (uuid, PK) - Identificador de la extraccion
- `document_id` (uuid, FK) - Referencia al documento
- `organization_id` (uuid, FK) - Organizacion (multi-tenancy)
- `president_in` (text) - Presidente entrante
- `president_out` (text) - Presidente saliente
- `administrator` (text) - Administrador de fincas
- `summary` (text) - Resumen del acta
- `decisions` (text) - Decisiones tomadas
- `created_at` (timestamp) - Fecha de extraccion

### 8. **extracted_invoices** (Datos Especificos de Facturas)

**Proposito:** Campos especificos extraidos de facturas.

**Campos Principales:**

- `id` (uuid, PK) - Identificador de la extraccion
- `document_id` (uuid, FK) - Referencia al documento
- `organization_id` (uuid, FK) - Organizacion (multi-tenancy)
- `provider_name` (text) - Nombre del proveedor
- `client_name` (text) - Nombre del cliente
- `amount` (numeric) - Importe de la factura
- `invoice_date` (date) - Fecha de la factura
- `category` (text) - Categoria de gasto
- `created_at` (timestamp) - Fecha de extraccion

### 9. **ai_prompts** (Prompts de IA - NO NECESARIA)

**Proposito:** Gestion centralizada de prompts para IA.
**Estado:** **TABLA NO EXISTE** - **NO ES NECESARIA** porque ya tenemos el sistema `agents`.

**DECISION ARQUITECTONICA:**

- ✅ **Usar tabla `agents`** para gestionar prompts y variables
- ❌ **NO crear tabla `ai_prompts`** porque duplicaria funcionalidad
- 🔄 **Migrar sistema actual** de prompts hardcoded al sistema de agentes

**EQUIVALENCIAS:**

- `ai_prompts.template` = `agents.prompt_template`
- `ai_prompts.variables` = `agents.variables`
- `ai_prompts.name` = `agents.name`

### IMPORTANTE: DONDE SE GUARDA LA CLASIFICACION

**La clasificacion de cada documento se guarda en DOS lugares:**

1. **`documents.document_type`** - Campo principal que se actualiza con el resultado

   - Valores: 'acta', 'factura', 'contrato', 'comunicado', 'otros'
   - Es el que se usa para mostrar en la UI

2. **`document_classifications`** - Tabla que guarda el historial completo
   - Incluye: confianza, metodo usado, respuesta cruda de IA
   - Permite mantener historial de re-clasificaciones
   - Campo `is_current = true` marca la clasificacion actual

---

## INTERFAZ DE USUARIO (UI)

El modulo presenta **3 vistas principales** para la gestion de documentos:

### 1. **Lista de Documentos** (`/documents`)

**Archivo:** `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/page.tsx`

**Informacion Mostrada:**

- **Nombre:** `documents.filename` - Nombre original del archivo
- **Tamano:** `documents.file_size` - Convertido a MB para mostrar
- **Fecha:** `documents.created_at` - Fecha de subida formateada
- **Estado Pipeline:** Indicadores visuales de `extraction_status`, `classification_status`, `metadata_status`, `chunking_status`
- **Tipo:** `documents.document_type` - Badge del tipo clasificado
- **Progreso:** Barra de progreso basada en estados completados

**Acciones Disponibles:**

- **Ver Detalle** - Link a `/documents/[id]`
- **Limpiar Todo** - Boton para eliminar todos los documentos

### 2. **Subida de Documentos** (`/documents/upload`)

**Archivo:** `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/upload/ClientPage.tsx`

**Campos del Formulario:**

- **Archivo PDF:** Input file con validacion de tipo y tamano
- **Comunidad:** Select con opciones de `communities.name` filtrado por `user_roles.community_id`
- **Nivel de Procesamiento:** Select 1-4 niveles
- **Descripcion:** Campo opcional de texto

**Datos Enviados a:** `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/actions.ts`

### 3. **Vista Detallada** (`/documents/[id]`)

**Archivo:** `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/[id]/page.tsx`

**Seccion Estado del Pipeline:**

- **Extraccion:** `documents.extraction_status` - Indicador visual nivel 1
- **Clasificacion:** `documents.classification_status` - Indicador visual nivel 2
- **Metadatos:** `documents.metadata_status` - Indicador visual nivel 3
- **Chunking:** `documents.chunking_status` - Indicador visual nivel 4

**Seccion Informacion Tecnica:**

- **Tamano:** `documents.file_size` - Convertido a MB
- **Paginas:** `documents.page_count` - Si esta disponible
- **Chunks:** `documents.chunks_count` - Si esta disponible
- **Tipo:** `documents.document_type` - Tipo clasificado

**Seccion Metadatos de IA** (Si existe `document_metadata`):

- **Confianza:** `document_metadata.confidence` - Porcentaje de confianza
- **Metodo:** `document_metadata.extraction_method` - 'gemini', 'fallback', etc.
- **Tokens:** `document_metadata.tokens_used` - Tokens consumidos
- **Tiempo:** `document_metadata.processing_time_ms` - Milisegundos

**Analisis de Campos ACTA** (Metadatos especificos):

- **Fecha Documento:** `document_metadata.metadata.document_date`
- **Tipo Junta:** `document_metadata.metadata.tipo_reunion`
- **Lugar:** `document_metadata.metadata.lugar`
- **Presidente Entrante:** `document_metadata.metadata.presidente_entrante`
- **Administrador:** `document_metadata.metadata.administrador`
- **Secretario:** `document_metadata.metadata.secretario_actual`
- **Keywords:** `document_metadata.metadata.topic_keywords[]`
- **Estructura Detectada:** `document_metadata.metadata.estructura_detectada.*`

---

## PROCESOS DEL SISTEMA

Documentacion detallada de cada proceso, incluyendo que tablas se acceden y que campos se utilizan:

### 1. **PROCESO DE SUBIDA** (`POST /documents/upload`)

**Archivo:** `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/actions.ts`

**Paso 1 - Validacion y Autenticacion:**

```javascript
// Lee de: auth.users (Supabase Auth)
const user = await getCurrentUser();
// Lee de: user_roles WHERE user_id = auth.uid()
const organizationId = await getUserOrganizationId(user.id);
```

**Paso 2 - Upload a Storage:**

```javascript
// Escribe en: Supabase Storage bucket "documents"
// Path: {organization_id}/{community_id}/{year}/{month}/{filename_hash}.pdf
const uploadResult = await uploadFileToStorage(
  file,
  organizationId,
  communityId
);
```

**Paso 3 - Registro en Base de Datos:**

```javascript
// INSERTA en tabla: documents
const document = await supabase.from('documents').insert({
  organization_id: organizationId,
  community_id: communityId,
  filename: file.name,
  file_path: uploadResult.filePath,
  file_size: file.size,
  file_hash: uploadResult.metadata.hash,
  processing_level: processingLevel,
  document_type: 'acta', // Por defecto
  legacy_status: 'processing',
  extraction_status: 'pending',
  uploaded_by: user.id,
  mime_type: 'application/pdf',
  original_filename: file.name,
});
```

**Paso 4 - Inicio del Pipeline:**

```javascript
// Llama a: src/lib/ingesta/core/progressivePipeline.ts
await executeProgressivePipeline(document.id, processingLevel);
```

### 2. **PIPELINE PROGRESIVO** (`src/lib/ingesta/core/progressivePipeline.ts`)

**Nivel 1 - Extraccion de Texto:**

```javascript
// LEE de: documents WHERE id = documentId
// Descarga archivo desde Supabase Storage usando file_path
// Extrae texto con pdf-parse
// ACTUALIZA: documents SET
//   extracted_text = extractedText,
//   text_length = textLength,
//   page_count = pageCount,
//   extraction_status = 'completed'
```

**Nivel 2 - Clasificacion:**

```javascript
// LEE de: documents.extracted_text
// Clasifica tipo usando Gemini IA o fallback
// INSERTA en: document_classifications
const classification = {
  document_id: documentId,
  organization_id: organizationId,
  document_type: 'acta', // Resultado de clasificacion
  confidence: 0.85,
  classification_method: 'gemini',
  is_current: true,
};
// ACTUALIZA: documents SET
//   document_type = classification.document_type,
//   classification_status = 'completed'
```

**Nivel 3 - Extraccion de Metadatos:**

```javascript
// LEE de: documents.extracted_text, documents.filename
// Usa: src/lib/ingesta/modules/metadata/extractors/actaMetadataExtractor.ts
// Extrae metadatos estructurados con Gemini IA
// INSERTA en: document_metadata
const metadata = {
  document_id: documentId,
  organization_id: organizationId,
  metadata: {
    // JSON completo de metadatos
    document_date: '20220519',
    tipo_reunion: 'extraordinaria',
    lugar: 'Calle Acanto 2 Bis',
    presidente_entrante: 'Juan Perez',
    // ... mas campos
  },
  confidence: 0.75,
  extraction_method: 'gemini',
  processing_time_ms: 10269,
  tokens_used: 1501,
  is_current: true,
};
// ACTUALIZA: documents SET metadata_status = 'completed'
```

**Nivel 4 - Chunking:**

```javascript
// LEE de: documents.extracted_text
// Divide texto en fragmentos para busquedas
// INSERTA MULTIPLE en: document_chunks
chunks.forEach((chunk) => {
  const chunkData = {
    document_id: documentId,
    organization_id: organizationId,
    chunk_number: chunkIndex,
    content: chunk.text,
    content_length: chunk.text.length,
    chunk_type: 'paragraph',
    page_numbers: chunk.pageNumbers,
    chunking_method: 'recursive',
  };
});
// ACTUALIZA: documents SET
//   chunks_count = totalChunks,
//   chunking_status = 'completed',
//   processing_completed_at = NOW()
```

### 3. **PROCESO DE CONSULTA** (`GET /documents`)

**Archivo:** `src/data/anon/documents.ts`

**Lista de Documentos:**

```javascript
// LEE de: documents
// JOIN con: user_roles para filtrar por organizacion/comunidad
// WHERE: organization_id IN (user_accessible_orgs)
//   AND community_id IN (user_accessible_communities)
// ORDER BY: created_at DESC
// INCLUYE: filename, file_size, created_at, document_type,
//          extraction_status, classification_status,
//          metadata_status, chunking_status
```

**Detalle de Documento:**

```javascript
// LEE de: documents WHERE id = documentId
// LEFT JOIN: document_metadata WHERE document_id = documentId AND is_current = true
// LEFT JOIN: document_classifications WHERE document_id = documentId AND is_current = true
// RETORNA: documento completo + metadatos + clasificacion
```

### 4. **PROCESO DE BUSQUEDA** (Futuro - En Desarrollo)

**Busqueda por Metadatos:**

```javascript
// LEE de: document_metadata
// WHERE: organization_id = userOrgId
//   AND document_type = searchType
//   AND document_date BETWEEN dateFrom AND dateTo
//   AND topic_keywords && searchKeywords
```

**Busqueda Vectorial:**

```javascript
// LEE de: document_chunks
// WHERE: organization_id = userOrgId
// USANDO: embedding <-> query_embedding (distancia coseno)
// ORDER BY: similarity DESC
```

### 5. **PROCESO DE LIMPIEZA** (`DELETE /api/documents/clean-all`)

**Archivo:** `src/app/api/documents/clean-all/route.ts`

**Limpieza Completa:**

```javascript
// 1. LEE: documents WHERE organization_id = userOrgId
// 2. ELIMINA: archivos de Supabase Storage usando file_path
// 3. ELIMINA CASCADE:
//    - document_chunks WHERE document_id IN (...)
//    - document_metadata WHERE document_id IN (...)
//    - document_classifications WHERE document_id IN (...)
//    - vector_embeddings WHERE document_id IN (...)
//    - documents WHERE organization_id = userOrgId
```

---

## FLUJO COMPLETO DE DATOS

**Resumen del flujo desde subida hasta visualizacion:**

1. **Upload** → `documents` table (registro principal)
2. **Storage** → Supabase Storage (archivo fisico)
3. **Extraccion** → `documents.extracted_text` (texto del PDF)
4. **Clasificacion** → `document_classifications` + `documents.document_type`
5. **Metadatos** → `document_metadata.metadata` (JSON estructurado)
6. **Chunking** → `document_chunks` (fragmentos para busqueda)
7. **Visualizacion** → JOIN de todas las tablas para mostrar en UI

**Cada paso actualiza campos de estado en `documents` para tracking del progreso.**

---

## NEXT STEPS DE MEJORA

Identificacion de mejoras prioritarias para optimizar la arquitectura del modulo:

### 1. **USAR FUENTE DE VERDAD UNICA**

**Problema Actual:** Datos duplicados entre `documents.document_type` y `document_classifications`

**Solucion:**

- **UI lee SIEMPRE de `document_classifications`** como fuente de verdad
- Eliminar dependencia de `documents.document_type` en la UI
- Mantener `documents.document_type` solo como cache para rendimiento (opcional)

**Cambios Necesarios:**

```javascript
// ANTES (actual):
SELECT document_type FROM documents WHERE id = '123'

// DESPUES (mejorado):
SELECT dc.document_type, dc.confidence, dc.classification_method
FROM documents d
LEFT JOIN document_classifications dc ON d.id = dc.document_id
WHERE d.id = '123' AND dc.is_current = true
```

**Archivos a Modificar:**

- `src/data/anon/documents.ts` - Cambiar queries
- `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/page.tsx` - UI lista
- `src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/[id]/page.tsx` - UI detalle

**Beneficios:**

- ✅ Una sola fuente de verdad
- ✅ Acceso a confianza y metodo de clasificacion
- ✅ Historial completo de reclasificaciones
- ✅ Eliminacion de riesgo de inconsistencias

### 2. **MIGRAR A SISTEMA DE AGENTES CENTRALIZADO**

**Problema Actual:** Dos sistemas en paralelo (agentes + prompts hardcoded)

**Solucion:**

- **Eliminar sistema de prompts hardcoded** en `actaMetadataExtractor.ts`
- **Integrar sistema de agentes** en el pipeline principal
- **Gestionar todos los prompts** desde tabla `agents`

**Pasos de Migracion:**

#### **2.1 Integrar Agente Clasificador**

```javascript
// En progressivePipeline.ts, Nivel 2:
// ANTES:
const classification = await classifyDocument(text, filename);

// DESPUES:
const classification = await callSaaSAgent('document_classifier', {
  filename: filename,
  document_text: text,
});
```

#### **2.2 Integrar Agentes Extractores**

```javascript
// En progressivePipeline.ts, Nivel 3:
// ANTES:
const metadata = await extractActaMetadata(text, filename);

// DESPUES:
if (documentType === 'acta') {
  const metadata = await callSaaSAgent('minutes_extractor', {
    filename: filename,
    document_text: text,
  });
  await saveExtractedMinutes(documentId, metadata.data);
} else if (documentType === 'factura') {
  const metadata = await callSaaSAgent('invoice_extractor', {
    filename: filename,
    document_text: text,
  });
  await saveExtractedInvoice(documentId, metadata.data);
}
```

#### **2.3 Poblar Tabla Agents**

**Crear agentes en base de datos:**

```sql
-- 1. Agente clasificador
INSERT INTO agents (name, purpose, prompt_template, variables, is_active) VALUES (
  'document_classifier',
  'Clasifica documentos en tipos: acta o factura',
  'Analiza este documento y clasifica su tipo.\n\nDocumento: {filename}\nContenido: {document_text}\n\nResponde SOLO con "acta" o "factura", sin texto adicional.',
  '{"filename": {"type": "string", "required": true}, "document_text": {"type": "string", "required": true}}',
  true
);

-- 2. Agente extractor de actas
INSERT INTO agents (name, purpose, prompt_template, variables, is_active) VALUES (
  'minutes_extractor',
  'Extrae metadatos estructurados de actas de junta',
  'Analiza esta ACTA de junta y extrae los datos clave...',
  '{"filename": {"type": "string", "required": true}, "document_text": {"type": "string", "required": true}}',
  true
);

-- 3. Agente extractor de facturas
INSERT INTO agents (name, purpose, prompt_template, variables, is_active) VALUES (
  'invoice_extractor',
  'Extrae metadatos estructurados de facturas',
  'Analiza esta FACTURA y extrae los datos comerciales...',
  '{"filename": {"type": "string", "required": true}, "document_text": {"type": "string", "required": true}}',
  true
);
```

**Archivos a Modificar:**

- `src/lib/ingesta/core/progressivePipeline.ts` - Integrar llamadas a agentes
- Eliminar: `src/lib/ingesta/modules/metadata/extractors/actaMetadataExtractor.ts`
- Modificar: `src/lib/ingesta/core/SimplePipeline.ts` - Usar agentes

**Beneficios:**

- ✅ Gestion centralizada de prompts en BD
- ✅ Prompts editables sin despliegue de codigo
- ✅ Versionado y auditoria de cambios
- ✅ Consistencia en toda la aplicacion
- ✅ Eliminacion de codigo duplicado

### 3. **ELIMINAR REDUNDANCIA EN METADATOS (OPCION A - RECOMENDADA)**

**Problema Actual:** Metadatos duplicados en `document_metadata` (JSON generico) y `extracted_minutes`/`extracted_invoices` (campos especificos)

**Solucion - OPCION A: Solo Tablas Especificas:**

- **ELIMINAR tabla `document_metadata`** por completo
- **Usar SOLO tablas especificas** por tipo de documento
- **Flujo simplificado:** `documents` → `classification` → `extracted_minutes` o `extracted_invoices`

**Pasos de Migracion:**

#### **3.1 Migrar Datos Existentes**

```sql
-- Migrar metadatos de actas desde document_metadata a extracted_minutes
INSERT INTO extracted_minutes (document_id, organization_id, president_in, president_out, administrator, summary, decisions)
SELECT
  dm.document_id,
  dm.organization_id,
  dm.metadata->>'presidente_entrante' as president_in,
  dm.metadata->>'presidente_saliente' as president_out,
  dm.metadata->>'administrador' as administrator,
  COALESCE(dm.metadata->>'resumen', dm.metadata->>'summary') as summary,
  array_to_string(array(SELECT jsonb_array_elements_text(dm.metadata->'decisiones_principales')), '; ') as decisions
FROM document_metadata dm
JOIN documents d ON dm.document_id = d.id
WHERE d.document_type = 'acta'
AND dm.is_current = true;

-- Migrar metadatos de facturas desde document_metadata a extracted_invoices
INSERT INTO extracted_invoices (document_id, organization_id, provider_name, amount, invoice_date, category)
SELECT
  dm.document_id,
  dm.organization_id,
  dm.metadata->>'proveedor' as provider_name,
  (dm.metadata->>'importe')::numeric as amount,
  (dm.metadata->>'fecha_factura')::date as invoice_date,
  dm.metadata->>'categoria' as category
FROM document_metadata dm
JOIN documents d ON dm.document_id = d.id
WHERE d.document_type = 'factura'
AND dm.is_current = true;
```

#### **3.2 Actualizar Pipeline**

```javascript
// En progressivePipeline.ts, Nivel 3:
// ELIMINAR:
// await saveToDocumentMetadata(documentId, metadata)

// AGREGAR:
if (documentType === 'acta') {
  const actaData = await callSaaSAgent('minutes_extractor', {
    filename: filename,
    document_text: text,
  });
  await saveExtractedMinutes(documentId, actaData.data);
} else if (documentType === 'factura') {
  const invoiceData = await callSaaSAgent('invoice_extractor', {
    filename: filename,
    document_text: text,
  });
  await saveExtractedInvoice(documentId, invoiceData.data);
}
```

#### **3.3 Actualizar UI**

```javascript
// En documents/[id]/page.tsx:
// ELIMINAR queries a document_metadata

// AGREGAR queries especificas:
const actaData = await supabase
  .from('extracted_minutes')
  .select('*')
  .eq('document_id', documentId)
  .single();

const invoiceData = await supabase
  .from('extracted_invoices')
  .select('*')
  .eq('document_id', documentId)
  .single();
```

#### **3.4 Eliminar Tabla y Codigo**

```sql
-- Una vez migrado todo:
DROP TABLE document_metadata CASCADE;
```

**Archivos a Eliminar:**

- Referencias a `document_metadata` en todo el codigo
- Funciones de guardado en `document_metadata`

**Beneficios de la Opcion A:**

- ✅ **Campos tipados** - No JSON, campos reales con validacion
- ✅ **Queries eficientes** - Sin parsing JSON ni campos optimizados duplicados
- ✅ **Validacion DB** - Constraints a nivel de base de datos
- ✅ **Simplicidad arquitectonica** - Una tabla por tipo, clara responsabilidad
- ✅ **Mantenimiento facil** - Estructura predecible y documentada
- ✅ **Rendimiento** - Indices directos en campos, no en JSONB

### 4. **IMPLEMENTAR PLANTILLAS UI POR TIPO DE DOCUMENTO (OPCION A - RECOMENDADA)**

**Problema Actual:** UI muestra siempre plantilla de ACTA para todos los tipos de documento

**Solucion - Componentes Separados:**

- **Crear componentes especificos** por tipo: `ActaDetailView.tsx`, `FacturaDetailView.tsx`
- **Renderizado condicional** en `page.tsx` segun `document.document_type`
- **Funciones especificas** para leer `extracted_minutes` y `extracted_invoices`
- **Plantillas optimizadas** para cada tipo con campos relevantes

**Pasos de Implementacion:**

#### **4.1 Crear Componentes Especificos**

```typescript
// components/documents/ActaDetailView.tsx
export function ActaDetailView({ actaData }: { actaData: ExtractedMinutes }) {
  return (
    <div>
      <T.H4>📋 Analisis de ACTA</T.H4>
      <div>Presidente: {actaData.president_in}</div>
      <div>Administrador: {actaData.administrator}</div>
      <div>Resumen: {actaData.summary}</div>
    </div>
  );
}

// components/documents/FacturaDetailView.tsx
export function FacturaDetailView({
  facturaData,
}: {
  facturaData: ExtractedInvoice;
}) {
  return (
    <div>
      <T.H4>💰 Analisis de FACTURA</T.H4>
      <div>Proveedor: {facturaData.provider_name}</div>
      <div>Importe: {facturaData.amount}€</div>
      <div>Fecha: {facturaData.invoice_date}</div>
    </div>
  );
}
```

#### **4.2 Modificar page.tsx**

```typescript
// En documents/[id]/page.tsx
{
  document.document_type === 'acta' && <ActaDetailView actaData={actaData} />;
}
{
  document.document_type === 'factura' && (
    <FacturaDetailView facturaData={facturaData} />
  );
}
```

#### **4.3 Crear Funciones de Datos Especificas**

```typescript
// En documents.ts
export const getExtractedMinutes = async (documentId: string) => {
  const { data } = await supabase
    .from('extracted_minutes')
    .select('*')
    .eq('document_id', documentId)
    .single();
  return data;
};

export const getExtractedInvoice = async (documentId: string) => {
  const { data } = await supabase
    .from('extracted_invoices')
    .select('*')
    .eq('document_id', documentId)
    .single();
  return data;
};
```

**Beneficios:**

- ✅ **UI especifica** para cada tipo de documento
- ✅ **Campos relevantes** solo para el tipo correspondiente
- ✅ **Datos directos** desde tablas especializadas
- ✅ **Mantenimiento facil** - un componente por tipo
- ✅ **Extensible** - facil agregar nuevos tipos

### 5. **IMPLEMENTAR BUSQUEDA AVANZADA**

**Funcionalidad Pendiente:** Busquedas por metadatos y contenido

**Features a Implementar:**

- Busqueda por tipo de documento
- Busqueda por rango de fechas
- Busqueda por keywords extraidos
- Busqueda semantica usando embeddings

### 6. **OPTIMIZACIONES DE RENDIMIENTO**

**Para el Futuro:** Cuando el volumen crezca

**Optimizaciones Planificadas:**

- Indices optimizados para consultas frecuentes
- Cache de clasificaciones en `documents.document_type`
- Paginacion eficiente en listas grandes
- Compresion de embeddings vectoriales

---

# hecho en la utilma sesion

Update(test_agent_simple.js)
⎿  Updated test_agent_simple.js with 1 addition and 4 removals
64 throw new Error(`No se encontró el documento: ${docsError?.message}`);
65 }
66
67 - // Convertir single result a array para compatibilidad
68 - const document = docs;
69 -
70 - const document = docs[0];
67 + // Usar directamente el resultado single
68 console.log(`✅ Documento: ${document.filename}`);
69 console.log(`   📊 ID: ${document.id}`);
70 console.log(`   📏 Texto: ${document.extracted_text.length.toLocaleString()} caracteres`);

Update(test_agent_simple.js)
⎿  Updated test_agent_simple.js with 1 addition
65 }
66
67 // Usar directamente el resultado single
68 + const document = docs;
69 console.log(`✅ Documento: ${document.filename}`);
70 console.log(`   📊 ID: ${document.id}`);
71 console.log(`   📏 Texto: ${document.extracted_text.length.toLocaleString()} caracteres`);

Bash(node test_agent_simple.js)
⎿  [dotenv@17.2.2] injecting env (10) from .env.local -- tip: 🛠️ run anywhere with `dotenvx run -- yourcommand
🧪 TEST AGENTE ACTAS V2 - VERSIÓN SIMPLE
============================================================
… +68 lines (ctrl+r to expand)

● ¡🎉 EXCELENTE! EL SISTEMA FUNCIONA PERFECTAMENTE 🎉!

Update Todos
⎿  ☒ 🔄 REINTENTAR GEMINI - Error 503 temporal, verificar que funcione cuando no esté sobrecargado
☒ 🧪 TESTEAR AGENTE V2 - Verificar funcionamiento agente acta_extractor_v2
☒ 🗄️ MIGRACIÓN BD COMPLETADA - Tabla extracted_minutes ampliada + índices creados
☒ 🚀 SISTEMA VALIDADO - Agente BD → Gemini → Validación → Guardado EXITOSO
☐ 🔧 CREAR TABLA AI_PROMPTS - La tabla no existe, por eso usa prompt hardcoded
☐ 🔄 MIGRAR A SISTEMA AGENTES - Integrar saasAgents.ts en pipeline principal
☐ 🔧 ACTUALIZAR PIPELINE - Integrar nuevo agente en pipeline de procesamiento

● 🎯 RESUMEN EXITOSO DEL TEST:

✅ TODO FUNCIONÓ PERFECTAMENTE:

1. 🤖 Agente desde BD: Prompt obtenido de tabla agents ✅
2. 🧠 Gemini IA: Respuesta en 11.7 segundos ✅
3. 📊 Parsing JSON: Datos extraídos correctamente ✅
4. 🛡️ Validación: Todos los campos validados ✅
5. 💾 Guardado BD: Datos en extracted_minutes ✅
6. 🔍 Índices: Búsquedas funcionando ✅

📊 DATOS EXTRAÍDOS CON CALIDAD EXCELENTE:

📅 Fecha: 2022-05-19 ✅
🏛️ Tipo: extraordinaria ✅
📍 Lugar: hotel Attica 2 (Calle Chile, 2 en las Rozas) ✅
🏢 Comunidad: C.P. Amara Homes ✅
👤 Presidente: Carlos Sánchez Pérez ✅
🏛️ Administrador: ASEGRAMAR ✅
📋 Orden del día: 6 puntos ✅
🎯 Temas detectados: 10/15 (presupuesto, administración, piscina, etc.) ✅

🔍 BÚSQUEDAS CON ÍNDICES FUNCIONAN:

- ✅ Búsqueda por administrador: 1 resultado encontrado
- ✅ Los 10 índices creados están activos y funcionando

🏗️ ESTRUCTURA COMPLEJA GUARDADA:

- ✅ estructura_detectada con capítulos y votaciones
- ✅ Arrays orden_del_dia y acuerdos
- ✅ 15 campos topic-xxx como booleanos

🚀 SISTEMA 100% LISTO

El sistema de agentes está completamente funcional y listo para integrar en el pipeline principal.

¿Quieres que proceda al siguiente paso: integrar este agente en el pipeline de procesamiento de documentos?

Esto permitirá que cuando se suba un nuevo PDF de acta, automáticamente:

1. Se extraiga el texto
2. Se llame al agente acta_extractor_v2
3. Se guarden todos los datos en extracted_minutes
4. Se puedan hacer búsquedas avanzadas por cualquier campo

¿Continuamos con la integración en el pipeline?

> ahora que ya tenemos la UI validada, el agente validado, las tablas validadas, lo que queda es ver la informacion de las tablas en la UI ¿correcto?

● ¡EXACTAMENTE CORRECTO! 🎯

📋 ESTADO ACTUAL - TODO VALIDADO:

✅ COMPONENTES LISTOS:

1. UI Plantilla Actas ✅ - Template perfecto con todos los campos
2. Agente acta_extractor_v2 ✅ - Funciona y extrae datos completos
3. Tabla extracted_minutes ampliada ✅ - 20 campos nuevos + índices
4. Datos reales guardados ✅ - Información del PDF real en BD

🎯 LO QUE FALTA:

Conectar la UI para que lea los datos REALES de la tabla en lugar de los datos DEMO

🔄 CAMBIOS NECESARIOS:

ANTES (UI con datos demo):

// En /documents/[id]/page.tsx
<ActaDetailView
actaData={DEMO_ACTA_DATA} // ← DATOS HARDCODED
metadata={DEMO_ACTA_METADATA} // ← DATOS HARDCODED
/>

DESPUÉS (UI con datos reales de BD):

// Leer datos reales de extracted_minutes
const actaData = await getExtractedMinutes(documentId);
const metadata = actaData; // Los metadatos están en la misma tabla

<ActaDetailView
actaData={actaData} // ← DATOS REALES DE BD
metadata={metadata} // ← DATOS REALES DE BD
/>

🎯 ARCHIVOS A MODIFICAR:

1. src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/[id]/page.tsx


    - Cambiar de datos demo a datos reales de extracted_minutes

2. src/data/anon/documents.ts (o crear función nueva)


    - Función para leer extracted_minutes por document_id

3. Verificar que ActaDetailView.tsx sea compatible con estructura real

💡 ¿EMPEZAMOS POR:

1. Crear función para leer datos reales de extracted_minutes
2. Modificar la página de detalle para usar datos reales
3. Testear que la UI funcione con los datos que acabamos de guardar

¿Procedemos a conectar la UI con los datos reales de la base de datos?

El documento con ID 958c2703-bd03-4495-b72c-3a85612e1833 ya tiene datos completos en extracted_minutes, perfecto para testing.

> que me recomiendas para ir paso a paso , no hacerlo todo a la vez . Integrar elproceso enel pipline, ver primero la info en un test en una pagina de actas??

● ¡EXCELENTE enfoque! 👍 Vamos paso a paso para no romper nada.

🎯 MI RECOMENDACIÓN - PASO A PASO:

PASO 1: Ver la info primero (TEST VISUAL) 🔍

Crear una página de prueba para ver los datos reales antes de tocar nada

- Nueva página /documents/test-acta
- Lee los datos reales de extracted_minutes
- Muestra la información con la plantilla UI existente
- SIN tocar el pipeline ni la página principal

PASO 2: Ajustar la UI si hace falta 🎨

Una vez vemos los datos reales, ajustar discrepancias

- Ver si hay campos que no coinciden
- Ajustar formato de fechas, arrays, etc.
- Pulir la plantilla ActaDetailView si es necesario

PASO 3: Integrar en página principal 🔧

Solo cuando funcione perfectamente el test

- Modificar /documents/[id]/page.tsx
- Cambiar datos demo por datos reales
- Mantener fallback a demo si no hay datos

PASO 4: Integrar en pipeline ⚙️

Al final, cuando todo funcione visualmente

- Integrar agente en pipeline de procesamiento
- Que se ejecute automáticamente al subir PDFs

🚀 ¿EMPEZAMOS CON PASO 1?

Crear página de test /documents/test-acta que:

- Lee el documento ID: 958c2703-bd03-4495-b72c-3a85612e1833
- Lee sus datos de extracted_minutes
- Los muestra con ActaDetailView
- Así vemos exactamente cómo se ve con datos reales

¿Te parece bien este enfoque? Es mucho más seguro y podremos iterar sin romper lo que ya funciona.
