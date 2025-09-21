#!/usr/bin/env node

/**
 * ARCHIVO: extract-document.js
 * PROPÓSITO: Extraer texto de un documento específico usando pdf-parse (para llamada externa)
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js, pdf-parse, fs
 * OUTPUTS: Extracción de texto de PDF y actualización en BD
 * ACTUALIZADO: 2025-09-15
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function extractDocument() {
  const documentId = process.env.DOCUMENT_ID || process.argv[2];
  
  if (!documentId) {
    console.error('❌ Document ID required');
    process.exit(1);
  }

  console.log(`🔧 Extracting text for document: ${documentId}`);
  
  try {
    // 1. Autenticarse
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'sergioariasf@gmail.com',
      password: 'Elpato_46'
    });
    
    if (authError) {
      throw new Error(`Auth failed: ${authError.message}`);
    }

    // 2. Buscar el documento
    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();
    
    if (error || !doc) {
      throw new Error(`Document not found: ${error?.message}`);
    }
    
    console.log(`📄 Document: ${doc.filename}`);
    console.log(`📁 Path: ${doc.file_path}`);
    
    // 3. Descargar archivo desde Supabase Storage
    console.log('☁️ Downloading from Storage...');
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(doc.file_path);
    
    if (downloadError || !fileData) {
      throw new Error(`Download failed: ${downloadError?.message}`);
    }
    
    // 4. Convertir a buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());
    console.log(`✅ Downloaded: ${buffer.length} bytes`);
    
    // 5. Extraer texto con pdf-parse
    console.log('📖 Extracting text with pdf-parse...');
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(buffer, { max: 0 });
    
    const extractedText = pdfData.text.trim();
    console.log(`✅ Extracted: ${extractedText.length} characters, ${pdfData.numpages} pages`);
    
    // 6. Actualizar documento con texto extraído
    console.log('💾 Updating document...');
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        extracted_text: extractedText,
        text_length: extractedText.length,
        page_count: pdfData.numpages,
        extraction_status: 'completed'
      })
      .eq('id', documentId);
    
    if (updateError) {
      throw new Error(`Update failed: ${updateError.message}`);
    }
    
    console.log('✅ Document updated successfully');
    
    // Return success info
    console.log(JSON.stringify({
      success: true,
      textLength: extractedText.length,
      pages: pdfData.numpages
    }));
    
  } catch (error) {
    console.error('❌ Extraction failed:', error.message);
    console.log(JSON.stringify({
      success: false,
      error: error.message
    }));
    process.exit(1);
  }
}

extractDocument();