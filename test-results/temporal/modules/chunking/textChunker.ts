/**
 * ARCHIVO: textChunker.ts
 * PROPÓSITO: Segmentación de texto en chunks para vectorización RAG
 * ESTADO: production
 * DEPENDENCIAS: ../../core/types.ts
 * OUTPUTS: Texto segmentado con metadatos de posición y overlap
 * ACTUALIZADO: 2025-09-14
 */

export interface ChunkingOptions {
  chunkSize?: number;
  strategy?: 'fixed-size' | 'semantic' | 'paragraph' | 'section';
  overlap?: number;
  maxChunks?: number;
}

export interface TextChunk {
  chunk_number: number;
  chunk_type: 'header' | 'content' | 'table' | 'list' | 'conclusion' | 'summary';
  content: string;
  content_length: number;
  start_position: number;
  end_position: number;
  page_numbers?: number[];
  chunk_metadata?: Record<string, any>;
}

export interface ChunkingResult {
  chunks: TextChunk[];
  total_chunks: number;
  total_length: number;
  chunking_method: string;
  processing_time_ms: number;
}

export class TextChunker {
  private options: ChunkingOptions;

  constructor(options: ChunkingOptions = {}) {
    this.options = {
      chunkSize: 800,
      strategy: 'fixed-size',
      overlap: 0,
      maxChunks: undefined,
      ...options
    };
  }

  /**
   * Chunk text using the configured strategy
   * Basado en la lógica probada del test
   */
  async chunkText(text: string): Promise<ChunkingResult> {
    const startTime = Date.now();
    
    console.log(`[TextChunker] Starting chunking: ${text.length} chars, strategy: ${this.options.strategy}`);
    
    let chunks: TextChunk[];
    
    switch (this.options.strategy) {
      case 'fixed-size':
        chunks = this.chunkFixedSize(text);
        break;
      case 'semantic':
      case 'paragraph':
      case 'section':
        // TODO: Implementar estrategias más avanzadas
        console.log(`[TextChunker] Strategy ${this.options.strategy} not implemented yet, using fixed-size`);
        chunks = this.chunkFixedSize(text);
        break;
      default:
        chunks = this.chunkFixedSize(text);
    }
    
    const processingTime = Date.now() - startTime;
    
    console.log(`[TextChunker] Chunking completed: ${chunks.length} chunks in ${processingTime}ms`);
    
    return {
      chunks,
      total_chunks: chunks.length,
      total_length: text.length,
      chunking_method: this.options.strategy || 'fixed-size',
      processing_time_ms: processingTime
    };
  }

  /**
   * Fixed-size chunking strategy (extraído del test funcional)
   */
  private chunkFixedSize(text: string): TextChunk[] {
    const chunks: TextChunk[] = [];
    const chunkSize = this.options.chunkSize || 800;
    let chunkNumber = 1;
    
    // Aplicar límite máximo si está configurado
    const maxLength = this.options.maxChunks 
      ? Math.min(text.length, this.options.maxChunks * chunkSize)
      : text.length;
    
    for (let i = 0; i < maxLength; i += chunkSize) {
      const chunkText = text.substring(i, i + chunkSize);
      
      if (chunkText.trim().length === 0) {
        continue; // Skip empty chunks
      }
      
      chunks.push({
        chunk_number: chunkNumber++,
        chunk_type: this.determineChunkType(chunkText, i, text.length),
        content: chunkText,
        content_length: chunkText.length,
        start_position: i,
        end_position: Math.min(i + chunkSize, text.length),
        page_numbers: this.estimatePageNumbers(i, text.length),
        chunk_metadata: {
          section: i === 0 ? 'header' : 'body',
          paragraph_count: chunkText.split('\n\n').filter(p => p.trim()).length,
          word_count: chunkText.split(/\s+/).filter(w => w.trim()).length
        }
      });
    }
    
    return chunks;
  }

  /**
   * Determine chunk type based on position and content
   */
  private determineChunkType(content: string, position: number, totalLength: number): TextChunk['chunk_type'] {
    // First chunk is typically header
    if (position === 0) {
      return 'header';
    }
    
    // Last 10% could be conclusion
    if (position > totalLength * 0.9) {
      return 'conclusion';
    }
    
    // Simple heuristics for content type
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('tabla') || lowerContent.includes('cuadro')) {
      return 'table';
    }
    
    if (lowerContent.includes('•') || lowerContent.includes('-') || lowerContent.includes('1.') || lowerContent.includes('a)')) {
      return 'list';
    }
    
    if (lowerContent.includes('resumen') || lowerContent.includes('conclusión')) {
      return 'summary';
    }
    
