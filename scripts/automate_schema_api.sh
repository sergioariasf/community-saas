#!/bin/bash

# ===============================================================================
# SCRIPT: Automatización de Schema via Supabase API (Alternativa)
# ===============================================================================
# Usa la API REST de Supabase para obtener información del schema
# Más confiable que psql directo en algunos entornos de red

echo "🔍 ANÁLISIS DE SCHEMA VIA SUPABASE API..."
echo "================================================"

# Configuración
SUPABASE_PROJECT_URL="https://vhybocthkbupgedovovj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzk4MjAsImV4cCI6MjA3Mjk1NTgyMH0.p_vGX8kx6EWF6GJOYCjQw2EcMD-KvwsInKcFj9KLQwk"
OUTPUT_FILE="database_schema_actual_api.txt"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')

echo "📁 Método: API REST"
echo "📝 Archivo salida: $OUTPUT_FILE"
echo "⏰ Timestamp: $TIMESTAMP"
echo ""

# Crear backup del archivo anterior si existe
if [ -f "$OUTPUT_FILE" ]; then
    echo "💾 Creando backup del archivo anterior..."
    cp "$OUTPUT_FILE" "${OUTPUT_FILE}.backup_${TIMESTAMP}"
fi

echo "🚀 Obteniendo información del schema via API..."
echo "" > "$OUTPUT_FILE"

# Función para hacer consultas a la API
query_api() {
    local query="$1"
    local description="$2"
    
    echo "📊 $description" | tee -a "$OUTPUT_FILE"
    echo "=============================================" | tee -a "$OUTPUT_FILE"
    
    curl -s -X POST "$SUPABASE_PROJECT_URL/rest/v1/rpc/execute_sql" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Content-Type: application/json" \
        -d "{\"query\": \"$query\"}" | tee -a "$OUTPUT_FILE"
    
    echo "" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
}

# Método alternativo: Usar PostgREST para obtener metadatos de tablas
echo "📋 OBTENIENDO INFORMACIÓN DE TABLAS VIA PostgREST..."
echo "=============================================" >> "$OUTPUT_FILE"

# Listar todas las tablas disponibles via PostgREST
echo "🔍 Explorando endpoints disponibles..." | tee -a "$OUTPUT_FILE"

# Intentar obtener información básica de las tablas conocidas
TABLES=("communities" "user_roles" "items" "private_items")

for table in "${TABLES[@]}"; do
    echo "📊 TABLA: $table" | tee -a "$OUTPUT_FILE"
    echo "----------------------------------------" | tee -a "$OUTPUT_FILE"
    
    # Obtener estructura de la tabla (primeros registros para inferir columnas)
    curl -s -X GET "$SUPABASE_PROJECT_URL/rest/v1/$table?limit=1" \
        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
        -H "apikey: $SUPABASE_ANON_KEY" \
        -H "Prefer: count=exact" | tee -a "$OUTPUT_FILE"
    
    echo "" | tee -a "$OUTPUT_FILE"
    echo "" | tee -a "$OUTPUT_FILE"
done

# Si el método anterior no funciona, usar un enfoque directo con Node.js
echo "🔧 CREANDO SCRIPT AUXILIAR NODE.JS..."

cat > temp_schema_extractor.js << 'EOF'
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzk4MjAsImV4cCI6MjA3Mjk1NTgyMH0.p_vGX8kx6EWF6GJOYCjQw2EcMD-KvwsInKcFj9KLQwk';

console.log('🔍 Extrayendo schema via Supabase JS Client...');

async function extractSchema() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const results = [];
    
    // Listar tablas conocidas y obtener datos de muestra
    const tables = ['communities', 'user_roles', 'items', 'private_items'];
    
    for (const table of tables) {
        try {
            console.log(`📊 Analizando tabla: ${table}`);
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact' })
                .limit(1);
            
            if (error) {
                results.push(`❌ Error en tabla ${table}: ${error.message}`);
            } else {
                results.push(`✅ Tabla ${table}:`);
                results.push(`   📏 Total registros: ${count}`);
                if (data && data.length > 0) {
                    results.push(`   🔑 Columnas encontradas: ${Object.keys(data[0]).join(', ')}`);
                } else {
                    results.push(`   ⚠️ Tabla vacía, no se pueden inferir columnas`);
                }
                results.push('');
            }
        } catch (err) {
            results.push(`❌ Excepción en tabla ${table}: ${err.message}`);
        }
    }
    
    // Escribir resultados
    const output = results.join('\n');
    fs.writeFileSync('database_schema_actual_js.txt', output);
    console.log('✅ Resultados guardados en database_schema_actual_js.txt');
    console.log(output);
}

extractSchema().catch(console.error);
EOF

echo "📦 Instalando dependencias necesarias..." | tee -a "$OUTPUT_FILE"

# Verificar si @supabase/supabase-js está disponible
if npm list @supabase/supabase-js &> /dev/null; then
    echo "✅ @supabase/supabase-js ya disponible" | tee -a "$OUTPUT_FILE"
    echo "🚀 Ejecutando extractor Node.js..." | tee -a "$OUTPUT_FILE"
    node temp_schema_extractor.js | tee -a "$OUTPUT_FILE"
else
    echo "⚠️ @supabase/supabase-js no disponible, saltando método JS" | tee -a "$OUTPUT_FILE"
fi

# Limpiar archivo temporal
rm -f temp_schema_extractor.js

echo "" | tee -a "$OUTPUT_FILE"
echo "🏁 ANÁLISIS VIA API COMPLETADO" | tee -a "$OUTPUT_FILE"
echo "================================================" | tee -a "$OUTPUT_FILE"

if [ -f "$OUTPUT_FILE" ]; then
    LINES=$(wc -l < "$OUTPUT_FILE")
    SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "📊 Resultados en: $OUTPUT_FILE"
    echo "📏 Líneas: $LINES | 💽 Tamaño: $SIZE"
    
    echo ""
    echo "👀 VISTA PREVIA:"
    echo "----------------------------------------"
    head -15 "$OUTPUT_FILE"
    echo "----------------------------------------"
fi