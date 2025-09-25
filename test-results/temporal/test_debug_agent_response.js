#!/usr/bin/env node

/**
 * Debug: Ver respuesta completa del agente para diagnosticar problema de parsing
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function debugAgentResponse() {
  console.log('🔍 DEBUG: Respuesta del agente comunicado_extractor_v1');
  
  try {
    // 1. Obtener agente
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('name', 'comunicado_extractor_v1')
      .eq('is_active', true)
      .single();
    
    if (agentError || !agent) {
      throw new Error(`Agente no encontrado: ${agentError?.message}`);
    }
    
    console.log('✅ Agente encontrado');
    
    // 2. Cargar documento
    const testFile = path.join(process.cwd(), 'datos/Comunicado- INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. _AMARA HOMES_.pdf');
    const buffer = fs.readFileSync(testFile);
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer);
    
    console.log(`📄 Texto extraído: ${pdfData.text.length} caracteres`);
    
    // 3. Ejecutar agente
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const fullPrompt = `${agent.prompt_template}\n\nTexto del documento:\n${pdfData.text}`;
    console.log('🔄 Ejecutando agente...');
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const agentResponse = response.text();
    
    console.log('\n📋 RESPUESTA COMPLETA DEL AGENTE:');
    console.log('='.repeat(60));
    console.log(agentResponse);
    console.log('='.repeat(60));
    
    // 4. Intentar diferentes estrategias de parsing
    console.log('\n🔧 ESTRATEGIAS DE PARSING:');
    
    // Estrategia 1: Buscar JSON con backticks
    const jsonWithBackticks = agentResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonWithBackticks) {
      console.log('✅ Encontrado JSON con backticks');
      try {
        const parsed1 = JSON.parse(jsonWithBackticks[1]);
        console.log('✅ Parsing exitoso con estrategia 1');
        console.log('📊 Campos:', Object.keys(parsed1));
        return;
      } catch (e) {
        console.log('❌ Error parsing estrategia 1:', e.message);
      }
    }
    
    // Estrategia 2: Buscar JSON sin backticks
    const jsonWithoutBackticks = agentResponse.match(/\{[\s\S]*\}/);
    if (jsonWithoutBackticks) {
      console.log('✅ Encontrado JSON sin backticks');
      try {
        const parsed2 = JSON.parse(jsonWithoutBackticks[0]);
        console.log('✅ Parsing exitoso con estrategia 2');
        console.log('📊 Campos:', Object.keys(parsed2));
        return;
      } catch (e) {
        console.log('❌ Error parsing estrategia 2:', e.message);
      }
    }
    
    // Estrategia 3: Parsing completo
    try {
      const parsed3 = JSON.parse(agentResponse);
      console.log('✅ Parsing exitoso con estrategia 3 (completo)');
      console.log('📊 Campos:', Object.keys(parsed3));
    } catch (e) {
      console.log('❌ Error parsing estrategia 3:', e.message);
    }
    
    console.log('\n🔍 ANÁLISIS DEL PROBLEMA:');
    console.log(`📏 Longitud respuesta: ${agentResponse.length}`);
    console.log(`🔤 Primeros 100 chars: ${agentResponse.substring(0, 100)}`);
    console.log(`🔤 Últimos 100 chars: ${agentResponse.substring(agentResponse.length - 100)}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugAgentResponse().catch(console.error);