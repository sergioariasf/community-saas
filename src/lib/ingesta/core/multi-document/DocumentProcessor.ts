/**
 * ARCHIVO: DocumentProcessor.ts
 * PROPÓSITO: Procesar documento individual usando pipeline existente con inicialización segura
 * ESTADO: development
 * DEPENDENCIAS: SupabaseApiHelper, progressivePipelineSimple (dynamic import)
 * OUTPUTS: Documento procesado completamente
 * ACTUALIZADO: 2025-09-28
 */

import crypto from 'crypto';
import { SeparatedDocument, ProcessingConfig, ProcessingResult } from './MultiDocumentCoordinator';
import { SupabaseApiHelper } from '@/lib/api/SupabaseApiHelper';

/**
 * PROCESADOR INDIVIDUAL - Maneja las dependencias de base de datos de forma segura
 * Responsabilidad: Procesar un documento usando el pipeline existente
 */
export class DocumentProcessor {
  
  /**
   * Procesar documento individual usando el pipeline existente
   * Inicialización LAZY de dependencias para evitar problemas de build
   */
  async processDocument(doc: SeparatedDocument, config: ProcessingConfig): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔧 [PROCESSOR] Processing document: ${doc.type} - ${doc.suggestedTitle}`);
      
      // 1. Preparar datos del documento
      const documentText = this.prepareDocumentText(doc, config);
      const filename = this.generateFilename(doc, config);
      const contentHash = this.generateContentHash(documentText, config.originalFilename, doc.type);
      
      // 2. Obtener información de la comunidad
      const communityData = await this.getCommunityData(config.communityId);
      
      // 3. Crear entrada en base de datos
      const documentData = await this.createDocumentRecord(
        doc, filename, contentHash, documentText, communityData, config
      );
      
      // 4. CRUCIAL: Actualizar extracted_text ANTES de procesar con pipeline
      await this.updateDocumentStatus((documentData as any).id, documentText);
      
      // 5. Procesar con pipeline (IMPORT DINÁMICO SEGURO) 
      const processingResult = await this.processWithPipeline(
        documentData, doc, config
      );
      
      const processingTimeMs = Date.now() - startTime;
      
      return {
        documentId: (documentData as any).id,
        success: true,
        stages: processingResult.stages,
        processingTimeMs,
        extractedData: processingResult.extractedData
      };
      
    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';
      
      console.error(`❌ [PROCESSOR] Failed to process document ${doc.id}:`, errorMessage);
      
      return {
        documentId: doc.id,
        success: false,
        stages: [],
        error: errorMessage,
        processingTimeMs
      };
    }
  }
  
  /**
   * Preparar texto del documento
   */
  private prepareDocumentText(doc: SeparatedDocument, config: ProcessingConfig): string {
    if (doc.textFragment) {
      return doc.textFragment;
    }
    
    const lines = config.extractedText.split('\n');
    return lines.slice(doc.startLine - 1, doc.endLine).join('\n');
  }
  
  /**
   * Generar nombre de archivo único
   */
  private generateFilename(doc: SeparatedDocument, config: ProcessingConfig): string {
    const timestamp = Date.now();
    const safeTitle = doc.suggestedTitle
      .replace(/[^a-zA-Z0-9\s\-\_]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    return `separated_${doc.type}_${safeTitle}_${timestamp}.txt`;
  }
  
  /**
   * Generar hash de contenido único
   */
  private generateContentHash(text: string, originalFilename: string, docType: string): string {
    return crypto.createHash('md5')
      .update(text + originalFilename + docType + Date.now())
      .digest('hex');
  }
  
  /**
   * Obtener datos de la comunidad
   */
  private async getCommunityData(communityId: string) {
    try {
      console.log(`🔍 [PROCESSOR] Buscando comunidad: ${communityId}`);
      
      return await SupabaseApiHelper.executeQuery(async (supabase) => {
        console.log(`🔍 [PROCESSOR] Ejecutando query communities...`);
        
        const { data, error } = await supabase
          .from('communities')
          .select('organization_id, name')
          .eq('id', communityId)
          .single();
        
        console.log(`🔍 [PROCESSOR] Query result:`, { data, error });
        
        if (error) {
          console.error(`❌ [PROCESSOR] Supabase error:`, error);
          throw new Error(`Community query failed: ${error.message}`);
        }
        
        if (!data) {
          throw new Error(`Community not found: No data returned`);
        }
        
        console.log(`✅ [PROCESSOR] Comunidad encontrada: ${(data as any).name}`);
        return data;
      }, { useServiceRole: true }); // ✅ USAR SERVICE ROLE
      
    } catch (error) {
      console.error(`❌ [PROCESSOR] getCommunityData failed:`, error);
      throw error;
    }
  }
  
  /**
   * Crear registro de documento en base de datos
   */
  private async createDocumentRecord(
    doc: SeparatedDocument,
    filename: string,
    contentHash: string,
    documentText: string,
    communityData: any,
    config: ProcessingConfig
  ) {
    const textBuffer = Buffer.from(documentText, 'utf-8');
    
    const documentData = {
      filename,
      file_path: `/temp/multi-document/${filename}`,
      file_size: textBuffer.length,
      file_hash: contentHash,
      mime_type: 'text/plain',
      organization_id: communityData.organization_id,
      community_id: config.communityId,
      document_type: doc.type === 'unknown' ? null : doc.type,
      original_filename: config.originalFilename,
      extraction_status: 'completed',
      extraction_method: 'multi-document-analyzer', // ✅ Valor válido
      classification_status: doc.type !== 'unknown' ? 'completed' : 'pending',
      processing_level: 1,
    };
    
    return await SupabaseApiHelper.createDocument(documentData);
  }
  
  /**
   * Procesar con pipeline usando import dinámico SEGURO
   */
  private async processWithPipeline(documentData: any, doc: SeparatedDocument, config: ProcessingConfig) {
    const stages: string[] = ['extract'];
    let extractedData: any = null;
    
    // IMPORT DINÁMICO SEGURO - Solo cuando realmente necesitamos el pipeline
    const { SimplePipeline } = await import('@/lib/ingesta/core/progressivePipelineSimple');
    const pipeline = new SimplePipeline();
    
    // Simular documento para el pipeline
    const mockDocument = {
      id: documentData.id,
      filename: documentData.filename,
      organization_id: documentData.organization_id,
      file_size: documentData.file_size,
      mime_type: documentData.mime_type,
      document_type: documentData.document_type,
      created_at: new Date().toISOString(),
      extracted_text: this.prepareDocumentText(doc, config),
      extraction_status: 'completed',
      extraction_completed_at: new Date().toISOString(),
      classification_status: documentData.classification_status
    };
    
    // Ejecutar fases según configuración
    if (this.shouldRunClassification(config, doc)) {
      console.log(`🏷️ [PROCESSOR] Running classification for document ${documentData.id}...`);
      await (pipeline as any).classifyDocument(mockDocument);
      stages.push('classify');
    }
    
    if (this.shouldRunMetadata(config)) {
      console.log(`📊 [PROCESSOR] Running metadata extraction for document ${documentData.id}...`);
      const metadataResult = await (pipeline as any).extractMetadata(mockDocument);
      extractedData = metadataResult;
      stages.push('metadata');
    }
    
    if (this.shouldRunChunking(config)) {
      console.log(`🧩 [PROCESSOR] Running chunking for document ${documentData.id}...`);
      await (pipeline as any).chunkDocument(mockDocument);
      stages.push('chunks');
    }
    
    return { stages, extractedData };
  }
  
  /**
   * Actualizar estado final del documento
   */
  private async updateDocumentStatus(documentId: string, documentText: string) {
    const updates = {
      extracted_text: documentText,
      text_length: documentText.length,
      extraction_completed_at: new Date().toISOString(),
      processing_completed_at: new Date().toISOString(),
      legacy_status: 'completed'
    };
    
    await SupabaseApiHelper.updateDocument(documentId, updates);
  }
  
  /**
   * Determinar si debe ejecutar clasificación
   */
  private shouldRunClassification(config: ProcessingConfig, doc: SeparatedDocument): boolean {
    return (config.processingLevel === 'classify' || 
            config.processingLevel === 'metadata' || 
            config.processingLevel === 'chunks') && 
           doc.type === 'unknown';
  }
  
  /**
   * Determinar si debe ejecutar extracción de metadata
   */
  private shouldRunMetadata(config: ProcessingConfig): boolean {
    return config.processingLevel === 'metadata' || config.processingLevel === 'chunks';
  }
  
  /**
   * Determinar si debe ejecutar chunking
   */
  private shouldRunChunking(config: ProcessingConfig): boolean {
    return config.processingLevel === 'chunks';
  }
}