/**
 * ARCHIVO: test-complete-e2e-validation.ts
 * PROPÓSITO: Test E2E completo sin BD - PDF → Extracción → Clasificación → Metadata → Validación Template
 * ESTADO: testing
 * DEPENDENCIAS: TextExtractionFactory, DocumentClassifier, DocumentExtractorFactory, Templates
 * OUTPUTS: Validación completa compatibilidad datos extraídos ↔ templates UI
 * ACTUALIZADO: 2025-09-22
 */

import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
dotenv.config({ path: '.env.local' });

// Obtener __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importar módulos compartidos prod/test
import { TextExtractionFactory } from '../core/extraction/TextExtractionFactory';
import { DocumentClassifier } from '../core/strategies/DocumentClassifier';
import { DocumentExtractorFactory } from '../core/strategies/DocumentExtractorFactory';

// Importar sistema de validación centralizado
import { 
  validateExtractedData, 
  generateValidationReport, 
  TEMPLATE_SCHEMAS 
} from '../validation/templateValidation';

interface E2ETestResult {
  filename: string;
  success: boolean;
  phases: {
    extraction: { success: boolean; text_length?: number; method?: string; error?: string };
    classification: { success: boolean; type?: string; confidence?: number; error?: string };
    metadata: { success: boolean; fields_count?: number; fields?: string[]; error?: string };
    template_validation: { success: boolean; compatibility_score?: number; missing_fields?: string[]; error?: string };
    db_schema_validation: { success: boolean; incompatible_fields?: string[]; unknown_fields?: string[]; error?: string };
  };
  total_time: number;
  extracted_data?: any;
  template_compatibility?: any;
}

// Las validaciones ahora están centralizadas en templateValidation.ts

