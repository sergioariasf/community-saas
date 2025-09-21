#!/usr/bin/env node

/**
 * ARCHIVO: test_agent_actas.js
 * PROPÓSITO: Test del nuevo agente acta_extractor_v2 desde tabla agents
 * ESTADO: testing
 * DEPENDENCIAS: saasAgents.ts, tabla agents, PDF real
 * OUTPUTS: Verificación sistema agentes vs prompt hardcoded
 * ACTUALIZADO: 2025-09-16
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Importar sistema de agentes
const { callSaaSAgent } = require('./src/lib/gemini/saasAgents.ts');

async function testAgentAcatas() {
  console.log('🧪 TEST AGENTE ACTAS V2 - Sistema Centralizado');
  console.log('='.repeat(60));

  const testFile = path.join(process.cwd(), 'datos', 'ACTA 19 MAYO 2022.pdf');
  
  try {
    // PASO 1: Extraer texto del PDF
    console.log('📖 Extrayendo texto del PDF...');
    const buffer = fs.readFileSync(testFile);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    
    console.log(`✅ PDF: ${pdfData.numpages} páginas, ${pdfData.text.length} caracteres`);

    // PASO 2: Llamar al agente desde la tabla agents
    console.log('\n🤖 Llamando agente acta_extractor_v2...');
    const startTime = Date.now();
    
    const resultado = await callSaaSAgent('acta_extractor_v2', {
      document_text: pdfData.text
    });
    
    const tiempoTotal = Date.now() - startTime;
    
    console.log(`⏱️ Tiempo: ${tiempoTotal}ms`);
    console.log(`✅ Éxito: ${resultado.success}`);

    if (!resultado.success) {
      console.error('❌ Error:', resultado.error);
      return;
    }

    // PASO 3: Mostrar datos extraídos
    console.log('\n📋 DATOS EXTRAÍDOS POR EL AGENTE:');
    console.log('-'.repeat(50));
    console.log(JSON.stringify(resultado.data, null, 2));

    // PASO 4: Verificar campos esperados
    const data = resultado.data;
    const verificaciones = [
      { campo: 'document_date', valor: data.document_date, tipo: 'string' },
      { campo: 'president_in', valor: data.president_in, tipo: 'string' },
      { campo: 'administrator', valor: data.administrator, tipo: 'string' },
      { campo: 'topic-presupuesto', valor: data['topic-presupuesto'], tipo: 'boolean' },
      { campo: 'estructura_detectada', valor: data.estructura_detectada, tipo: 'object' },
      { campo: 'orden_del_dia', valor: data.orden_del_dia, tipo: 'array' },
      { campo: 'decisions', valor: data.decisions, tipo: 'string' }
    ];

    let camposCorrectos = 0;
    console.log('\n🎯 VERIFICACIÓN DE CAMPOS:');
    verificaciones.forEach(({ campo, valor, tipo }) => {
      const tipoActual = Array.isArray(valor) ? 'array' : typeof valor;
      const correcto = tipoActual === tipo && valor !== null && valor !== undefined;
      
      if (correcto) {
        camposCorrectos++;
        console.log(`✅ ${campo}: ${tipoActual} - ${Array.isArray(valor) ? `[${valor.length}]` : String(valor).substring(0, 40)}`);
      } else {
        console.log(`❌ ${campo}: esperado ${tipo}, actual ${tipoActual} - ${valor}`);
      }
    });

    // PASO 5: Verificar temas
    console.log('\n🏷️ VERIFICACIÓN TEMAS:');
    const temas = [
      'topic-presupuesto', 'topic-administracion', 'topic-piscina', 
      'topic-jardin', 'topic-limpieza', 'topic-energia'
    ];
    
    temas.forEach(tema => {
      const valor = data[tema];
      const icono = typeof valor === 'boolean' ? '✅' : '❌';
      console.log(`${icono} ${tema}: ${valor}`);
    });

    // PASO 6: Verificar estructura detectada
    if (data.estructura_detectada) {
      console.log('\n🏗️ ESTRUCTURA DETECTADA:');
      const ed = data.estructura_detectada;
      console.log(`   ✅ quorum_alcanzado: ${ed.quorum_alcanzado}`);
      console.log(`   ✅ capitulos: ${ed.capitulos?.length || 0} elementos`);
      console.log(`   ✅ votaciones: ${ed.votaciones?.length || 0} elementos`);
      console.log(`   ✅ total_paginas: ${ed.total_paginas}`);
    }

    // PASO 7: Resultado final
    const porcentajeExito = (camposCorrectos / verificaciones.length * 100).toFixed(1);
    console.log(`\n📊 RESULTADO AGENTE:`);
    console.log(`   Campos correctos: ${camposCorrectos}/${verificaciones.length}`);
    console.log(`   Porcentaje éxito: ${porcentajeExito}%`);
    console.log(`   Metadata agent: ${resultado.metadata?.agent}`);
    console.log(`   Processing time: ${resultado.metadata?.processingTime}ms`);

    if (parseFloat(porcentajeExito) >= 85) {
      console.log(`✅ EXCELENTE: El agente funciona correctamente`);
      console.log(`🎯 LISTO PARA MIGRAR del sistema hardcoded al sistema de agentes`);
    } else {
      console.log(`⚠️ Requiere ajustes antes de migrar`);
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testAgentActas();