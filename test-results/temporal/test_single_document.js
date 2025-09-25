#!/usr/bin/env node

/**
 * ARCHIVO: test_single_document.js
 * PROPÓSITO: Test de UN solo documento para análisis detallado de calidad
 * ESTADO: testing
 * DEPENDENCIAS: pdf-parse, Google Gemini, Supabase
 * OUTPUTS: Análisis completo de calidad de prompts y extracción
 * ACTUALIZADO: 2025-09-18
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Configurar clientes
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuración del documento de test
const testDocument = {
  name: 'COMUNICADO VECINOS',
  file: 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf',
  agent: 'comunicado_extractor_v1',
  table: 'extracted_communications',
  expectedFields: ['fecha', 'comunidad', 'remitente', 'resumen', 'category']
};

/**
 * Extracción de texto con análisis de calidad
 */
async function extractTextDetailed(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const pdfParse = require('pdf-parse');
    
    console.log(`📖 EXTRACCIÓN DE TEXTO DETALLADA`);
    console.log(`   Archivo: ${path.basename(filePath)}`);
    console.log(`   Tamaño: ${(buffer.length / 1024).toFixed(1)} KB`);
    
    const pdfData = await pdfParse(buffer);
    const pdfText = (pdfData.text || '').trim();
    
    console.log(`   📄 Páginas: ${pdfData.numpages}`);
    console.log(`   📄 Caracteres extraídos: ${pdfText.length}`);
    
    // Mostrar muestra del texto extraído
    console.log(`\n   📝 MUESTRA DEL TEXTO EXTRAÍDO:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    const lines = pdfText.split('\n').slice(0, 15);
    lines.forEach(line => {
      const truncated = line.length > 66 ? line.substring(0, 66) + '..' : line;
      console.log(`   │ ${truncated.padEnd(66)} │`);
    });
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    return {
      success: true,
      text: pdfText,
      pages: pdfData.numpages,
      length: pdfText.length
    };
    
  } catch (error) {
    console.error(`❌ Error extrayendo texto:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Obtener y ejecutar agente con análisis detallado
 */
async function executeAgentDetailed(agentName, documentText) {
  try {
    console.log(`\n🤖 EJECUCIÓN DETALLADA DEL AGENTE`);
    console.log(`   Agente: ${agentName}`);
    
    // 1. Obtener el agente de Supabase
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', agentName)
      .eq('is_active', true)
      .single();
    
    if (agentError || !agent) {
      throw new Error(`Agente no encontrado: ${agentName}`);
    }
    
    console.log(`   ✅ Agente encontrado`);
    console.log(`   📝 Propósito: ${agent.purpose}`);
    
    // 2. Mostrar el prompt completo
    const fullPrompt = \`\${agent.prompt_template}

Texto del documento:
\${documentText}\`;
    
    console.log(`\n   📋 PROMPT COMPLETO DEL AGENTE:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    const promptLines = fullPrompt.split('\n');
    promptLines.slice(0, 20).forEach(line => {
      const truncated = line.length > 66 ? line.substring(0, 66) + '..' : line;
      console.log(`   │ ${truncated.padEnd(66)} │`);
    });
    if (promptLines.length > 20) {
      console.log(`   │ ... (${promptLines.length - 20} líneas más) ${' '.repeat(28)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    console.log(`\n   🔄 Ejecutando con Gemini Flash 1.5...`);
    
    // 3. Llamar a Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(`\n   📋 RESPUESTA COMPLETA DE GEMINI:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    const responseLines = text.split('\n');
    responseLines.forEach((line, index) => {
      if (index < 30) { // Mostrar las primeras 30 líneas
        const truncated = line.length > 66 ? line.substring(0, 66) + '..' : line;
        console.log(`   │ ${truncated.padEnd(66)} │`);
      }
    });
    if (responseLines.length > 30) {
      console.log(`   │ ... (${responseLines.length - 30} líneas más) ${' '.repeat(28)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // 4. Intentar parsear JSON
    let extractedData;
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = text.match(/```json\\s*([\\s\\S]*?)\\s*```/) || text.match(/\\{[\\s\\S]*\\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
      extractedData = JSON.parse(jsonString);
      console.log(`\n   ✅ JSON parseado exitosamente`);
    } catch (parseError) {
      console.log(`\n   ⚠️ Error parseando JSON: ${parseError.message}`);
      console.log(`   🔧 Intentando extraer campos manualmente...`);
      
      // Fallback: extraer campos básicos manualmente
      extractedData = {
        fecha: extractPattern(text, /fecha[:\\s]*([^\\n]+)/i),
        comunidad: extractPattern(text, /comunidad[:\\s]*([^\\n]+)/i),
        remitente: extractPattern(text, /remitente[:\\s]*([^\\n]+)/i),
        resumen: extractPattern(text, /resumen[:\\s]*([^\\n]+)/i),
        category: extractPattern(text, /categor[íi]a[:\\s]*([^\\n]+)/i)
      };
    }
    
    console.log(`\n   📊 DATOS EXTRAÍDOS:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    for (const [key, value] of Object.entries(extractedData)) {
      const displayValue = value ? (value.toString().length > 50 ? value.toString().substring(0, 50) + '...' : value) : 'null';
      console.log(`   │ ${key}: ${displayValue.toString().padEnd(60 - key.length)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    const tokensUsed = Math.round(fullPrompt.length / 4) + Math.round(text.length / 4);
    const cost = (tokensUsed / 1000) * 0.002;
    
    return {
      success: true,
      data: extractedData,
      rawResponse: text,
      agent: agent,
      prompt: fullPrompt,
      tokensUsed: tokensUsed,
      cost: cost
    };
    
  } catch (error) {
    console.error(`   ❌ Error ejecutando agente:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function extractPattern(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : null;
}

/**
 * Guardar en tabla con validación
 */
async function saveWithValidation(tableName, data, documentId) {
  try {
    console.log(`\n💾 GUARDADO EN TABLA CON VALIDACIÓN`);
    console.log(`   Tabla: ${tableName}`);
    
    // Preparar datos para inserción
    const insertData = {
      document_id: documentId,
      organization_id: 'test-org-12345',
      created_at: new Date().toISOString(),
      ...data
    };
    
    console.log(`\n   📊 DATOS A INSERTAR:`);
    console.log(`   ${'┌' + '─'.repeat(68) + '┐'}`);
    for (const [key, value] of Object.entries(insertData)) {
      const displayValue = value ? (value.toString().length > 50 ? value.toString().substring(0, 50) + '...' : value) : 'null';
      console.log(`   │ ${key}: ${displayValue.toString().padEnd(60 - key.length)} │`);
    }
    console.log(`   ${'└' + '─'.repeat(68) + '┘'}`);
    
    // Insertar en Supabase
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(insertData)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`\n   ✅ Datos guardados exitosamente`);
    console.log(`   📊 ID insertado: ${result[0].id}`);
    
    return {
      success: true,
      id: result[0].id,
      insertedData: result[0]
    };
    
  } catch (error) {
    console.error(`\n   ❌ Error guardando en tabla:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test completo de un documento
 */
async function testSingleDocument() {
  console.log('🧪 TEST DETALLADO DE UN DOCUMENTO');
  console.log('='.repeat(70));
  console.log('📋 ANÁLISIS COMPLETO DE CALIDAD DE PROMPTS Y EXTRACCIÓN');
  console.log('='.repeat(70));
  
  const documentId = \`test_single_\${Date.now()}\`;
  const fullPath = path.join(process.cwd(), testDocument.file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(\`❌ Archivo no encontrado: \${testDocument.file}\`);
    return;
  }
  
  console.log(\`📄 Documento: \${testDocument.name}\`);
  console.log(\`📂 Archivo: \${testDocument.file}\`);
  console.log(\`🤖 Agente: \${testDocument.agent}\`);
  console.log(\`📊 Tabla: \${testDocument.table}\`);
  console.log(\`🔗 ID Documento: \${documentId}\`);
  
  // PASO 1: Extracción de texto
  const extractionResult = await extractTextDetailed(fullPath);
  if (!extractionResult.success) {
    console.log('❌ Fallo en extracción de texto');
    return;
  }
  
  // PASO 2: Agente
  const agentResult = await executeAgentDetailed(testDocument.agent, extractionResult.text);
  if (!agentResult.success) {
    console.log('❌ Fallo en ejecución del agente');
    return;
  }
  
  // PASO 3: Guardado
  const saveResult = await saveWithValidation(testDocument.table, agentResult.data, documentId);
  if (!saveResult.success) {
    console.log('❌ Fallo guardando en tabla');
    return;
  }
  
  // RESUMEN FINAL
  console.log(\`\n\n📊 RESUMEN FINAL DEL TEST\`);
  console.log('='.repeat(70));
  console.log(\`✅ ÉXITO: Pipeline completado exitosamente\`);
  console.log(\`📊 ID insertado en BD: \${saveResult.id}\`);
  console.log(\`💰 Costo: $\${agentResult.cost.toFixed(4)}\`);
  console.log(\`🔢 Tokens: \${agentResult.tokensUsed}\`);
  
  console.log(\`\n🎯 ANÁLISIS DE CALIDAD:\`);
  
  // Verificar campos esperados
  const extractedFields = Object.keys(agentResult.data);
  const missingFields = testDocument.expectedFields.filter(field => !extractedFields.includes(field));
  const extraFields = extractedFields.filter(field => !testDocument.expectedFields.includes(field) && !['document_id', 'organization_id', 'created_at'].includes(field));
  
  console.log(\`   📋 Campos esperados: \${testDocument.expectedFields.join(', ')}\`);
  console.log(\`   📋 Campos extraídos: \${extractedFields.join(', ')}\`);
  
  if (missingFields.length === 0) {
    console.log(\`   ✅ Todos los campos esperados extraídos\`);
  } else {
    console.log(\`   ⚠️ Campos faltantes: \${missingFields.join(', ')}\`);
  }
  
  if (extraFields.length > 0) {
    console.log(\`   ℹ️ Campos adicionales: \${extraFields.join(', ')}\`);
  }
  
  // Verificar completitud de datos
  const completeFields = Object.entries(agentResult.data).filter(([key, value]) => value && value.toString().length > 0);
  const completionRate = (completeFields.length / Object.keys(agentResult.data).length) * 100;
  
  console.log(\`   📊 Tasa de completitud: \${completionRate.toFixed(1)}%\`);
  
  if (completionRate >= 80) {
    console.log(\`   ✅ EXCELENTE: Extracción de alta calidad\`);
  } else if (completionRate >= 60) {
    console.log(\`   ⚠️ BUENO: Extracción aceptable\`);
  } else {
    console.log(\`   ❌ MALO: Extracción de baja calidad\`);
  }
  
  console.log(\`\n🚀 CONCLUSIÓN:\`);
  console.log(\`   El agente \${testDocument.agent} está \${completionRate >= 80 ? 'LISTO' : 'NECESITA MEJORAS'} para producción\`);
}

// Ejecutar test
if (require.main === module) {
  testSingleDocument().catch(console.error);
}

module.exports = { testSingleDocument };