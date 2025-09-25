<!--
ARCHIVO: test-e2e-flow-diagram.md
PROPÓSITO: Diagramas Mermaid del flujo del test E2E modernizado
ESTADO: production
DEPENDENCIAS: test-complete-e2e-validation_1.ts
OUTPUTS: Diagramas de flujo, arquitectura visual
ACTUALIZADO: 2025-09-24
-->

# 📊 Diagramas de Flujo - Test E2E Modernizado

## 🚀 Flujo Principal del Test E2E

```mermaid
graph TD
    Start([🚀 Inicio Test E2E]) --> Args{🔧 Parse Arguments}
    Args --> Config[📋 Configuración<br/>--steps, --verbose, target_file]
    
    Config --> Schema[📁 Load Schema<br/>document-types-schema.json]
    Schema --> Types[🎯 Auto-discover Types<br/>7 tipos soportados]
    
    Types --> FileLoop{📂 Target File?}
    FileLoop -->|Específico| SingleFile[📄 Test Single File]  
    FileLoop -->|Todos| AllFiles[📁 Test All PDFs<br/>datos/pdf/*.pdf]
    
    SingleFile --> TestFlow[🔄 Execute Pipeline]
    AllFiles --> TestFlow
    
    TestFlow --> Step1[📄 PASO 1: Extracción]
    Step1 --> Step2[🏷️ PASO 2: Clasificación]  
    Step2 --> Step3[📊 PASO 3: Metadata]
    Step3 --> Step4[🔍 PASO 4: Validación]
    Step4 --> Step5[🎨 PASO 5: Templates]
    Step5 --> Step6[🔧 PASO 6: Schema BD]
    
    Step6 --> Report[📊 Generate Report]
    Report --> Output[💾 Save JSON Report<br/>datos/e2e-reports/]
    Output --> End([✅ End])

    %% Styling
    classDef productionCode fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    classDef testCode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    classDef dataFile fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
```

## 🔄 Pipeline de 6 Pasos Detallado

```mermaid
graph TD
    %% PASO 1: EXTRACCIÓN
    Step1[📄 PASO 1: EXTRACCIÓN] --> PDF[📁 factura.pdf<br/>377KB buffer]
    PDF --> TextFactory[🏭 TextExtractionFactory.ts<br/>CÓDIGO PRODUCCIÓN]
    
    TextFactory --> Strategy1{🔧 PDF-parse}
    Strategy1 -->|Falla| OCR[👁️ Google Vision OCR<br/>vision-api.json]
    Strategy1 -->|Éxito| ExtractOK[✅ 1113 chars extraídos]
    OCR --> ExtractOK
    
    %% PASO 2: CLASIFICACIÓN  
    ExtractOK --> Step2[🏷️ PASO 2: CLASIFICACIÓN]
    Step2 --> Classifier[🏭 DocumentClassifier.ts<br/>CÓDIGO PRODUCCIÓN]
    Classifier --> Pattern{🎯 Filename Pattern?}
    Pattern -->|Match| ClassifyOK[✅ factura - 95%]
    Pattern -->|No Match| AIClassify[🤖 AI Classification]
    AIClassify --> ClassifyOK
    
    %% PASO 3: METADATA
    ClassifyOK --> Step3[📊 PASO 3: METADATA]  
    Step3 --> SchemaConfig[🏭 schemaBasedConfig.ts<br/>CÓDIGO PRODUCCIÓN]
    SchemaConfig --> AgentPrompt[📄 facturaExtractor_prompt.md]
    AgentPrompt --> GeminiDirect[🧪 callGeminiDirect<br/>TEST-ONLY BYPASS]
    GeminiDirect --> MetadataOK[✅ 27 campos extraídos<br/>6080ms]
    
    %% PASO 4: VALIDACIÓN
    MetadataOK --> Step4[🔍 PASO 4: VALIDACIÓN]
    Step4 --> ValidateFields[🧪 getRequiredFieldsForType<br/>TEST-ONLY]
    ValidateFields --> ValidateTypes[🧪 isValidDate, Numbers<br/>TEST-ONLY]  
    ValidateTypes --> ValidationOK[✅ ÉXITO - 0 errores]
    
    %% PASO 5: TEMPLATES
    ValidationOK --> Step5[🎨 PASO 5: TEMPLATES]
    Step5 --> UISchema[🏭 document-types-schema.json<br/>ui_template.sections]
    UISchema --> CompatCheck[🧪 Template Compatibility<br/>TEST-ONLY]
    CompatCheck --> TemplateOK[✅ 100% compatibilidad]
    
    %% PASO 6: SCHEMA BD
    TemplateOK --> Step6[🔧 PASO 6: SCHEMA BD]
    Step6 --> DBSchema[🏭 document-types-schema.json<br/>database_schema]
    DBSchema --> SchemaCheck[🧪 BD Schema Validation<br/>TEST-ONLY]
    SchemaCheck --> SchemaOK[✅ VÁLIDO - 0 errores]
    
    %% Styling
    classDef productionCode fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    classDef testCode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    classDef dataFile fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef success fill:#c8e6c9,stroke:#2e7d32,stroke-width:2px
    
    class TextFactory,Classifier,SchemaConfig,UISchema,DBSchema productionCode
    class GeminiDirect,ValidateFields,ValidateTypes,CompatCheck,SchemaCheck testCode  
    class PDF,AgentPrompt dataFile
    class ExtractOK,ClassifyOK,MetadataOK,ValidationOK,TemplateOK,SchemaOK success
```

