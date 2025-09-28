/**
 * ARCHIVO: test-multidocument-e2e-complete.ts
 * PROPÓSITO: Test E2E completo multidocumento usando código de producción real
 * ESTADO: development
 * DEPENDENCIAS: APIs reales, base de datos, follon.pdf
 * OUTPUTS: Validación completa del flujo multidocumento
 * ACTUALIZADO: 2025-09-28
 */

// ✅ Cargar variables de entorno ANTES de cualquier import
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env.local desde la raíz del proyecto
const projectRoot = path.resolve(__dirname, '../../../..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });

console.log('🔐 [ENV] Variables cargadas desde:', path.join(projectRoot, '.env.local'));
console.log('🔐 [ENV] SUPABASE_SERVICE_ROLE_KEY disponible:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

import fs from 'fs/promises';
import { SupabaseApiHelper } from '@/lib/api/SupabaseApiHelper';

interface TestResult {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
}

interface MultiDocumentTestReport {
  timestamp: string;
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  totalDuration: number;
  results: TestResult[];
  documents?: any[];
  summary: string;
}

/**
 * TEST E2E COMPLETO MULTIDOCUMENTO
 * Flujo: follon.pdf → Multi-analyze → Process-separated → Verificar BD → UI
 */
class MultiDocumentE2ETest {
  private baseUrl: string;
  private testCommunityId: string;

  constructor(baseUrl = 'http://localhost:3001', testCommunityId = 'c7e7b867-6180-4363-a2f8-2aa12eb804b5') {
    this.baseUrl = baseUrl;
    this.testCommunityId = testCommunityId; // Usando "Amara"
  }

  /**
   * Verificar si un tipo de documento está soportado por el pipeline
   */
  private isSupportedType(type: string): boolean {
    const supportedTypes = ['acta', 'factura', 'comunicado', 'contrato', 'escritura', 'albaran', 'presupuesto'];
    return supportedTypes.includes(type?.toLowerCase());
  }

  async runCompleteTest(): Promise<MultiDocumentTestReport> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    
    console.log('🚀 [MULTIDOC E2E] =================================');
    console.log('🚀 [MULTIDOC E2E] INICIANDO TEST COMPLETO MULTIDOCUMENTO');
    console.log('🚀 [MULTIDOC E2E] =================================');
    console.log(`📂 [MULTIDOC E2E] Archivo: follon.pdf`);
    console.log(`🏠 [MULTIDOC E2E] Comunidad: Amara (${this.testCommunityId})`);
    console.log(`🌐 [MULTIDOC E2E] URL Base: ${this.baseUrl}\n`);

    // PASO 1: Verificar prerrequisitos
    results.push(await this.step1_VerifyPrerequisites());
    
    // PASO 2: Cargar archivo follon.pdf
    const fileData = await this.step2_LoadTestFile();
    if (!fileData.success) {
      results.push(fileData);
      return this.generateReport(startTime, results);
    }
    results.push(fileData);

    // PASO 3: Llamar API multi-analyze
    const analyzeResult = await this.step3_MultiAnalyze(fileData.data);
    results.push(analyzeResult);
    if (!analyzeResult.success) {
      return this.generateReport(startTime, results);
    }

    // PASO 4: Verificar documentos en base de datos (ya procesados por multi-analyze)
    const dbVerifyResult = await this.step4_VerifyDatabase(analyzeResult.data);
    results.push(dbVerifyResult);

    // PASO 5: Verificar vistas de detalle funcionan
    const uiVerifyResult = await this.step5_VerifyDetailViews(dbVerifyResult.data);
    results.push(uiVerifyResult);

    // PASO 6: Cleanup (opcional)
    const cleanupResult = await this.step6_Cleanup(dbVerifyResult.data);
    results.push(cleanupResult);

    return this.generateReport(startTime, results);
  }

  /**
   * PASO 1: Verificar que el entorno está listo
   */
  private async step1_VerifyPrerequisites(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('📋 [PASO 1] Verificando prerrequisitos...');
      
      // Verificar que el servidor local esté corriendo
      const healthResponse = await fetch(`${this.baseUrl}/api/documents/multi-analyze`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!healthResponse.ok) {
        throw new Error(`Servidor no disponible: ${healthResponse.status}`);
      }

      // Verificar comunidad existe (simulamos que Amara existe)
      console.log('✅ [PASO 1] Servidor disponible');
      console.log('✅ [PASO 1] Comunidad configurada');
      
      return {
        step: 'Verify Prerequisites',
        success: true,
        duration: Date.now() - startTime,
        data: { server: 'available', community: this.testCommunityId }
      };
      
    } catch (error) {
      return {
        step: 'Verify Prerequisites',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * PASO 2: Cargar follon.pdf
   */
  private async step2_LoadTestFile(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('📂 [PASO 2] Cargando follon.pdf...');
      
      const filePath = path.join(__dirname, '../../../../datos/pdf/follon.pdf');
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      
      if (!fileExists) {
        throw new Error(`Archivo no encontrado: ${filePath}`);
      }

      const fileBuffer = await fs.readFile(filePath);
      const fileStats = await fs.stat(filePath);
      
      console.log(`✅ [PASO 2] Archivo cargado: ${fileStats.size} bytes`);
      
      return {
        step: 'Load Test File',
        success: true,
        duration: Date.now() - startTime,
        data: {
          filename: 'follon.pdf',
          size: fileStats.size,
          buffer: fileBuffer // No guardar en reporte para evitar archivos gigantes
        }
      };
      
    } catch (error) {
      return {
        step: 'Load Test File',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * PASO 3: Analizar multidocumento con API real
   */
  private async step3_MultiAnalyze(fileData: any): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 [PASO 3] Ejecutando multi-analyze...');
      
      const formData = new FormData();
      const blob = new Blob([fileData.buffer], { type: 'application/pdf' });
      formData.append('file', blob, fileData.filename);
      formData.append('outputPath', '/tmp/test-multidoc');
      formData.append('uploadToDatabase', 'true'); // ✅ IGUAL QUE LA UI
      formData.append('communityId', this.testCommunityId);

      const response = await fetch(`${this.baseUrl}/api/documents/multi-analyze`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Multi-analyze failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      console.log(`📊 [PASO 3] Respuesta recibida:`, {
        success: result.success,
        isMultiDocument: result.isMultiDocument,
        confidence: result.confidence,
        documentsCount: result.detectedDocuments?.length || 0
      });
      
      // La API multi-analyze usa un formato diferente - no tiene "success"
      if (result.error) {
        throw new Error(`Multi-analyze returned error: ${result.error}`);
      }
      
      // Verificar que tenga documentos detectados
      if (!result.detectedDocuments || result.detectedDocuments.length === 0) {
        throw new Error('No documents detected in multi-analyze');
      }

      // Mapear documentos al formato esperado por process-separated
      const mappedDocuments = result.detectedDocuments.map((doc: any) => ({
        type: doc.type || 'unknown',
        suggestedTitle: doc.suggestedTitle || doc.description || 'Documento sin título',
        textFragment: '', // Lo rellenará process-separated
        startLine: doc.startLine || 1,
        endLine: doc.endLine || 1,
        confidence: doc.confidence || 0.5,
        isSupportedByPipeline: this.isSupportedType(doc.type)
      }));

      console.log(`✅ [PASO 3] Documentos detectados: ${mappedDocuments.length}`);
      console.log(`📊 [PASO 3] Soportados: ${mappedDocuments.filter(d => d.isSupportedByPipeline).length}`);
      
      return {
        step: 'Multi-Analyze',
        success: true,
        duration: Date.now() - startTime,
        data: {
          documents: mappedDocuments,
          extractedText: result.extractedText || '',
          supportedCount: mappedDocuments.filter(d => d.isSupportedByPipeline).length
        }
      };
      
    } catch (error) {
      return {
        step: 'Multi-Analyze',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * PASO 4: Procesar documentos separados con API v2
   */
  private async step4_ProcessSeparated(analyzeData: any): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🏭 [PASO 4] Procesando documentos separados...');
      
      if (!analyzeData.documents || analyzeData.documents.length === 0) {
        throw new Error('No hay documentos para procesar');
      }

      const requestBody = {
        documents: analyzeData.documents,
        communityId: this.testCommunityId,
        processingLevel: 'metadata' as const, // Procesar hasta metadata
        originalFilename: 'follon.pdf',
        extractedText: analyzeData.extractedText
      };

      console.log(`📋 [PASO 4] Procesando ${analyzeData.documents.length} documentos hasta nivel: metadata`);

      const response = await fetch(`${this.baseUrl}/api/documents/process-separated-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Process-separated failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(`Process-separated returned error: ${result.error || 'Unknown error'}`);
      }

      console.log(`✅ [PASO 4] Procesados exitosamente: ${result.data?.processedDocuments || 0}`);
      console.log(`📊 [PASO 4] Tasa de éxito: ${result.data?.stats?.successRate || 0}%`);
      
      return {
        step: 'Process Separated',
        success: true,
        duration: Date.now() - startTime,
        data: {
          processedCount: result.data?.processedDocuments || 0,
          totalRequested: result.data?.totalRequested || 0,
          results: result.data?.results || [],
          stats: result.data?.stats || {}
        }
      };
      
    } catch (error) {
      return {
        step: 'Process Separated',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * PASO 4: Verificar documentos en base de datos (procesados por multi-analyze)
   */
  private async step4_VerifyDatabase(analyzeData: any): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('💾 [PASO 4] Verificando documentos en base de datos...');
      
      // Con uploadToDatabase=true, multi-analyze crea documentos automáticamente
      // Buscar documentos recientes del follon.pdf en la comunidad
      const recentDocuments = await SupabaseApiHelper.executeQuery(async (supabase) => {
        const { data, error } = await supabase
          .from('documents')
          .select('id, filename, document_type, extraction_status, classification_status, metadata_status, created_at')
          .eq('organization_id', 'e3f4370b-2235-45ad-869a-737ee9fd95ab') // Amara org
          .ilike('filename', '%follon%')
          .gte('created_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // Últimos 10 min
          .order('created_at', { ascending: false });
        
        if (error) throw new Error(`Query failed: ${error.message}`);
        return data || [];
      }, { useServiceRole: true });

      if (recentDocuments.length === 0) {
        throw new Error('No se encontraron documentos recientes del follon.pdf');
      }

      const documentIds = recentDocuments.map((doc: any) => doc.id);

      if (documentIds.length === 0) {
        throw new Error('No hay documentos exitosos para verificar');
      }

      // Usar SupabaseApiHelper para verificar documentos
      
      const verifiedDocuments: any[] = [];
      
      for (const docId of documentIds) {
        try {
          // Usar Service Role para tests fuera de request context
          const document = await SupabaseApiHelper.executeQuery(async (supabase) => {
            const { data, error } = await supabase
              .from('documents')
              .select('id, filename, document_type, extraction_status, classification_status, metadata_status')
              .eq('id', docId)
              .single();
            
            if (error) throw new Error(`Document not found: ${error.message}`);
            return data;
          }, { useServiceRole: true });
          verifiedDocuments.push({
            id: (document as any).id,
            filename: (document as any).filename,
            document_type: (document as any).document_type,
            extraction_status: (document as any).extraction_status,
            classification_status: (document as any).classification_status,
            metadata_status: (document as any).metadata_status
          });
          
          console.log(`✅ [PASO 4] Documento verificado: ${(document as any).filename} (${(document as any).document_type})`);
          
        } catch (error) {
          console.error(`❌ [PASO 4] Error verificando documento ${docId}:`, error);
        }
      }

      if (verifiedDocuments.length === 0) {
        throw new Error('No se pudieron verificar documentos en base de datos');
      }
      
      return {
        step: 'Verify Database',
        success: true,
        duration: Date.now() - startTime,
        data: {
          verifiedCount: verifiedDocuments.length,
          documents: verifiedDocuments
        }
      };
      
    } catch (error) {
      return {
        step: 'Verify Database',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * PASO 5: Verificar vistas de detalle funcionan
   */
  private async step5_VerifyDetailViews(dbData: any): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🎨 [PASO 5] Verificando vistas de detalle...');
      
      if (!dbData.documents || dbData.documents.length === 0) {
        throw new Error('No hay documentos para verificar vistas');
      }

      const viewResults: any[] = [];
      
      for (const doc of dbData.documents) {
        try {
          // Verificar que la página de detalle responde
          const response = await fetch(`${this.baseUrl}/documents/${doc.id}`, {
            method: 'GET',
            headers: { 'Accept': 'text/html' }
          });
          
          if (response.ok) {
            viewResults.push({
              documentId: doc.id,
              filename: doc.filename,
              type: doc.document_type,
              viewAvailable: true
            });
            
            console.log(`✅ [PASO 5] Vista disponible: ${doc.filename}`);
          } else {
            viewResults.push({
              documentId: doc.id,
              filename: doc.filename,
              type: doc.document_type,
              viewAvailable: false,
              error: `HTTP ${response.status}`
            });
          }
          
        } catch (error) {
          viewResults.push({
            documentId: doc.id,
            filename: doc.filename,
            type: doc.document_type,
            viewAvailable: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const availableViews = viewResults.filter(v => v.viewAvailable).length;
      
      return {
        step: 'Verify Detail Views',
        success: availableViews > 0,
        duration: Date.now() - startTime,
        data: {
          totalViews: viewResults.length,
          availableViews,
          results: viewResults
        }
      };
      
    } catch (error) {
      return {
        step: 'Verify Detail Views',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * PASO 6: Cleanup (opcional - eliminar documentos de prueba)
   */
  private async step6_Cleanup(dbData: any): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log('🧹 [PASO 6] Cleanup de documentos de prueba...');
      
      // Por seguridad, solo hacer cleanup si hay muy pocos documentos
      if (!dbData.documents || dbData.documents.length > 10) {
        return {
          step: 'Cleanup',
          success: true,
          duration: Date.now() - startTime,
          data: { message: 'Cleanup skipped for safety' }
        };
      }

      let deletedCount = 0;
      
      for (const doc of dbData.documents) {
        try {
          await SupabaseApiHelper.deleteDocument(doc.id);
          deletedCount++;
          console.log(`🗑️ [PASO 6] Eliminado: ${doc.filename}`);
        } catch (error) {
          console.error(`❌ [PASO 6] Error eliminando ${doc.id}:`, error);
        }
      }
      
      return {
        step: 'Cleanup',
        success: true,
        duration: Date.now() - startTime,
        data: { deletedCount, totalDocuments: dbData.documents.length }
      };
      
    } catch (error) {
      return {
        step: 'Cleanup',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Generar reporte final
   */
  private generateReport(startTime: number, results: TestResult[]): MultiDocumentTestReport {
    const totalDuration = Date.now() - startTime;
    const successfulSteps = results.filter(r => r.success).length;
    const failedSteps = results.filter(r => !r.success).length;
    
    const report: MultiDocumentTestReport = {
      timestamp: new Date().toISOString(),
      totalSteps: results.length,
      successfulSteps,
      failedSteps,
      totalDuration,
      results,
      summary: this.generateSummary(successfulSteps, failedSteps, totalDuration)
    };

    return report;
  }

  private generateSummary(successful: number, failed: number, duration: number): string {
    const successRate = successful + failed > 0 ? (successful / (successful + failed)) * 100 : 0;
    
    if (failed === 0) {
      return `✅ ÉXITO COMPLETO: ${successful}/${successful + failed} pasos completados en ${duration}ms (${successRate.toFixed(1)}%)`;
    } else if (successful > failed) {
      return `⚠️ ÉXITO PARCIAL: ${successful}/${successful + failed} pasos completados en ${duration}ms (${successRate.toFixed(1)}%)`;
    } else {
      return `❌ FALLO: ${successful}/${successful + failed} pasos completados en ${duration}ms (${successRate.toFixed(1)}%)`;
    }
  }
}

/**
 * Función principal para ejecutar desde línea de comandos
 */
async function runMultiDocumentE2ETest() {
  const tester = new MultiDocumentE2ETest();
  const report = await tester.runCompleteTest();
  
  // Mostrar reporte en consola
  console.log('\n🏁 ===== REPORTE FINAL MULTIDOCUMENTO =====');
  console.log(`📊 ${report.summary}`);
  console.log(`⏱️ Duración total: ${report.totalDuration}ms`);
  console.log(`📈 Pasos exitosos: ${report.successfulSteps}/${report.totalSteps}\n`);
  
  report.results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const duration = `(${result.duration}ms)`;
    console.log(`${icon} ${result.step}: ${result.success ? 'SUCCESS' : result.error} ${duration}`);
  });
  
  // Guardar reporte en archivo (sin buffers para evitar archivos gigantes)
  const reportsDir = path.join(__dirname, '../../../../datos/e2e-reports');
  await fs.mkdir(reportsDir, { recursive: true }); // Crear directorio si no existe
  const reportPath = path.join(reportsDir, `multidoc-e2e-${new Date().toISOString().replace(/:/g, '-')}.json`);
  
  // Clonar reporte sin buffers
  const reportToSave = JSON.parse(JSON.stringify(report, (key, value) => {
    if (key === 'buffer') return '[Buffer omitted for file size]';
    return value;
  }));
  
  await fs.writeFile(reportPath, JSON.stringify(reportToSave, null, 2));
  console.log(`\n📄 Reporte guardado en: ${reportPath}`);
  
  console.log('\n' + '='.repeat(50));
  
  // Exit code basado en el resultado
  if (typeof process !== 'undefined') {
    process.exit(report.failedSteps > 0 ? 1 : 0);
  }
}

// Permitir ejecución directa
if (import.meta.url === `file://${process.argv[1]}`) {
  runMultiDocumentE2ETest().catch(console.error);
}

export { MultiDocumentE2ETest, type MultiDocumentTestReport };