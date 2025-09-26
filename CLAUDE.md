# Project Info

**SaaS:** Community management with RAG/AI  
**Stack:** NextBase + Supabase + Next.js 15  
**DB:** `vhybocthkbupgedovovj` | **Local:** `http://localhost:3001` (puerto fijo)

## Key Files

```bash
- `.env.local`  Dónde Encontrarlas y Gestionarlas
- `CLAUDE.md`
- `architect-master.json`
- `dbmaster-supabase.json`
- `deployment-master.json`
- `ui-guardian.json`
- `vercel-master.json`
```

## Tech Stack Mastery

- **Next.js 15:** Server/Client Components, Server Actions, dynamic routes [17]
- **Supabase:** RLS, real-time sync, SQL migrations, TypeScript types [17]
- **Arquitectura y Principios de Diseño:**
  - Multi-tenant roles, NextBase patterns, error handling [17]
  - **Modularidad:** Diseño de componentes, servicios y lógica de negocio como unidades independientes y reutilizables, favoreciendo la separación de responsabilidades (ej. datos en `communities.ts`, UI en `CommunitiesList.tsx`, orquestación en `page.tsx`). [24, discusión]
- **Agente de Coordinación (Architect-master):** Planificación estratégica y orquestación de otros agentes. [discusión]
- **Agentes Especializados:** Uso de `dbmaster-supabase`, `deployment-master`, `ui-guardian`, `vercel-master` para tareas específicas de DB, despliegue, testing y depuración. [discusión]
- **Desarrollo Colaborativo con IA:** Integración de la guía de agentes en el flujo de trabajo diario. [discusión]

## Commands

- **General:**
- `npm run dev`: Iniciar el servidor de desarrollo en http://localhost:3001 [5]
- `git commit -m "Mensaje"` / `git push`: Para control de versiones y despliegue (cuando Vercel esté OK). [33]
- npm run build # TypeScript check

### modulo documentos

🔍 HERRAMIENTAS DE VERIFICACIÓN DEL PIPELINE:

1. Estado de documentos en BD:

node src/lib/ingesta/test/check-document-status.js

- ✅ Muestra documentos recientes con estados: extract/classify/metadata/chunk
- ✅ Identifica qué documentos fallaron y en qué fase

2. Test específico de agentes:

node test_classifier_debug.js# (creado hoy)

- ✅ Prueba agentes individuales con texto de ejemplo
- ✅ Verifica respuestas JSON y tiempos de procesamiento

3. Verificación directa de BD:

node -e "require('dotenv').config({path:'.env.local'}); [código para consultas específicas]"

- ✅ Consultas a tablas: documents, extracted_communications, extracted_minutes, etc.
- ✅ Verificación de datos guardados por ID de documento

4. UI de verificación:

- Páginas de test públicas: http://localhost:3001/test-comunicado
- Lista de documentos: http://localhost:3001/documents
- Plantillas: http://localhost:3001/documents/templates
- Detalle de documento: http://localhost:3001/documents/[id]

5. Tests del pipeline completo:

node src/lib/ingesta/test/test_full_pipeline_real.js

- ✅ Test end-to-end con documentos reales
- ✅ Simula todo el flujo: PDF → extracción → agente → BD

# CONTEXTO DEL PROYECTO

## HERRAMIENTA DE CONTEXTO:

Para que tengas el contexto actualizado en cada momento mira:

- `node scripts/contexto_proyecto.js` - Genera `scripts/CONTEXTO_PROYECTO_OUT.md`
  **MODULO DOCUMENTOS**
- Status de modulo documentos en `docs\status_docuemntos.md`
  **SUPABASE**
- Script: supabase/scripts/update-database-schema.js
- Documentación: supabase/database_schema_current.md Y supabase\docs\status_supabase.md
- Comando: `npm run generate:schema`

**ENCABEZADO OBLIGATORIO** (añadir a TODOS los archivos creados/editados):

```javascript
/**
 * ARCHIVO: [nombre del archivo]
 * PROPÓSITO: [Qué hace este archivo - 1 línea]
 * ESTADO: [development/testing/production/deprecated]
 * DEPENDENCIAS: [archivos clave que usa]
 * OUTPUTS: [qué genera/exporta]
 * ACTUALIZADO: [YYYY-MM-DD]
 */
```

**ADAPTACIONES POR TIPO:**

```html
<!-- Para .md -->
<!--
ARCHIVO: archivo.md
PROPÓSITO: Descripción del archivo
ESTADO: development
DEPENDENCIAS: archivo1.js, archivo2.js
OUTPUTS: Documentación, guías
ACTUALIZADO: 2025-09-14
-->
```

```sql
-- Para .sql
-- ARCHIVO: script.sql
-- PROPÓSITO: Descripción del script
-- ESTADO: production
-- DEPENDENCIAS: tabla1, tabla2
-- OUTPUTS: Migración de base de datos
-- ACTUALIZADO: 2025-09-14
```

```bash
# Para .env, .sh
# ARCHIVO: script.sh
# PROPÓSITO: Descripción del script
# ESTADO: development
# DEPENDENCIAS: node, npm
# OUTPUTS: Automatización de tareas
# ACTUALIZADO: 2025-09-14
```

