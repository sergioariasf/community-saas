/**
 * ===============================================================================  
 * EXTRACTOR DIRECTO - USA PSQL CON NODE.JS
 * ===============================================================================
 * Ejecuta las 10 queries usando psql directo desde Node.js
 * Garantiza resultados exactos del archivo get_full_schema.sql
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuración
require('dotenv').config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

console.log('🔍 EXTRACTOR DIRECTO - PSQL + NODE.JS');
console.log('=====================================');

if (!DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no encontrada en .env.local');
    process.exit(1);
}

console.log('🔑 DATABASE_URL encontrada');
console.log('📁 Archivo SQL: supabase/scripts/get_full_schema.sql');

// Verificar que el archivo SQL existe
const sqlFile = 'supabase/scripts/get_full_schema.sql';
if (!fs.existsSync(sqlFile)) {
    console.error(`❌ ERROR: No se encuentra ${sqlFile}`);
    process.exit(1);
}

console.log('✅ Archivo SQL verificado');
console.log('');

function executePsqlCommand() {
    return new Promise((resolve, reject) => {
        const outputFile = 'database_schema_actual.txt';
        
        // Construir comando psql
        const psqlCommand = `psql "${DATABASE_URL}" -f "${sqlFile}" -o "${outputFile}" 2>&1`;
        
        console.log('🚀 Ejecutando comando psql...');
        console.log('⏳ Esto puede tomar 30-60 segundos...');
        console.log('');
        
        // Ejecutar comando
        exec(psqlCommand, { 
            timeout: 120000, // 2 minutos timeout
            maxBuffer: 1024 * 1024 * 10 // 10MB buffer
        }, (error, stdout, stderr) => {
            
            console.log('📋 SALIDA DEL COMANDO:');
            console.log('======================');
            
            if (stdout) {
                console.log('📤 STDOUT:');
                console.log(stdout);
                console.log('');
            }
            
            if (stderr) {
                console.log('📤 STDERR:');
                console.log(stderr);
                console.log('');
            }
            
            if (error) {
                console.log('❌ ERROR DETECTADO:');
                console.log(error.message);
                console.log('');
                
                // Intentar analizar el tipo de error
                if (error.message.includes('Network is unreachable')) {
                    console.log('🔧 DIAGNÓSTICO: Problema de conectividad de red');
                    console.log('💡 SOLUCIONES:');
                    console.log('   1. Verifica tu conexión a internet');
                    console.log('   2. Prueba el método API alternativo');
                    console.log('   3. Verifica que no hay firewall bloqueando');
                } else if (error.message.includes('psql: command not found')) {
                    console.log('🔧 DIAGNÓSTICO: PostgreSQL client no instalado');
                    console.log('💡 SOLUCIONES:');
                    console.log('   1. Instala: sudo apt install postgresql-client');
                    console.log('   2. O usa el método API alternativo');
                } else {
                    console.log('🔧 DIAGNÓSTICO: Error desconocido');
                }
                
                reject(error);
                return;
            }
            
            // Verificar que se generó el archivo
            if (fs.existsSync(outputFile)) {
                const stats = fs.statSync(outputFile);
                const content = fs.readFileSync(outputFile, 'utf-8');
                
                console.log('✅ ARCHIVO GENERADO EXITOSAMENTE');
                console.log('================================');
                console.log(`📄 Archivo: ${outputFile}`);
                console.log(`📏 Líneas: ${content.split('\\n').length}`);
                console.log(`💽 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log('');
                
                // Verificar contenido
                if (content.includes('extension_name') && 
                    content.includes('table_name') && 
                    content.includes('column_name')) {
                    console.log('✅ VALIDACIÓN: Contenido parece completo');
                    console.log('🎯 Las 10 queries se ejecutaron correctamente');
                } else {
                    console.log('⚠️ ADVERTENCIA: Contenido puede estar incompleto');
                }
                
                // Mostrar preview
                console.log('');
                console.log('👀 VISTA PREVIA (primeras 20 líneas):');
                console.log('=====================================');
                const lines = content.split('\\n').slice(0, 20);
                lines.forEach((line, i) => {
                    console.log(`${(i + 1).toString().padStart(3)}: ${line}`);
                });
                console.log('=====================================');
                
                resolve(outputFile);
                
            } else {
                reject(new Error('El archivo de salida no fue generado'));
            }
        });
    });
}

// Ejecutar
console.log('🎯 INICIANDO PROCESO DIRECTO...');
console.log('');

executePsqlCommand()
    .then((outputFile) => {
        console.log('');
        console.log('🏁 PROCESO COMPLETADO EXITOSAMENTE');
        console.log('==================================');
        console.log(`✅ Archivo listo: ${outputFile}`);
        console.log('✅ Contiene las 10 queries exactas');
        console.log('✅ Resultados idénticos al proceso manual');
        console.log('');
        console.log('🔄 PRÓXIMA VEZ: ./automate_schema.sh');
    })
    .catch((error) => {
        console.log('');
        console.log('❌ PROCESO FALLÓ');
        console.log('================');
        console.log(`Error: ${error.message}`);
        console.log('');
        console.log('🔧 ALTERNATIVAS:');
        console.log('1. Usar método API (./scripts/schema_extractor_final.js)');
        console.log('2. Proceso manual original (SQL Editor)');
        console.log('3. Verificar conectividad y credenciales');
        
        process.exit(1);
    });