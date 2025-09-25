/**
 * Test específico para debuggear el albaran_extractor_v1
 */

const { callSaaSAgent } = require('./src/lib/agents/AgentOrchestrator.ts');

async function testAlbaranExtractor() {
  console.log('🧪 Testing albaran_extractor_v1 agent...');
  
  const testText = `--- Página 1 ---
fischer
Fischer
innovative solutions
Albarán
Fecha:
Hoja
01.10.2020
1
Cliente número:
594182
de
Fischer ibérica, S.A.U. CI. Klaus Fischer, 1/43300 Mont-roig del Camp
Albarán número:
S
CONTROL Y TENSION S.L.
Cliente:
C/ LUIS SAUQUILLO, 23
03203 ELCHE (ALICANTE)
Referencia:
SX12X50X40
Denominación:
TACO SX 12x50/40 (C/100)
Cantidad:
2`;

  const inputs = {
    document_content: testText,
    document_type: 'albaran',
    extraction_mode: 'complete'
  };

  try {
    const result = await callSaaSAgent('albaran_extractor_v1', inputs);
    
    console.log('✅ Agent Response:', {
      success: result.success,
      hasData: result.hasData,
      error: result.error,
      dataKeys: result.dataKeys ? result.dataKeys.length + ' keys' : 'no keys'
    });
    
    if (result.success && result.data) {
      console.log('📋 Data Keys Found:', Object.keys(result.data));
      console.log('🔍 Sample Data:');
      Object.entries(result.data).slice(0, 5).forEach(([key, value]) => {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
      });
    }
    
    if (!result.success) {
      console.error('❌ Error:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Exception:', error);
  }
}

testAlbaranExtractor();