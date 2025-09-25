// Quick script to check what invoices are actually in production
require('dotenv').config({ path: '.env.local' });
const { createSupabaseServiceClient } = require('./src/lib/supabase/service');

async function checkProductionInvoices() {
  const supabase = createSupabaseServiceClient();
  
  console.log('🔍 Checking invoices in production database...');
  
  try {
    // Check all documents classified as factura
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, filename, classification_result')
      .eq('status', 'completed')
      .like('classification_result', '%factura%');
    
    if (error) {
      console.error('❌ Error fetching documents:', error);
      return;
    }
    
    console.log(`📊 Found ${documents.length} documents classified as factura:`);
    
    documents.forEach(doc => {
      const classification = JSON.parse(doc.classification_result || '{}');
      console.log(`- ${doc.filename} (${classification.document_type}) - ID: ${doc.id}`);
    });
    
    // Check extracted invoices
    const { data: extractedInvoices, error: extractError } = await supabase
      .from('extracted_invoices')
      .select('document_id, provider_name, amount, created_at');
    
    if (extractError) {
      console.error('❌ Error fetching extracted invoices:', extractError);
      return;
    }
    
    console.log(`\n💾 Found ${extractedInvoices.length} successfully extracted invoices:`);
    
    extractedInvoices.forEach(invoice => {
      console.log(`- Document ID: ${invoice.document_id}, Provider: ${invoice.provider_name}, Amount: ${invoice.amount}, Date: ${invoice.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkProductionInvoices();