#!/usr/bin/env node

/**
 * ARCHIVO: test_extraccion_acta_real.js
 * PROPÓSITO: Test de extracción usando PDF real ACTA 19 MAYO 2022 con prompt mejorado
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, Gemini AI, datos/ACTA 19 MAYO 2022.pdf
 * OUTPUTS: Verificación extracción compatible con plantilla UI actas
 * ACTUALIZADO: 2025-09-16
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testExtraccionActaReal() {
  console.log('🧪 TEST EXTRACCIÓN ACTA REAL - Compatibilidad Plantilla UI');
  console.log('='.repeat(70));

  const testFile = path.join(process.cwd(), 'datos', 'ACTA 19 MAYO 2022.pdf');
  
  try {
    // PASO 1: Verificar archivo existe
    if (!fs.existsSync(testFile)) {
      throw new Error(`Archivo no encontrado: ${testFile}`);
    }
    console.log(`✅ Archivo encontrado: ${path.basename(testFile)}`);

    // PASO 2: Extraer texto del PDF
    console.log('\n📖 Extrayendo texto del PDF...');
    const buffer = fs.readFileSync(testFile);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer, { max: 0 });
    
    console.log(`✅ PDF: ${pdfData.numpages} páginas, ${pdfData.text.length} caracteres`);
    console.log(`📄 Primeros 200 chars: "${pdfData.text.substring(0, 200)}..."`);

    // PASO 3: Configurar Gemini
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no encontrada en .env.local');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('✅ Cliente Gemini configurado');

    // PASO 4: Crear prompt mejorado compatible con plantilla UI
    const prompt = `Analiza este ACTA de junta de propietarios y extrae TODOS los metadatos en formato JSON EXACTO.

TEXTO DEL ACTA:
${pdfData.text}

EXTRAE ESTOS METADATOS (JSON válido, sin texto adicional):

{
  "document_date": "YYYY-MM-DD",
  "tipo_reunion": "ordinaria|extraordinaria",
  "lugar": "lugar completo de la reunión",
  "comunidad_nombre": "nombre completo de la comunidad",
  "president_in": "nombre presidente entrante",
  "president_out": "nombre presidente saliente",
  "administrator": "nombre administrador",
  "summary": "resumen ejecutivo de la reunión",
  "decisions": "decisiones principales tomadas separadas por números (1. decisión 1, 2. decisión 2, etc.)",
  "orden_del_dia": ["punto 1", "punto 2", "punto 3"],
  "acuerdos": ["acuerdo 1", "acuerdo 2", "acuerdo 3"],
  "topic_keywords": ["palabra1", "palabra2", "palabra3"],
  "topic-presupuesto": true|false,
  "topic-mantenimiento": true|false,
  "topic-administracion": true|false,
  "topic-piscina": true|false,
  "topic-jardin": true|false,
  "topic-limpieza": true|false,
  "topic-balance": true|false,
  "topic-paqueteria": true|false,
  "topic-energia": true|false,
  "topic-normativa": true|false,
  "topic-proveedor": true|false,
  "topic-dinero": true|false,
  "topic-ascensor": true|false,
  "topic-incendios": true|false,
  "topic-porteria": true|false,
  "estructura_detectada": {
    "quorum_alcanzado": true|false,
    "propietarios_totales": numero,
    "capitulos": [
      {
        "numero": 1,
        "titulo": "Título capítulo",
        "pagina": 1,
        "subsecciones": [
          {"titulo": "Subsección", "pagina": 1}
        ]
      }
    ],
    "total_paginas": numero,
    "votaciones": [
      {"tema": "tema", "resultado": "aprobado|rechazado", "votos": "mayoría|unanimidad", "pagina": 1}
    ]
  }
}

REGLAS ESTRICTAS:
1. Devuelve SOLO el JSON, sin explicaciones antes ni después
2. Usa comillas dobles para todas las claves y valores string
3. Los campos topic-xxx DEBEN ser booleanos (true/false)
4. Si no encuentras un campo, usa valores por defecto apropiados
5. document_date en formato YYYY-MM-DD
6. Los arrays pueden estar vacíos [] si no hay información
7. estructura_detectada.capitulos debe reflejar la estructura real del documento
8. estructura_detectada.votaciones debe incluir todas las votaciones encontradas
9. Para topic-xxx analiza el contenido y marca true si el tema se menciona o trata

IMPORTANTE: Responde ÚNICAMENTE con el JSON válido, empezando por { y terminando por }.`;

    // PASO 5: Llamar a Gemini
    console.log('\n🤖 Llamando a Gemini con prompt mejorado...');
    const startTime = Date.now();
    
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 3000,
      }
    });

    const response = result.response.text();
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Gemini respondió en ${processingTime}ms`);
    console.log(`📝 Longitud respuesta: ${response.length} caracteres`);

    // PASO 6: Mostrar respuesta completa
    console.log('\n🤖 RESPUESTA COMPLETA DE GEMINI:');
    console.log('='.repeat(50));
    console.log(response);
    console.log('='.repeat(50));

    // PASO 7: Parsear JSON
    console.log('\n🔄 Parseando JSON...');
    let datosExtraidos;
    
    try {
      // Limpiar respuesta por si tiene texto adicional
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No se encontró JSON válido en la respuesta');
      }
      
      const jsonText = response.substring(jsonStart, jsonEnd);
      datosExtraidos = JSON.parse(jsonText);
      console.log('✅ JSON parseado correctamente');
      
    } catch (parseError) {
      console.error('❌ Error parseando JSON:', parseError.message);
      console.log('\n🔍 Intentando extraer JSON manualmente...');
      console.log('Respuesta raw:', response.substring(0, 500));
      return;
    }

    // PASO 8: Análisis de datos extraídos
    console.log('\n📋 DATOS EXTRAÍDOS:');
    console.log('-'.repeat(50));
    console.log(JSON.stringify(datosExtraidos, null, 2));

    // PASO 9: Verificar campos esperados por plantilla UI
    console.log('\n🎯 VERIFICACIÓN COMPATIBILIDAD CON PLANTILLA UI:');
    console.log('-'.repeat(50));

    const camposEsperados = {
      // Campos básicos extracted_minutes
      'document_date': 'string',
      'tipo_reunion': 'string', 
      'lugar': 'string',
      'comunidad_nombre': 'string',
      'president_in': 'string',
      'president_out': 'string', 
      'administrator': 'string',
      'summary': 'string',
      'decisions': 'string',
      
      // Arrays
      'orden_del_dia': 'array',
      'acuerdos': 'array',
      'topic_keywords': 'array',
      
      // Campos topic-xxx como booleanos
      'topic-presupuesto': 'boolean',
      'topic-mantenimiento': 'boolean',
      'topic-administracion': 'boolean',
      'topic-piscina': 'boolean',
      'topic-jardin': 'boolean', 
      'topic-limpieza': 'boolean',
      'topic-balance': 'boolean',
      'topic-paqueteria': 'boolean',
      'topic-energia': 'boolean',
      'topic-normativa': 'boolean',
      'topic-proveedor': 'boolean',
      'topic-dinero': 'boolean',
      'topic-ascensor': 'boolean',
      'topic-incendios': 'boolean',
      'topic-porteria': 'boolean',
      
      // Estructura compleja
      'estructura_detectada': 'object'
    };

    let camposCorrectos = 0;
    let camposTotal = Object.keys(camposEsperados).length;

    Object.entries(camposEsperados).forEach(([campo, tipoEsperado]) => {
      const valor = datosExtraidos[campo];
      const tipoActual = Array.isArray(valor) ? 'array' : typeof valor;
      const tipoCoincide = tipoActual === tipoEsperado;
      
      if (tipoCoincide && valor !== null && valor !== undefined) {
        camposCorrectos++;
        console.log(`✅ ${campo}: ${tipoActual} - ${Array.isArray(valor) ? `[${valor.length}]` : String(valor).substring(0, 50)}`);
      } else {
        console.log(`❌ ${campo}: esperado ${tipoEsperado}, actual ${tipoActual} - ${valor}`);
      }
    });

    // PASO 10: Verificar estructura_detectada en detalle
    if (datosExtraidos.estructura_detectada) {
      console.log('\n🏗️ ESTRUCTURA DETECTADA:');
      const ed = datosExtraidos.estructura_detectada;
      console.log(`   quorum_alcanzado: ${ed.quorum_alcanzado}`);
      console.log(`   propietarios_totales: ${ed.propietarios_totales}`);
      console.log(`   total_paginas: ${ed.total_paginas}`);
      console.log(`   capitulos: ${ed.capitulos?.length || 0} elementos`);
      console.log(`   votaciones: ${ed.votaciones?.length || 0} elementos`);
    }

    // PASO 11: Calcular porcentaje de éxito
    const porcentajeExito = (camposCorrectos / camposTotal * 100).toFixed(1);
    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`   Campos correctos: ${camposCorrectos}/${camposTotal}`);
    console.log(`   Porcentaje éxito: ${porcentajeExito}%`);
    console.log(`   Tiempo procesamiento: ${processingTime}ms`);

    if (parseFloat(porcentajeExito) >= 90) {
      console.log(`✅ EXCELENTE: Los datos son muy compatibles con la plantilla UI`);
    } else if (parseFloat(porcentajeExito) >= 70) {
      console.log(`⚠️ BUENO: Los datos son mayormente compatibles, requiere ajustes menores`);
    } else if (parseFloat(porcentajeExito) >= 50) {
      console.log(`⚠️ REGULAR: Requiere mejoras en el prompt`);
    } else {
      console.log(`❌ MALO: Requiere trabajo significativo en extracción`);
    }

    // PASO 12: Mostrar estructura final para copiar a plantilla UI
    console.log(`\n📋 ESTRUCTURA FINAL PARA PLANTILLA UI:`);
    console.log('-'.repeat(50));
    console.log('// DEMO_ACTA_DATA');
    console.log(JSON.stringify({
      id: "real-acta-1",
      document_id: "real-doc-acta",
      organization_id: "real-org",
      president_in: datosExtraidos.president_in || "",
      president_out: datosExtraidos.president_out || "",
      administrator: datosExtraidos.administrator || "",
      summary: datosExtraidos.summary || "",
      decisions: datosExtraidos.decisions || "",
      created_at: new Date().toISOString()
    }, null, 2));

    console.log('\n// DEMO_ACTA_METADATA');
    console.log(JSON.stringify(datosExtraidos, null, 2));

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar test
testExtraccionActaReal();