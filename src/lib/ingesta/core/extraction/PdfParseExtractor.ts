/**
 * ARCHIVO: PdfParseExtractor.ts
 * PROPÓSITO: Extractor de texto usando pdf-parse con proceso externo
 * ESTADO: development
 * DEPENDENCIAS: BaseTextExtractor, fs, child_process
 * OUTPUTS: Texto extraído de PDFs usando pdf-parse
 * ACTUALIZADO: 2025-09-21
 */

import { BaseTextExtractor, ExtractionResult, ExtractionContext } from './BaseTextExtractor.ts';

export class PdfParseExtractor extends BaseTextExtractor {
  constructor() {
    super('pdf-parse');
  }

  /**
   * Verifica si este extractor puede manejar el contexto
   */
  canHandle(context: ExtractionContext): boolean {
    // PDF-parse es siempre el primer intento para cualquier PDF
    return context.buffer.length > 0;
  }

  /**
   * Prioridad más alta (primer intento)
   */
  getPriority(): number {
    return 1;
  }

  /**
   * Extrae texto usando pdf-parse en proceso externo
   */
  async extract(context: ExtractionContext): Promise<ExtractionResult> {
    this.log('info', 'Starting PDF-parse extraction...');
    const startTime = Date.now();

    try {
      const result = await this.extractWithExternalProcess(context.buffer);
      const processingTime = `${Date.now() - startTime}ms`;

      if (result.success && result.text) {
        this.log('success', `Extracted ${result.text.length} characters in ${processingTime}`);
        
        return this.createSuccessResult(result.text, {
          confidence: 0.9,
          pages: result.pages,
          processingTime,
          method: 'pdf-parse-external'
        });
      } else {
        return this.createErrorResult(
          result.error || 'PDF-parse extraction failed - no text extracted',
          'pdf-parse-external'
        );
      }

    } catch (error) {
      return this.createErrorResult(error, 'pdf-parse-external');
    }
  }

  /**
   * Ejecuta pdf-parse usando proceso externo para compatibilidad con Next.js
   */
  private async extractWithExternalProcess(buffer: Buffer): Promise<any> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);

    let tempFile: string | null = null;

    try {
      this.log('info', 'Starting external process extraction...');
      
      // Create temporary file
      const tempDir = '/tmp';
      tempFile = path.join(tempDir, `pdf_temp_${Date.now()}.pdf`);
      
      this.log('info', `Writing temp file: ${tempFile}`);
      await fs.writeFile(tempFile, buffer);
      
      // Execute external script
      const scriptPath = path.join(process.cwd(), 'extract-pdf-text.js');
      this.log('info', `Executing script: ${scriptPath}`);
      
      const { stdout, stderr } = await execFileAsync('node', [scriptPath, tempFile], {
        timeout: 30000, // 30 seconds
        maxBuffer: 10 * 1024 * 1024 // 10MB
      });
      
      if (stderr) {
        this.log('warning', `Stderr (warnings): ${stderr}`);
      }
      
      // Limpiar stdout eliminando posibles warnings o logs
      const cleanOutput = stdout.trim();
      
      // Intentar encontrar JSON válido en la salida
      let jsonStart = cleanOutput.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON found in output');
      }
      
      const jsonOutput = cleanOutput.substring(jsonStart);
      const result = JSON.parse(jsonOutput);
      
      this.log('info', 'External process result:', {
        success: result.success,
        textLength: result.text?.length || 0,
        pages: result.pages
      });
      
      return result;
      
    } catch (error) {
      this.log('error', `External process failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'External process execution failed',
        text: null,
        pages: 0
      };
      
    } finally {
      // Cleanup temp file
      if (tempFile) {
        try {
          await fs.unlink(tempFile);
          this.log('info', 'Temp file cleaned up');
        } catch (cleanupError) {
          this.log('warning', `Failed to cleanup temp file: ${cleanupError}`);
        }
      }
    }
  }
}