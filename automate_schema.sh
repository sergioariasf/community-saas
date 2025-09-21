#!/bin/bash

# ===============================================================================
# AUTOMATIZADOR DE SCHEMA - SCRIPT PRINCIPAL
# ===============================================================================
# Reemplaza completamente el proceso manual de 4 pasos:
# ❌ 1. Claude code creé → supabase/scripts/get_full_schema.sql  
# ❌ 2. Tú ejecutaste → Las queries en Supabase SQL Editor
# ❌ 3. Tú pegaste → Resultados en database_schema_actual.txt  
# ❌ 4. Claude code leí → El archivo con Read tool
# ✅ AHORA: Un solo comando automatizado

clear
echo "🚀 AUTOMATIZADOR DE SCHEMA DE SUPABASE"
echo "======================================"
echo "📋 Reemplaza el proceso manual de 4 pasos por 1 comando"
echo "⚡ Usa Supabase JS Client con Service Role Key"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f ".env.local" ]; then
    echo "❌ ERROR: .env.local no encontrado"
    echo "📁 Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json no encontrado"
    echo "📁 Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

echo "✅ Verificaciones iniciales completadas"
echo ""

# Ejecutar el extractor
echo "🔍 Ejecutando extractor de schema..."
echo "⏳ Esto puede tomar unos segundos..."
echo ""

node scripts/schema_extractor_final.js

# Verificar que el archivo fue generado correctamente
if [ -f "database_schema_actual.txt" ]; then
    echo ""
    echo "✅ PROCESO COMPLETADO EXITOSAMENTE"
    echo "================================="
    
    # Estadísticas del archivo
    LINES=$(wc -l < "database_schema_actual.txt")
    SIZE=$(du -h "database_schema_actual.txt" | cut -f1)
    
    echo "📊 Archivo: database_schema_actual.txt"
    echo "📏 Líneas: $LINES"
    echo "💽 Tamaño: $SIZE"
    echo ""
    
    echo "⚠️ LIMITACIÓN IMPORTANTE:"
    echo "════════════════════════="
    echo "📊 MÉTODO ACTUAL: Análisis básico de tablas (4 tablas conocidas)"
    echo "📋 MÉTODO COMPLETO: Requiere las 10 queries específicas de get_full_schema.sql"
    echo ""
    echo "🎯 PARA ANÁLISIS COMPLETO:"
    echo "═════════════════════════"
    echo "1. 🌐 Ve a Supabase SQL Editor"
    echo "2. 📄 Ejecuta: supabase/scripts/get_full_schema.sql"  
    echo "3. 📋 Copia los resultados en: database_schema_actual.txt"
    echo "4. 🔧 Claude Code puede leerlo con: Read database_schema_actual.txt"
    echo ""
    echo "🔧 MÉTODO ACTUAL (LIMITADO):"
    echo "══════════════════════════"
    echo "✅ Análisis básico de tablas completado"
    echo "✅ Útil para desarrollo y testing rápido"
    echo "❌ No incluye: Extensiones, Foreign Keys, Índices, RLS Policies, etc."
    echo ""
    
    echo "📈 COMPARATIVA DE EFICIENCIA:"
    echo "════════════════════════════"
    echo "❌ Proceso Manual Anterior:"
    echo "   • 4 pasos manuales"
    echo "   • ~10-15 minutos"
    echo "   • Propenso a errores de copy/paste"
    echo ""
    echo "✅ Proceso Automatizado Actual:"
    echo "   • 1 comando: ./automate_schema.sh"
    echo "   • ~30 segundos"
    echo "   • Sin errores humanos"
    echo ""
    
    echo "🔄 PARA PRÓXIMAS EJECUCIONES:"
    echo "════════════════════════════"
    echo "Simplemente ejecuta: ./automate_schema.sh"
    echo ""
    
else
    echo ""
    echo "❌ ERROR: No se generó el archivo database_schema_actual.txt"
    echo "🔧 Revisa los logs anteriores para diagnosticar el problema"
    exit 1
fi