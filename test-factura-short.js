// Test rápido para verificar si el agente factura_extractor_v2 funciona con texto corto
const { createSupabaseServiceClient } = require('./src/lib/supabase/service');

async function testFacturaAgent() {
  const supabase = createSupabaseServiceClient();
  
  // Texto corto de prueba
  const shortText = `
FACTURA
FECHA: 28-02-2023
NÚMERO: 1/230.230
SALTER SPORT S.A.
N.I.F. A58112590
Cliente: Lluís Millet
Importe: 16.144,53 €
Producto: FUNCTIONAL TRAINER INSPIRE FT
Cantidad: 1
Precio: 2.075,50 €
  `;
  
  console.log('🔍 Testing factura_extractor_v2 with short text...');
  
  try {
    const { data, error } = await supabase.rpc('execute_agent', {
      agent_name: 'factura_extractor_v2',
      user_prompt: `Eres un experto en análisis de documentos comerciales especializado en facturas. Analiza el siguiente documento y extrae TODA la información de factura en formato JSON válido:\n\n${shortText}`
    });
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log('✅ Response received:', typeof data);
    console.log('📄 Raw response (first 500 chars):', data.substring(0, 500));
    
    // Try to parse JSON
    try {
      const parsed = JSON.parse(data);
      console.log('✅ JSON parsed successfully!');
      console.log('📊 Fields found:', Object.keys(parsed).length);
    } catch (parseError) {
      console.error('❌ JSON parsing failed:', parseError.message);
      console.log('📄 Response ends with:', data.slice(-100));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFacturaAgent();