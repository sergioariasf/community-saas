<!--
ARCHIVO: test-e2e-modernized-documentation.md
PROPÓSITO: Documentación completa del test E2E modernizado para pipeline modularizado
ESTADO: production
DEPENDENCIAS: test-complete-e2e-validation_1.ts, document-types-schema.json
OUTPUTS: Documentación técnica, diagramas de flujo, guías de uso
ACTUALIZADO: 2025-09-24
-->

# 📋 Test E2E Modernizado - Documentación Completa

## 🎯 Propósito General

El test `test-complete-e2e-validation_1.ts` valida el pipeline completo de procesamiento de documentos usando **el mismo código de producción** para garantizar que:

1. ✅ La extracción de texto funciona correctamente
2. ✅ La clasificación identifica el tipo de documento
3. ✅ La IA extrae metadata estructurada
4. ✅ Los datos son válidos y completos
5. ✅ Son compatibles con templates UI
6. ✅ Cumplen el schema de base de datos

## 🏗️ Arquitectura: Código de Producción vs Test

### **Código de Producción Reutilizado** ♻️

El test utiliza directamente estos módulos de producción:

```typescript
// 📁 Extracción de texto (MISMO CÓDIGO PRODUCCIÓN)
import { TextExtractionFactory } from '../core/extraction/TextExtractionFactory';

// 📁 Clasificación de documentos (MISMO CÓDIGO PRODUCCIÓN)
import { DocumentClassifier } from '../core/strategies/DocumentClassifier';

// 📁 Schema y configuración (MISMO CÓDIGO PRODUCCIÓN)
import { getDocumentConfigs } from '../core/schemaBasedConfig';
import { parseAgentResponse } from '../../agents/gemini/ResponseParser';
```

### **Código Específico del Test** 🧪

Para funcionar independientemente sin Next.js server context:

```typescript
// 🔧 TEST-ONLY: Acceso directo a Gemini (bypassa Next.js)
async function callGeminiDirect(prompt: string, agentName: string);

// 🔧 TEST-ONLY: Lectura directa del schema
function getDocumentSchema();
function getDocumentTypes();
function getTypeConfig();

// 🔧 TEST-ONLY: Validaciones específicas para testing
function getRequiredFieldsForType();
function isValidDate();
```

## 📋 Pipeline de 6 Pasos Detallado

### **PASO 1: Extracción de Texto** 📄

**Propósito:** Extraer texto legible del PDF usando múltiples estrategias

**Input:**

- `factura.pdf` (archivo binario)
- Buffer de 377KB

**Código de Producción:**

```typescript
// 🏭 PRODUCCIÓN: TextExtractionFactory.ts
const textFactory = new TextExtractionFactory();
const extractionResult = await textFactory.extractText(extractionContext);
```

**Estrategias (en orden de prioridad):**

1. **PDF-parse** → `extract-pdf-text.js` (proceso externo)
2. **Google Vision OCR** → Vision API + credenciales

**Output:**

- ✅ Éxito: `1113 caracteres` extraídos
- 📊 Métrica: `1842ms` tiempo procesamiento
- 🔧 Método: `google-vision-ocr`

**Qué Verificamos:**

- [ ] PDF se puede leer sin errores
- [ ] Texto extraído > 50 caracteres mínimos
- [ ] Estrategia de extracción funciona correctamente

---

### **PASO 2: Clasificación de Documento** 🏷️

**Propósito:** Identificar el tipo de documento para aplicar el procesamiento correcto

**Input:**

- Texto extraído: `1113 caracteres`
- Filename: `factura.pdf`

**Código de Producción:**

```typescript
// 🏭 PRODUCCIÓN: DocumentClassifier.ts
const classifier = new DocumentClassifier();
const classificationResult = await classifier.classifyDocument({
  filename: `${baseName}.pdf`,
  extractedText: extractedText,
  useAI: true,
});
```

**Estrategias de Clasificación:**

1. **Filename pattern matching** (95% confianza)
2. **AI-powered classification** (si filename falla)
3. **Content analysis** (fallback)

**Output:**

- ✅ Tipo: `factura`
- 📊 Confianza: `95%`
- ⚡ Tiempo: `0ms` (pattern match)

**Qué Verificamos:**

- [ ] Tipo identificado correctamente
- [ ] Confianza > 30% mínima
- [ ] Tipo está en lista de soportados (7 tipos)

---

### **PASO 3: Extracción de Metadata** 📊

**Propósito:** Extraer campos estructurados específicos del tipo de documento usando IA

