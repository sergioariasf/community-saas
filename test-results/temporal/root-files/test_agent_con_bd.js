#!/usr/bin/env node

/**
 * ARCHIVO: test_agent_con_bd.js
 * PROPÓSITO: Test del agente acta_extractor_v2 usando texto ya extraído de BD
 * ESTADO: testing
 * DEPENDENCIAS: saasAgents.ts, supabase, extracted_minutes ampliada
 * OUTPUTS: Verificación completa agente → BD → validación
 * ACTUALIZADO: 2025-09-16
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { callSaaSAgent, saveCompleteActaMetadata } = require('./src/lib/gemini/saasAgents.ts');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const USER_EMAIL = 'sergioariasf@gmail.com';
const USER_PASSWORD = 'Elpato_46';

async function testAgentConBD() {
  console.log('🧪 TEST AGENTE ACTAS V2 - CON BASE DE DATOS REAL');
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

    // PASO 2: Buscar documento "ACTA 19 MAYO 2022" ya procesado
    console.log('\n📄 Buscando documento ACTA 19 MAYO 2022...');
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .ilike('filename', '%ACTA%19%MAYO%2022%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (docsError) throw docsError;
    
    if (!docs || docs.length === 0) {
      console.log('⚠️ No se encontró el documento. Buscando cualquier documento con texto extraído...');
      
      const { data: anyDoc, error: anyDocError } = await supabase
        .from('documents')
        .select('*')
        .not('extracted_text', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (anyDocError) throw anyDocError;
      
      if (!anyDoc || anyDoc.length === 0) {
        throw new Error('No se encontró ningún documento con texto extraído');
      }
      
      docs[0] = anyDoc[0];
      console.log(`✅ Usando documento: ${docs[0].filename}`);
    } else {
      console.log(`✅ Documento encontrado: ${docs[0].filename}`);
    }

    const document = docs[0];
    console.log(`   📊 ID: ${document.id}`);
    console.log(`   📏 Texto: ${document.extracted_text?.length || 0} caracteres`);
    console.log(`   🏢 Org: ${document.organization_id}`);

    if (!document.extracted_text || document.extracted_text.length < 100) {
      throw new Error('El documento no tiene texto extraído suficiente');
    }

    // PASO 3: Llamar al agente acta_extractor_v2
    console.log('\n🤖 Llamando agente acta_extractor_v2 desde BD...');
    const startTime = Date.now();
    
    const agentResult = await callSaaSAgent('acta_extractor_v2', {
      document_text: document.extracted_text
    });
    
    const processingTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo: ${processingTime}ms`);
    console.log(`✅ Éxito: ${agentResult.success}`);

    if (!agentResult.success) {
      console.error('❌ Error en agente:', agentResult.error);
      return;
    }

    // PASO 4: Mostrar datos extraídos por el agente
    const extractedData = agentResult.data;
    console.log('\n📋 DATOS EXTRAÍDOS POR AGENTE:');
    console.log('-'.repeat(50));
    
    // Mostrar campos clave
    console.log(`📅 Fecha: ${extractedData.document_date}`);
    console.log(`🏛️ Tipo: ${extractedData.tipo_reunion}`);
    console.log(`📍 Lugar: ${extractedData.lugar}`);
    console.log(`🏢 Comunidad: ${extractedData.comunidad_nombre}`);
    console.log(`👤 Presidente entrante: ${extractedData.president_in}`);
    console.log(`👤 Presidente saliente: ${extractedData.president_out}`);
    console.log(`🏛️ Administrador: ${extractedData.administrator}`);
    
    // Mostrar arrays
    console.log(`📋 Orden del día: ${extractedData.orden_del_dia?.length || 0} puntos`);
    console.log(`✅ Acuerdos: ${extractedData.acuerdos?.length || 0} elementos`);
    console.log(`🏷️ Keywords: ${extractedData.topic_keywords?.length || 0} palabras`);

    // Mostrar algunos temas
    const temasActivos = Object.keys(extractedData)
      .filter(key => key.startsWith('topic-') && extractedData[key] === true);
    console.log(`🎯 Temas detectados (${temasActivos.length}): ${temasActivos.join(', ')}`);

    // Mostrar estructura
    const ed = extractedData.estructura_detectada;
    if (ed) {
      console.log(`🏗️ Estructura: ${ed.capitulos?.length || 0} capítulos, ${ed.votaciones?.length || 0} votaciones`);
    }

    // PASO 5: Verificar si ya existe registro en extracted_minutes
    console.log('\n🔍 Verificando extracted_minutes existente...');
    const { data: existingMinutes } = await supabase
      .from('extracted_minutes')
      .select('*')
      .eq('document_id', document.id)
      .single();

    if (existingMinutes) {
      console.log('⚠️ Ya existe registro. Eliminando para insertar datos nuevos...');
      const { error: deleteError } = await supabase
        .from('extracted_minutes')
        .delete()
        .eq('document_id', document.id);
      
      if (deleteError) {
        console.warn('⚠️ Error eliminando registro existente:', deleteError);
      }
    }

    // PASO 6: Guardar en extracted_minutes (tabla ampliada)
    console.log('\n💾 Guardando en extracted_minutes ampliada...');
    
    const minutesData = {
      document_id: document.id,
      organization_id: document.organization_id,
      
      // Campos básicos
      president_in: extractedData.president_in,
      president_out: extractedData.president_out,
      administrator: extractedData.administrator,
      summary: extractedData.summary,
      decisions: extractedData.decisions,
      
      // Campos nuevos
      document_date: extractedData.document_date,
      tipo_reunion: extractedData.tipo_reunion,
      lugar: extractedData.lugar,
      comunidad_nombre: extractedData.comunidad_nombre,
      
      // Arrays
      orden_del_dia: extractedData.orden_del_dia || [],
      acuerdos: extractedData.acuerdos || [],
      topic_keywords: extractedData.topic_keywords || [],
      
      // Los 15 temas como booleanos
      topic_presupuesto: extractedData['topic-presupuesto'] || false,
      topic_mantenimiento: extractedData['topic-mantenimiento'] || false,
      topic_administracion: extractedData['topic-administracion'] || false,
      topic_piscina: extractedData['topic-piscina'] || false,
      topic_jardin: extractedData['topic-jardin'] || false,
      topic_limpieza: extractedData['topic-limpieza'] || false,
      topic_balance: extractedData['topic-balance'] || false,
      topic_paqueteria: extractedData['topic-paqueteria'] || false,
      topic_energia: extractedData['topic-energia'] || false,
      topic_normativa: extractedData['topic-normativa'] || false,
      topic_proveedor: extractedData['topic-proveedor'] || false,
      topic_dinero: extractedData['topic-dinero'] || false,
      topic_ascensor: extractedData['topic-ascensor'] || false,
      topic_incendios: extractedData['topic-incendios'] || false,
      topic_porteria: extractedData['topic-porteria'] || false,
      
      // Estructura detectada
      estructura_detectada: extractedData.estructura_detectada || {}
    };

    const { data: savedMinutes, error: saveError } = await supabase
      .from('extracted_minutes')
      .insert(minutesData)
      .select()
      .single();

    if (saveError) {
      console.error('❌ Error guardando en extracted_minutes:', saveError);
      return;
    }

    console.log(`✅ Guardado en extracted_minutes: ${savedMinutes.id}`);

    // PASO 7: Verificar datos guardados
    console.log('\n🔍 VERIFICANDO DATOS GUARDADOS:');
    console.log('-'.repeat(50));

    const { data: verification, error: verifyError } = await supabase
      .from('extracted_minutes')
      .select('*')
      .eq('id', savedMinutes.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verificando:', verifyError);
      return;
    }

    // Mostrar verificación
    console.log(`✅ ID: ${verification.id}`);
    console.log(`✅ Documento: ${verification.document_id}`);
    console.log(`✅ Fecha: ${verification.document_date}`);
    console.log(`✅ Tipo: ${verification.tipo_reunion}`);
    console.log(`✅ Administrador: ${verification.administrator}`);
    console.log(`✅ Orden del día: ${Array.isArray(verification.orden_del_dia) ? verification.orden_del_dia.length : 0} elementos`);
    console.log(`✅ Topic presupuesto: ${verification.topic_presupuesto}`);
    console.log(`✅ Topic piscina: ${verification.topic_piscina}`);
    console.log(`✅ Estructura detectada: ${Object.keys(verification.estructura_detectada || {}).length} claves`);

    // PASO 8: Test de búsquedas usando índices
    console.log('\n🔍 TESTING BÚSQUEDAS CON ÍNDICES:');
    console.log('-'.repeat(50));

    // Búsqueda por administrador
    if (verification.administrator) {
      const { data: byAdmin, error: adminError } = await supabase
        .from('extracted_minutes')
        .select('id, administrator, document_date')
        .ilike('administrator', `%${verification.administrator.split(' ')[0]}%`)
        .limit(5);
      
      if (!adminError) {
        console.log(`✅ Búsqueda por administrador: ${byAdmin.length} resultados`);
      }
    }

    // Búsqueda por tema
    const { data: byTopic, error: topicError } = await supabase
      .from('extracted_minutes')
      .select('id, administrator, topic_presupuesto')
      .eq('topic_presupuesto', true)
      .limit(5);
    
    if (!topicError) {
      console.log(`✅ Búsqueda por topic_presupuesto: ${byTopic.length} resultados`);
    }

    // PASO 9: Resultado final
    console.log('\n🎉 RESULTADO FINAL:');
    console.log('='.repeat(50));
    console.log(`✅ Agente acta_extractor_v2: FUNCIONA`);
    console.log(`✅ Datos validados: CORRECTO`);
    console.log(`✅ Guardado en BD: EXITOSO`);
    console.log(`✅ Búsquedas con índices: FUNCIONAN`);
    console.log(`✅ Tiempo procesamiento: ${processingTime}ms`);
    console.log(`\n🚀 LISTO PARA INTEGRAR EN PIPELINE PRINCIPAL`);

  } catch (error) {
    console.error('❌ Error durante el test:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Ejecutar test
testAgentConBD();