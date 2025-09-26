
// Importación dinámica para evitar problemas de inicialización de pdf-parse

/**
 * Estrategia híbrida de extracción de texto de PDFs
 * Basada en la experiencia del proyecto RAG del usuario
 * 
 * 1. Intentar pdf-parse primero (90% casos - rápido, gratis)
 * 2. Detectar si necesita OCR (10% casos - lento, pagado)
 * 3. Fallback graceful en caso de error
 */

export interface TextExtractionResult {
  text: string;
  success: boolean;
  method: 'pdf-parse' | 'pdf-parse-direct' | 'pdf-parse-external' | 'langchain-pypdf' | 'ocr' | 'error' | 'gemini-flash-ocr-ia';
  metadata: {
    pages: number;
    size: number;
    confidence?: number;
    error?: string;
  };
}

/**
 * Extrae texto de un PDF usando estrategia híbrida
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<TextExtractionResult> {
  try {
    console.log(`[PDF Extraction] Starting extraction for ${buffer.length} byte file`);
    console.log(`[PDF Extraction] Buffer type:`, typeof buffer);
    console.log(`[PDF Extraction] Buffer is Buffer:`, Buffer.isBuffer(buffer));
    console.log(`[PDF Extraction] First 10 bytes:`, buffer.subarray(0, 10));
    
    // PASO 1: Intentar pdf-parse primero (método preferido)
    console.log(`[PDF Extraction] Calling extractWithPdfParse...`);
    const pdfResult = await extractWithPdfParse(buffer);
    console.log(`[PDF Extraction] extractWithPdfParse returned:`, {
      success: pdfResult.success,
      textLength: pdfResult.text.length,
      method: pdfResult.method,
      pages: pdfResult.metadata.pages
    });
    
    if (pdfResult.success && !needsOCR(pdfResult.text)) {
      console.log(`[PDF Extraction] Success with pdf-parse: ${pdfResult.text.length} chars`);
      return pdfResult;
    }

    console.log(`[PDF Extraction] pdf-parse result insufficient, text length: ${pdfResult.text?.length || 0}`);
    
    // PASO 2: Si pdf-parse no es suficiente, intentar OCR con Google Vision
    console.log(`[PDF Extraction] Attempting OCR fallback...`);
    const ocrResult = await extractWithGoogleVision(buffer);
    
    if (ocrResult.success && ocrResult.text.length > pdfResult.text.length) {
      console.log(`[PDF Extraction] OCR successful: ${ocrResult.text.length} chars vs ${pdfResult.text.length} from pdf-parse`);
      return ocrResult;
    }

    // PASO 3: Si OCR también falla, usar el mejor resultado disponible
    if (pdfResult.success) {
      console.log(`[PDF Extraction] Using pdf-parse result as fallback`);
      return {
        ...pdfResult,
        method: 'pdf-parse', // Marcar que fue pdf-parse pero con limitaciones
      };
    }

    // PASO 4: Si todo falla, retornar error con información útil
    return {
      text: '',
      success: false,
      method: 'error',
      metadata: {
        pages: 0,
        size: buffer.length,
      }
    };

  } catch (error) {
    console.error('[PDF Extraction] Fatal error:', error);
    return {
      text: '',
      success: false,
      method: 'error',
      metadata: {
        pages: 0,
        size: buffer.length,
      }
    };
  }
}

/**
 * Extrae texto usando pdf-parse (método rápido y gratuito)
 * Con fallback a proceso externo si falla en Next.js
 */
