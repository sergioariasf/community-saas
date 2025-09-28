/**
 * ARCHIVO: ProductionHealthTest.ts
 * PROPÓSITO: Test de salud para verificar APIs Supabase en producción usando código real
 * ESTADO: development
 * DEPENDENCIAS: SupabaseApiHelper, fetch API
 * OUTPUTS: Reporte de salud del sistema
 * ACTUALIZADO: 2025-09-28
 */

import { SupabaseApiHelper } from './SupabaseApiHelper';

export interface HealthTestResult {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  duration?: number;
  details?: any;
}

export interface SystemHealthReport {
  timestamp: string;
  environment: 'development' | 'production' | 'unknown';
  overall_status: 'healthy' | 'degraded' | 'critical';
  tests: HealthTestResult[];
  summary: {
    total: number;
    passed: number;
    warnings: number;
    failed: number;
  };
}

/**
 * Suite de tests de salud para verificar que el sistema está operativo
 * Usa el mismo código que las APIs de producción
 */
export class ProductionHealthTest {
  private baseUrl: string;
  
  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001');
  }

  /**
   * Ejecutar test completo de salud del sistema
   */
  async runFullHealthCheck(): Promise<SystemHealthReport> {
    const startTime = Date.now();
    const tests: HealthTestResult[] = [];
    
    console.log('🏥 [HEALTH CHECK] Starting production health test...');
    
    // Test 1: Supabase connectivity
    tests.push(await this.testSupabaseConnectivity());
    
    // Test 2: API endpoints availability
    tests.push(await this.testApiEndpoints());
    
    // Test 3: Document operations
    tests.push(await this.testDocumentOperations());
    
    // Test 4: Pipeline health
    tests.push(await this.testPipelineHealth());
    
    // Analizar resultados
    const summary = {
      total: tests.length,
      passed: tests.filter(t => t.status === 'ok').length,
      warnings: tests.filter(t => t.status === 'warning').length,
      failed: tests.filter(t => t.status === 'error').length,
    };
    
    let overall_status: 'healthy' | 'degraded' | 'critical';
    if (summary.failed === 0) {
      overall_status = summary.warnings === 0 ? 'healthy' : 'degraded';
    } else {
      overall_status = 'critical';
    }
    
    const report: SystemHealthReport = {
      timestamp: new Date().toISOString(),
      environment: this.detectEnvironment(),
      overall_status,
      tests,
      summary
    };
    
    console.log(`🏥 [HEALTH CHECK] Completed in ${Date.now() - startTime}ms - Status: ${overall_status.toUpperCase()}`);
    
    return report;
  }

  /**
   * Test 1: Conectividad básica a Supabase
   */
  private async testSupabaseConnectivity(): Promise<HealthTestResult> {
    const startTime = Date.now();
    
    try {
      const result = await SupabaseApiHelper.healthCheck();
      const duration = Date.now() - startTime;
      
      if (result.status === 'ok') {
        return {
          component: 'Supabase Database',
          status: 'ok',
          message: 'Database connection successful',
          duration,
          details: result
        };
      } else {
        return {
          component: 'Supabase Database',
          status: 'error',
          message: `Database connection failed: ${result.message}`,
          duration,
          details: result
        };
      }
    } catch (error) {
      return {
        component: 'Supabase Database',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown database error',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 2: Disponibilidad de endpoints API
   */
  private async testApiEndpoints(): Promise<HealthTestResult> {
    const endpoints = [
      '/api/documents/multi-analyze',
      '/api/documents/clean-all',
    ];
    
    const results: any[] = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        results.push({
          endpoint,
          status: response.status,
          available: response.status < 500
        });
      } catch (error) {
        results.push({
          endpoint,
          status: 'error',
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const unavailable = results.filter(r => !r.available);
    
    if (unavailable.length === 0) {
      return {
        component: 'API Endpoints',
        status: 'ok',
        message: 'All API endpoints are available',
        details: results
      };
    } else if (unavailable.length < results.length) {
      return {
        component: 'API Endpoints',
        status: 'warning',
        message: `${unavailable.length}/${results.length} endpoints unavailable`,
        details: results
      };
    } else {
      return {
        component: 'API Endpoints',
        status: 'error',
        message: 'All API endpoints are unavailable',
        details: results
      };
    }
  }

  /**
   * Test 3: Operaciones básicas de documentos
   */
  private async testDocumentOperations(): Promise<HealthTestResult> {
    const startTime = Date.now();
    
    try {
      // Test: Listar documentos recientes (sin crear/modificar nada)
      const recentDocs = await SupabaseApiHelper.executeQuery(async (supabase) => {
        const { data, error } = await supabase
          .from('documents')
          .select('id, filename, created_at, extraction_status')
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          throw new Error(`Query failed: ${error.message}`);
        }
        
        return data || [];
      });
      
      const duration = Date.now() - startTime;
      
      return {
        component: 'Document Operations',
        status: 'ok',
        message: `Successfully queried ${recentDocs.length} recent documents`,
        duration,
        details: {
          recent_documents_count: recentDocs.length,
          sample_statuses: recentDocs.map((d: any) => d.extraction_status)
        }
      };
      
    } catch (error) {
      return {
        component: 'Document Operations',
        status: 'error',
        message: error instanceof Error ? error.message : 'Document operations failed',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Test 4: Salud del pipeline de procesamiento
   */
  private async testPipelineHealth(): Promise<HealthTestResult> {
    const startTime = Date.now();
    
    try {
      // Verificar documentos procesados recientemente
      const pipelineStats = await SupabaseApiHelper.executeQuery(async (supabase) => {
        const { data, error } = await supabase
          .from('documents')
          .select('extraction_status, classification_status, metadata_status')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Últimas 24h
          .limit(20);
        
        if (error) {
          throw new Error(`Pipeline stats query failed: ${error.message}`);
        }
        
        return data || [];
      });
      
      const stats = {
        total: pipelineStats.length,
        completed_extraction: pipelineStats.filter((d: any) => d.extraction_status === 'completed').length,
        completed_classification: pipelineStats.filter((d: any) => d.classification_status === 'completed').length,
        completed_metadata: pipelineStats.filter((d: any) => d.metadata_status === 'completed').length,
      };
      
      const duration = Date.now() - startTime;
      
      // Evaluar salud del pipeline
      let status: 'ok' | 'warning' | 'error' = 'ok';
      let message = 'Pipeline is healthy';
      
      if (stats.total === 0) {
        status = 'warning';
        message = 'No documents processed in last 24h';
      } else {
        const extractionRate = stats.completed_extraction / stats.total;
        const classificationRate = stats.completed_classification / stats.total;
        
        if (extractionRate < 0.8 || classificationRate < 0.7) {
          status = 'warning';
          message = 'Pipeline completion rates below expected thresholds';
        }
      }
      
      return {
        component: 'Processing Pipeline',
        status,
        message,
        duration,
        details: stats
      };
      
    } catch (error) {
      return {
        component: 'Processing Pipeline',
        status: 'error',
        message: error instanceof Error ? error.message : 'Pipeline health check failed',
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Detectar entorno de ejecución
   */
  private detectEnvironment(): 'development' | 'production' | 'unknown' {
    if (typeof window !== 'undefined') {
      // Cliente
      return window.location.hostname === 'localhost' ? 'development' : 'production';
    } else {
      // Servidor
      return process.env.NODE_ENV === 'production' ? 'production' : 'development';
    }
  }

  /**
   * Método para uso desde línea de comandos
   */
  static async runStandaloneTest(baseUrl?: string): Promise<void> {
    const tester = new ProductionHealthTest(baseUrl);
    const report = await tester.runFullHealthCheck();
    
    console.log('\n🏥 ===== SYSTEM HEALTH REPORT =====');
    console.log(`📊 Overall Status: ${report.overall_status.toUpperCase()}`);
    console.log(`🌐 Environment: ${report.environment}`);
    console.log(`⏱️ Timestamp: ${report.timestamp}`);
    console.log(`📈 Summary: ${report.summary.passed}/${report.summary.total} tests passed\n`);
    
    report.tests.forEach(test => {
      const icon = test.status === 'ok' ? '✅' : test.status === 'warning' ? '⚠️' : '❌';
      const duration = test.duration ? ` (${test.duration}ms)` : '';
      console.log(`${icon} ${test.component}: ${test.message}${duration}`);
      
      if (test.details && test.status !== 'ok') {
        console.log(`   Details:`, test.details);
      }
    });
    
    console.log('\n' + '='.repeat(50));
    
    // Exit code basado en el estado
    if (typeof process !== 'undefined') {
      process.exit(report.overall_status === 'critical' ? 1 : 0);
    }
  }
}

// Permitir ejecución directa desde línea de comandos
if (typeof require !== 'undefined' && require.main === module) {
  ProductionHealthTest.runStandaloneTest().catch(console.error);
}