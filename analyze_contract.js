require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeLatestContract() {
  const { data: docs, error } = await supabase
    .from('documents')
    .select('*')
    .eq('document_type', 'contrato')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (error || !docs) {
    console.log('No contract found:', error);
    return;
  }
  
  console.log('=== ANÁLISIS DEL CONTRATO MÁS RECIENTE ===');
  console.log('ID:', docs.id);
  console.log('Filename:', docs.filename);
  console.log('Processing status:', docs.processing_status);
  console.log('Extraction method:', docs.extraction_method);
  console.log('Text length:', docs.extracted_text ? docs.extracted_text.length : 0);
  console.log('');
  
  if (docs.extracted_text) {
    const has45600 = docs.extracted_text.includes('45600') || docs.extracted_text.includes('45.600');
    console.log('¿Contiene coste 45600?:', has45600);
    
    const pageIndicators = docs.extracted_text.match(/página/gi) || [];
    console.log('Menciones de página:', pageIndicators.length);
    
    console.log('');
    console.log('=== PRIMEROS 500 CARACTERES ===');
    console.log(docs.extracted_text.substring(0, 500));
    
    const costTerms = ['euro', '€', 'coste', 'precio', 'importe', '45600', '45.600'];
    console.log('');
    console.log('=== BÚSQUEDA DE TÉRMINOS DE COSTE ===');
    costTerms.forEach(term => {
      const found = docs.extracted_text.toLowerCase().includes(term.toLowerCase());
      console.log(term + ': ' + found);
    });
    
    // Buscar específicamente texto relacionado con el coste
    const lines = docs.extracted_text.split('\n');
    const costLines = lines.filter(line => 
      line.includes('45600') || 
      line.includes('45.600') || 
      line.toLowerCase().includes('total') ||
      line.toLowerCase().includes('importe')
    );
    
    if (costLines.length > 0) {
      console.log('');
      console.log('=== LÍNEAS CON INFORMACIÓN DE COSTE ===');
      costLines.forEach(line => console.log('>', line.trim()));
    }
  }
  
  // Verificar datos extraídos por el agente
  const { data: contract } = await supabase
    .from('extracted_contracts')
    .select('*')
    .eq('document_id', docs.id)
    .single();
    
  if (contract) {
    console.log('');
    console.log('=== DATOS EXTRAÍDOS POR EL AGENTE ===');
    console.log('Título:', contract.titulo_contrato);
    console.log('Importe total:', contract.importe_total);
    console.log('Topic keywords:', contract.topic_keywords);
    console.log('Topic mantenimiento:', contract.topic_mantenimiento);
    console.log('Topic agua:', contract.topic_agua);
  }
}

analyzeLatestContract().catch(console.error);