async function extractWithPdfParse(buffer: Buffer): Promise<TextExtractionResult> {
  try {
    console.log('[PDF Parse] Starting extraction with buffer size:', buffer.length);
    console.log('[PDF Parse] Buffer validation:', {
      isBuffer: Buffer.isBuffer(buffer),
      length: buffer.length,
      firstBytes: buffer.subarray(0, 4).toString('hex')
    });
    
    // MÉTODO 1: Intentar directamente en Next.js
    try {
      console.log('[PDF Parse] Trying direct pdf-parse in Next.js...');
      const pdfParse = (await import('pdf-parse')).default;
      
      if (typeof pdfParse !== 'function') {
        throw new Error(`pdf-parse is not a function, got: ${typeof pdfParse}`);
      }
      
      const data = await pdfParse(buffer, {
        max: 0 // Parse all pages
      });
      
      const extractedText = (data.text || '').trim();
      console.log('[PDF Parse] Direct method success:', extractedText.length, 'characters');
      
      if (extractedText.length > 0) {
        return {
          text: extractedText,
          success: true,
          method: 'pdf-parse-direct',
          metadata: {
            pages: data.numpages || 0,
            size: buffer.length,
          }
        };
      }
    } catch (directError) {
      console.log('[PDF Parse] Direct method failed:', directError.message);
    }
    
    // MÉTODO 2: Usar proceso externo como fallback
    console.log('[PDF Parse] Trying external process fallback...');
    return await extractWithExternalProcess(buffer);

  } catch (error) {
    console.error('[PDF Parse] All methods failed:', error);
    
    return {
      text: '',
      success: false,
      method: 'error',
      metadata: {
        pages: 0,
        size: buffer.length,
      }
    };
  }
}

/**
 * Extrae texto usando proceso externo (fallback robusto)
 */
async function extractWithExternalProcess(buffer: Buffer): Promise<TextExtractionResult> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);

  try {
    console.log('[PDF External] Starting external extraction...');
    
    // Crear archivo temporal
    const tempDir = '/tmp';
    const tempFile = path.join(tempDir, `pdf_temp_${Date.now()}.bin`);
    
    console.log('[PDF External] Writing temp file:', tempFile);
    await fs.writeFile(tempFile, buffer);
    
    try {
      // Ejecutar script externo
      const scriptPath = path.join(process.cwd(), 'extract-pdf-text.js');
      console.log('[PDF External] Executing script:', scriptPath);
      
      const { stdout, stderr } = await execFileAsync('node', [scriptPath, tempFile], {
        timeout: 30000, // 30 segundos
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      
      if (stderr) {
        console.warn('[PDF External] Stderr:', stderr);
      }
      
      const result = JSON.parse(stdout.trim());
      console.log('[PDF External] Result:', {
        success: result.success,
        textLength: result.text?.length || 0,
        pages: result.pages
      });
      
      if (result.success && result.text) {
        return {
          text: result.text,
          success: true,
          method: 'pdf-parse-external',
          metadata: {
            pages: result.pages || 0,
            size: buffer.length,
          }
        };
      }
      
      throw new Error(result.error || 'External process failed');
      
    } finally {
      // Limpiar archivo temporal
      await fs.unlink(tempFile).catch(() => {});
    }

  } catch (error) {
    console.error('[PDF External] Error:', error);
    
    return {
      text: '',
      success: false,
      method: 'error',
      metadata: {
        pages: 0,
        size: buffer.length,
      }
    };
  }
}

/**
 * Extrae texto usando PyPDFLoader de LangChain (método más robusto)
 */
async function extractWithLangChain(buffer: Buffer): Promise<TextExtractionResult> {
  try {
    console.log('[LangChain PDF] Starting extraction with buffer size:', buffer.length);
    
    // Importar PyPDFLoader
    const { PyPDFLoader } = await import('@langchain/community/document_loaders/fs/pdf');
    console.log('[LangChain PDF] PyPDFLoader imported successfully');
    
    // Crear un archivo temporal para PyPDFLoader
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `temp_${Date.now()}.pdf`);
    
    console.log('[LangChain PDF] Writing temp file:', tempFile);
    await fs.writeFile(tempFile, buffer);
    
    try {
      // Usar PyPDFLoader
      const loader = new PyPDFLoader(tempFile);
      console.log('[LangChain PDF] Loading document...');
      
      const docs = await loader.load();
      console.log('[LangChain PDF] Documents loaded:', docs.length);
      
      // Concatenar todo el texto de todos los documentos
      const extractedText = docs.map(doc => doc.pageContent).join('\n\n').trim();
      console.log('[LangChain PDF] Total text length:', extractedText.length);
      
      return {
        text: extractedText,
        success: extractedText.length > 0,
        method: 'langchain-pypdf',
        metadata: {
          pages: docs.length,
          size: buffer.length,
        }
      };
      
    } finally {
      // Limpiar archivo temporal
      await fs.unlink(tempFile).catch(() => {});
    }

  } catch (error) {
    console.error('[LangChain PDF] Error:', error);
    return {
      text: '',
      success: false,
      method: 'error',
      metadata: {
        pages: 0,
        size: buffer.length,
      }
    };
  }
}

