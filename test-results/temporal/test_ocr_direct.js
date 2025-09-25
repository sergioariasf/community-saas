/**
 * ARCHIVO: test_ocr_direct.js
 * PROPÓSITO: Test directo de Google Vision OCR con PDF vacío
 * ESTADO: testing
 * DEPENDENCIAS: google-cloud/vision, pdf-parse
 * OUTPUTS: Test de funcionalidad OCR
 * ACTUALIZADO: 2025-09-20
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const { extractWithGoogleVision } = require('./src/lib/pdf/googleVision');
const { extractTextFromPDF } = require('./src/lib/pdf/textExtraction');

console.log('🧪 Testing OCR direct functionality...');
console.log('📍 GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Test con un PDF que sabemos que está escaneado (imagen)
async function testOCR() {
    try {
        // Primero buscar PDFs recientes en uploads
        const uploadsPath = '/tmp';
        const files = fs.readdirSync(uploadsPath).filter(f => f.endsWith('.pdf'));
        
        if (files.length === 0) {
            console.log('❌ No hay PDFs en /tmp para testar');
            return;
        }
        
        const latestPDF = files[files.length - 1];
        const pdfPath = `${uploadsPath}/${latestPDF}`;
        
        console.log(`📄 Testing con: ${pdfPath}`);
        
        const buffer = fs.readFileSync(pdfPath);
        console.log(`📏 PDF Size: ${buffer.length} bytes`);
        
        // Test 1: Extracción normal con pdf-parse
        console.log('\n🔍 TEST 1: PDF-PARSE');
        const normalResult = await extractTextFromPDF(buffer);
        console.log(`   Success: ${normalResult.success}`);
        console.log(`   Method: ${normalResult.method}`);
        console.log(`   Text length: ${normalResult.text.length}`);
        console.log(`   Pages: ${normalResult.metadata?.pages || 'unknown'}`);
        
        // Test 2: Extracción directa con Google Vision
        console.log('\n🔍 TEST 2: GOOGLE VISION OCR');
        const ocrResult = await extractWithGoogleVision(buffer);
        console.log(`   Success: ${ocrResult.success}`);
        console.log(`   Method: ${ocrResult.method}`);
        console.log(`   Text length: ${ocrResult.text.length}`);
        console.log(`   Pages: ${ocrResult.metadata?.pages || 'unknown'}`);
        console.log(`   Confidence: ${ocrResult.metadata?.confidence || 'unknown'}`);
        
        if (ocrResult.success && ocrResult.text.length > 0) {
            console.log('\n📝 PREVIEW DEL TEXTO EXTRAÍDO:');
            console.log(ocrResult.text.substring(0, 200) + '...');
        }
        
        if (ocrResult.metadata?.error) {
            console.log(`\n❌ OCR Error: ${ocrResult.metadata.error}`);
        }
        
    } catch (error) {
        console.error('❌ Error en test:', error.message);
    }
}

testOCR();