async function testCompleteE2EValidation() {
  console.log('🧪 [E2E VALIDATION] =================================');
  console.log('🧪 [E2E VALIDATION] TEST COMPLETO E2E + VALIDACIÓN TEMPLATES');
  console.log('🧪 [E2E VALIDATION] =================================\\n');

  const TARGET_FILE = process.argv[2];
  const results: E2ETestResult[] = [];
  
  try {
    // Si se especifica un archivo, testear solo ese
    if (TARGET_FILE) {
      console.log(`🎯 [E2E VALIDATION] Testeando archivo específico: ${TARGET_FILE}\\n`);
      const result = await testSingleFileE2E(TARGET_FILE);
      results.push(result);
    } else {
      // Testear todos los archivos disponibles
      console.log('🔄 [E2E VALIDATION] Testeando todos los archivos disponibles\\n');
      const pdfDir = path.join(__dirname, '../../../../datos/pdf');
      const pdfFiles = await fs.readdir(pdfDir);
      
      console.log(`📁 [E2E VALIDATION] Encontrados ${pdfFiles.length} archivos PDF\\n`);
      
      for (const pdfFile of pdfFiles) {
        const baseName = pdfFile.replace('.pdf', '');
        const result = await testSingleFileE2E(baseName);
        results.push(result);
        
        // Pequeña pausa entre archivos
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Generar reporte final
    await generateE2EReport(results);

  } catch (error) {
    console.error('❌ [E2E VALIDATION] Error general:', error);
  }
}

async function testSingleFileE2E(baseName: string): Promise<E2ETestResult> {
  console.log(`🔍 [E2E VALIDATION] ===== PROCESANDO: ${baseName} =====`);
  
  const result: E2ETestResult = {
    filename: baseName,
    success: false,
    phases: {
      extraction: { success: false },
      classification: { success: false },
      metadata: { success: false },
      template_validation: { success: false },
      db_schema_validation: { success: false }
    },
    total_time: 0
  };

  const startTime = Date.now();

  try {
    // FASE 1: EXTRACCIÓN DE TEXTO
    console.log('📝 [E2E VALIDATION] Fase 1: Extracción de texto...');
    const pdfPath = path.join(__dirname, '../../../../datos/pdf', `${baseName}.pdf`);
    
    // Verificar que el archivo existe
    try {
      await fs.access(pdfPath);
    } catch (error) {
      result.phases.extraction = { 
        success: false, 
        error: `File not found: ${baseName}.pdf` 
      };
      throw new Error(`File not found: ${baseName}.pdf`);
    }
    
    // Leer el archivo y crear ExtractionContext
    const buffer = await fs.readFile(pdfPath);
    const extractionContext = {
      buffer,
      filename: `${baseName}.pdf`,
      documentId: 'fake-doc-id',
      minTextLength: 50
    };
    
    const extractionStart = Date.now();
    const textFactory = new TextExtractionFactory();
    const extractionResult = await textFactory.extractText(extractionContext);
    
    if (!extractionResult.success || !extractionResult.text) {
      result.phases.extraction = { 
        success: false, 
        error: extractionResult.error || 'No text extracted' 
      };
      throw new Error(`Extracción falló: ${extractionResult.error}`);
    }
    
    result.phases.extraction = {
      success: true,
      text_length: extractionResult.text.length,
      method: extractionResult.method || 'unknown'
    };
    console.log(`✅ [E2E VALIDATION] Extracción: ${extractionResult.text.length} caracteres con ${extractionResult.method}`);

    // FASE 2: CLASIFICACIÓN
    console.log('🏷️ [E2E VALIDATION] Fase 2: Clasificación de documento...');
    const classificationStart = Date.now();
    const classifier = new DocumentClassifier();
    const classificationResult = await classifier.classifyDocument({
      filename: `${baseName}.pdf`,
      extractedText: extractionResult.text,
      useAI: true
    });
    
    if (!classificationResult.documentType || classificationResult.confidence < 0.3) {
      result.phases.classification = { 
        success: false, 
        error: classificationResult.reasoning || 'Classification failed with low confidence' 
      };
      throw new Error(`Clasificación falló: ${classificationResult.reasoning}`);
    }
    
    result.phases.classification = {
      success: true,
      type: classificationResult.documentType,
      confidence: classificationResult.confidence
    };
    console.log(`✅ [E2E VALIDATION] Clasificación: ${classificationResult.documentType} (${(classificationResult.confidence * 100).toFixed(1)}%)`);

    // FASE 3: EXTRACCIÓN DE METADATA
    console.log('📊 [E2E VALIDATION] Fase 3: Extracción de metadata...');
    const metadataStart = Date.now();
    const extractor = DocumentExtractorFactory.getExtractor(classificationResult.documentType);
    
    if (!extractor) {
      result.phases.metadata = { 
        success: false, 
        error: `Tipo no soportado: ${classificationResult.documentType}` 
      };
      throw new Error(`Extractor no disponible para: ${classificationResult.documentType}`);
    }
    
    // Usar modo test para evitar guardado en BD
    const metadataResult = await extractor.processMetadata('fake-doc-id', extractionResult.text, true);
    
    if (!metadataResult.success || !metadataResult.data) {
      result.phases.metadata = { 
        success: false, 
        error: metadataResult.error || 'Metadata extraction failed' 
      };
      throw new Error(`Metadata falló: ${metadataResult.error}`);
    }
    
    const fieldCount = Object.keys(metadataResult.data).length;
    result.phases.metadata = {
      success: true,
      fields_count: fieldCount,
      fields: Object.keys(metadataResult.data)
    };
    result.extracted_data = metadataResult.data;
    console.log(`✅ [E2E VALIDATION] Metadata: ${fieldCount} campos extraídos`);

    // FASE 4: VALIDACIÓN TEMPLATE (usando sistema centralizado)
    console.log('🎨 [E2E VALIDATION] Fase 4: Validación compatibilidad template...');
    const schema = TEMPLATE_SCHEMAS[classificationResult.documentType];
    
    if (!schema) {
      result.phases.template_validation = { 
        success: false, 
        error: `No hay esquema para tipo: ${classificationResult.documentType}` 
      };
      console.log(`⚠️ [E2E VALIDATION] Sin esquema para: ${classificationResult.documentType}`);
    } else {
      const validationResult = validateExtractedData(classificationResult.documentType, metadataResult.data);
      
      result.phases.template_validation = {
        success: validationResult.valid,
        compatibility_score: validationResult.score,
        missing_fields: validationResult.missing_fields
      };
      result.template_compatibility = validationResult;
      
      console.log(`✅ [E2E VALIDATION] Template: ${validationResult.score}% compatibilidad (${validationResult.valid ? 'VÁLIDO' : 'INVÁLIDO'})`);
      
      // Mostrar reporte detallado si hay problemas
      if (!validationResult.valid || validationResult.score < 80) {
        console.log('\\n📋 [E2E VALIDATION] Reporte detallado:');
        const report = generateValidationReport(classificationResult.documentType, metadataResult.data, validationResult);
        console.log(report);
      }
    }

    // FASE 5: VALIDACIÓN BD SCHEMA (nueva validación crítica)
    console.log('🔍 [E2E VALIDATION] Fase 5: Validación compatibilidad BD schema...');
    const dbSchemaValidation = await validateDatabaseSchema(classificationResult.documentType, metadataResult.data);
    
    result.phases.db_schema_validation = {
      success: dbSchemaValidation.valid,
      incompatible_fields: dbSchemaValidation.incompatible_fields || [],
      unknown_fields: dbSchemaValidation.unknown_fields || []
    };
    
    if (!dbSchemaValidation.valid) {
      console.log(`❌ [E2E VALIDATION] BD Schema: INCOMPATIBLE - ${dbSchemaValidation.errors?.length || 0} errores`);
      dbSchemaValidation.errors?.forEach(error => {
        console.log(`   🔸 ${error}`);
      });
    } else {
      console.log(`✅ [E2E VALIDATION] BD Schema: COMPATIBLE`);
    }

    result.success = result.phases.extraction.success && 
                    result.phases.classification.success && 
                    result.phases.metadata.success && 
                    result.phases.template_validation.success &&
                    result.phases.db_schema_validation.success;

  } catch (error) {
    console.log(`❌ [E2E VALIDATION] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.success = false;
  }

  result.total_time = Date.now() - startTime;
  console.log(`⏱️  [E2E VALIDATION] Tiempo total: ${result.total_time}ms\\n`);
  
  return result;
}

async function generateE2EReport(results: E2ETestResult[]) {
  console.log('📊 [E2E VALIDATION] ===== REPORTE FINAL =====');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`📈 [E2E VALIDATION] Resumen general:`);
  console.log(`   - Total archivos: ${results.length}`);
  console.log(`   - Exitosos E2E: ${successful.length} (${(successful.length/results.length*100).toFixed(1)}%)`);
  console.log(`   - Fallidos: ${failed.length}`);
  
  // Estadísticas por fase
  const phaseStats = {
    extraction: results.filter(r => r.phases.extraction.success).length,
    classification: results.filter(r => r.phases.classification.success).length,
    metadata: results.filter(r => r.phases.metadata.success).length,
    template_validation: results.filter(r => r.phases.template_validation.success).length
  };
  
  console.log(`\\n📊 [E2E VALIDATION] Éxito por fase:`);
  console.log(`   - Extracción: ${phaseStats.extraction}/${results.length} (${(phaseStats.extraction/results.length*100).toFixed(1)}%)`);
  console.log(`   - Clasificación: ${phaseStats.classification}/${results.length} (${(phaseStats.classification/results.length*100).toFixed(1)}%)`);
  console.log(`   - Metadata: ${phaseStats.metadata}/${results.length} (${(phaseStats.metadata/results.length*100).toFixed(1)}%)`);
  console.log(`   - Template Validation: ${phaseStats.template_validation}/${results.length} (${(phaseStats.template_validation/results.length*100).toFixed(1)}%)`);

  // Compatibilidad promedio por tipo
  const byType: Record<string, E2ETestResult[]> = {};
  results.forEach(r => {
    const type = r.phases.classification.type || 'unknown';
    if (!byType[type]) byType[type] = [];
    byType[type].push(r);
  });
  
  console.log(`\\n🎨 [E2E VALIDATION] Compatibilidad templates:`);
  Object.entries(byType).forEach(([type, typeResults]) => {
    const validTemplates = typeResults.filter(r => r.phases.template_validation.success);
    const avgScore = typeResults
      .filter(r => r.phases.template_validation.compatibility_score !== undefined)
      .reduce((sum, r) => sum + (r.phases.template_validation.compatibility_score || 0), 0) / typeResults.length || 0;
    
    console.log(`   - ${type}: ${validTemplates.length}/${typeResults.length} válidos (${avgScore.toFixed(1)}% promedio)`);
  });

  // Archivos fallidos con detalles
  if (failed.length > 0) {
    console.log(`\\n❌ [E2E VALIDATION] Archivos fallidos:`);
    failed.forEach(f => {
      console.log(`   - ${f.filename}:`);
      if (!f.phases.extraction.success) console.log(`     └─ Extracción: ${f.phases.extraction.error}`);
      if (!f.phases.classification.success) console.log(`     └─ Clasificación: ${f.phases.classification.error}`);
      if (!f.phases.metadata.success) console.log(`     └─ Metadata: ${f.phases.metadata.error}`);
      if (!f.phases.template_validation.success) console.log(`     └─ Template: ${f.phases.template_validation.error}`);
    });
  }

  // Guardar reporte detallado
  const outputDir = path.join(__dirname, '../../../../datos/e2e-reports');
  await fs.mkdir(outputDir, { recursive: true });
  
  const reportFile = path.join(outputDir, `e2e-validation-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(reportFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      success_rate: successful.length / results.length * 100,
      phase_stats: phaseStats,
      by_type: Object.fromEntries(
        Object.entries(byType).map(([type, typeResults]) => [
          type, 
          {
            count: typeResults.length,
            valid_templates: typeResults.filter(r => r.phases.template_validation.success).length,
            avg_compatibility: typeResults
              .filter(r => r.phases.template_validation.compatibility_score !== undefined)
              .reduce((sum, r) => sum + (r.phases.template_validation.compatibility_score || 0), 0) / typeResults.length || 0
          }
        ])
      )
    },
    detailed_results: results
  }, null, 2));
  
  console.log(`\\n💾 [E2E VALIDATION] Reporte detallado guardado: ${reportFile}`);
  console.log('🎯 [E2E VALIDATION] ¡Test E2E completado!');
}

/**
 * Valida que los campos extraídos sean compatibles con el schema de BD
 */
async function validateDatabaseSchema(documentType: string, extractedData: any) {
  try {
    // Esquemas de BD esperados (basado en docs/tablas_doc.md)
    const dbSchemas = {
      acta: [
        'id', 'document_id', 'organization_id', 'president_in', 'president_out', 
        'administrator', 'summary', 'decisions', 'created_at', 'document_date', 
        'tipo_reunion', 'lugar', 'comunidad_nombre', 'orden_del_dia', 'acuerdos', 
        'topic_keywords', 'topic_presupuesto', 'topic_mantenimiento', 
        'topic_administracion', 'topic_piscina', 'topic_jardin', 'topic_limpieza', 
        'topic_balance', 'topic_paqueteria', 'topic_energia', 'topic_normativa', 
        'topic_proveedor', 'topic_dinero', 'topic_ascensor', 'topic_incendios', 
        'topic_porteria', 'estructura_detectada'
      ],
      factura: [
        'id', 'document_id', 'organization_id', 'provider_name', 'client_name', 
        'amount', 'invoice_date', 'category', 'invoice_number', 'total_amount', 
        'currency', 'payment_method', 'products', 'bank_details', 'created_at'
      ],
      escritura: [
        'id', 'document_id', 'organization_id', 'vendedor_nombre', 'comprador_nombre',
        'direccion_inmueble', 'precio_venta', 'fecha_escritura', 'notario_nombre',
        'referencia_catastral', 'superficie_m2', 'category', 'vendedor_dni',
        'vendedor_direccion', 'vendedor_estado_civil', 'vendedor_nacionalidad',
        'vendedor_profesion', 'comprador_dni', 'comprador_direccion',
        'comprador_estado_civil', 'comprador_nacionalidad', 'comprador_profesion',
        'tipo_inmueble', 'superficie_util', 'numero_habitaciones', 'numero_banos',
        'planta', 'orientacion', 'descripcion_inmueble', 'registro_propiedad',
        'tomo', 'libro', 'folio', 'finca', 'inscripcion', 'moneda', 'forma_pago',
        'precio_en_letras', 'impuestos_incluidos', 'gastos_a_cargo_comprador',
        'gastos_a_cargo_vendedor', 'cargas_existentes', 'hipotecas_pendientes',
        'servidumbres', 'libre_cargas', 'condicion_suspensiva', 'condiciones_especiales',
        'clausulas_particulares', 'fecha_entrega', 'entrega_inmediata',
        'estado_conservacion', 'inventario_incluido', 'notario_numero_colegiado',
        'notaria_direccion', 'protocolo_numero', 'autorizacion_notarial',
        'valor_catastral', 'coeficiente_participacion', 'itp_aplicable',
        'base_imponible_itp', 'inscripcion_registro', 'created_at'
      ]
    };

    const expectedFields = dbSchemas[documentType as keyof typeof dbSchemas];
    if (!expectedFields) {
      return {
        valid: false,
        errors: [`No hay esquema BD definido para tipo: ${documentType}`]
      };
    }

    const extractedFields = Object.keys(extractedData);
    const errors: string[] = [];
    const incompatibleFields: string[] = [];
    const unknownFields: string[] = [];

    // Detectar campos con formato incompatible (guión medio vs guión bajo)
    extractedFields.forEach(field => {
      if (field.includes('-') && field.startsWith('topic-')) {
        const expectedField = field.replace(/-/g, '_');
        if (expectedFields.includes(expectedField)) {
          incompatibleFields.push(field);
          errors.push(`Campo incompatible: '${field}' debería ser '${expectedField}' (BD usa guiones bajos)`);
        }
      } else if (!expectedFields.includes(field) && !['id', 'document_id', 'organization_id', 'created_at'].includes(field)) {
        unknownFields.push(field);
        errors.push(`Campo desconocido: '${field}' no existe en tabla BD`);
      }
    });

    const isValid = errors.length === 0;

    return {
      valid: isValid,
      errors: isValid ? undefined : errors,
      incompatible_fields: incompatibleFields.length > 0 ? incompatibleFields : undefined,
      unknown_fields: unknownFields.length > 0 ? unknownFields : undefined
    };

  } catch (error) {
    return {
      valid: false,
      errors: [`Error validando schema BD: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
}

// Ejecutar si se llama directamente
testCompleteE2EValidation().catch(console.error);