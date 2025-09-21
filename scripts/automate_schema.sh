#!/bin/bash

# ===============================================================================
# SCRIPT: Automatización de Extracción de Schema de Supabase
# ===============================================================================
# Ejecuta automáticamente el análisis completo del schema y guarda resultados
# Basado en: supabase/scripts/get_full_schema.sql

echo "🔍 INICIANDO ANÁLISIS AUTOMÁTICO DE SCHEMA..."
echo "================================================"

# Función para verificar conectividad
check_connectivity() {
    echo "🌐 Verificando conectividad a Supabase..."
    
    # Test básico de conectividad
    if command -v curl &> /dev/null; then
        echo "📡 Probando conexión HTTP a Supabase..."
        if curl -s --connect-timeout 10 "https://vhybocthkbupgedovovj.supabase.co" > /dev/null; then
            echo "✅ Conexión HTTP exitosa"
        else
            echo "⚠️ Conexión HTTP falló"
        fi
    fi
    
    # Test de conexión PostgreSQL
    echo "🔌 Probando conexión PostgreSQL..."
    if command -v pg_isready &> /dev/null; then
        if pg_isready -h db.vhybocthkbupgedovovj.supabase.co -p 5432; then
            echo "✅ Servidor PostgreSQL responde"
        else
            echo "⚠️ Servidor PostgreSQL no responde"
        fi
    else
        echo "ℹ️ pg_isready no disponible, continuando..."
    fi
}

# Configuración
SUPABASE_URL="postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM3OTgyMCwiZXhwIjoyMDcyOTU1ODIwfQ.cccxSgmi-46frrr_zz_vI4EhZLCDa6EYnFTyoa7Nzz4@db.vhybocthkbupgedovovj.supabase.co:5432/postgres"
SQL_FILE="supabase/scripts/get_full_schema.sql"
OUTPUT_FILE="database_schema_actual.txt"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

# Verificar que el archivo SQL existe
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ ERROR: No se encuentra el archivo $SQL_FILE"
    exit 1
fi

echo "📁 Archivo SQL: $SQL_FILE"
echo "📝 Archivo salida: $OUTPUT_FILE"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Ejecutar verificación de conectividad
check_connectivity
echo ""

# Crear backup del archivo anterior si existe
if [ -f "$OUTPUT_FILE" ]; then
    echo "💾 Creando backup del archivo anterior..."
    cp "$OUTPUT_FILE" "${OUTPUT_FILE}.backup_${TIMESTAMP}"
    echo "✅ Backup guardado en: ${OUTPUT_FILE}.backup_${TIMESTAMP}"
fi

echo ""
echo "🚀 Ejecutando análisis de schema..."
echo "⏳ Conectando a Supabase y ejecutando queries..."

# Ejecutar el script SQL y guardar resultados
psql "$SUPABASE_URL" -f "$SQL_FILE" -o "$OUTPUT_FILE" 2>&1

# Verificar si la ejecución fue exitosa
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ANÁLISIS COMPLETADO EXITOSAMENTE"
    echo "================================================"
    echo "📊 Resultados guardados en: $OUTPUT_FILE"
    
    # Mostrar estadísticas básicas del archivo generado
    if [ -f "$OUTPUT_FILE" ]; then
        LINES=$(wc -l < "$OUTPUT_FILE")
        SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        echo "📏 Líneas generadas: $LINES"
        echo "💽 Tamaño archivo: $SIZE"
        echo ""
        
        # Mostrar las primeras líneas para verificación
        echo "👀 VISTA PREVIA (primeras 10 líneas):"
        echo "----------------------------------------"
        head -10 "$OUTPUT_FILE"
        echo "----------------------------------------"
        echo ""
        
        echo "🎯 PRÓXIMO PASO:"
        echo "El archivo $OUTPUT_FILE ya está listo para ser leído por Claude Code"
        echo "Comando sugerido: Read $OUTPUT_FILE"
    fi
else
    echo ""
    echo "❌ ERROR AL EJECUTAR EL ANÁLISIS"
    echo "================================================"
    echo "Revisa la conexión a Supabase y el archivo SQL"
    
    # Mostrar el contenido del archivo de salida para debug
    if [ -f "$OUTPUT_FILE" ]; then
        echo ""
        echo "📋 Contenido del archivo de error:"
        cat "$OUTPUT_FILE"
    fi
    exit 1
fi

echo ""
echo "🏁 PROCESO AUTOMATIZADO COMPLETADO"
echo "================================================"