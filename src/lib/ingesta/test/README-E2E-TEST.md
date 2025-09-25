<!--
ARCHIVO: README-E2E-TEST.md  
PROPÓSITO: Guía práctica de uso del test E2E modernizado con ejemplos ejecutables
ESTADO: production
DEPENDENCIAS: test-complete-e2e-validation_1.ts
OUTPUTS: Guía de usuario, ejemplos de comandos
ACTUALIZADO: 2025-09-24
-->

# 🧪 Test E2E Modernizado - Guía de Uso

## 🚀 Quick Start

```bash
# Ejecutar desde project root con API key
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --verbose
```

## 📋 ¿Qué hace este test?

Valida **el pipeline completo** de procesamiento de documentos usando **el mismo código de producción**:

1. 📄 **Extrae texto** del PDF (Google Vision OCR)
2. 🏷️ **Clasifica** el tipo de documento (factura, acta, etc.)
3. 📊 **Extrae metadata** estructurada con IA (27 campos)
4. 🔍 **Valida** integridad de los datos
5. 🎨 **Verifica** compatibilidad con templates UI
6. 🔧 **Valida** schema de base de datos

## 🎯 Comandos Disponibles

### **🔥 Comando Principal - Pipeline Completo**
```bash
# Test completo con logs detallados
GEMINI_API_KEY=AIzaSyBQSt4jiQ6Bfn0t8W54RRNqwo_3J-qXGbc npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --verbose

# Salida esperada:
# ✅ Extraído: 1113 caracteres con google-vision-ocr en 1842ms  
# ✅ Clasificado: factura (95.0%) en 0ms
# ✅ Extraído: 27 campos en 6080ms
# ✅ Validación: ÉXITO en 1ms
# ✅ Template: 100.0% compatibilidad en 1ms
# ✅ Schema BD: VÁLIDO en 1ms
```

### **⚡ Pasos Específicos**
```bash
# Solo extracción de texto
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=1 --verbose

# Solo metadata extraction (auto-ejecuta pasos 1-2 primero)
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=3 --verbose

# Rango de pasos
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=2-4

# Pasos no consecutivos  
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=1,3,5
```

### **📋 Otros Tipos de Documentos**
```bash
# Acta de reunión
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts acta --verbose

# Comunicado oficial
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts comunicado --verbose

# Contrato legal
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts contrato --verbose

# Escritura notarial  
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts escritura --verbose
```

## 🔍 Debugging por Pasos

### **PASO 1: Problemas de Extracción**
```bash
# Si PDF-parse falla, usa Google Vision OCR
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=1 --verbose

# Revisa:
# - ¿Existe el archivo datos/pdf/factura.pdf?
# - ¿Están las credenciales de Google Vision correctas?
# - ¿El PDF no está corrupto?
```

### **PASO 2: Problemas de Clasificación**  
```bash
# Verifica la clasificación del documento
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=2 --verbose

# Revisa:
# - ¿El filename contiene el patrón correcto?
# - ¿La confianza es > 30%?
# - ¿El tipo está en los 7 soportados?
```

### **PASO 3: Problemas de Metadata**
```bash  
# Debug la extracción de metadata con IA
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=3 --verbose

# Revisa:
# - ¿GEMINI_API_KEY es válida?
# - ¿Existe prompts/facturaExtractor_prompt.md?
# - ¿El prompt template es correcto?
# - ¿Gemini responde con JSON válido?
```

## 📊 Interpretando los Resultados

### **✅ Éxito Completo**
```
📈 [E2E MODERNIZADO] Resumen General:
   - Total archivos: 1
   - Exitosos E2E: 1 (100.0%)
   - Fallidos: 0

📋 [E2E MODERNIZADO] Éxito por Paso:
   - Paso 1 (Extracción de texto del PDF): 1/1 (100.0%)
   - Paso 2 (Clasificación del tipo de documento): 1/1 (100.0%) 
   - Paso 3 (Extracción de metadata con IA): 1/1 (100.0%)
   - Paso 4 (Validación de datos extraídos): 1/1 (100.0%)
   - Paso 5 (Compatibilidad con templates UI): 1/1 (100.0%)
   - Paso 6 (Validación contra schema BD): 1/1 (100.0%)
```

### **❌ Fallos Comunes**
```bash
# Error: GEMINI_API_KEY not found
# Solución: Exportar variable de entorno
export GEMINI_API_KEY=AIzaSyBQSt4jiQ6Bfn0t8W54RRNqwo_3J-qXGbc

# Error: Cannot find module TextExtractionFactory  
# Solución: Ejecutar desde project root, no desde /test/
cd /home/sergi/proyectos/community-saas
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura

# Error: No se pudo leer prompt
# Solución: Verificar que existe prompts/facturaExtractor_prompt.md
ls prompts/facturaExtractor_prompt.md
```

## 🔧 Setup de Variables de Entorno

### **Método 1: Variables Explícitas (Recomendado para testing)**
```bash
# Exportar en la sesión
export GEMINI_API_KEY=AIzaSyBQSt4jiQ6Bfn0t8W54RRNqwo_3J-qXGbc
export GOOGLE_APPLICATION_CREDENTIALS=/home/sergi/proyectos/community-saas/credenciales/mi-saas-comunidades-vision-api.json

# Ejecutar test
npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --verbose
```

### **Método 2: Inline (Para comandos únicos)**
```bash
GEMINI_API_KEY=AIzaSyBQSt4jiQ6Bfn0t8W54RRNqwo_3J-qXGbc npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --verbose
```

