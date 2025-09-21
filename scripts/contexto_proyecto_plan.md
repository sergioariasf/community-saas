<!--
ARCHIVO: contexto_proyecto_plan.md
PROPÓSITO: Documentación de la herramienta de contexto del proyecto para LLMs
ESTADO: production
DEPENDENCIAS: contexto_proyecto.js, CLAUDE.md
OUTPUTS: Documentación técnica de la herramienta
ACTUALIZADO: 2025-09-14
-->

# 📊 HERRAMIENTA DE CONTEXTO DEL PROYECTO

## 🎯 PROPÓSITO

Herramienta automatizada que genera un contexto completo del proyecto SaaS para mejorar la eficiencia de interacciones con LLMs, proporcionando información estructurada y económica en tokens.

## 🛠️ COMPONENTES

### **Script Principal**: `scripts/contexto_proyecto.js`
- **Funcionalidad**: Escanea recursivamente todo el proyecto
- **Análisis**: Encabezados, estructura, métricas, alertas
- **Output**: `scripts/CONTEXTO_PROYECTO_OUT.md`
- **Ejecución**: `node scripts/contexto_proyecto.js`

### **Configuración en**: `CLAUDE.md`
- **Sección**: "📊 Contexto del Proyecto"
- **Incluye**: Encabezado obligatorio estándar
- **Adaptaciones**: Por tipo de archivo (.md, .sql, .env, .json)

## 📋 ENCABEZADO ESTÁNDAR (FORMATO SIMPLIFICADO)

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

**Adaptaciones por tipo de archivo:**
- **Markdown**: `<!-- ARCHIVO: ... -->`
- **SQL**: `-- ARCHIVO: ...`
- **Shell/Env**: `# ARCHIVO: ...`

## 📊 MÉTRICAS ACTUALES

- **Total archivos analizados**: 496
- **Líneas de código**: 138,307
- **Cobertura de encabezados**: 0.2% (1/496)
- **Tokens estimados del reporte**: ~8,818
- **Costo aproximado GPT-4**: $0.0003

## 🎯 BENEFICIOS

### **Para LLMs:**
- **Contexto rápido** del proyecto completo
- **Economía de tokens** - información condensada
- **Estructura clara** - fácil navegación
- **Estado actualizado** - detección automática de cambios

### **Para Desarrolladores:**
- **Visibilidad total** del proyecto
- **Detección de archivos** sin documentar
- **Alertas automáticas** de discrepancias de fechas
- **Índice navegable** de funcionalidades

## 🔄 PROCESO DE ANÁLISIS

1. **Escaneo recursivo** de directorios
2. **Extracción de encabezados** (primeras 20 líneas)
3. **Parsing de metadatos** (PROPÓSITO, ESTADO, etc.)
4. **Comparación de fechas** (header vs modificación)
5. **Generación de alertas** automáticas
6. **Creación de reporte** estructurado
7. **Estimación de tokens** para LLM

## ⚠️ CONFIGURACIÓN

### **Carpetas ignoradas:**
- `node_modules`, `.git`, `.next`, `dist`, `build`, `.vercel`

### **Formatos de comentario soportados:**
- **JavaScript/TypeScript**: `/** */`
- **Markdown**: `<!-- -->`
- **SQL**: `-- comentario`
- **Shell/Env**: `# comentario`
- **Python**: `""" """`

## 🚀 PRÓXIMOS PASOS

1. **Adopción gradual** - Añadir encabezados mientras desarrollamos
2. **Automatización** - Script para añadir encabezados a archivos críticos
3. **Integración CI/CD** - Verificación automática de encabezados
4. **Métricas de calidad** - Dashboard de cobertura

## 📈 IMPACTO ESPERADO

- **Sesiones LLM más eficientes** - Contexto inmediato
- **Menos tokens desperdiciados** - Información relevante
- **Mejor mantenimiento** - Código autodocumentado
- **Onboarding rápido** - Nuevos desarrolladores
- **Debugging mejorado** - Trazabilidad clara

## 🔧 COMANDOS ÚTILES

```bash
# Generar contexto completo
node scripts/contexto_proyecto.js

# Ver reporte generado
cat scripts/CONTEXTO_PROYECTO_OUT.md

# Buscar archivos sin encabezado
grep -L "ARCHIVO:" **/*.js
```

---
*Herramienta creada para optimizar el desarrollo con IA - Community SaaS Project*
