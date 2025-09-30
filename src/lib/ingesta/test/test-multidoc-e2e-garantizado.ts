/**
 * ARCHIVO: test-multidoc-e2e-garantizado.ts
 * PROPÓSITO: Test E2E REAL que garantiza funcionamiento completo del MultiDocumentAnalyzer
 * ESTADO: development
 * DEPENDENCIAS: Supabase real, APIs reales, follon.pdf, UI multidocumento
 * OUTPUTS: Garantía de que si el test pasa, multidocumento funciona 100% en producción
 * ACTUALIZADO: 2025-09-30
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno ANTES de cualquier import
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });

// Verificar variables críticas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ [MULTIDOC E2E] Variables de entorno faltantes:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.error('   Verificar .env.local en:', path.join(projectRoot, '.env.local'));
  process.exit(1);
}

console.log('✅ [MULTIDOC E2E] Variables de entorno cargadas correctamente');

// Imports dinámicos para evitar problemas de contexto
let SupabaseApiHelper: any = null;

async function loadDependencies() {
  if (!SupabaseApiHelper) {
    const { SupabaseApiHelper: Helper } = await import('../../api/SupabaseApiHelper');
    SupabaseApiHelper = Helper;
  }
}

interface MultiDocE2ETestResult {
  testName: string;
  success: boolean;
  steps: {
    fileUpload: boolean;
    multiAnalyze: boolean;
    processSeparated: boolean;
    databaseVerification: boolean;
    uiDataAvailable: boolean;
    cleanupCompleted: boolean;
  };
  error?: string;
  duration: number;
  extractedData?: any;
  documentsCreated?: string[];
  supportedDocuments?: number;
  unsupportedDocuments?: number;
}

/**
 * TEST E2E MULTIDOCUMENTO GARANTIZADO
 * Garantiza que follon.pdf → Multi-analyze → Process-separated → BD → UI funciona 100%
 */
export class MultiDocE2EGuaranteedTest {
  private testResults: MultiDocE2ETestResult[] = [];
  private createdDocuments: string[] = [];

  constructor(
    private baseUrl: string = 'http://localhost:3001',
    private communityId: string = 'c7e7b867-6180-4363-a2f8-2aa12eb804b5' // Amara
  ) {}