### **Método 3: Script de Convenience**
```bash
# Crear script helper
cat > test-e2e.sh << 'EOF'
#!/bin/bash
export GEMINI_API_KEY=AIzaSyBQSt4jiQ6Bfn0t8W54RRNqwo_3J-qXGbc
export GOOGLE_APPLICATION_CREDENTIALS=/home/sergi/proyectos/community-saas/credenciales/mi-saas-comunidades-vision-api.json

npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts "$@"
EOF

chmod +x test-e2e.sh

# Usar el script
./test-e2e.sh factura --verbose
./test-e2e.sh acta --steps=3
```

## 📁 Estructura de Archivos Necesarios

```
project-root/
├── src/lib/ingesta/test/
│   └── test-complete-e2e-validation_1.ts  # 🧪 Test principal
├── src/lib/schemas/
│   └── document-types-schema.json         # 📋 Schema central  
├── prompts/
│   ├── facturaExtractor_prompt.md         # 📝 Prompt para facturas
│   ├── actaExtractor_prompt.md            # 📝 Prompt para actas
│   └── ...                               # 📝 Otros prompts
├── datos/pdf/
│   ├── factura.pdf                       # 📄 PDF de prueba
│   ├── acta.pdf                          # 📄 PDF de prueba
│   └── ...                               # 📄 Otros PDFs
├── datos/e2e-reports/                    # 📊 Reportes generados
├── credenciales/
│   └── mi-saas-comunidades-vision-api.json # 🔐 Credenciales Google
└── extract-pdf-text.js                   # 🔧 Script PDF-parse
```

## 🎯 Casos de Uso Prácticos

### **Durante Desarrollo de Nuevos Tipos**
```bash
# 1. Añadir nuevo tipo al schema
# 2. Crear prompt template
# 3. Añadir PDF de prueba  
# 4. Testear pipeline completo
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts nuevo_tipo --verbose
```

### **Testing de Regresión**
```bash  
# Script para testear todos los tipos
for tipo in acta escritura albaran factura comunicado contrato presupuesto; do
    echo "Testing $tipo..."
    GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts $tipo
done
```

### **Performance Testing**
```bash
# Medir tiempos de cada paso
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts factura --steps=1-6 --verbose | grep "en.*ms"

# Output esperado:
# ✅ Extraído: 1113 caracteres con google-vision-ocr en 1842ms
# ✅ Clasificado: factura (95.0%) en 0ms  
# ✅ Extraído: 27 campos en 6080ms
# ✅ Validación: ÉXITO en 1ms
# ✅ Template: 100.0% compatibilidad en 1ms
# ✅ Schema BD: VÁLIDO en 1ms
```

### **Debugging Específico de IA**
```bash
# Solo metadata extraction para ajustar prompts
GEMINI_API_KEY=xxx npx tsx src/lib/ingesta/test/test-complete-e2e-validation_1.ts acta --steps=3 --verbose

# Revisar campos extraídos:
# 📋 Campos: meeting_date, attendees, topics, decisions, ...
```

## 📊 Análisis de Reportes JSON

Los reportes detallados se guardan en `datos/e2e-reports/`:

```bash
# Ver último reporte
ls -la datos/e2e-reports/ | tail -1

# Analizar reporte con jq  
cat datos/e2e-reports/e2e-modernized-*.json | jq '.summary'

# Ver campos extraídos
cat datos/e2e-reports/e2e-modernized-*.json | jq '.detailed_results[0].extracted_data | keys'
```

## 🔄 Auto-Dependency Resolution Explained

El test es inteligente y ejecuta automáticamente los pasos prerequisitos:

```bash
# Usuario pide solo paso 4 (validación)
npx tsx test...ts factura --steps=4

# Test automáticamente ejecuta:
# 1. 📄 PASO 1: Extracción (necesita PDF)  
# 2. 🏷️ PASO 2: Clasificación (necesita texto)
# 3. 📊 PASO 3: Metadata (necesita tipo)
# 4. 🔍 PASO 4: Validación (objetivo usuario) ✅
```

## ⚠️ Troubleshooting

### **Error: "Cannot find module"**
- **Problema**: Ejecutando desde directorio incorrecto
- **Solución**: `cd` al project root antes de ejecutar

### **Error: "GEMINI_API_KEY not found"**
- **Problema**: Variable de entorno no configurada
- **Solución**: Exportar `GEMINI_API_KEY` antes de ejecutar

### **Error: "No se pudo leer prompt"**
- **Problema**: Archivo prompt faltante
- **Solución**: Verificar que existe `prompts/{agentName}_prompt.md`

### **Error: "File not found: factura.pdf"**  
- **Problema**: PDF de prueba no existe
- **Solución**: Añadir PDF a `datos/pdf/factura.pdf`

### **Error: Google Vision API**
- **Problema**: Credenciales incorrectas o cuota excedida
- **Solución**: Verificar `GOOGLE_APPLICATION_CREDENTIALS` y cuota API

## 🎯 Próximos Pasos

1. **Añadir más tipos de documentos** al schema
2. **Optimizar prompts** para mejor extracción
3. **Integrar en CI/CD** para testing automático  
4. **Extender validaciones** específicas por tipo
5. **Métricas de performance** detalladas por paso

---

## 📚 Recursos Adicionales

- [📋 Documentación completa](../../../docs/test-e2e-modernized-documentation.md)
- [📊 Diagramas de flujo](../../../docs/test-e2e-flow-diagram.md)  
- [🏗️ Arquitectura del pipeline](../core/)
- [📝 Templates de prompts](../../../prompts/)

---

**🚀 Happy Testing!**