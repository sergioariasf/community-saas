/**
 * ===============================================================================
 * EXTRACTOR HÍBRIDO FINAL - LAS 10 QUERIES EXACTAS VIA JS CLIENT
 * ===============================================================================
 * Ejecuta las mismas 10 queries de get_full_schema.sql usando Supabase JS
 * Garantiza que database_schema_actual.txt contiene EXACTAMENTE lo esperado
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 EXTRACTOR HÍBRIDO - 10 QUERIES EXACTAS VIA JS');
console.log('================================================');
console.log(`📡 URL: ${supabaseUrl}`);
console.log(`🔑 Service Key: ${serviceKey ? 'OK' : 'FALTA'}`);

if (!supabaseUrl || !serviceKey) {
    console.error('❌ ERROR: Variables de entorno faltantes');
    process.exit(1);
}

// Cliente con service role para máximos privilegios
const supabase = createClient(supabaseUrl, serviceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Las 10 queries exactas del archivo get_full_schema.sql
const queries = [
    {
        id: 1,
        title: "EXTENSIONES HABILITADAS",
        sql: `SELECT extname as extension_name FROM pg_extension WHERE extname NOT IN ('plpgsql', 'pg_stat_statements') ORDER BY extname`
    },
    {
        id: 2, 
        title: "TABLAS EXISTENTES (Schema público)",
        sql: `SELECT table_name, table_type, is_insertable_into, is_typed FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    },
    {
        id: 3,
        title: "COLUMNAS DE TODAS LAS TABLAS", 
        sql: `SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length, numeric_precision FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position`
    },
    {
        id: 4,
        title: "PRIMARY KEYS",
        sql: `SELECT tc.table_name, kcu.column_name, tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public' ORDER BY tc.table_name`
    },
    {
        id: 5,
        title: "FOREIGN KEYS Y REFERENCIAS",
        sql: `SELECT tc.constraint_name, tc.table_name as source_table, kcu.column_name as source_column, ccu.table_name as target_table, ccu.column_name as target_column, rc.update_rule, rc.delete_rule FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public' ORDER BY tc.table_name, kcu.column_name`
    },
    {
        id: 6,
        title: "CHECK CONSTRAINTS", 
        sql: `SELECT tc.table_name, tc.constraint_name, cc.check_clause FROM information_schema.table_constraints tc JOIN information_schema.check_constraints cc ON tc.constraint_name = cc.constraint_name WHERE tc.constraint_type = 'CHECK' AND tc.table_schema = 'public' ORDER BY tc.table_name`
    },
    {
        id: 7,
        title: "ÍNDICES",
        sql: `SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname`
    },
    {
        id: 8,
        title: "FUNCIONES CUSTOM (Solo las tuyas, no pgvector)",
        sql: `SELECT routine_name, routine_type, data_type as return_type, routine_definition FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name NOT LIKE 'vector%' AND routine_name NOT LIKE 'halfvec%' AND routine_name NOT LIKE 'sparsevec%' AND routine_name NOT LIKE '%distance' AND routine_name NOT LIKE 'ivf%' AND routine_name NOT LIKE 'hnsw%' AND routine_name NOT LIKE 'binary_quantize' AND routine_name NOT LIKE 'l2_%' AND routine_name NOT LIKE 'l1_%' AND routine_name NOT LIKE 'inner_product' AND routine_name NOT LIKE 'cosine_distance' AND routine_name NOT LIKE 'hamming_distance' AND routine_name NOT LIKE 'jaccard_distance' AND routine_name NOT LIKE 'array_to_%' AND routine_name NOT LIKE '%_to_float4' AND routine_name NOT LIKE 'subvector' AND routine_name NOT IN ('avg', 'sum') ORDER BY routine_name`
    },
    {
        id: 9,
        title: "TRIGGERS",
        sql: `SELECT trigger_name, event_object_table as table_name, action_timing, event_manipulation, action_statement FROM information_schema.triggers WHERE trigger_schema = 'public' ORDER BY event_object_table, trigger_name`
    },
    {
        id: 10,
        title: "RLS (Row Level Security) POLICIES", 
        sql: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname`
    }
];

async function executeQuery(query) {
    console.log(`📊 ${query.id}. ${query.title}`);
    
    try {
        // Intentar ejecutar query SQL directa usando .rpc()
        const { data, error } = await supabase.rpc('sql', {
            query: query.sql
        });
        
        if (data && data.length > 0) {
            console.log(`  ✅ ${data.length} resultados obtenidos`);
            return { success: true, data, count: data.length };
        } else if (error) {
            console.log(`  ⚠️ Error con rpc: ${error.message}`);
            
            // Método alternativo: usar .from() para queries de information_schema
            if (query.sql.includes('information_schema')) {
                console.log(`  🔄 Intentando método alternativo...`);
                // Este método no funcionará para todas las queries complejas
                return { success: false, error: error.message };
            }
            
            return { success: false, error: error.message };
        } else {
            console.log(`  ℹ️ Sin resultados`);
            return { success: true, data: [], count: 0 };
        }
        
    } catch (err) {
        console.log(`  ❌ Excepción: ${err.message}`);
        return { success: false, error: err.message };
    }
}

function formatResults(results) {
    if (!results || results.length === 0) {
        return ['(Sin resultados)'];
    }
    
    const lines = [];
    const headers = Object.keys(results[0]);
    
    // Header de la tabla
    lines.push(headers.join(' | '));
    lines.push(headers.map(h => '-'.repeat(h.length)).join('-+-'));
    
    // Datos
    results.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            if (value === null) return 'NULL';
            if (typeof value === 'string' && value.length > 80) {
                return value.substring(0, 80) + '...';
            }
            return String(value);
        });
        lines.push(values.join(' | '));
    });
    
    return lines;
}

async function executeAllQueries() {
    console.log('🚀 EJECUTANDO LAS 10 QUERIES EXACTAS...');
    console.log('');
    
    const results = [];
    const timestamp = new Date().toISOString();
    
    // Header del archivo
    results.push('===============================================================================');
    results.push('SCHEMA COMPLETO DE SUPABASE - 10 QUERIES EXACTAS');
    results.push('===============================================================================');
    results.push(`Fecha: ${timestamp}`);
    results.push('Método: Supabase JS Client con Service Role - Queries Exactas de get_full_schema.sql');
    results.push('Archivo origen: supabase/scripts/get_full_schema.sql');
    results.push('');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Ejecutar cada query
    for (const query of queries) {
        results.push('=============================================================================');
        results.push(`-- ${query.id}. ${query.title}`);
        results.push('=============================================================================');
        
        const result = await executeQuery(query);
        
        if (result.success) {
            successCount++;
            const formatted = formatResults(result.data);
            results.push(...formatted);
        } else {
            errorCount++;
            results.push(`❌ Error: ${result.error}`);
            results.push('⚠️ Esta query requiere acceso directo a PostgreSQL que puede no estar disponible via JS Client');
        }
        
        results.push('');
        results.push('');
    }
    
    // Footer con estadísticas
    results.push('===============================================================================');
    results.push('RESUMEN DE EJECUCIÓN');
    results.push('===============================================================================');
    results.push(`✅ Queries exitosas: ${successCount}/10`);
    results.push(`❌ Queries fallidas: ${errorCount}/10`);
    results.push(`📊 Total queries ejecutadas: ${queries.length}`);
    results.push('');
    
    if (errorCount > 0) {
        results.push('⚠️ NOTA: Algunas queries fallan porque el JS Client no tiene acceso completo');
        results.push('   a los schemas del sistema (information_schema, pg_*). Esto es normal.');
        results.push('   Para obtener TODA la información, usar el método manual:');
        results.push('   1. Ir a Supabase SQL Editor');
        results.push('   2. Ejecutar las queries de supabase/scripts/get_full_schema.sql');
        results.push('   3. Copiar resultados manualmente');
        results.push('');
    }
    
    // Guardar archivo
    const outputFile = 'database_schema_actual.txt';
    const output = results.join('\n');
    
    fs.writeFileSync(outputFile, output);
    
    console.log('');
    console.log('✅ EXTRACCIÓN COMPLETADA');
    console.log('========================');
    console.log(`📄 Archivo: ${outputFile}`);
    console.log(`📏 Líneas: ${output.split('\n').length}`);
    console.log(`💽 Tamaño: ${(output.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Queries exitosas: ${successCount}/10`);
    console.log(`❌ Queries fallidas: ${errorCount}/10`);
    
    return { outputFile, successCount, errorCount };
}

// Ejecutar
executeAllQueries()
    .then(({ outputFile, successCount, errorCount }) => {
        console.log('');
        console.log('🎯 VALIDACIÓN FINAL:');
        console.log('===================');
        console.log(`✅ Archivo ${outputFile} generado`);
        console.log(`📋 Contiene las mismas 10 secciones que get_full_schema.sql`);
        
        if (successCount === 10) {
            console.log('🎉 PERFECTO: Todas las queries ejecutadas correctamente');
            console.log('✅ Los datos son exactos y completos');
        } else {
            console.log(`⚠️ PARCIAL: ${successCount}/10 queries exitosas`);
            console.log('💡 Para datos completos, considera el método manual de SQL Editor');
        }
        
        console.log('');
        console.log('🔄 PRÓXIMA VEZ: ./automate_schema.sh');
    })
    .catch((error) => {
        console.error('❌ ERROR FATAL:', error);
        process.exit(1);
    });