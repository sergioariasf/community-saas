#!/usr/bin/env node

/**
 * ARCHIVO: check_documents_bd.js
 * PROPÓSITO: Verificar qué documentos hay en la BD con texto extraído
 * ESTADO: testing
 * DEPENDENCIAS: supabase
 * OUTPUTS: Lista de documentos disponibles para testing
 * ACTUALIZADO: 2025-09-16
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const USER_EMAIL = 'sergioariasf@gmail.com';
const USER_PASSWORD = 'Elpato_46';

async function checkDocuments() {
  console.log('🔍 VERIFICANDO DOCUMENTOS EN BD');
  console.log('='.repeat(40));

  try {
    // PASO 1: Autenticar
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    if (authError) throw authError;
    console.log(`✅ Autenticado: ${authData.user.email}`);

    // PASO 2: Ver todos los documentos
    console.log('\n📄 DOCUMENTOS EN LA BD:');
    const { data: allDocs, error: docsError } = await supabase
      .from('documents')
      .select('id, filename, text_length, extracted_text, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (docsError) throw docsError;

    if (!allDocs || allDocs.length === 0) {
      console.log('❌ No hay documentos en la BD');
      return;
    }

    console.log(`📊 Total documentos: ${allDocs.length}`);
    
    allDocs.forEach((doc, i) => {
      const textInfo = doc.extracted_text ? 
        `${doc.extracted_text.length.toLocaleString()} chars` : 
        'SIN TEXTO';
      
      console.log(`${i + 1}. ${doc.filename} - ${textInfo} - ${doc.created_at.substring(0, 10)}`);
      console.log(`   ID: ${doc.id}`);
    });

    // PASO 3: Ver extracted_minutes
    console.log('\n📋 EXTRACTED_MINUTES EN LA BD:');
    const { data: minutes, error: minutesError } = await supabase
      .from('extracted_minutes')
      .select('id, document_id, administrator, document_date, topic_presupuesto')
      .order('created_at', { ascending: false })
      .limit(5);

    if (minutesError) throw minutesError;

    if (!minutes || minutes.length === 0) {
      console.log('❌ No hay extracted_minutes en la BD');
    } else {
      console.log(`📊 Total extracted_minutes: ${minutes.length}`);
      minutes.forEach((min, i) => {
        console.log(`${i + 1}. Doc: ${min.document_id} - ${min.administrator} - ${min.document_date} - Presupuesto: ${min.topic_presupuesto}`);
      });
    }

    // PASO 4: Ver agentes
    console.log('\n🤖 AGENTES EN LA BD:');
    const { data: agents, error: agentsError } = await supabase
      .from('agents')
      .select('id, name, purpose, is_active')
      .order('created_at', { ascending: false });

    if (agentsError) throw agentsError;

    if (!agents || agents.length === 0) {
      console.log('❌ No hay agentes en la BD');
    } else {
      console.log(`🤖 Total agentes: ${agents.length}`);
      agents.forEach((agent, i) => {
        console.log(`${i + 1}. ${agent.name} - ${agent.is_active ? 'ACTIVO' : 'INACTIVO'}`);
        console.log(`   ${agent.purpose?.substring(0, 60)}...`);
      });
    }

    // PASO 5: Sugerir siguiente paso
    console.log('\n💡 SIGUIENTE PASO:');
    if (allDocs.some(doc => doc.extracted_text)) {
      console.log('✅ Hay documentos con texto - puedes probar el agente');
    } else {
      console.log('⚠️ No hay documentos con texto extraído');
      console.log('   Opción 1: Procesar un PDF nuevo');
      console.log('   Opción 2: Usar el test con PDF local (test_extraccion_acta_real.js)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar
checkDocuments();