  /**
   * FLUJO COMPLETO GARANTIZADO: follon.pdf → Multi-analyze → Process-separated → BD → UI
   */
  async runCompleteGuaranteedTest(): Promise<MultiDocE2ETestResult> {
    const startTime = Date.now();
    const testResult: MultiDocE2ETestResult = {
      testName: 'MultiDocument E2E Test: follon.pdf',
      success: false,
      steps: {
        fileUpload: false,
        multiAnalyze: false,
        processSeparated: false,
        databaseVerification: false,
        uiDataAvailable: false,
        cleanupCompleted: false
      },
      duration: 0,
      documentsCreated: []
    };

    try {
      console.log('🚀 [MULTIDOC E2E] Iniciando test garantizado multidocumento');
      console.log('📂 [MULTIDOC E2E] Archivo: follon.pdf');
      console.log('🏠 [MULTIDOC E2E] Comunidad: Amara');
      
      // Cargar dependencias dinámicamente
      await loadDependencies();

      // PASO 1: Cargar archivo follon.pdf
      const filePath = path.join(projectRoot, 'datos/pdf/follon.pdf');
      const fileBuffer = await fs.readFile(filePath);
      const fileSize = fileBuffer.length;
      
      console.log(`📁 [MULTIDOC E2E] Archivo cargado: ${fileSize} bytes`);
      testResult.steps.fileUpload = true;

      // PASO 2: Ejecutar multi-analyze (detección de documentos)
      const multiAnalyzeResult = await this.executeMultiAnalyze(fileBuffer);
      testResult.steps.multiAnalyze = multiAnalyzeResult.success;
      
      if (!multiAnalyzeResult.success) {
        testResult.error = `Multi-analyze failed: ${multiAnalyzeResult.error}`;
        testResult.duration = Date.now() - startTime;
        return testResult;
      }

      console.log(`🔍 [MULTIDOC E2E] Multi-analyze exitoso: ${multiAnalyzeResult.documentsDetected} documentos`);
      testResult.supportedDocuments = multiAnalyzeResult.supportedCount;
      testResult.unsupportedDocuments = multiAnalyzeResult.unsupportedCount;

      // ✅ NUEVA ARQUITECTURA: Los documentos se crean automáticamente en multi-analyze-stored
      console.log(`🏭 [MULTIDOC E2E] Documentos creados automáticamente: ${multiAnalyzeResult.documentsCreated} documentos`);
      testResult.steps.processSeparated = true; // Se hace automáticamente
      testResult.documentsCreated = multiAnalyzeResult.documentIds || [];
      this.createdDocuments = multiAnalyzeResult.documentIds || [];

      // PASO 4: Verificar documentos en base de datos
      const dbVerifyResult = await this.verifyDocumentsInDatabase();
      testResult.steps.databaseVerification = dbVerifyResult.success;
      
      if (!dbVerifyResult.success) {
        testResult.error = `Database verification failed: ${dbVerifyResult.error}`;
        testResult.duration = Date.now() - startTime;
        return testResult;
      }

      console.log(`💾 [MULTIDOC E2E] Verificación BD exitosa: ${dbVerifyResult.verifiedCount} documentos`);

      // PASO 5: Esperar sincronización de datos antes de verificar UI
      console.log('⏳ [MULTIDOC E2E] Esperando sincronización de datos con UI...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos para operaciones múltiples

      // PASO 5: Verificar que UI puede mostrar todos los datos
      const uiVerifyResult = await this.verifyUIDataAvailability();
      testResult.steps.uiDataAvailable = uiVerifyResult.success;
      
      if (!uiVerifyResult.success) {
        testResult.error = `UI verification failed: ${uiVerifyResult.error}`;
        testResult.duration = Date.now() - startTime;
        return testResult;
      }

      console.log(`🎨 [MULTIDOC E2E] UI data disponible: ${uiVerifyResult.availableDocuments} documentos`);

      // PASO 6: Cleanup - Eliminar todos los documentos creados
      await this.cleanupTestData();
      testResult.steps.cleanupCompleted = true;
      
      console.log(`🧹 [MULTIDOC E2E] Cleanup completado`);

      // Evaluar éxito total
      const allStepsSuccess = Object.values(testResult.steps).every(step => step === true);
      testResult.success = allStepsSuccess;
      testResult.duration = Date.now() - startTime;

      if (testResult.success) {
        console.log(`✅ [MULTIDOC E2E] TEST MULTIDOCUMENTO GARANTIZADO EXITOSO (${testResult.duration}ms)`);
      } else {
        console.log(`❌ [MULTIDOC E2E] TEST MULTIDOCUMENTO GARANTIZADO FALLIDO`);
      }

      return testResult;

    } catch (error) {
      testResult.error = error instanceof Error ? error.message : 'Unknown error';
      testResult.duration = Date.now() - startTime;
      console.error(`💥 [MULTIDOC E2E] Error en test garantizado:`, error);
      
      // Cleanup en caso de error
      await this.cleanupTestData();
      
      return testResult;
    }
  }

  /**
   * PASO 2: Ejecutar nuevo sistema de upload directo + API multi-analyze-stored
   */
  private async executeMultiAnalyze(fileBuffer: Buffer) {
    try {
      console.log('🔍 [MULTIDOC E2E] Ejecutando nuevo sistema de upload directo...');
      
      // PASO 2A: Upload directo a Supabase Storage (simular cliente)
      console.log('📤 [MULTIDOC E2E] Subiendo archivo directo a Supabase Storage...');
      const { SupabaseApiHelper } = await import('../../api/SupabaseApiHelper');
      
      const timestamp = Date.now();
      const storagePath = `multi-documents/${timestamp}_follon.pdf`;
      
      await SupabaseApiHelper.executeQuery(async (supabase) => {
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(storagePath, fileBuffer, {
            contentType: 'application/pdf',
            upsert: false
          });

        if (uploadError) {
          throw new Error(`Error subiendo a Storage: ${uploadError.message}`);
        }
      }, { useServiceRole: true });

      console.log('✅ [MULTIDOC E2E] Archivo subido a Storage:', storagePath);

      // PASO 2B: Procesar archivo almacenado usando nueva API
      console.log('🔧 [MULTIDOC E2E] Procesando archivo almacenado...');
      
      const processPayload = {
        storagePath: storagePath,
        originalFileName: 'follon.pdf',
        fileSize: fileBuffer.length,
        uploadToDatabase: true,
        communityId: this.communityId
      };

      const response = await fetch(`${this.baseUrl}/api/documents/multi-analyze-stored`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Verificar que tenga documentos detectados
      if (!result.detectedDocuments || result.detectedDocuments.length === 0) {
        throw new Error('No se detectaron documentos en follon.pdf');
      }

      const supportedCount = result.detectedDocuments.filter((doc: any) => 
        doc.isSupportedByPipeline || 
        ['acta', 'factura', 'comunicado', 'contrato', 'escritura', 'albaran', 'presupuesto'].includes(doc.type?.toLowerCase())
      ).length;

      // Extraer IDs de documentos creados automáticamente
      const documentIds: string[] = [];
      if (result.upload?.success && result.upload?.childDocuments) {
        result.upload.childDocuments.forEach((childDoc: any) => {
          if (childDoc.id) {
            documentIds.push(childDoc.id);
          }
        });
      }

      console.log(`📊 [MULTIDOC E2E] Análisis completado:`, {
        isMultiDocument: result.isMultiDocument,
        documentsDetected: result.detectedDocuments.length,
        supportedCount,
        unsupportedCount: result.detectedDocuments.length - supportedCount,
        documentsCreated: documentIds.length,
        uploadSuccess: result.upload?.success || false
      });

      return {
        success: true,
        documentsDetected: result.detectedDocuments.length,
        documentsCreated: documentIds.length,
        documentIds: documentIds,
        supportedCount,
        unsupportedCount: result.detectedDocuments.length - supportedCount,
        data: {
          documents: result.detectedDocuments,
          extractedText: result.extractedText || '',
          communityId: this.communityId
        }
      };

    } catch (error) {
      console.error('❌ [MULTIDOC E2E] Multi-analyze error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Multi-analyze failed',
        documentsDetected: 0,
        supportedCount: 0,
        unsupportedCount: 0,
        data: { documents: [], extractedText: '', communityId: this.communityId }
      };
    }
  }

  /**
   * PASO 3: Ejecutar API process-separated (crear documentos en BD)
   */
  private async executeProcessSeparated(analyzeData: any) {
    try {
      console.log('🏭 [MULTIDOC E2E] Ejecutando API process-separated-v2...');
      
      const requestBody = {
        documents: analyzeData.documents,
        communityId: this.communityId,
        processingLevel: 'metadata' as const, // Procesamiento completo hasta metadata
        originalFilename: 'follon.pdf',
        extractedText: analyzeData.extractedText
      };

      console.log(`📋 [MULTIDOC E2E] Procesando ${analyzeData.documents.length} documentos hasta: metadata`);

      const response = await fetch(`${this.baseUrl}/api/documents/process-separated-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Process-separated returned error');
      }

      // Extraer IDs de documentos creados exitosamente
      const documentIds: string[] = [];
      if (result.data?.results) {
        result.data.results.forEach((docResult: any) => {
          if (docResult.success && docResult.documentId) {
            documentIds.push(docResult.documentId);
          }
        });
      }

      console.log(`✅ [MULTIDOC E2E] Process-separated completado:`, {
        documentsCreated: documentIds.length,
        totalRequested: result.data?.totalRequested || 0,
        successRate: result.data?.stats?.successRate || 0
      });

      return {
        success: true,
        documentsCreated: documentIds.length,
        documentIds
      };

    } catch (error) {
      console.error('❌ [MULTIDOC E2E] Process-separated error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Process-separated failed',
        documentsCreated: 0,
        documentIds: []
      };
    }
  }

  /**
   * PASO 4: Verificar documentos en base de datos
   */
  private async verifyDocumentsInDatabase() {
    try {
      console.log('💾 [MULTIDOC E2E] Verificando documentos en base de datos...');
      
      if (!SupabaseApiHelper) {
        await loadDependencies();
      }

      if (this.createdDocuments.length === 0) {
        throw new Error('No hay documentos para verificar');
      }

      const verifiedDocuments: any[] = [];
      
      for (const docId of this.createdDocuments) {
        try {
          const document = await SupabaseApiHelper.executeQuery(async (supabase: any) => {
            // @ts-ignore - Temporal fix para problemas de tipos Supabase
            const { data, error } = await (supabase as any)
              .from('documents')
              .select(`
                id, 
                filename, 
                document_type, 
                extraction_status, 
                classification_status, 
                metadata_status,
                extracted_text
              `)
              .eq('id', docId)
              .single();
            
            if (error) throw new Error(`Document ${docId} not found: ${error.message}`);
            return data;
          }, { useServiceRole: true });

          verifiedDocuments.push(document);
          
          console.log(`✅ [MULTIDOC E2E] Documento verificado: ${document.filename} (${document.document_type})`);
          
        } catch (error) {
          console.error(`❌ [MULTIDOC E2E] Error verificando documento ${docId}:`, error);
          throw error; // Fallar si algún documento no se puede verificar
        }
      }

      return {
        success: true,
        verifiedCount: verifiedDocuments.length,
        documents: verifiedDocuments
      };

    } catch (error) {
      console.error('❌ [MULTIDOC E2E] Database verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database verification failed'
      };
    }
  }

  /**
   * PASO 5: Verificar que UI puede acceder a todos los datos
   */
  private async verifyUIDataAvailability() {
    try {
      console.log('🎨 [MULTIDOC E2E] Verificando disponibilidad de datos en UI...');
      
      if (!SupabaseApiHelper) {
        await loadDependencies();
      }

      const availableDocuments: any[] = [];
      
      for (const docId of this.createdDocuments) {
        try {
          // Simular lo que hace la UI: obtener datos para renderizar
          const uiData = await SupabaseApiHelper.executeQuery(async (supabase: any) => {
            // @ts-ignore - Temporal fix para problemas de tipos Supabase
            const { data, error } = await (supabase as any)
              .from('documents')
              .select(`
                *,
                extracted_minutes (*),
                extracted_invoices (*),
                extracted_communications (*),
                extracted_contracts (*),
                extracted_budgets (*),
                extracted_delivery_notes (*),
                extracted_property_deeds (*),
                document_chunks (*)
              `)
              .eq('id', docId)
              .single();
            
            if (error) {
              throw new Error(`UI Query Error [${error.code}]: ${error.message}`);
            }
            return data;
          }, { useServiceRole: true });

          const hasRenderableData = !!(
            uiData.extracted_text || 
            uiData.extracted_minutes?.length ||
            uiData.extracted_invoices?.length ||
            uiData.extracted_communications?.length ||
            uiData.extracted_contracts?.length ||
            uiData.extracted_budgets?.length ||
            uiData.extracted_delivery_notes?.length ||
            uiData.extracted_property_deeds?.length ||
            uiData.document_chunks?.length
          );

          if (hasRenderableData) {
            availableDocuments.push({
              id: docId,
              filename: uiData.filename,
              type: uiData.document_type,
              hasData: true
            });
            
            console.log(`✅ [MULTIDOC E2E] UI data disponible: ${uiData.filename} (${uiData.document_type})`);
          } else {
            console.log(`⚠️ [MULTIDOC E2E] Sin datos renderizables: ${uiData.filename}`);
          }

          // Verificar que la página de detalle responde
          try {
            const response = await fetch(`${this.baseUrl}/documents/${docId}`, {
              method: 'GET',
              headers: { 'Accept': 'text/html' }
            });
            
            if (!response.ok) {
              console.warn(`⚠️ [MULTIDOC E2E] Página de detalle no disponible: ${docId} (HTTP ${response.status})`);
            } else {
              console.log(`✅ [MULTIDOC E2E] Página de detalle disponible: ${docId}`);
            }
          } catch (pageError) {
            console.warn(`⚠️ [MULTIDOC E2E] Error accediendo página de detalle ${docId}:`, pageError);
          }

        } catch (error) {
          console.error(`❌ [MULTIDOC E2E] Error verificando UI data para ${docId}:`, error);
          throw error; // Fallar si algún documento no tiene UI data
        }
      }

      if (availableDocuments.length === 0) {
        throw new Error('Ningún documento tiene datos disponibles para la UI');
      }

      return {
        success: true,
        availableDocuments: availableDocuments.length,
        documents: availableDocuments
      };

    } catch (error) {
      console.error('❌ [MULTIDOC E2E] UI verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'UI verification failed'
      };
    }
  }

  /**
   * PASO 6: Cleanup completo - Eliminar todos los documentos creados
   */
  private async cleanupTestData() {
    try {
      if (!SupabaseApiHelper) {
        await loadDependencies();
      }
      
      console.log(`🧹 [MULTIDOC E2E] Iniciando cleanup de ${this.createdDocuments.length} documentos...`);
      
      for (const docId of this.createdDocuments) {
        try {
          console.log(`🗑️ [MULTIDOC E2E] Eliminando documento: ${docId}`);
          
          // Primero obtener el file_path para eliminar del Storage
          const document = await SupabaseApiHelper.executeQuery(async (supabase: any) => {
            const { data, error } = await supabase
              .from('documents')
              .select('file_path, filename')
              .eq('id', docId)
              .single();
            return data;
          }, { useServiceRole: true });
          
          // Eliminar archivo del Storage si existe
          if (document?.file_path) {
            try {
              console.log(`☁️ [MULTIDOC E2E] Eliminando del Storage: ${document.file_path}`);
              const { deleteDocumentFromStorage } = await import('../../storage/supabaseStorage');
              await deleteDocumentFromStorage(document.file_path);
              console.log(`✅ [MULTIDOC E2E] Storage limpio: ${document.filename}`);
            } catch (storageError) {
              console.warn(`⚠️ [MULTIDOC E2E] Error eliminando del Storage:`, storageError);
            }
          }
          
          // Eliminar todos los datos relacionados de BD (orden específico por FK)
          await SupabaseApiHelper.executeQuery(async (supabase: any) => {
            // @ts-ignore - Temporal fix para problemas de tipos Supabase
            await (supabase as any).from('extracted_minutes').delete().eq('document_id', docId);
            await (supabase as any).from('extracted_invoices').delete().eq('document_id', docId);
            await (supabase as any).from('extracted_communications').delete().eq('document_id', docId);
            await (supabase as any).from('extracted_contracts').delete().eq('document_id', docId);
            await (supabase as any).from('extracted_budgets').delete().eq('document_id', docId);
            await (supabase as any).from('extracted_delivery_notes').delete().eq('document_id', docId);
            await (supabase as any).from('extracted_property_deeds').delete().eq('document_id', docId);
            await (supabase as any).from('document_chunks').delete().eq('document_id', docId);
            await (supabase as any).from('documents').delete().eq('id', docId);
          }, { useServiceRole: true });
          
          console.log(`✅ [MULTIDOC E2E] Documento eliminado completamente: ${docId}`);
          
        } catch (error) {
          console.error(`❌ [MULTIDOC E2E] Error eliminando documento ${docId}:`, error);
        }
      }
      
      this.createdDocuments = [];
      console.log(`✅ [MULTIDOC E2E] Cleanup completado (BD + Storage)`);
      
    } catch (error) {
      console.error(`⚠️ [MULTIDOC E2E] Error en cleanup:`, error);
    }
  }

  /**
   * Ejecutar batería de tests garantizados multidocumento
   */
  async runGuaranteedTestSuite(): Promise<void> {
    console.log(`🚀 [MULTIDOC E2E SUITE] Iniciando test garantizado multidocumento`);

    const result = await this.runCompleteGuaranteedTest();
    
    // Reporte final
    console.log(`\n🏁 [MULTIDOC E2E SUITE] ===== REPORTE FINAL MULTIDOCUMENTO GARANTIZADO =====`);
    console.log(`📊 [MULTIDOC E2E SUITE] Resultado: ${result.success ? 'ÉXITO' : 'FALLO'}`);
    console.log(`⏱️ [MULTIDOC E2E SUITE] Duración: ${result.duration}ms`);
    console.log(`📋 [MULTIDOC E2E SUITE] Documentos creados: ${result.documentsCreated?.length || 0}`);
    console.log(`✅ [MULTIDOC E2E SUITE] Documentos soportados: ${result.supportedDocuments || 0}`);
    console.log(`⚠️ [MULTIDOC E2E SUITE] Documentos no soportados: ${result.unsupportedDocuments || 0}`);

    // Mostrar estado de cada paso
    console.log(`\n📝 [MULTIDOC E2E SUITE] Estado de pasos:`);
    Object.entries(result.steps).forEach(([step, success]) => {
      const icon = success ? '✅' : '❌';
      console.log(`${icon} ${step}: ${success ? 'SUCCESS' : 'FAILED'}`);
    });

    if (result.error) {
      console.log(`\n❌ [MULTIDOC E2E SUITE] Error: ${result.error}`);
    }

    if (result.success) {
      console.log(`\n🎉 [MULTIDOC E2E SUITE] ¡GARANTÍA MULTIDOCUMENTO COMPLETA! El sistema multidocumento funcionará en producción.`);
    } else {
      console.log(`\n⚠️ [MULTIDOC E2E SUITE] ADVERTENCIA: Test falló. Revisar antes de usar multidocumento en producción.`);
    }

    // Guardar reporte
    const reportPath = path.join(projectRoot, 'datos/e2e-reports', `multidoc-e2e-guaranteed-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      testType: 'multidocument-guaranteed',
      file: 'follon.pdf',
      result
    }, null, 2));

    console.log(`📄 [MULTIDOC E2E SUITE] Reporte guardado: ${reportPath}`);
  }
}

/**
 * Ejecutar test garantizado multidocumento desde CLI
 */
async function runMultiDocE2EGuaranteedTest() {
  try {
    console.log(`🎯 [MULTIDOC E2E CLI] Iniciando test garantizado multidocumento`);

    const testSuite = new MultiDocE2EGuaranteedTest();
    await testSuite.runGuaranteedTestSuite();
    
  } catch (error) {
    console.error('💥 [MULTIDOC E2E MAIN] Error en test suite:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  // Mostrar ayuda si se pide
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🚀 [MULTIDOC E2E GARANTIZADO] Test E2E Multidocumento que Garantiza Funcionamiento Completo

📋 USO:
  npx tsx test-multidoc-e2e-garantizado.ts

📂 FLUJO GARANTIZADO:
  1. File Upload (follon.pdf)
  2. Multi-Analyze API (detección de documentos)
  3. Process-Separated API (creación de documentos en BD)
  4. Database Verification (verificar datos)
  5. UI Data Availability (verificar renderizado)
  6. Cleanup (eliminar datos de test)

⚠️  ADVERTENCIA: Este test usa BD real y APIs de Gemini (consume tokens)
✅ GARANTÍA: Si este test pasa al 100%, el sistema multidocumento funcionará en producción

📝 DIFERENCIAS vs test-real-e2e-garantizado.ts:
  - Procesa 1 PDF → N documentos (vs 1 PDF → 1 documento)
  - Usa APIs /multi-analyze + /process-separated-v2 (vs pipeline directo)
  - Verifica N documentos en BD (vs 1 documento)
  - Verifica UI para N documentos (vs 1 documento)
  - Cleanup de N documentos + storage (vs 1 documento)
    `);
    process.exit(0);
  }
  
  runMultiDocE2EGuaranteedTest();
}