## ESTADO ACTUAL

### Gestion de usuarios

- Funciona por correo y pasword
- Funciona Social media con google
- Hay que mejorar porque hay fallos en deploy
- Hay que mejorar disposicion en la UI
- En el furturo tambien loging con outlook

### Modulo incidencias

- Hecho

### Modulo documentacion

- En fase de construccion
- Plantillas creadas
- Implemntando plantillas en el pipeline

- Pipeline ✅
  - Upload documento ✅ ( mjeorar avisos de fallo en http://localhost:3001/documents/upload , y proceso activo que no se muestra🚧 )
  - PDF ✅
  - OCR ✅
  - calsificacion ✅
  - metadatos ✅
  - chunks ✅ ( hay que mejorar 🚧)
- Delete documento ✅
  - archivo
  - hash
  - calsificacion
  - metadatos
  - chunks
- Tipos de documentos ✅:
  - Actas (plantilla ✅, base de datos✅, integracion pipeline✅)
  - Comunicados (plantilla ✅, base de datos✅, integracion pipeline✅)
  - Facturas (plantilla ✅, base de datos✅, integracion pipeline✅)
  - Contratos (plantilla ✅, base de datos✅, integracion pipeline✅)
  - Escrituras (plantilla ✅, base de datos✅, integracion pipeline✅)
  - Alabaran (plantilla ✅, base de datos✅, integracion pipeline✅)
  - Presupuestos (plantilla ✅, base de datos✅, integracion pipeline✅)
- Test masivo para ver robustez del metodo ✅
- Fragmentar multidocumento
- Chunkig
- Busqueda documentos

### Modulo Chat

- Desarrollo futuro

### Modulo Foro

- Desarrollo futuro

### Modulo COnfiguracion

- Desarrollo futuro

# PROCESO DE TRABAJO

## CREAR PLAN

- Plan implemtacion del modulo
  - Objetivo
  - Estrctura
  - Plan de implemtacion
- Creacion plan UI
  - Diseño de la UI
  - Implementacion de UI con refrenecia a backend verificado paso a paso
  - Test UI con escenarios creados en playwright
- Creacion de tabla
- Creacion de procesos en backend
  - Diseño del proceso
  - Test backend con los mismo archivos ya creados.
- Deploy Vercel

## Implememtacion UI

- De acuerdo al proceso validad anterioremente en el backend
- YO: Dandole contexto de lo que hay en la UI a Claude code
- Claude code: Propone un sieño de la UI para despues ir poniendo funcionalidad paso apso
- YO: Itero hasta tener la UI deseada
- Claude code: Usa como referencia el proceso aprobado en back end y vamos poniendo funcionalidad en la UI diseñada paso a paso.
- Una vez funcione todo realizaremos un script de test
  - Diseñara un plan de test para comprobar que todo los escenarios posibles funcionan como fueron planificado en la UI

## Crear tablas en supabase

1. Claude code creé → supabase/scripts/get_full_schema.sql
2. Tú ejecutaste → Las queries en Supabase SQL Editor
3. Tú pegaste → Resultados en database_schema_actual.txt
4. Claude code leí → El archivo con Read tool
5. Claude code analicé → Tu schema y creé migración compatible

el script get_full_schema.sql está correcto y muy completo. Analiza:

1. ✅ Extensiones - Detectará pgvector si está habilitado
2. ✅ Tablas - Mostrará todas las tablas existentes
3. ✅ Columnas - Con tipos, nullable, defaults
4. ✅ Primary Keys - Claves primarias
5. ✅ Foreign Keys - Con reglas de CASCADE
6. ✅ Check Constraints - Validaciones
7. ✅ Índices - Para optimización
8. ✅ Funciones Custom - Filtra las de pgvector
9. ✅ Triggers - Eventos automáticos
10. ✅ RLS Policies - Seguridad a nivel de fila

## Crear procesos

- Tomar como referencia **Archivo**: `/src/lib/ingesta/test/test-database-real-schema.js` . No creacionde nuevo codigo , reutilizar el que ya esta en el proceso.

## documentacion por modulo

Mirar como ejemplo src\lib\ingesta\Ingesta_doc.md

# 📁 ARCHIVOS DE CONFIGURACIÓN CRÍTICOS

| Archivo              | Propósito                                 | Impacto en Módulo Documentos           |
| -------------------- | ----------------------------------------- | -------------------------------------- |
| `package.json`       | Dependencias y scripts NPM                | 🚀 Scripts test específicos módulo     |
| `tsconfig.json`      | Configuración TypeScript                  | 🔧 Tipos documentos y pipeline         |
| `.env.local`         | Variables de entorno                      | 🔐 APIs Supabase, Google, Gemini       |
| `next.config.js`     | Configuración Next.js                     | ⚡ Upload files, optimizaciones        |
| `tailwind.config.js` | Estilos UI                                | 🎨 Templates documentos                |
| **`agentConfig.ts`** | **Configuración centralizada agentes IA** | **🤖 Modelo Gemini, tokens, timeouts** |
