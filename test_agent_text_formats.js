require('dotenv').config({ path: '.env.local' });

async function testAgentWithDifferentTexts() {
  console.log('=== TESTING CONTRATO_EXTRACTOR_V1 WITH DIFFERENT TEXT FORMATS ===');
  
  try {
    // Import saas agents
    const { callSaaSAgent } = require('./src/lib/gemini/saasAgents.ts');
    
    // Test 1: Simulated short text (like Gemini OCR IA)
    const shortText = `PRESUPUESTO N° 8661/22
MANTENIMIENTO TEMPORADA DE VERANO
El precio de presente presupuesto de los servicios a realizar por la Empresa se elevarán
a la cantidad de: 45.600,00 € + 21% IVA. (CUARENTA Y CINCO MIL
SEISCIENTOS EUROS + 21% IVA).`;
    
    console.log('🧪 TEST 1: SHORT TEXT (like Gemini OCR IA)');
    console.log('Length:', shortText.length, 'characters');
    
    try {
      const result1 = await callSaaSAgent('contrato_extractor_v1', {
        document_text: shortText
      });
      console.log('✅ Short text result:', {
        success: result1.success,
        hasData: !!result1.data,
        dataKeys: result1.data ? Object.keys(result1.data) : null,
        error: result1.error
      });
    } catch (error) {
      console.log('❌ Short text failed:', error.message);
    }
    
    console.log('');
    
    // Test 2: Simulated long text with page markers (like Google Vision)
    const longText = `--- Página 1 ---
OLAQUA
OLAQUA PISCINAS, S.L.
CONSERVACIÓN Y MANTENIMIENTO DE PISCINAS
COMUNIDAD DE PROPIETARIOS
C/ ACANTO Nº 2 BIS (LA MARAZUELA)
FASE I - II - III – IV (PISCINAS A-B-C-D)
LAS ROZAS - MADRID

--- Página 2 ---
Las Rozas, 01 de Mayo del 2023
PRESUPUESTO Nº 8661/22
MANTENIMIENTO TEMPORADA DE VERANO
La conservación y mantenimiento de la piscina de referencia, comprende las siguientes prestaciones.

--- Página 8 ---
CONDICIONES ECONOMICAS POR EL MANTENIMIENTO ANUAL DE LA PISCINA.-
TEMPORADA DE VERANO
El precio de presente presupuesto de los servicios a realizar por la Empresa se elevarán
a la cantidad de: 45.600,00 € + 21% IVA. (CUARENTA Y CINCO MIL
SEISCIENTOS EUROS + 21% IVA).
FORMA DE PAGO: Recibo domiciliado-
➤ 5.700,00 € + 21% IVA. Factura de fecha 05-05-2023 con vto. 25/05/23.
[... more content to simulate full document ...]`;
    
    console.log('🧪 TEST 2: LONG TEXT WITH PAGE MARKERS (like Google Vision)');
    console.log('Length:', longText.length, 'characters');
    
    try {
      const result2 = await callSaaSAgent('contrato_extractor_v1', {
        document_text: longText
      });
      console.log('✅ Long text result:', {
        success: result2.success,
        hasData: !!result2.data,
        dataKeys: result2.data ? Object.keys(result2.data) : null,
        error: result2.error
      });
    } catch (error) {
      console.log('❌ Long text failed:', error.message);
    }
    
    console.log('');
    
    // Test 3: Very long text to test limits
    const veryLongText = longText.repeat(10); // 10x longer
    console.log('🧪 TEST 3: VERY LONG TEXT (10x longer)');
    console.log('Length:', veryLongText.length, 'characters');
    
    try {
      const result3 = await callSaaSAgent('contrato_extractor_v1', {
        document_text: veryLongText
      });
      console.log('✅ Very long text result:', {
        success: result3.success,
        hasData: !!result3.data,
        dataKeys: result3.data ? Object.keys(result3.data) : null,
        error: result3.error
      });
    } catch (error) {
      console.log('❌ Very long text failed:', error.message);
    }
    
  } catch (error) {
    console.log('❌ Error importing saasAgents:', error.message);
    console.log('Stack:', error.stack);
  }
}

testAgentWithDifferentTexts().catch(console.error);