**Input:**

- Tipo documento: `factura`
- Texto extraído: `1113 caracteres`
- Prompt template: `facturaExtractor_prompt.md`

**Código Híbrido (Producción + Test):**

```typescript
// 🏭 PRODUCCIÓN: Schema y configuración
const configs = getDocumentConfigs();
const agentConfig = configs[documentType];

// 🧪 TEST-ONLY: Acceso directo a Gemini (evita Next.js context)
const metadataResult = await callGeminiDirect(
  finalPrompt,
  agentConfig.agentName
);
```

**Archivos Utilizados:**

- `src/lib/schemas/document-types-schema.json` → Configuración agentes
- `prompts/facturaExtractor_prompt.md` → Template del prompt
- Variables de entorno: `GEMINI_API_KEY`

**Output - 27 Campos Extraídos:**

```json
{
  "provider_name": "ELECTRO MERCANTIL LEGANÉS D.A.M., S.L.",
  "client_name": "CONTROL Y TENSION SL",
  "amount": 193,
  "invoice_date": "2019-05-20",
  "category": "comercial",
  "invoice_number": "850162"
  // ... 21 campos más
}
```

**Métricas:**

- 📊 Campos extraídos: `27`
- ⚡ Tiempo: `6080ms` (~6 segundos)
- 🤖 Modelo: `gemini-1.5-flash`

**Qué Verificamos:**

- [ ] IA responde correctamente
- [ ] JSON válido retornado
- [ ] Campos mínimos extraídos
- [ ] Tipos de datos correctos

---

### **PASO 4: Validación de Datos** 🔍

**Propósito:** Verificar integridad y completitud de los datos extraídos

**Input:**

- Metadata extraída (27 campos)
- Tipo documento: `factura`

**Código Específico del Test:**

```typescript
// 🧪 TEST-ONLY: Validaciones específicas por tipo
const requiredFields = getRequiredFieldsForType(documentType);
// Para factura: ['provider_name', 'client_name', 'amount', 'invoice_number']
```

**Validaciones Aplicadas:**

1. **Estructura**: ¿Es un objeto válido?
2. **Campos requeridos**: ¿Están presentes los campos mínimos?
3. **Tipos de datos**: ¿amount es numérico?
4. **Fechas válidas**: ¿Formatos de fecha correctos?

**Output:**

- ✅ Resultado: `ÉXITO`
- ⚡ Tiempo: `1ms`
- 🔍 Errores encontrados: `0`

**Qué Verificamos:**

- [ ] Campos requeridos presentes
- [ ] Tipos de datos correctos
- [ ] Fechas en formato válido
- [ ] Valores numéricos válidos

---

### **PASO 5: Compatibilidad con Templates** 🎨

**Propósito:** Verificar que los datos extraídos son compatibles con las plantillas de UI

**Input:**

- Metadata extraída (27 campos)
- Tipo: `factura`
- Schema UI: `document-types-schema.json`

**Código de Producción:**

```typescript
// 🏭 PRODUCCIÓN: Schema de templates UI
const typeConfig = getTypeConfig(documentType);
const uiFields = typeConfig.ui_template.sections.flatMap(
  (section) => section.fields
);
```

**Análisis de Compatibilidad:**

- **Campos UI esperados**: Según `ui_template.sections`
- **Campos extraídos**: 27 campos de la IA
- **Campos faltantes**: Los que UI necesita pero no se extrajeron
- **Campos extra**: Los que se extrajeron pero UI no usa

**Output:**

- ✅ Compatibilidad: `100%`
- ⚡ Tiempo: `1ms`
- 📋 Campos extra: `['amount', 'category', 'issue_date', 'products']`
- 📋 Campos faltantes: `[]`

**Qué Verificamos:**

- [ ] Compatibilidad > 70% umbral
- [ ] Campos críticos de UI presentes
- [ ] Mapeo datos ↔ templates funciona

---

### **PASO 6: Validación Schema BD** 🔧

**Propósito:** Verificar que los datos son compatibles con el schema de base de datos

**Input:**

- Metadata extraída (27 campos)
- Tipo: `factura`
- Schema BD: `document-types-schema.json`

**Código de Producción:**

```typescript
// 🏭 PRODUCCIÓN: Schema de BD
const allExpectedFields = [
  ...typeConfig.database_schema.primary_fields.map((f) => f.name),
  ...typeConfig.database_schema.detail_fields.map((f) => f.name),
  // ... campos base estándar
];
```