## 🔄 Auto-Dependency Resolution

```mermaid
graph TD
    UserCmd[👤 Usuario ejecuta<br/>--steps=4]
    UserCmd --> CheckDeps{🔍 Check Dependencies}
    
    CheckDeps --> NeedStep1{❓ ¿Tiene texto extraído?}
    NeedStep1 -->|No| AutoStep1[🔄 Auto-ejecuta PASO 1<br/>Extracción]
    NeedStep1 -->|Sí| CheckStep2{❓ ¿Tiene tipo documento?}
    
    AutoStep1 --> CheckStep2
    CheckStep2 -->|No| AutoStep2[🔄 Auto-ejecuta PASO 2<br/>Clasificación]  
    CheckStep2 -->|Sí| CheckStep3{❓ ¿Tiene metadata?}
    
    AutoStep2 --> CheckStep3
    CheckStep3 -->|No| AutoStep3[🔄 Auto-ejecuta PASO 3<br/>Metadata]
    CheckStep3 -->|Sí| RunStep4[▶️ Ejecuta PASO 4<br/>Validación]
    
    AutoStep3 --> RunStep4
    RunStep4 --> Success[✅ Paso 4 completado<br/>con todas dependencias]
    
    %% Styling
    classDef autoStep fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef userStep fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    classDef checkStep fill:#f1f8e9,stroke:#689f38,stroke-width:2px
    
    class AutoStep1,AutoStep2,AutoStep3 autoStep
    class UserCmd,RunStep4 userStep
    class CheckDeps,NeedStep1,CheckStep2,CheckStep3 checkStep
```

## 📊 Arquitectura: Código de Producción vs Test

