// Check the specific invoice that works in production
require('dotenv').config({ path: '.env.local' });
const { createSupabaseServiceClient } = require('./src/supabase-clients/server');

async function checkSpecificInvoice() {
  const supabase = createSupabaseServiceClient();
  const documentId = 'fa373e4b-f406-438f-a495-fd2a691bfa52';
  
  console.log(`🔍 Checking document: ${documentId}`);
  
  try {
    // Get document info
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (docError) {
      console.error('❌ Error fetching document:', docError);
      return;
    }
    
    console.log('📄 Document info:');
    console.log(`- Filename: ${document.filename}`);
    console.log(`- Status: ${document.status}`);
    console.log(`- File size: ${document.file_size} bytes`);
    console.log(`- Pages: ${document.pages_count}`);
    console.log(`- Classification: ${JSON.stringify(JSON.parse(document.classification_result || '{}'), null, 2)}`);
    
    // Get extracted text length
    const { data: extractedText, error: textError } = await supabase
      .from('extracted_text')
      .select('extracted_text')
      .eq('document_id', documentId)
      .single();
    
    if (textError) {
      console.error('❌ Error fetching extracted text:', textError);
    } else {
      console.log(`📝 Extracted text length: ${extractedText.extracted_text.length} characters`);
      console.log(`📝 First 200 chars: ${extractedText.extracted_text.substring(0, 200)}...`);
    }
    
    // Check if invoice was extracted successfully
    const { data: extractedInvoice, error: invoiceError } = await supabase
      .from('extracted_invoices')
      .select('*')
      .eq('document_id', documentId)
      .single();
    
    if (invoiceError) {
      console.error('❌ Error fetching extracted invoice:', invoiceError);
    } else {
      console.log('💰 Successfully extracted invoice:');
      console.log(`- Provider: ${extractedInvoice.provider_name}`);
      console.log(`- Amount: ${extractedInvoice.amount}`);
      console.log(`- Invoice number: ${extractedInvoice.invoice_number}`);
      console.log(`- Products count: ${extractedInvoice.products ? JSON.parse(extractedInvoice.products).length : 'N/A'}`);
      
      if (extractedInvoice.products) {
        const products = JSON.parse(extractedInvoice.products);
        console.log(`📦 Products (first 3):`);
        products.slice(0, 3).forEach((product, i) => {
          console.log(`  ${i+1}. ${product.description} - ${product.quantity} x ${product.unit_price} = ${product.total_price}`);
        });
        if (products.length > 3) {
          console.log(`  ... and ${products.length - 3} more products`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

checkSpecificInvoice();