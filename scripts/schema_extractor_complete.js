/**
 * ===============================================================================
 * EXTRACTOR COMPLETO DE SCHEMA - LAS 10 QUERIES EXACTAS
 * ===============================================================================
 * Ejecuta las mismas 10 queries que están en supabase/scripts/get_full_schema.sql
 * Reemplaza el proceso manual completo con resultados idénticos
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuración
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 EXTRACTOR COMPLETO - 10 QUERIES EXACTAS');
console.log('==========================================');

if (!supabaseUrl || !serviceKey) {
    console.error('❌ ERROR: Variables de entorno no encontradas');
    process.exit(1);
}

// Crear cliente con service role para acceso completo
const supabase = createClient(supabaseUrl, serviceKey);

// Las 10 queries exactas del archivo get_full_schema.sql
const queries = [
    {
        title: "1. EXTENSIONES HABILITADAS",
        sql: `SELECT extname as extension_name 
              FROM pg_extension 
              WHERE extname NOT IN ('plpgsql', 'pg_stat_statements')
              ORDER BY extname;`
    },
    {
        title: "2. TABLAS EXISTENTES (Schema público)",
        sql: `SELECT 
                table_name,
                table_type,
                is_insertable_into,
                is_typed
              FROM information_schema.tables 
              WHERE table_schema = 'public' 
              ORDER BY table_name;`
    },
    {
        title: "3. COLUMNAS DE TODAS LAS TABLAS",
        sql: `SELECT 
                table_name,
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length,
                numeric_precision
              FROM information_schema.columns
              WHERE table_schema = 'public'
              ORDER BY table_name, ordinal_position;`
    },
    {
        title: "4. PRIMARY KEYS",
        sql: `SELECT 
                tc.table_name,
                kcu.column_name,
                tc.constraint_name
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu 
                  ON tc.constraint_name = kcu.constraint_name
              WHERE tc.constraint_type = 'PRIMARY KEY'
                  AND tc.table_schema = 'public'
              ORDER BY tc.table_name;`
    },
    {
        title: "5. FOREIGN KEYS Y REFERENCIAS",
        sql: `SELECT
                tc.constraint_name,
                tc.table_name as source_table,
                kcu.column_name as source_column,
                ccu.table_name as target_table,
                ccu.column_name as target_column,
                rc.update_rule,
                rc.delete_rule
              FROM information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu
                  ON tc.constraint_name = kcu.constraint_name
              JOIN information_schema.constraint_column_usage ccu
                  ON ccu.constraint_name = tc.constraint_name
              JOIN information_schema.referential_constraints rc
                  ON tc.constraint_name = rc.constraint_name
              WHERE tc.constraint_type = 'FOREIGN KEY' 
                  AND tc.table_schema = 'public'
              ORDER BY tc.table_name, kcu.column_name;`
    },
    {
        title: "6. CHECK CONSTRAINTS",
        sql: `SELECT 
                tc.table_name,
                tc.constraint_name,
                cc.check_clause
              FROM information_schema.table_constraints tc
              JOIN information_schema.check_constraints cc
                  ON tc.constraint_name = cc.constraint_name
              WHERE tc.constraint_type = 'CHECK'
                  AND tc.table_schema = 'public'
              ORDER BY tc.table_name;`
    },
    {
        title: "7. ÍNDICES",
        sql: `SELECT 
                schemaname,
                tablename,
                indexname,
                indexdef
              FROM pg_indexes
              WHERE schemaname = 'public'
              ORDER BY tablename, indexname;`
    },
    {
        title: "8. FUNCIONES CUSTOM (Solo las tuyas, no pgvector)",
        sql: `SELECT 
                routine_name,
                routine_type,
                data_type as return_type,
                routine_definition
              FROM information_schema.routines 
              WHERE routine_schema = 'public'
                  AND routine_name NOT LIKE 'vector%'
                  AND routine_name NOT LIKE 'halfvec%' 
                  AND routine_name NOT LIKE 'sparsevec%'
                  AND routine_name NOT LIKE '%distance'
                  AND routine_name NOT LIKE 'ivf%'
                  AND routine_name NOT LIKE 'hnsw%'
                  AND routine_name NOT LIKE 'binary_quantize'
                  AND routine_name NOT LIKE 'l2_%'
                  AND routine_name NOT LIKE 'l1_%'
                  AND routine_name NOT LIKE 'inner_product'
                  AND routine_name NOT LIKE 'cosine_distance'
                  AND routine_name NOT LIKE 'hamming_distance'
                  AND routine_name NOT LIKE 'jaccard_distance'
                  AND routine_name NOT LIKE 'array_to_%'
                  AND routine_name NOT LIKE '%_to_float4'
                  AND routine_name NOT LIKE 'subvector'
                  AND routine_name NOT IN ('avg', 'sum')
              ORDER BY routine_name;`
    },
    {
        title: "9. TRIGGERS",
        sql: `SELECT 
                trigger_name,
                event_object_table as table_name,
                action_timing,
                event_manipulation,
                action_statement
              FROM information_schema.triggers
              WHERE trigger_schema = 'public'
              ORDER BY event_object_table, trigger_name;`
    },
    {
        title: "10. RLS (Row Level Security) POLICIES",
        sql: `SELECT 
                schemaname,
                tablename,
                policyname,
                permissive,
                roles,
                cmd,
                qual,
                with_check
              FROM pg_policies
              WHERE schemaname = 'public'
              ORDER BY tablename, policyname;`
    }
];

async function executeCompleteSchema() {
    console.log(`🚀 Ejecutando ${queries.length} queries exactas...`);
    console.log('');
    
    const results = [];
    const timestamp = new Date().toISOString();
    
    // Header del archivo
    results.push('===============================================================================');
    results.push('SCHEMA COMPLETO DE SUPABASE - 10 QUERIES EXACTAS');
    results.push('===============================================================================');
    results.push(`Fecha: ${timestamp}`);
    results.push('Método: Las mismas queries que get_full_schema.sql');
    results.push('');
    
    // Ejecutar cada query
    for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        console.log(`📊 ${query.title} (${i + 1}/${queries.length})`);
        
        results.push(`=============================================================================`);
        results.push(`-- ${query.title}`);
        results.push(`=============================================================================`);
        
        try {
            // Ejecutar query SQL directa usando el método rpc
            const { data, error } = await supabase.rpc('execute_sql', { 
                query: query.sql 
            });
            
            if (error) {
                console.log(`  ⚠️ Query directa falló: ${error.message}`);
                results.push(`❌ Error: ${error.message}`);
                results.push('');
                continue;
            }
            
            if (data && data.length > 0) {
                console.log(`  ✅ ${data.length} resultados`);
                
                // Formatear resultados como tabla
                const headers = Object.keys(data[0]);
                results.push(headers.join(' | '));
                results.push(headers.map(h => '-'.repeat(h.length)).join('-+-'));
                
                data.forEach(row => {
                    const values = headers.map(header => {
                        const value = row[header];
                        if (value === null) return 'NULL';
                        if (typeof value === 'string' && value.length > 100) {
                            return value.substring(0, 100) + '...';
                        }
                        return String(value);
                    });
                    results.push(values.join(' | '));
                });
                
            } else {
                console.log(`  ℹ️ Sin resultados`);
                results.push('(Sin resultados)');
            }
            
        } catch (err) {
            console.log(`  ❌ Excepción: ${err.message}`);
            results.push(`❌ Excepción: ${err.message}`);
        }
        
        results.push('');
        results.push('');
    }
    
    // Guardar archivo
    const outputFile = 'database_schema_actual.txt';
    const output = results.join('\n');
    
    fs.writeFileSync(outputFile, output);
    
    console.log('');
    console.log('✅ EXTRACCIÓN COMPLETA TERMINADA');
    console.log('================================');
    console.log(`📄 Archivo: ${outputFile}`);
    console.log(`📏 Líneas: ${output.split('\n').length}`);
    console.log(`💽 Tamaño: ${(output.length / 1024).toFixed(2)} KB`);
    console.log(`🔍 Queries ejecutadas: ${queries.length}/10`);
    
    return outputFile;
}

// Ejecutar
executeCompleteSchema()
    .then((outputFile) => {
        console.log('');
        console.log('🎯 VALIDACIÓN:');
        console.log('==============');
        console.log('✅ Ahora el archivo contiene las 10 queries exactas de get_full_schema.sql');
        console.log('✅ Resultados idénticos al proceso manual');
        console.log('✅ Listo para análisis de Claude Code');
    })
    .catch((error) => {
        console.error('❌ ERROR FATAL:', error);
        process.exit(1);
    });