```mermaid
graph TB
    subgraph "🏭 CÓDIGO DE PRODUCCIÓN"
        TextExt[TextExtractionFactory.ts<br/>📄 Extracción multi-estrategia]
        DocClass[DocumentClassifier.ts<br/>🏷️ Clasificación inteligente] 
        SchemaConf[schemaBasedConfig.ts<br/>📋 Configuración agentes]
        ResponseParser[ResponseParser.ts<br/>🔧 Parseo respuestas IA]
    end
    
    subgraph "🧪 CÓDIGO ESPECÍFICO TEST"
        CallGemini[callGeminiDirect()<br/>🤖 Acceso directo Gemini]
        GetSchema[getDocumentSchema()<br/>📁 Lectura directa schema]
        ValidateFields[getRequiredFieldsForType()<br/>🔍 Validación por tipo]
        ValidateDate[isValidDate()<br/>📅 Validación fechas]
    end
    
    subgraph "📁 ARCHIVOS DE DATOS"
        Schema[document-types-schema.json<br/>📋 Schema principal]
        Prompts[prompts/*.md<br/>📝 Templates IA]
        PDFs[datos/pdf/*.pdf<br/>📄 Archivos test]
        Reports[datos/e2e-reports/*.json<br/>📊 Resultados]
    end
    
    subgraph "🔧 VARIABLES ENTORNO"
        GeminiKey[GEMINI_API_KEY<br/>🤖 Clave API IA]
        VisionCreds[GOOGLE_APPLICATION_CREDENTIALS<br/>👁️ Credenciales OCR]
    end
    
    %% Conexiones principales
    TextExt --> PDFs
    TextExt --> VisionCreds
    DocClass --> TextExt
    SchemaConf --> Schema
    CallGemini --> GeminiKey
    CallGemini --> Prompts
    GetSchema --> Schema
    ValidateFields --> Schema
    
    %% Test utiliza producción
    CallGemini -.->|"🔄 Reemplaza"| ResponseParser
    GetSchema -.->|"🔄 Reemplaza"| SchemaConf
    
    %% Outputs
    ValidateDate --> Reports
    ValidateFields --> Reports
    
    %% Styling  
    classDef productionCode fill:#e1f5fe,stroke:#0277bd,stroke-width:3px
    classDef testCode fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    classDef dataFile fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px
    classDef envVar fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    
    class TextExt,DocClass,SchemaConf,ResponseParser productionCode
    class CallGemini,GetSchema,ValidateFields,ValidateDate testCode
    class Schema,Prompts,PDFs,Reports dataFile  
    class GeminiKey,VisionCreds envVar
```

## 🎯 Tipos de Documentos y Archivos Utilizados

```mermaid
graph LR
    subgraph "📁 Schema Central"
        Schema[document-types-schema.json]
    end
    
    subgraph "📋 7 TIPOS SOPORTADOS"
        Acta[📋 acta<br/>Actas reuniones]
        Escritura[📃 escritura<br/>Escrituras notariales]  
        Albaran[📦 albaran<br/>Albaranes entrega]
        Factura[💰 factura<br/>Facturas comerciales]
        Comunicado[📢 comunicado<br/>Comunicados oficiales]
        Contrato[📝 contrato<br/>Contratos legales]
        Presupuesto[💵 presupuesto<br/>Presupuestos comerciales]
    end
    
    subgraph "📝 PROMPTS IA"
        ActaPrompt[actaExtractor_prompt.md]
        EscrituraPrompt[escrituraExtractor_prompt.md]
        AlbaranPrompt[albaranExtractor_prompt.md] 
        FacturaPrompt[facturaExtractor_prompt.md]
        ComunicadoPrompt[comunicadoExtractor_prompt.md]
        ContratoPrompt[contratoExtractor_prompt.md]
        PresupuestoPrompt[presupuestoExtractor_prompt.md]
    end
    
    subgraph "📄 ARCHIVOS TEST"
        ActaPDF[acta.pdf]
        EscrituraPDF[escritura.pdf]
        AlbaranPDF[albaran.pdf]
        FacturaPDF[factura.pdf] 
        ComunicadoPDF[comunicado.pdf]
        ContratoPDF[contrato.pdf]
        PresupuestoPDF[presupuesto.pdf]
    end
    
    %% Conexiones
    Schema --> Acta
    Schema --> Escritura  
    Schema --> Albaran
    Schema --> Factura
    Schema --> Comunicado
    Schema --> Contrato
    Schema --> Presupuesto
    
    Acta --> ActaPrompt
    Escritura --> EscrituraPrompt
    Albaran --> AlbaranPrompt
    Factura --> FacturaPrompt  
    Comunicado --> ComunicadoPrompt
    Contrato --> ContratoPrompt
    Presupuesto --> PresupuestoPrompt
    
    ActaPrompt --> ActaPDF
    EscrituraPrompt --> EscrituraPDF
    AlbaranPrompt --> AlbaranPDF
    FacturaPrompt --> FacturaPDF
    ComunicadoPrompt --> ComunicadoPDF
    ContratoPrompt --> ContratoPDF  
    PresupuestoPrompt --> PresupuestoPDF
    
    %% Styling
    classDef docType fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef promptFile fill:#f1f8e9,stroke:#689f38,stroke-width:2px  
    classDef pdfFile fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef schemaFile fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    
    class Acta,Escritura,Albaran,Factura,Comunicado,Contrato,Presupuesto docType
    class ActaPrompt,EscrituraPrompt,AlbaranPrompt,FacturaPrompt,ComunicadoPrompt,ContratoPrompt,PresupuestoPrompt promptFile
    class ActaPDF,EscrituraPDF,AlbaranPDF,FacturaPDF,ComunicadoPDF,ContratoPDF,PresupuestoPDF pdfFile
    class Schema schemaFile
```

