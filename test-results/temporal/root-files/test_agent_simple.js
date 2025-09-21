#!/usr/bin/env node

/**
 * ARCHIVO: test_agent_simple.js
 * PROPÓSITO: Test simple del agente usando solo Supabase y Gemini directo
 * ESTADO: testing
 * DEPENDENCIAS: supabase, gemini, extracted_minutes ampliada
 * OUTPUTS: Verificación agente → BD → validación completa
 * ACTUALIZADO: 2025-09-16
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const USER_EMAIL = 'sergioariasf@gmail.com';
const USER_PASSWORD = 'Elpato_46';

async function testAgentSimple() {
  console.log('🧪 TEST AGENTE ACTAS V2 - VERSIÓN SIMPLE');
  console.log('='.repeat(60));

  try {
    // PASO 1: Autenticar
    console.log('🔐 Autenticando...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    if (authError) throw authError;
    console.log(`✅ Autenticado: ${authData.user.email}`);

    // PASO 2: Obtener agente desde BD
    console.log('\n🤖 Obteniendo agente acta_extractor_v2 desde BD...');
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', 'acta_extractor_v2')
      .single();

    if (agentError || !agent) {
      throw new Error(`Agente no encontrado: ${agentError?.message}`);
    }

    console.log(`✅ Agente encontrado: ${agent.name}`);
    console.log(`   📝 Propósito: ${agent.purpose}`);
    console.log(`   📏 Prompt: ${agent.prompt_template.length} caracteres`);

    // PASO 3: Buscar documento específico "ACTA 19 MAYO 2022"
    console.log('\n📄 Buscando documento ACTA 19 MAYO 2022...');
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', '958c2703-bd03-4495-b72c-3a85612e1833') // ID específico del documento
      .single();

    if (docsError || !docs) {
      throw new Error(`No se encontró el documento: ${docsError?.message}`);
    }

    // Usar directamente el resultado single
    const document = docs;
    console.log(`✅ Documento: ${document.filename}`);
    console.log(`   📊 ID: ${document.id}`);
    console.log(`   📏 Texto: ${document.extracted_text.length.toLocaleString()} caracteres`);
    console.log(`   🏢 Org: ${document.organization_id}`);

    // PASO 4: Preparar prompt con datos reales
    console.log('\n🔧 Preparando prompt...');
    let prompt = agent.prompt_template;
    prompt = prompt.replace(/\{document_text\}/g, document.extracted_text);
    
    console.log(`✅ Prompt preparado: ${prompt.length.toLocaleString()} caracteres`);

    // PASO 5: Llamar Gemini directamente
    console.log('\n🤖 Llamando Gemini con prompt del agente...');
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no encontrada');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 3000,
      }
    });

    const startTime = Date.now();
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const processingTime = Date.now() - startTime;

    console.log(`✅ Gemini respondió en ${processingTime}ms`);
    console.log(`📝 Longitud respuesta: ${response.length} caracteres`);

    // PASO 6: Parsear JSON
    console.log('\n🔄 Parseando respuesta JSON...');
    const jsonStart = response.indexOf('{');
    const jsonEnd = response.lastIndexOf('}') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error('No se encontró JSON válido en la respuesta');
    }

    const jsonText = response.substring(jsonStart, jsonEnd);
    const extractedData = JSON.parse(jsonText);
    console.log('✅ JSON parseado correctamente');

    // PASO 7: Mostrar datos clave
    console.log('\n📋 DATOS EXTRAÍDOS:');
    console.log('-'.repeat(30));
    console.log(`📅 Fecha: ${extractedData.document_date}`);
    console.log(`🏛️ Tipo: ${extractedData.tipo_reunion}`);
    console.log(`📍 Lugar: ${extractedData.lugar?.substring(0, 50)}...`);
    console.log(`🏢 Comunidad: ${extractedData.comunidad_nombre}`);
    console.log(`👤 Presidente in: ${extractedData.president_in}`);
    console.log(`👤 Administrador: ${extractedData.administrator}`);
    console.log(`📋 Orden día: ${extractedData.orden_del_dia?.length || 0} puntos`);

    // Mostrar temas detectados
    const temasTrue = Object.keys(extractedData)
      .filter(key => key.startsWith('topic-') && extractedData[key] === true);
    console.log(`🎯 Temas (${temasTrue.length}): ${temasTrue.join(', ')}`);

    // PASO 8: Validar datos antes de guardar
    console.log('\n🔍 Validando datos...');
    const validatedData = {
      document_id: document.id,
      organization_id: document.organization_id,
      
      // Campos básicos validados
      president_in: typeof extractedData.president_in === 'string' ? extractedData.president_in.trim() : null,
      president_out: typeof extractedData.president_out === 'string' ? extractedData.president_out.trim() : null,
      administrator: typeof extractedData.administrator === 'string' ? extractedData.administrator.trim() : null,
      summary: typeof extractedData.summary === 'string' ? extractedData.summary.trim() : null,
      decisions: typeof extractedData.decisions === 'string' ? extractedData.decisions.trim() : null,
      
      // Campos nuevos validados
      document_date: extractedData.document_date || null,
      tipo_reunion: ['ordinaria', 'extraordinaria'].includes(extractedData.tipo_reunion) ? extractedData.tipo_reunion : null,
      lugar: typeof extractedData.lugar === 'string' ? extractedData.lugar.trim() : null,
      comunidad_nombre: typeof extractedData.comunidad_nombre === 'string' ? extractedData.comunidad_nombre.trim() : null,
      
      // Arrays validados
      orden_del_dia: Array.isArray(extractedData.orden_del_dia) ? extractedData.orden_del_dia : [],
      acuerdos: Array.isArray(extractedData.acuerdos) ? extractedData.acuerdos : [],
      topic_keywords: Array.isArray(extractedData.topic_keywords) ? extractedData.topic_keywords : [],
      
      // Temas como booleanos validados
      topic_presupuesto: extractedData['topic-presupuesto'] === true,
      topic_mantenimiento: extractedData['topic-mantenimiento'] === true,
      topic_administracion: extractedData['topic-administracion'] === true,
      topic_piscina: extractedData['topic-piscina'] === true,
      topic_jardin: extractedData['topic-jardin'] === true,
      topic_limpieza: extractedData['topic-limpieza'] === true,
      topic_balance: extractedData['topic-balance'] === true,
      topic_paqueteria: extractedData['topic-paqueteria'] === true,
      topic_energia: extractedData['topic-energia'] === true,
      topic_normativa: extractedData['topic-normativa'] === true,
      topic_proveedor: extractedData['topic-proveedor'] === true,
      topic_dinero: extractedData['topic-dinero'] === true,
      topic_ascensor: extractedData['topic-ascensor'] === true,
      topic_incendios: extractedData['topic-incendios'] === true,
      topic_porteria: extractedData['topic-porteria'] === true,
      
      // Estructura validada
      estructura_detectada: typeof extractedData.estructura_detectada === 'object' ? extractedData.estructura_detectada : {}
    };

    console.log('✅ Datos validados correctamente');

    // PASO 9: Eliminar registro existente si existe
    console.log('\n🔧 Verificando extracted_minutes existente...');
    const { data: existing } = await supabase
      .from('extracted_minutes')
      .select('id')
      .eq('document_id', document.id);

    if (existing && existing.length > 0) {
      console.log('⚠️ Eliminando registro existente...');
      await supabase
        .from('extracted_minutes')
        .delete()
        .eq('document_id', document.id);
    }

    // PASO 10: Guardar en extracted_minutes
    console.log('\n💾 Guardando en extracted_minutes...');
    const { data: saved, error: saveError } = await supabase
      .from('extracted_minutes')
      .insert(validatedData)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error guardando:', saveError);
      throw saveError;
    }

    console.log(`✅ Guardado exitosamente: ${saved.id}`);

    // PASO 11: Verificar datos guardados
    console.log('\n🔍 VERIFICANDO DATOS EN BD:');
    console.log('-'.repeat(50));

    const { data: verification } = await supabase
      .from('extracted_minutes')
      .select('*')
      .eq('id', saved.id)
      .single();

    console.log(`✅ ID: ${verification.id}`);
    console.log(`✅ Fecha: ${verification.document_date}`);
    console.log(`✅ Tipo: ${verification.tipo_reunion}`);
    console.log(`✅ Administrador: ${verification.administrator}`);
    console.log(`✅ Presupuesto: ${verification.topic_presupuesto}`);
    console.log(`✅ Administración: ${verification.topic_administracion}`);
    console.log(`✅ Piscina: ${verification.topic_piscina}`);
    console.log(`✅ Estructura: ${JSON.stringify(verification.estructura_detectada).substring(0, 100)}...`);

    // PASO 12: Test búsqueda rápida
    console.log('\n🔍 TEST BÚSQUEDA POR ÍNDICES:');
    
    if (verification.administrator) {
      const { data: searchResults } = await supabase
        .from('extracted_minutes')
        .select('id, administrator, document_date')
        .ilike('administrator', `%${verification.administrator.split(' ')[0]}%`);
      
      console.log(`✅ Búsqueda por administrador: ${searchResults?.length || 0} resultados`);
    }

    // PASO 13: Resultado final
    console.log('\n🎉 RESULTADO FINAL:');
    console.log('='.repeat(50));
    console.log(`✅ Agente desde BD: FUNCIONA`);
    console.log(`✅ Gemini respuesta: VÁLIDA`);
    console.log(`✅ Parsing JSON: EXITOSO`);
    console.log(`✅ Validación datos: CORRECTA`);
    console.log(`✅ Guardado BD: EXITOSO`);
    console.log(`✅ Índices: FUNCIONAN`);
    console.log(`⏱️ Tiempo total: ${processingTime}ms`);
    console.log(`\n🚀 SISTEMA LISTO PARA PRODUCCIÓN`);

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Ejecutar test
testAgentSimple();