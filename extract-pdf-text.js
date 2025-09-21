// Script independiente para extraer texto de PDFs
// Se ejecuta como proceso separado para evitar problemas de Next.js

const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractText() {
  try {
    // Leer argumentos: path del buffer temporal
    const bufferPath = process.argv[2];
    
    if (!bufferPath) {
      console.error('Error: No se proporcionó path del buffer');
      process.exit(1);
    }

    // Leer el buffer del archivo temporal
    const buffer = fs.readFileSync(bufferPath);
    
    // Extraer texto usando pdf-parse
    const data = await pdfParse(buffer, {
      max: 0 // Parse all pages
    });

    // Retornar resultado como JSON
    const result = {
      success: true,
      text: data.text.trim(),
      pages: data.numpages,
      method: 'pdf-parse-external'
    };

    // Escribir solo JSON válido en stdout, sin logs adicionales
    process.stdout.write(JSON.stringify(result));

  } catch (error) {
    const result = {
      success: false,
      error: error.message,
      method: 'pdf-parse-external'
    };

    // Escribir solo JSON válido en stdout, sin logs adicionales
    process.stdout.write(JSON.stringify(result));
    process.exit(1);
  }
}

extractText();