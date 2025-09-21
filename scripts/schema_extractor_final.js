/**
 * ===============================================================================
 * EXTRACTOR FINAL DE SCHEMA - AUTOMATIZADO
 * ===============================================================================
 * Usa las credenciales correctas para obtener el schema completo
 * Reemplaza el proceso manual: SQL Editor → copy/paste → análisis
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuración (lee de .env.local)
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 EXTRACTOR DE SCHEMA - PROCESO AUTOMATIZADO');
console.log('===============================================');
console.log(`📡 URL: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${serviceKey ? serviceKey.substring(0, 20) + '...' : 'NOT FOUND'}`);
console.log('');

if (!supabaseUrl || !serviceKey) {
    console.error('❌ ERROR: Variables de entorno no encontradas');
    console.error('Verifica que .env.local contenga:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

// Crear cliente con service role (acceso completo)
const supabase = createClient(supabaseUrl, serviceKey);

async function extractFullSchema() {
    console.log('🚀 Iniciando extracción completa del schema...');
    console.log('');
    
    const results = [];
    const timestamp = new Date().toISOString();
    
    results.push('===============================================================================');
    results.push('SCHEMA COMPLETO DE SUPABASE - EXTRAÍDO AUTOMÁTICAMENTE');
    results.push('===============================================================================');
    results.push(`Fecha: ${timestamp}`);
    results.push(`Método: Supabase JS Client con Service Role`);
    results.push('');
    
    // 1. LISTAR TODAS LAS TABLAS DISPONIBLES
    console.log('📊 1. Explorando todas las tablas...');
    results.push('📊 1. TABLAS DISPONIBLES');
    results.push('===============================================');
    
    try {
        // Usar una query directa para listar tablas
        const { data: tables, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .order('table_name');
        
        if (error) {
            // Método alternativo: intentar con tablas conocidas
            console.log('⚠️ Método directo falló, usando tablas conocidas...');
            results.push('⚠️ No se pudo consultar information_schema, usando tablas conocidas:');
            
            const knownTables = ['communities', 'user_roles', 'items', 'private_items'];
            
            for (const tableName of knownTables) {
                console.log(`  📋 Analizando: ${tableName}`);
                await analyzeTable(tableName, results);
            }
            
        } else if (tables && tables.length > 0) {
            console.log(`✅ Encontradas ${tables.length} tablas`);
            results.push(`✅ Total de tablas encontradas: ${tables.length}`);
            results.push('');
            
            for (const table of tables) {
                console.log(`  📋 Analizando: ${table.table_name}`);
                await analyzeTable(table.table_name, results);
            }
        }
        
    } catch (err) {
        console.error('❌ Error al listar tablas:', err.message);
        results.push(`❌ Error: ${err.message}`);
        
        // Fallback: usar tablas conocidas
        console.log('🔧 Usando fallback con tablas conocidas...');
        const knownTables = ['communities', 'user_roles', 'items', 'private_items'];
        
        for (const tableName of knownTables) {
            console.log(`  📋 Analizando: ${tableName}`);
            await analyzeTable(tableName, results);
        }
    }
    
    // Guardar resultados
    const outputFile = 'database_schema_actual.txt';
    const output = results.join('\n');
    
    fs.writeFileSync(outputFile, output);
    console.log('');
    console.log('✅ EXTRACCIÓN COMPLETADA');
    console.log('===============================================');
    console.log(`📄 Archivo generado: ${outputFile}`);
    console.log(`📏 Líneas: ${output.split('\n').length}`);
    console.log(`💽 Tamaño: ${(output.length / 1024).toFixed(2)} KB`);
    
    // Mostrar vista previa
    console.log('');
    console.log('👀 VISTA PREVIA (primeras 15 líneas):');
    console.log('----------------------------------------');
    console.log(output.split('\n').slice(0, 15).join('\n'));
    console.log('----------------------------------------');
    
    return outputFile;
}

async function analyzeTable(tableName, results) {
    results.push(`📋 TABLA: ${tableName}`);
    results.push('----------------------------------------');
    
    try {
        // Intentar obtener datos de muestra para inferir estructura
        const { data, error, count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact' })
            .limit(1);
        
        if (error) {
            results.push(`❌ Error: ${error.message}`);
        } else {
            results.push(`📊 Total registros: ${count || 0}`);
            
            if (data && data.length > 0) {
                const columns = Object.keys(data[0]);
                results.push(`🔑 Columnas (${columns.length}): ${columns.join(', ')}`);
                
                // Analizar tipos de datos básicos
                const sample = data[0];
                results.push('📋 Análisis de tipos:');
                
                for (const [col, value] of Object.entries(sample)) {
                    const type = value === null ? 'null' : typeof value;
                    const preview = value === null ? 'NULL' : 
                                  typeof value === 'string' && value.length > 50 ? 
                                  value.substring(0, 50) + '...' : 
                                  String(value);
                    results.push(`   ${col}: ${type} (ej: ${preview})`);
                }
                
            } else {
                results.push('⚠️ Tabla vacía - no se pueden inferir columnas');
            }
        }
        
    } catch (err) {
        results.push(`❌ Excepción: ${err.message}`);
    }
    
    results.push('');
}

// Ejecutar extracción
extractFullSchema()
    .then((outputFile) => {
        console.log('');
        console.log('🎯 PRÓXIMOS PASOS:');
        console.log(`1. El archivo ${outputFile} está listo para Claude Code`);
        console.log(`2. Comando sugerido: Read ${outputFile}`);
        console.log('3. Claude Code puede analizarlo y crear migraciones');
    })
    .catch((error) => {
        console.error('❌ ERROR FATAL:', error);
        process.exit(1);
    });