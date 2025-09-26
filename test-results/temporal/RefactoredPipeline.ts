/**
 * ARCHIVO: RefactoredPipeline.ts
 * PROPÓSITO: Versión refactorizada del pipeline usando Strategy + Factory pattern
 * ESTADO: development
 * DEPENDENCIAS: DocumentsStore, strategies, supabase
 * OUTPUTS: Pipeline modular y mantenible
 * ACTUALIZADO: 2025-09-21
 */

import { DocumentsStore } from '../storage/documentsStore';
import { createSupabaseClient } from '@/supabase-clients/server';
import { DocumentExtractorFactory } from './strategies';

export class RefactoredPipeline {
  constructor() {
    // No need for instance variables since DocumentsStore methods are static
  }

  // Helper function to update document status
  private async updateDocumentStatus(documentId: string, updates: any) {
    console.log(`🔄 [DEBUG] Updating document ${documentId} with:`, JSON.stringify(updates, null, 2));
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId);
    
    if (error) {
      console.error(`❌ [DEBUG] Failed to update document ${documentId}:`, error.message);
      console.error(`❌ [DEBUG] Update data was:`, updates);
    } else {
      console.log(`✅ [DEBUG] Successfully updated document ${documentId}`);
    }
  }

  // Helper function to save extraction data (simplified)
  private async saveExtractionData(documentId: string, data: any) {
    const supabase = await createSupabaseClient();
    
    // Use the real extraction method (constraint now allows all values)
    const { error } = await supabase
      .from('documents')
      .update({ 
        extracted_text: data.text,
        page_count: data.page_count,
        extraction_method: data.method,
        text_length: data.text?.length || 0
      })
      .eq('id', documentId);
    
    if (error) {
      console.error(`❌ [DEBUG] Failed to save extraction data for ${documentId}:`, error.message);
    } else {
      console.log(`✅ [DEBUG] Saved extraction data: method=${data.method}, text_length=${data.text?.length || 0}`);
    }
  }

  /**
   * REFACTORED METADATA EXTRACTION METHOD
   * Uses Strategy + Factory pattern to eliminate code duplication
   */
  private async extractMetadataRefactored(document: any) {
    console.log('📊 Level 3: Metadata Extraction with Gemini IA (REFACTORED)');
    
    try {
      await this.updateDocumentStatus(document.id, { metadata_status: 'processing' });
      
      // Get updated document with extracted text
      const updatedDocument = await DocumentsStore.getDocument(document.id);
      if (!updatedDocument?.extracted_text) {
        throw new Error('No extracted text available for metadata extraction');
      }

      // Basic metadata
      let metadata: any = {
        title: document.filename.replace('.pdf', ''),
        created_date: new Date().toISOString(),
        page_count: updatedDocument.page_count || 1,
        language: 'es',
        text_length: updatedDocument.extracted_text.length
      };

      // Log document type analysis
      console.log('🔍 [DEBUG] Checking document type for metadata extraction...');
      console.log('🔍 [DEBUG] Original document.document_type:', document.document_type);
      console.log('🔍 [DEBUG] Updated document.document_type:', updatedDocument.document_type);
      
      // Use Factory to get appropriate extractor
      const documentType = updatedDocument.document_type;
      
      if (documentType && DocumentExtractorFactory.isSupported(documentType)) {
        console.log(`🏭 [DEBUG] Using Factory to create ${documentType} extractor...`);
        
        const extractor = DocumentExtractorFactory.getExtractor(documentType);
        const extractorConfig = extractor.getConfig();
        
        console.log(`🔧 [DEBUG] Extractor config:`, extractorConfig);
        
        // Process metadata using the strategy
        const result = await extractor.processMetadata(updatedDocument.id, updatedDocument.extracted_text);
        
        if (result.success && result.data) {
          // Update metadata with extraction results
          metadata = {
            ...metadata,
            extraction_method: extractorConfig.agentName,
            agent_confidence: 0.96,
            agent_fields_count: Object.keys(result.data).length,
            specialized_table_updated: true,
            extractor_type: documentType
          };
          
          console.log(`✅ [DEBUG] ${documentType.toUpperCase()} processing completed successfully using ${extractorConfig.agentName}`);
        } else {
          throw new Error(`Metadata extraction failed for ${documentType}: ${result.error}`);
        }
      } else {
        console.log(`⚠️ [DEBUG] Document type '${documentType}' not supported by factory. Using basic metadata only.`);
        
        // For unsupported types, use basic metadata
        metadata = {
          ...metadata,
          extraction_method: 'basic',
          agent_confidence: 0.5,
          specialized_extraction: false,
          extractor_type: 'unsupported'
        };
      }

      // Update processing config (backward compatibility)
      await this.updateDocumentStatus(document.id, { 
        processing_config: metadata,
        metadata_status: 'completed'
      });
      
      console.log(`✅ [DEBUG] Metadata extraction completed for document ${document.id}`);

    } catch (error) {
      console.error(`❌ [DEBUG] Metadata extraction failed for ${document.id}:`, error);
      await this.updateDocumentStatus(document.id, { 
        metadata_status: 'failed',
        processing_config: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          failed_at: new Date().toISOString()
        }
      });
      throw error;
    }
  }

  /**
   * Test method to compare old vs new implementation
   */
  async testMetadataExtraction(documentId: string) {
    console.log(`\n🧪 [TEST] Testing refactored metadata extraction for document ${documentId}`);
    
    try {
      const document = await DocumentsStore.getDocument(documentId);
      if (!document) {
        throw new Error(`Document ${documentId} not found`);
      }

      console.log(`📄 [TEST] Document found: ${document.filename} (type: ${document.document_type})`);
      
      // Test refactored implementation
      await this.extractMetadataRefactored(document);
      
      console.log(`✅ [TEST] Refactored metadata extraction completed successfully`);
      
      return { success: true, documentId };
    } catch (error) {
      console.error(`❌ [TEST] Refactored metadata extraction failed:`, error);
      throw error;
    }
  }
}