**Validaciones BD:**

1. **Campos desconocidos**: ¿Hay campos que la BD no reconoce?
2. **Campos requeridos**: ¿Faltan campos obligatorios para BD?
3. **Compatibilidad naming**: ¿Guiones vs guiones bajos?

**Output:**

- ✅ Schema BD: `VÁLIDO`
- ⚡ Tiempo: `1ms`
- 🔸 Campos desconocidos: `0`
- 🔸 Campos requeridos faltantes: `0`

**Qué Verificamos:**

- [ ] Todos los campos tienen columna en BD
- [ ] Campos requeridos presentes
- [ ] Naming conventions correctas

## 🚀 Comandos Disponibles

### **Ejecución desde Project Root**

```bash
# ✅ Pipeline completo (6 pasos)
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura

# 🔍 Con logs detallados
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --verbose

# ⚡ Pasos específicos
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=1
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=2-4
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=1,3,5

# 📋 Otros tipos de documentos
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts comunicado --verbose
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts acta --steps=3-6
```

### **Auto-Dependency Resolution** 🔄

El test es inteligente y ejecuta automáticamente los pasos prerequisitos:

```bash
# Si ejecutas solo paso 4, automáticamente ejecuta pasos 1-3 primero
--steps=4  → Ejecuta pasos 1,2,3,4

# Si ejecutas pasos 5-6, ejecuta pasos 1-3 primero
--steps=5-6 → Ejecuta pasos 1,2,3,5,6
```

## 📊 Outputs y Reportes

### **Console Output**

- ✅ Estados en tiempo real de cada paso
- 📊 Métricas de performance (tiempo, tamaño, confianza)
- 🔍 Logs detallados en modo `--verbose`

### **JSON Report**

```json
// Guardado en: /datos/e2e-reports/e2e-modernized-{timestamp}.json
{
  "timestamp": "2025-09-24T14:17:04.071Z",
  "config": {
    "target_file": "factura",
    "steps_executed": [1, 2, 3, 4, 5, 6],
    "verbose": false
  },
  "summary": {
    "total": 1,
    "successful": 1,
    "success_rate": 100,
    "supported_types": [
      "acta",
      "escritura",
      "albaran",
      "factura",
      "comunicado",
      "contrato",
      "presupuesto"
    ]
  },
  "detailed_results": [
    /* resultados detallados por archivo */
  ]
}
```

## 🔧 Configuración y Dependencias

### **Variables de Entorno Requeridas**

```bash
GEMINI_API_KEY=xxx  # API key para Gemini Flash 1.5
GOOGLE_APPLICATION_CREDENTIALS=path/to/vision-api.json  # Para Google Vision OCR
```

### **Archivos de Configuración**

- `src/lib/schemas/document-types-schema.json` → Schema principal
- `prompts/{agentName}_prompt.md` → Templates de prompts
- `datos/pdf/` → PDFs de prueba
- `extract-pdf-text.js` → Script externo PDF-parse

### **7 Tipos de Documentos Soportados**

1. `acta` - Actas de reuniones
2. `escritura` - Escrituras notariales
3. `albaran` - Albaranes de entrega
4. `factura` - Facturas comerciales
5. `comunicado` - Comunicados oficiales
6. `contrato` - Contratos legales
7. `presupuesto` - Presupuestos comerciales

## 🎯 Casos de Uso del Test

### **Durante Desarrollo** 🔨

```bash
# Verificar que cambios no rompieron pipeline
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --verbose
```

### **Testing de Regresión** 🧪

```bash
# Probar todos los tipos después de cambios
for doc in acta factura comunicado contrato; do
  GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts $doc
done
```

### **Debugging Específico** 🐛

```bash
# Solo metadata extraction para debugging
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts acta --steps=3 --verbose
```

### **Performance Testing** ⚡

```bash
# Medir tiempos por paso
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=1-6 --verbose
```

---

## ✅ Ventajas del Test E2E Modernizado

1. **🏭 Usa Código de Producción**: Garantiza que lo que testeas es lo que se ejecuta
2. **🔄 Auto-Dependency**: Inteligente resolución de prerequisitos
3. **🎯 Selectivo**: Ejecuta solo los pasos que necesitas
4. **📊 Completo**: Valida todo el pipeline end-to-end
5. **🧪 Independiente**: No requiere servidor Next.js corriendo
6. **📈 Métricas**: Performance y success rate por paso
7. **🔍 Debugging**: Logs detallados para troubleshooting
