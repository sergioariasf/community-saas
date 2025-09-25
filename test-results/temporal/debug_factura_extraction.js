require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPDFExtraction() {
  console.log('=== TESTING PDF EXTRACTION MANUALLY ===\n');
  
  const docId = '646b0990-90b4-4853-967c-fac67cd4df46';
  const filePath = 'e3f4370b-2235-45ad-869a-737ee9fd95ab/c7e7b867-6180-4363-a2f8-2aa12eb804b5/2025/09/factura_a9191cab_1758345500573.pdf';
  
  console.log('1. Downloading file from Supabase Storage...');
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(filePath);

  if (downloadError || !fileData) {
    console.log('❌ Download failed:', downloadError?.message);
    return;
  }

  console.log('✅ File downloaded:', fileData.size, 'bytes');
  
  console.log('\n2. Converting to buffer...');
  const buffer = Buffer.from(await fileData.arrayBuffer());
  console.log('✅ Buffer created:', buffer.length, 'bytes');
  
  console.log('\n3. Testing external PDF extraction...');
  
  const fs = require('fs');
  const path = require('path');
  const { execFile } = require('child_process');
  const { promisify } = require('util');
  const execFileAsync = promisify(execFile);

  try {
    // Create temporary file
    const tempDir = '/tmp';
    const tempFile = path.join(tempDir, `pdf_test_${Date.now()}.pdf`);
    
    console.log('📁 Writing temp file:', tempFile);
    fs.writeFileSync(tempFile, buffer);
    
    try {
      // Execute external script
      const scriptPath = path.join(process.cwd(), 'extract-pdf-text.js');
      console.log('🚀 Executing script:', scriptPath);
      
      const { stdout, stderr } = await execFileAsync('node', [scriptPath, tempFile], {
        timeout: 30000,
        maxBuffer: 10 * 1024 * 1024
      });
      
      console.log('✅ Script completed!');
      console.log('📤 STDOUT length:', stdout.length);
      console.log('📤 STDERR length:', stderr.length);
      
      if (stderr) {
        console.log('\n⚠️ STDERR content:');
        console.log(stderr);
      }
      
      console.log('\n📝 STDOUT preview (first 500 chars):');
      console.log(stdout.substring(0, 500));
      
      // Try to parse JSON
      try {
        const cleanOutput = stdout.trim();
        let jsonStart = cleanOutput.indexOf('{');
        if (jsonStart === -1) {
          console.log('\n❌ No JSON found in output');
        } else {
          const jsonOutput = cleanOutput.substring(jsonStart);
          const result = JSON.parse(jsonOutput);
          console.log('\n✅ JSON parsed successfully:');
          console.log('   Success:', result.success);
          console.log('   Text length:', result.text?.length || 0);
          console.log('   Pages:', result.pages);
          console.log('   Error:', result.error || 'None');
        }
      } catch (parseError) {
        console.log('\n❌ JSON parse error:', parseError.message);
      }
      
    } finally {
      // Clean up temp file
      fs.unlinkSync(tempFile);
      console.log('\n🗑️ Temp file cleaned up');
    }

  } catch (error) {
    console.error('❌ Extraction test failed:', error.message);
    console.error('❌ Error details:', error);
  }
}

testPDFExtraction().catch(console.error);