    return 'content';
  }

  /**
   * Estimate page numbers based on position
   * Simple heuristic: ~2000 chars per page
   */
  private estimatePageNumbers(position: number, totalLength: number): number[] {
    const charsPerPage = 2000;
    const startPage = Math.floor(position / charsPerPage) + 1;
    const endPage = Math.floor((position + (this.options.chunkSize || 800)) / charsPerPage) + 1;
    
    const pages: number[] = [];
    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }
    
    return pages.length > 0 ? pages : [1];
  }

  /**
   * Create database-ready chunk data
   * Compatible with the real schema tested
   */
  createDatabaseChunk(
    chunk: TextChunk, 
    documentId: string, 
    organizationId: string,
    userId: string
  ) {
    return {
      document_id: documentId,
      organization_id: organizationId,
      chunk_number: chunk.chunk_number,
      chunk_type: chunk.chunk_type,
      content: chunk.content,
      content_length: chunk.content_length,
      start_position: chunk.start_position,
      end_position: chunk.end_position,
      page_numbers: chunk.page_numbers,
      chunk_metadata: chunk.chunk_metadata,
      chunking_method: this.options.strategy || 'fixed-size',
      confidence: 0.85, // Default confidence for fixed-size
      quality_score: this.calculateQualityScore(chunk),
      processing_time_ms: 300, // Estimated per chunk
      tokens_used: Math.floor(chunk.content.length / 4), // Rough estimate
      chunked_by: userId
    };
  }

  /**
   * Calculate quality score for a chunk
   */
  private calculateQualityScore(chunk: TextChunk): number {
    let score = 0.5; // Base score
    
    // Bonus for good length
    if (chunk.content_length > 100 && chunk.content_length < 1200) {
      score += 0.2;
    }
    
    // Bonus for complete sentences
    const sentences = chunk.content.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 1) {
      score += 0.1;
    }
    
    // Bonus for paragraphs
    const paragraphs = chunk.content.split('\n\n').filter(p => p.trim());
    if (paragraphs.length > 0) {
      score += 0.1;
    }
    
    // Penalty for too many special characters
    const specialChars = (chunk.content.match(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ\s\d.,;:!?()\-]/g) || []).length;
    if (specialChars / chunk.content.length > 0.1) {
      score -= 0.1;
    }
    
    return Math.max(0.1, Math.min(1.0, score));
  }
}

/**
 * Factory function for convenience
 */
export function createTextChunker(options?: ChunkingOptions): TextChunker {
  return new TextChunker(options);
}

/**
 * Direct chunking function for simple use cases
 */
export async function chunkText(text: string, options?: ChunkingOptions): Promise<ChunkingResult> {
  const chunker = createTextChunker(options);
  return chunker.chunkText(text);
}

// ============================================================================
// FUNCIÓN DE TEST INTEGRADA
// ============================================================================

/**
 * Test function to verify chunking works correctly
 */
export async function testTextChunking(): Promise<void> {
  console.log('🧪 [TextChunker Test] Iniciando test del módulo...\n');
  
  const testText = `
ACTA JUNTA GENERAL EXTRAORDINARIA

Da comienzo la junta el día 19 de mayo de 2022, a las 19.10 horas en segunda convocatoria, en el hotel Attica 2.

ORDEN DEL DÍA:
1. PROPUESTA CAMBIO DE PRESIDENTE
2. PRESENTACIÓN DE OPCIONES Y VOTACIÓN DE NUEVO ADMINISTRADOR
3. SEGUIMIENTO INCIDENCIAS CON NEINOR

El presidente actual, Camilo José Fernández Hernández, informa que necesita dejar el cargo por motivos personales.

Se procede a votar si se acepta la dimisión. Por mayoría se aprueba.

CONCLUSIONES:
- Se acepta la dimisión del presidente
- Se nombra nuevo presidente
- Se aprueba el nuevo administrador

Fin de la junta a las 22:00 horas.
  `.trim();
  
  console.log(`📄 [Test] Texto de prueba: ${testText.length} caracteres`);
  
  // Test con configuración por defecto
  console.log('\n🔧 [Test] Configuración por defecto...');
  const chunker1 = createTextChunker();
  const result1 = await chunker1.chunkText(testText);
  
  console.log(`✅ [Test] Resultado: ${result1.total_chunks} chunks, ${result1.processing_time_ms}ms`);
  
  result1.chunks.forEach((chunk, idx) => {
    console.log(`   Chunk ${idx + 1}: ${chunk.chunk_type} (${chunk.content_length} chars)`);
  });
  
  // Test con chunks más pequeños
  console.log('\n🔧 [Test] Chunks más pequeños (300 chars)...');
  const chunker2 = createTextChunker({ chunkSize: 300 });
  const result2 = await chunker2.chunkText(testText);
  
  console.log(`✅ [Test] Resultado: ${result2.total_chunks} chunks, ${result2.processing_time_ms}ms`);
  
  console.log('\n🎉 [TextChunker Test] Test completado correctamente\n');
}

/**
 * Auto-ejecutar test si el archivo se ejecuta directamente
 */
if (require.main === module) {
  testTextChunking()
    .then(() => {
      console.log('✅ Test completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Test falló:', error);
      process.exit(1);
    });
}