## ⚡ Comandos y Flujos de Ejecución

```mermaid
graph TD
    subgraph "🚀 COMANDOS DISPONIBLES"
        Cmd1[npx tsx test...ts factura<br/>🎯 Pipeline completo]
        Cmd2[npx tsx test...ts factura --verbose<br/>🔍 Con logs detallados]
        Cmd3[npx tsx test...ts factura --steps=1<br/>⚡ Solo extracción]
        Cmd4[npx tsx test...ts factura --steps=2-4<br/>📊 Rango de pasos]  
        Cmd5[npx tsx test...ts factura --steps=1,3,5<br/>🎯 Pasos específicos]
        Cmd6[npx tsx test...ts --steps=4<br/>🔄 Auto-dependency]
    end
    
    subgraph "📊 OUTPUTS GENERADOS"  
        Console[🖥️ Console Output<br/>Estados tiempo real]
        Verbose[🔍 Verbose Logs<br/>Debug detallado]
        JSONReport[📄 JSON Report<br/>datos/e2e-reports/]
        Metrics[📊 Métricas<br/>Tiempo, éxito, campos]
    end
    
    subgraph "🔄 RESOLUCIÓN AUTOMÁTICA"
        AutoDep1[Paso 4 → Auto-ejecuta 1,2,3]
        AutoDep2[Paso 5 → Auto-ejecuta 1,2,3]  
        AutoDep3[Paso 6 → Auto-ejecuta 1,2,3]
        AutoDep4[Pasos 2-4 → Auto-ejecuta 1]
    end
    
    Cmd1 --> Console
    Cmd2 --> Verbose
    Cmd3 --> Console
    Cmd4 --> Metrics
    Cmd5 --> JSONReport
    Cmd6 --> AutoDep1
    
    AutoDep1 --> Console
    AutoDep2 --> Metrics
    AutoDep3 --> JSONReport  
    AutoDep4 --> Verbose
    
    %% Styling
    classDef command fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px
    classDef output fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef autoDep fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    
    class Cmd1,Cmd2,Cmd3,Cmd4,Cmd5,Cmd6 command
    class Console,Verbose,JSONReport,Metrics output
    class AutoDep1,AutoDep2,AutoDep3,AutoDep4 autoDep
```

---

## 📋 Resumen Visual de Archivos Clave

| Archivo | Tipo | Propósito |
|---------|------|-----------|
| `test-complete-e2e-validation_1.ts` | 🧪 Test | **Main test file** - Orquesta todo el pipeline |
| `TextExtractionFactory.ts` | 🏭 Prod | Extracción multi-estrategia de texto |
| `DocumentClassifier.ts` | 🏭 Prod | Clasificación inteligente de documentos |
| `schemaBasedConfig.ts` | 🏭 Prod | Configuración y schema management |
| `document-types-schema.json` | 📁 Data | **Schema central** - Define todos los tipos |
| `prompts/*.md` | 📝 Data | Templates para prompts de IA |
| `datos/pdf/*.pdf` | 📄 Data | Archivos PDF para testing |
| `extract-pdf-text.js` | 🔧 Tool | Script externo para PDF-parse |

---

### 🎯 **Flujo Completo en Una Línea:**
```
PDF → TextExtraction → Classification → AI Metadata → Validation → Template Check → DB Schema ✅
```