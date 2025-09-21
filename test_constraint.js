require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function testConstraint() {
  // Obtener un documento existente
  const { data: docs, error } = await supabase
    .from('documents')
    .select('id, extraction_method')
    .limit(1);
    
  if (error || !docs || docs.length === 0) {
    console.log('No hay documentos para probar');
    return;
  }
  
  const docId = docs[0].id;
  console.log('Probando con documento: ' + docId);
  
  // Probar diferentes valores
  const testValues = [
    'pdf-parse',
    'google-vision-ocr', 
    'gemini-flash-ocr-ia',
    'pdf-parse-external'
  ];
  
  for (const value of testValues) {
    console.log('\nProbando: ' + value);
    const { error: updateError } = await supabase
      .from('documents')
      .update({ extraction_method: value })
      .eq('id', docId);
      
    if (updateError) {
      console.log('❌ ' + value + ': ' + updateError.message);
    } else {
      console.log('✅ ' + value + ': OK');
    }
  }
}

testConstraint();