/**
 * Determina si un texto extraído necesita OCR
 * Basado en heurísticas probadas en proyectos RAG
 */
function needsOCR(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return true; // Sin texto = necesita OCR
  }

  const trimmedText = text.trim();
  
  // Criterio 1: Muy poco texto (menos de 100 caracteres)
  if (trimmedText.length < 100) {
    console.log('[OCR Detection] Text too short:', trimmedText.length);
    return true;
  }

  // Criterio 2: Detectar artifacts típicos de OCR mal hecho
  if (hasOCRArtifacts(trimmedText)) {
    console.log('[OCR Detection] OCR artifacts detected');
    return true;
  }

  // Criterio 3: Falta estructura normal de documento
  if (!hasNormalStructure(trimmedText)) {
    console.log('[OCR Detection] No normal document structure');
    return true;
  }

  return false;
}

/**
 * Detecta artifacts típicos de OCR deficiente
 */
function hasOCRArtifacts(text: string): boolean {
  // Patrones comunes de OCR malo:
  const ocrArtifacts = [
    /[Il1|]{3,}/g,           // Secuencias de I, l, 1, |
    /[oO0]{3,}/g,            // Secuencias de o, O, 0
    /\s[a-zA-Z]\s/g,         // Letras sueltas (más del 5%)
    /[^\w\s\n\r\t.,;:!?()[\]{}'"áéíóúñü]/g, // Caracteres extraños
  ];

  let artifactCount = 0;
  for (const pattern of ocrArtifacts) {
    const matches = text.match(pattern);
    if (matches) {
      artifactCount += matches.length;
    }
  }

  // Si más del 5% del texto son artifacts, probablemente necesita OCR
  const artifactRatio = artifactCount / text.length;
  return artifactRatio > 0.05;
}

/**
 * Verifica si el texto tiene estructura normal de documento
 */
function hasNormalStructure(text: string): boolean {
  // Criterios de estructura normal:
  
  // 1. Tiene palabras de longitud normal (no solo caracteres sueltos)
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const normalWords = words.filter(w => w.length >= 3).length;
  const normalWordRatio = normalWords / words.length;
  
  if (normalWordRatio < 0.6) { // Menos del 60% son palabras normales
    return false;
  }

  // 2. Tiene algún tipo de puntuación normal
  const hasPunctuation = /[.,;:!?]/.test(text);
  
  // 3. Tiene espacios normales (no todo junto ni todo separado)
  const hasNormalSpacing = text.includes(' ') && !text.startsWith(' '.repeat(10));

  return hasPunctuation && hasNormalSpacing;
}

/**
 * Extrae texto usando Google Vision OCR
 * Importa dinámicamente para evitar errores si no está configurado
 */
export async function extractWithGoogleVision(buffer: Buffer): Promise<TextExtractionResult> {
  try {
    console.log('[PDF Extraction] Attempting Google Vision OCR...');
    
    // Importación dinámica para evitar errores en build si no está configurado
    const { extractWithGoogleVision: visionExtract, isGoogleVisionAvailable } = await import('./googleVision');
    
    if (!isGoogleVisionAvailable()) {
      console.log('[PDF Extraction] Google Vision not configured, skipping OCR');
      return {
        text: '',
        success: false,
        method: 'error',
        metadata: {
          pages: 0,
          size: buffer.length,
          confidence: 0,
        }
      };
    }

    const result = await visionExtract(buffer);
    return result;
    
  } catch (error) {
    console.error('[PDF Extraction] Google Vision error:', error);
    return {
      text: '',
      success: false,
      method: 'error',
      metadata: {
        pages: 0,
        size: buffer.length,
        confidence: 0,
      }
    };
  }
}

/**
 * Limpia y normaliza texto extraído
 */
export function cleanExtractedText(text: string) {
  return text
    // Normalizar saltos de línea
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Eliminar espacios excesivos
    .replace(/[ \t]+/g, ' ')
    // Eliminar múltiples saltos de línea
    .replace(/\n{3,}/g, '\n\n')
    // Trim general
    .trim();
}