/**
 * ARCHIVO: test_classifier_debug.js
 * PROPÓSITO: Debug del agente clasificador document_classifier
 * ESTADO: testing
 * DEPENDENCIAS: .env.local, supabase, gemini
 * OUTPUTS: Test del clasificador con diferentes tipos de texto
 * ACTUALIZADO: 2025-09-19
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testClassifier() {
  try {
    console.log('🔍 Testing document_classifier agent...');
    
    // Setup clients
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Get the classifier agent
    console.log('📋 Getting document_classifier agent from database...');
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', 'document_classifier')
      .single();
      
    if (agentError || !agent) {
      console.error('❌ Agent not found:', agentError);
      return;
    }
    
    console.log('✅ Agent found:', {
      name: agent.name,
      purpose: agent.purpose,
      active: agent.is_active,
      promptLength: agent.prompt_template.length
    });
    
    // Test different document types
    const testCases = [
      {
        type: 'acta',
        text: 'ACTA DE LA JUNTA GENERAL ORDINARIA DE LA COMUNIDAD DE PROPIETARIOS CELEBRADA EL 19 DE MAYO DE 2022. ASISTENTES: Presidente: Juan García. Administrador: Pedro López. ORDEN DEL DÍA: 1. Aprobación presupuesto 2022'
      },
      {
        type: 'comunicado',
        text: 'COMUNICADO A LA COMUNIDAD - Fecha: 2025-04-07. Remitente: Beltrán y Romera, S.L.U. Asunto: Información contadores SunFlower. Se informa que los contadores de lectura se están rompiendo.'
      },
      {
        type: 'factura',
        text: 'FACTURA N° 2022-001. Cliente: Comunidad Amara Homes. Proveedor: Servicios ABC S.L. Importe total: 1.250,00 EUR. Fecha: 15/03/2022. Concepto: Mantenimiento ascensores'
      }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📄 Testing ${testCase.type.toUpperCase()}:`);
      console.log('   Text:', testCase.text.substring(0, 80) + '...');
      
      try {
        // Build prompt
        const prompt = agent.prompt_template.replace('{document_text}', testCase.text);
        console.log('🤖 Prompt built, length:', prompt.length);
        
        // Call Gemini
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.1
          }
        });
        
        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const processingTime = Date.now() - startTime;
        
        console.log('✅ Gemini response:', {
          rawResponse: text,
          cleaned: text.toLowerCase().trim(),
          processingTime: processingTime + 'ms'
        });
        
        // Validate result
        const cleanedResult = text.toLowerCase().trim();
        const validTypes = ['acta', 'factura', 'comunicado', 'contrato', 'presupuesto', 'albaran', 'escritura'];
        const isValid = validTypes.includes(cleanedResult);
        
        console.log('🎯 Classification:', {
          expected: testCase.type,
          actual: cleanedResult,
          correct: cleanedResult === testCase.type,
          valid: isValid
        });
        
      } catch (error) {
        console.error('❌ Error processing:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testClassifier();