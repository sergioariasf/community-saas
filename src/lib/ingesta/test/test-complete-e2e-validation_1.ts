/**
 * ARCHIVO: test-complete-e2e-validation_1.ts
 * PROPÓSITO: Test E2E modernizado para pipeline modularizado - Soporte 7 tipos docs + Pasos selectivos
 * ESTADO: testing
 * DEPENDENCIAS: SchemaConfig, AgentOrchestrator, ResponseParser, document-types-schema.json
 * OUTPUTS: Validación completa E2E con arquitectura auto-discovery + pasos flexibles
 * ACTUALIZADO: 2025-09-24
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

// Importar arquitectura modularizada - MISMO CÓDIGO QUE PRODUCCIÓN
import { TextExtractionFactory } from '../core/extraction/TextExtractionFactory';
import { DocumentClassifier } from '../core/strategies/DocumentClassifier';
import { DocumentExtractorFactory } from '../core/strategies/DocumentExtractorFactory';
import { parseAgentResponse } from '../../agents/gemini/ResponseParser';
import { getDocumentConfigs } from '../core/schemaBasedConfig';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Tipos para el test E2E modernizado
interface E2ETestConfig {
  targetFile?: string;
  steps: number[];
  verbose: boolean;
}

interface E2EPhaseResult {
  success: boolean;
  data?: any;
  error?: string;
  metrics?: {
    duration: number;
    size?: number;
    method?: string;
    confidence?: number;
    fields_count?: number;
    compatibility_score?: number;
  };
}

interface E2ETestResult {
  filename: string;
  success: boolean;
  steps_executed: number[];
  phases: {
    step1_extraction: E2EPhaseResult;
    step2_classification: E2EPhaseResult;
    step3_metadata: E2EPhaseResult;
    step4_validation: E2EPhaseResult;
    step5_template_compatibility: E2EPhaseResult;
    step6_schema_validation: E2EPhaseResult;
  };
  total_time: number;
  document_type?: string;
  extracted_data?: any;
}

// Configuración de pasos del pipeline
const PIPELINE_STEPS = {
  1: { name: 'TEXT_EXTRACTION', description: 'Extracción de texto del PDF' },
  2: { name: 'CLASSIFICATION', description: 'Clasificación del tipo de documento' },
  3: { name: 'METADATA_EXTRACTION', description: 'Extracción de metadata con IA' },
  4: { name: 'DATA_VALIDATION', description: 'Validación de datos extraídos' },
  5: { name: 'TEMPLATE_COMPATIBILITY', description: 'Compatibilidad con templates UI' },
  6: { name: 'SCHEMA_VALIDATION', description: 'Validación contra schema BD' }
};

// Helper functions para acceso al schema - MISMO CÓDIGO QUE PRODUCCIÓN
function getDocumentSchema() {
  // Path is relative to project root, not current working directory
  const projectRoot = path.join(__dirname, '../../../..');
  const schemaPath = path.join(projectRoot, 'src/lib/schemas/document-types-schema.json');
  const fsSync = require('fs'); // Use sync fs for schema reading
  const schemaContent = fsSync.readFileSync(schemaPath, 'utf-8');
  return JSON.parse(schemaContent);
}

function getDocumentTypes(): string[] {
  const schema = getDocumentSchema();
  return Object.keys(schema.document_types || {});
}

function getTypeConfig(documentType: string) {
  const schema = getDocumentSchema();
  return schema.document_types?.[documentType];
}

// Helper function para llamar Gemini directamente - TEST-FRIENDLY
async function callGeminiDirect(prompt: string, agentName: string): Promise<any> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2000,
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return {
        success: false,
        error: 'Empty response from Gemini'
      };
    }

    // Procesar respuesta JSON (igual que en saasAgents.ts)
    let responseData = text.trim();
    
    // Limpiar respuesta - buscar JSON
    const jsonMatch = responseData.match(/```json\s*([\s\S]*?)\s*```/) || 
                     responseData.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      responseData = jsonMatch[1] || jsonMatch[0];
    }
    
    const parsedData = JSON.parse(responseData);
    
    return {
      success: true,
      data: parsedData
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Gemini error: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

async function main() {
  console.log('🚀 [E2E MODERNIZADO] ====================================');
  console.log('🚀 [E2E MODERNIZADO] TEST COMPLETO PIPELINE MODULARIZADO');
  console.log('🚀 [E2E MODERNIZADO] ====================================\\n');

  const config = parseArguments();
  
  console.log(`📋 [E2E MODERNIZADO] Configuración:`);
  console.log(`   - Archivo objetivo: ${config.targetFile || 'TODOS'}`);
  console.log(`   - Pasos a ejecutar: ${config.steps.join(', ')}`);
  console.log(`   - Modo verboso: ${config.verbose}\\n`);

  // Auto-discovery de tipos de documentos
  const supportedTypes = getDocumentTypes();
  console.log(`🎯 [E2E MODERNIZADO] Tipos soportados (${supportedTypes.length}): ${supportedTypes.join(', ')}\\n`);

  const results: E2ETestResult[] = [];
  
  try {
    if (config.targetFile) {
      // Testear archivo específico
      const result = await testSingleFileE2E(config.targetFile, config);
      results.push(result);
    } else {
      // Testear todos los archivos disponibles
      const pdfDir = path.join(__dirname, '../../../../datos/pdf');
      try {
        const pdfFiles = await fs.readdir(pdfDir);
        console.log(`📁 [E2E MODERNIZADO] Encontrados ${pdfFiles.length} archivos PDF\\n`);
        
        for (const pdfFile of pdfFiles) {
          if (pdfFile.endsWith('.pdf')) {
            const baseName = pdfFile.replace('.pdf', '');
            const result = await testSingleFileE2E(baseName, config);
            results.push(result);
            
            // Pausa entre archivos para evitar rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error(`❌ [E2E MODERNIZADO] Error accediendo a directorio PDF: ${error}`);
        return;
      }
    }

    // Generar reporte final
    await generateModernizedReport(results, config);

  } catch (error) {
    console.error('❌ [E2E MODERNIZADO] Error general:', error);
  }
}

function parseArguments(): E2ETestConfig {
  const args = process.argv.slice(2);
  const config: E2ETestConfig = {
    steps: [1, 2, 3, 4, 5, 6], // Por defecto todos los pasos
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--steps=')) {
      const stepsArg = arg.split('=')[1];
      if (stepsArg.includes('-')) {
        // Rango: --steps=2-5
        const [start, end] = stepsArg.split('-').map(Number);
        config.steps = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      } else if (stepsArg.includes(',')) {
        // Lista: --steps=1,3,5
        config.steps = stepsArg.split(',').map(Number);
      } else {
        // Un solo paso: --steps=3
        config.steps = [Number(stepsArg)];
      }
    } else if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (!arg.startsWith('--')) {
      // Archivo objetivo (sin extensión .pdf)
      config.targetFile = arg.replace('.pdf', '');
    }
  }

  // Validar pasos
  config.steps = config.steps.filter(step => step >= 1 && step <= 6);
  if (config.steps.length === 0) {
    config.steps = [1, 2, 3, 4, 5, 6];
  }

  return config;
}

async function testSingleFileE2E(baseName: string, config: E2ETestConfig): Promise<E2ETestResult> {
  console.log(`🔍 [E2E MODERNIZADO] ===== PROCESANDO: ${baseName} =====`);
  
  const result: E2ETestResult = {
    filename: baseName,
    success: false,
    steps_executed: config.steps,
    phases: {
      step1_extraction: { success: false },
      step2_classification: { success: false },
      step3_metadata: { success: false },
      step4_validation: { success: false },
      step5_template_compatibility: { success: false },
      step6_schema_validation: { success: false }
    },
    total_time: 0
  };

  const startTime = Date.now();
  let extractedText = '';
  let documentType = '';
  let metadataResult: any = null;

  try {
    // PASO 1: EXTRACCIÓN DE TEXTO
    if (config.steps.includes(1)) {
      console.log('📝 [PASO 1] Extrayendo texto del PDF...');
      const step1Result = await executeStep1Extraction(baseName, config.verbose);
      result.phases.step1_extraction = step1Result;
      
      if (step1Result.success && step1Result.data) {
        extractedText = step1Result.data;
      } else if (config.steps.some(s => s > 1)) {
        throw new Error(`Paso 1 falló: ${step1Result.error}`);
      }
    }

    // PASO 2: CLASIFICACIÓN  
    if (config.steps.includes(2)) {
      if (!extractedText && config.steps.includes(1)) {
        throw new Error('No hay texto extraído para clasificar');
      }
      
      console.log('🏷️ [PASO 2] Clasificando tipo de documento...');
      const step2Result = await executeStep2Classification(baseName, extractedText, config.verbose);
      result.phases.step2_classification = step2Result;
      
      if (step2Result.success && step2Result.data) {
        documentType = step2Result.data.documentType;
        result.document_type = documentType;
      } else if (config.steps.some(s => s > 2)) {
        throw new Error(`Paso 2 falló: ${step2Result.error}`);
      }
    }

    // PASO 3: EXTRACCIÓN DE METADATA
    if (config.steps.includes(3)) {
      // Si no tenemos datos previos pero necesitamos paso 3, ejecutar pasos 1-2 automáticamente
      if (!extractedText || !documentType) {
        console.log('🔄 [PASO 3] Requiere datos previos - ejecutando pasos 1-2 automáticamente...');
        
        if (!extractedText) {
          const step1Result = await executeStep1Extraction(baseName, false);
          if (step1Result.success) extractedText = step1Result.data;
          else throw new Error(`Paso 1 requerido falló: ${step1Result.error}`);
        }
        
        if (!documentType) {
          const step2Result = await executeStep2Classification(baseName, extractedText, false);
          if (step2Result.success) {
            documentType = step2Result.data.documentType;
            result.document_type = documentType;
          } else throw new Error(`Paso 2 requerido falló: ${step2Result.error}`);
        }
      }
      
      console.log('📊 [PASO 3] Extrayendo metadata con IA...');
      const step3Result = await executeStep3MetadataExtraction(documentType, extractedText, config.verbose);
      result.phases.step3_metadata = step3Result;
      
      // Debug para ver error específico del paso 3
      if (!step3Result.success && config.verbose) {
        console.log(`   ❌ PASO 3 ERROR: ${step3Result.error}`);
      }
      
      if (step3Result.success && step3Result.data) {
        metadataResult = step3Result.data;
        result.extracted_data = metadataResult;
      } else if (config.steps.some(s => s > 3)) {
        throw new Error(`Paso 3 falló: ${step3Result.error}`);
      }
    }

    // PASO 4: VALIDACIÓN DE DATOS
    if (config.steps.includes(4)) {
      // Si no tenemos datos previos pero necesitamos paso 4, ejecutar pasos 1-3 automáticamente
      if (!metadataResult || !documentType || !extractedText) {
        console.log('🔄 [PASO 4] Requiere datos previos - ejecutando pasos 1-3 automáticamente...');
        
        if (!extractedText) {
          const step1Result = await executeStep1Extraction(baseName, false);
          if (step1Result.success) extractedText = step1Result.data;
          else throw new Error(`Paso 1 requerido falló: ${step1Result.error}`);
        }
        
        if (!documentType) {
          const step2Result = await executeStep2Classification(baseName, extractedText, false);
          if (step2Result.success) {
            documentType = step2Result.data.documentType;
            result.document_type = documentType;
          } else throw new Error(`Paso 2 requerido falló: ${step2Result.error}`);
        }
        
        if (!metadataResult) {
          const step3Result = await executeStep3MetadataExtraction(documentType, extractedText, false);
          if (step3Result.success) {
            metadataResult = step3Result.data;
            result.extracted_data = metadataResult;
          } else throw new Error(`Paso 3 requerido falló: ${step3Result.error}`);
        }
      }
      
      console.log('🔍 [PASO 4] Validando datos extraídos...');
      const step4Result = await executeStep4DataValidation(documentType, metadataResult, config.verbose);
      result.phases.step4_validation = step4Result;
      
      // Debug para ver error específico del paso 4
      if (!step4Result.success && config.verbose) {
        console.log(`   ❌ PASO 4 ERROR: ${step4Result.error}`);
      }
    }

    // PASO 5: COMPATIBILIDAD TEMPLATE
    if (config.steps.includes(5)) {
      // Si no tenemos datos previos pero necesitamos paso 5, ejecutar pasos 1-3 automáticamente
      if (!metadataResult || !documentType || !extractedText) {
        console.log('🔄 [PASO 5] Requiere datos previos - ejecutando pasos 1-3 automáticamente...');
        
        if (!extractedText) {
          const step1Result = await executeStep1Extraction(baseName, false);
          if (step1Result.success) extractedText = step1Result.data;
          else throw new Error(`Paso 1 requerido falló: ${step1Result.error}`);
        }
        
        if (!documentType) {
          const step2Result = await executeStep2Classification(baseName, extractedText, false);
          if (step2Result.success) {
            documentType = step2Result.data.documentType;
            result.document_type = documentType;
          } else throw new Error(`Paso 2 requerido falló: ${step2Result.error}`);
        }
        
        if (!metadataResult) {
          const step3Result = await executeStep3MetadataExtraction(documentType, extractedText, false);
          if (step3Result.success) {
            metadataResult = step3Result.data;
            result.extracted_data = metadataResult;
          } else throw new Error(`Paso 3 requerido falló: ${step3Result.error}`);
        }
      }
      
      console.log('🎨 [PASO 5] Verificando compatibilidad con templates...');
      const step5Result = await executeStep5TemplateCompatibility(documentType, metadataResult, config.verbose);
      result.phases.step5_template_compatibility = step5Result;
      
      // Debug para ver error específico del paso 5
      if (!step5Result.success && config.verbose) {
        console.log(`   ❌ PASO 5 ERROR: ${step5Result.error}`);
      }
    }

    // PASO 6: VALIDACIÓN SCHEMA BD
    if (config.steps.includes(6)) {
      // Si no tenemos datos previos pero necesitamos paso 6, ejecutar pasos 1-3 automáticamente
      if (!metadataResult || !documentType || !extractedText) {
        console.log('🔄 [PASO 6] Requiere datos previos - ejecutando pasos 1-3 automáticamente...');
        
        if (!extractedText) {
          const step1Result = await executeStep1Extraction(baseName, false);
          if (step1Result.success) extractedText = step1Result.data;
          else throw new Error(`Paso 1 requerido falló: ${step1Result.error}`);
        }
        
        if (!documentType) {
          const step2Result = await executeStep2Classification(baseName, extractedText, false);
          if (step2Result.success) {
            documentType = step2Result.data.documentType;
            result.document_type = documentType;
          } else throw new Error(`Paso 2 requerido falló: ${step2Result.error}`);
        }
        
        if (!metadataResult) {
          const step3Result = await executeStep3MetadataExtraction(documentType, extractedText, false);
          if (step3Result.success) {
            metadataResult = step3Result.data;
            result.extracted_data = metadataResult;
          } else throw new Error(`Paso 3 requerido falló: ${step3Result.error}`);
        }
      }
      
      console.log('🔧 [PASO 6] Validando contra schema BD...');
      const step6Result = await executeStep6SchemaValidation(documentType, metadataResult, config.verbose);
      result.phases.step6_schema_validation = step6Result;
      
      // Debug para ver error específico del paso 6
      if (!step6Result.success && config.verbose) {
        console.log(`   ❌ PASO 6 ERROR: ${step6Result.error}`);
      }
    }

    // Evaluar éxito general
    const executedPhases = config.steps.map(step => {
      switch(step) {
        case 1: return result.phases.step1_extraction;
        case 2: return result.phases.step2_classification;
        case 3: return result.phases.step3_metadata;
        case 4: return result.phases.step4_validation;
        case 5: return result.phases.step5_template_compatibility;
        case 6: return result.phases.step6_schema_validation;
        default: return { success: false };
      }
    });

    result.success = executedPhases.every(phase => phase.success);

  } catch (error) {
    console.log(`❌ [E2E MODERNIZADO] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.success = false;
  }

  result.total_time = Date.now() - startTime;
  console.log(`⏱️  [E2E MODERNIZADO] Tiempo total: ${result.total_time}ms`);
  console.log(`${result.success ? '✅' : '❌'} [E2E MODERNIZADO] Resultado: ${result.success ? 'ÉXITO' : 'FALLO'}\\n`);
  
  return result;
}

async function executeStep1Extraction(baseName: string, verbose: boolean): Promise<E2EPhaseResult> {
  const stepStart = Date.now();
  
  try {
    const pdfPath = path.join(__dirname, '../../../../datos/pdf', `${baseName}.pdf`);
    
    // Verificar archivo existe
    try {
      await fs.access(pdfPath);
    } catch {
      return { 
        success: false, 
        error: `Archivo no encontrado: ${baseName}.pdf` 
      };
    }
    
    // Leer y extraer texto
    const buffer = await fs.readFile(pdfPath);
    const extractionContext = {
      buffer,
      filename: `${baseName}.pdf`,
      documentId: 'test-doc-id',
      minTextLength: 50
    };
    
    const textFactory = new TextExtractionFactory();
    const extractionResult = await textFactory.extractText(extractionContext);
    
    if (!extractionResult.success || !extractionResult.text) {
      return {
        success: false,
        error: extractionResult.error || 'No se pudo extraer texto'
      };
    }
    
    const duration = Date.now() - stepStart;
    if (verbose) {
      console.log(`   ✅ Extraído: ${extractionResult.text.length} caracteres con ${extractionResult.method} en ${duration}ms`);
    }
    
    return {
      success: true,
      data: extractionResult.text,
      metrics: {
        duration,
        size: extractionResult.text.length,
        method: extractionResult.method || 'unknown'
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error extracción: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

async function executeStep2Classification(baseName: string, extractedText: string, verbose: boolean): Promise<E2EPhaseResult> {
  const stepStart = Date.now();
  
  try {
    const classifier = new DocumentClassifier();
    const classificationResult = await classifier.classifyDocument({
      filename: `${baseName}.pdf`,
      extractedText: extractedText,
      useAI: true
    });
    
    if (!classificationResult.documentType || classificationResult.confidence < 0.3) {
      return {
        success: false,
        error: `Clasificación falló: ${classificationResult.reasoning || 'Confianza baja'}`
      };
    }
    
    const duration = Date.now() - stepStart;
    if (verbose) {
      console.log(`   ✅ Clasificado: ${classificationResult.documentType} (${(classificationResult.confidence * 100).toFixed(1)}%) en ${duration}ms`);
    }
    
    return {
      success: true,
      data: classificationResult,
      metrics: {
        duration,
        confidence: classificationResult.confidence
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error clasificación: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

async function executeStep3MetadataExtraction(documentType: string, extractedText: string, verbose: boolean): Promise<E2EPhaseResult> {
  const stepStart = Date.now();
  
  try {
    // Obtener configuración del agente para construir el prompt
    const configs = getDocumentConfigs();
    const agentConfig = configs[documentType];
    
    if (!agentConfig) {
      return {
        success: false,
        error: `No hay configuración de agente para tipo: ${documentType}`
      };
    }
    
    // Leer prompt desde archivo (como hace el sistema real)
    const projectRoot = path.join(__dirname, '../../../..');
    const promptPath = path.join(projectRoot, 'prompts', `${agentConfig.agentName}_prompt.md`);
    let promptTemplate: string;
    
    try {
      const fsSync = require('fs');
      promptTemplate = fsSync.readFileSync(promptPath, 'utf-8');
    } catch (error) {
      return {
        success: false,
        error: `No se pudo leer prompt: ${promptPath}`
      };
    }
    
    // Reemplazar variables en el prompt
    const finalPrompt = promptTemplate.replace('{document_text}', extractedText);
    
    // Usar función directa - NO REQUIERE NEXT.JS CONTEXT
    const metadataResult = await callGeminiDirect(finalPrompt, agentConfig.agentName);
    
    if (!metadataResult.success || !metadataResult.data) {
      return {
        success: false,
        error: metadataResult.error || 'Metadata extraction failed'
      };
    }
    
    const fieldCount = Object.keys(metadataResult.data).length;
    const duration = Date.now() - stepStart;
    
    if (verbose) {
      console.log(`   ✅ Extraído: ${fieldCount} campos en ${duration}ms`);
      console.log(`   📋 Campos: ${Object.keys(metadataResult.data).join(', ')}`);
    }
    
    return {
      success: true,
      data: metadataResult.data,
      metrics: {
        duration,
        fields_count: fieldCount
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error extracción metadata: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

async function executeStep4DataValidation(documentType: string, extractedData: any, verbose: boolean): Promise<E2EPhaseResult> {
  const stepStart = Date.now();
  
  try {
    // El paso 4 valida que los datos extraídos son correctos y completos
    // No necesitamos parseAgentResponse aquí porque ya tenemos datos válidos del paso 3
    
    // Validaciones básicas de integridad de datos
    const validationErrors = [];
    
    // 1. Verificar que hay datos
    if (!extractedData || typeof extractedData !== 'object') {
      validationErrors.push('Datos extraídos inválidos o vacíos');
    }
    
    // 2. Verificar campos mínimos según el tipo de documento
    const requiredFields = getRequiredFieldsForType(documentType);
    for (const field of requiredFields) {
      if (!extractedData[field] || extractedData[field] === '') {
        validationErrors.push(`Campo requerido faltante: ${field}`);
      }
    }
    
    // 3. Validar tipos de datos específicos - USA SCHEMA REAL
    const typeConfig = getTypeConfig(documentType);
    if (typeConfig) {
      // Validar campos numéricos según schema
      const allFields = [
        ...(typeConfig.database_schema?.primary_fields || []),
        ...(typeConfig.database_schema?.detail_fields || []),
        ...(typeConfig.database_schema?.topic_fields || [])
      ];
      
      allFields.forEach(fieldDef => {
        const fieldName = fieldDef.name;
        const fieldType = fieldDef.type;
        
        if (extractedData[fieldName] !== undefined && extractedData[fieldName] !== null) {
          // Validar campos numéricos (integer, decimal, money)
          if (['integer', 'decimal', 'money', 'numeric'].includes(fieldType)) {
            if (typeof extractedData[fieldName] !== 'number') {
              if (typeof extractedData[fieldName] === 'string' && !isNaN(Number(extractedData[fieldName]))) {
                extractedData[fieldName] = Number(extractedData[fieldName]);
              } else {
                validationErrors.push(`Campo ${fieldName} debe ser numérico`);
              }
            }
          }
          
          // Validar campos de fecha
          if (['date', 'timestamp', 'timestamptz'].includes(fieldType)) {
            if (!isValidDate(extractedData[fieldName])) {
              validationErrors.push(`Fecha inválida en campo: ${fieldName}`);
            }
          }
          
          // Validar campos boolean
          if (fieldType === 'boolean') {
            if (typeof extractedData[fieldName] !== 'boolean') {
              validationErrors.push(`Campo ${fieldName} debe ser boolean`);
            }
          }
        }
      });
    }
    
    const isValid = validationErrors.length === 0;
    const duration = Date.now() - stepStart;
    
    if (verbose) {
      console.log(`   ${isValid ? '✅' : '❌'} Validación: ${isValid ? 'ÉXITO' : 'ERRORES ENCONTRADOS'} en ${duration}ms`);
      if (!isValid) {
        validationErrors.forEach(error => console.log(`     - ${error}`));
      }
    }
    
    return {
      success: isValid,
      data: { validationErrors, validatedData: extractedData },
      metrics: {
        duration
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error validación: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

// Helper function para obtener campos requeridos por tipo de documento - USA SCHEMA REAL
function getRequiredFieldsForType(documentType: string): string[] {
  try {
    const typeConfig = getTypeConfig(documentType);
    if (!typeConfig) {
      return []; // No hay configuración para este tipo
    }
    
    // Obtener campos requeridos del schema real
    const requiredFields = [];
    
    // Primary fields marcados como required
    if (typeConfig.database_schema?.primary_fields) {
      typeConfig.database_schema.primary_fields.forEach(field => {
        if (field.required) {
          requiredFields.push(field.name);
        }
      });
    }
    
    // Detail fields marcados como required  
    if (typeConfig.database_schema?.detail_fields) {
      typeConfig.database_schema.detail_fields.forEach(field => {
        if (field.required) {
          requiredFields.push(field.name);
        }
      });
    }
    
    // Si no hay campos marcados como required, usar algunos campos básicos importantes
    if (requiredFields.length === 0 && typeConfig.database_schema?.primary_fields) {
      // Tomar los primeros 2-3 campos como mínimos para validación básica
      const basicFields = typeConfig.database_schema.primary_fields.slice(0, 2);
      basicFields.forEach(field => {
        requiredFields.push(field.name);
      });
    }
    
    return requiredFields;
    
  } catch (error) {
    console.warn(`Error obteniendo campos requeridos para ${documentType}:`, error);
    return []; // En caso de error, no requerir campos específicos
  }
}

// Helper function para validar fechas
function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

async function executeStep5TemplateCompatibility(documentType: string, extractedData: any, verbose: boolean): Promise<E2EPhaseResult> {
  const stepStart = Date.now();
  
  try {
    // Obtener schema desde document-types-schema.json
    const typeConfig = getTypeConfig(documentType);
    if (!typeConfig) {
      return {
        success: false,
        error: `No hay configuración para tipo: ${documentType}`
      };
    }
    
    // Verificar campos del template UI
    const uiFields = typeConfig.ui_template.sections.flatMap(section => section.fields);
    const extractedFields = Object.keys(extractedData);
    
    const missingFields = uiFields.filter(field => !extractedFields.includes(field));
    const extraFields = extractedFields.filter(field => !uiFields.includes(field));
    
    const compatibilityScore = ((uiFields.length - missingFields.length) / uiFields.length) * 100;
    const isCompatible = compatibilityScore >= 70; // Umbral de compatibilidad
    
    const duration = Date.now() - stepStart;
    if (verbose) {
      console.log(`   ${isCompatible ? '✅' : '⚠️'} Template: ${compatibilityScore.toFixed(1)}% compatibilidad en ${duration}ms`);
      if (missingFields.length > 0) console.log(`   📝 Campos faltantes: ${missingFields.join(', ')}`);
      if (extraFields.length > 0) console.log(`   📋 Campos extra: ${extraFields.slice(0, 5).join(', ')}${extraFields.length > 5 ? '...' : ''}`);
    }
    
    return {
      success: isCompatible,
      data: { compatibilityScore, missingFields, extraFields },
      metrics: {
        duration,
        compatibility_score: compatibilityScore
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error compatibilidad template: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

async function executeStep6SchemaValidation(documentType: string, extractedData: any, verbose: boolean): Promise<E2EPhaseResult> {
  const stepStart = Date.now();
  
  try {
    // Obtener schema BD desde document-types-schema.json
    const typeConfig = getTypeConfig(documentType);
    if (!typeConfig) {
      return {
        success: false,
        error: `No hay schema BD para tipo: ${documentType}`
      };
    }
    
    // Combinar todos los campos esperados en BD
    const allExpectedFields = [
      ...typeConfig.database_schema.primary_fields.map(f => f.name),
      ...typeConfig.database_schema.detail_fields.map(f => f.name),
      ...(typeConfig.database_schema.topic_fields || []).map(f => f.name),
      // NOTA: Campos base estándar que aparecen en todas las tablas BD
      // Estos están definidos individualmente en el schema pero no como "base_fields"
      // TODO: Mover a una sección "base_fields" en document-types-schema.json
      'id', 'document_id', 'organization_id', 'created_at'
    ];
    
    const extractedFields = Object.keys(extractedData);
    const unknownFields = extractedFields.filter(field => !allExpectedFields.includes(field));
    const requiredFields = typeConfig.database_schema.primary_fields
      .filter(f => f.required)
      .map(f => f.name);
    const missingRequired = requiredFields.filter(field => !extractedFields.includes(field));
    
    const isValid = unknownFields.length === 0 && missingRequired.length === 0;
    
    const duration = Date.now() - stepStart;
    if (verbose) {
      console.log(`   ${isValid ? '✅' : '❌'} Schema BD: ${isValid ? 'VÁLIDO' : 'INVÁLIDO'} en ${duration}ms`);
      if (unknownFields.length > 0) console.log(`   🔸 Campos desconocidos: ${unknownFields.join(', ')}`);
      if (missingRequired.length > 0) console.log(`   🔸 Campos requeridos faltantes: ${missingRequired.join(', ')}`);
    }
    
    return {
      success: isValid,
      data: { unknownFields, missingRequired, totalExpected: allExpectedFields.length },
      metrics: {
        duration
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: `Error validación schema: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

async function generateModernizedReport(results: E2ETestResult[], config: E2ETestConfig) {
  console.log('\\n📊 [E2E MODERNIZADO] ===== REPORTE FINAL =====');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`📈 [E2E MODERNIZADO] Resumen General:`);
  console.log(`   - Total archivos: ${results.length}`);
  console.log(`   - Exitosos E2E: ${successful.length} (${(successful.length/results.length*100).toFixed(1)}%)`);
  console.log(`   - Fallidos: ${failed.length}`);
  console.log(`   - Pasos ejecutados: ${config.steps.join(', ')}`);
  
  // Estadísticas por paso
  if (results.length > 0) {
    console.log(`\\n📋 [E2E MODERNIZADO] Éxito por Paso:`);
    config.steps.forEach(step => {
      const stepKeys = {
        1: 'step1_extraction',
        2: 'step2_classification', 
        3: 'step3_metadata',
        4: 'step4_validation',
        5: 'step5_template_compatibility',
        6: 'step6_schema_validation'
      } as const;
      
      const stepKey = stepKeys[step as keyof typeof stepKeys] as keyof E2ETestResult['phases'];
      const successCount = results.filter(r => r.phases[stepKey]?.success).length;
      const stepName = PIPELINE_STEPS[step].description;
      console.log(`   - Paso ${step} (${stepName}): ${successCount}/${results.length} (${(successCount/results.length*100).toFixed(1)}%)`);
    });
  }
  
  // Estadísticas por tipo de documento
  const byType: Record<string, E2ETestResult[]> = {};
  results.forEach(r => {
    const type = r.document_type || 'desconocido';
    if (!byType[type]) byType[type] = [];
    byType[type].push(r);
  });
  
  console.log(`\\n🎯 [E2E MODERNIZADO] Resultados por Tipo:`);
  Object.entries(byType).forEach(([type, typeResults]) => {
    const successfulType = typeResults.filter(r => r.success);
    console.log(`   - ${type}: ${successfulType.length}/${typeResults.length} (${(successfulType.length/typeResults.length*100).toFixed(1)}%)`);
  });
  
  // Archivos fallidos con detalles
  if (failed.length > 0) {
    console.log(`\\n❌ [E2E MODERNIZADO] Archivos Fallidos:`);
    failed.slice(0, 5).forEach(f => {  // Mostrar máximo 5
      console.log(`   - ${f.filename} (${f.document_type || 'tipo desconocido'}):`);
      config.steps.forEach(step => {
        const stepKey = `step${step}_${Object.keys(PIPELINE_STEPS)[step-1].toLowerCase().split('_')[0]}` as keyof E2ETestResult['phases'];
        const phase = f.phases[stepKey];
        if (phase && !phase.success && phase.error) {
          console.log(`     └─ Paso ${step}: ${phase.error}`);
        }
      });
    });
    if (failed.length > 5) {
      console.log(`   ... y ${failed.length - 5} archivos más fallidos`);
    }
  }
  
  // Guardar reporte detallado
  const outputDir = path.join(__dirname, '../../../../datos/e2e-reports');
  await fs.mkdir(outputDir, { recursive: true });
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportFile = path.join(outputDir, `e2e-modernized-${timestamp}.json`);
  
  await fs.writeFile(reportFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    config: {
      target_file: config.targetFile,
      steps_executed: config.steps,
      verbose: config.verbose
    },
    summary: {
      total: results.length,
      successful: successful.length,
      failed: failed.length,
      success_rate: results.length > 0 ? successful.length / results.length * 100 : 0,
      supported_types: getDocumentTypes(),
      by_type: Object.fromEntries(
        Object.entries(byType).map(([type, typeResults]) => [
          type, 
          {
            count: typeResults.length,
            successful: typeResults.filter(r => r.success).length,
            success_rate: typeResults.filter(r => r.success).length / typeResults.length * 100
          }
        ])
      )
    },
    detailed_results: results
  }, null, 2));
  
  console.log(`\\n💾 [E2E MODERNIZADO] Reporte guardado: ${reportFile}`);
  console.log('🎯 [E2E MODERNIZADO] ¡Test E2E Completado!\\n');
  
  // Mostrar comandos de ejemplo
  console.log('📚 [E2E MODERNIZADO] Ejemplos de uso:');
  console.log('   node test-complete-e2e-validation_1.ts                    # Todos archivos, todos pasos');
  console.log('   node test-complete-e2e-validation_1.ts archivo            # Un archivo, todos pasos');
  console.log('   node test-complete-e2e-validation_1.ts --steps=1          # Todos archivos, solo paso 1');
  console.log('   node test-complete-e2e-validation_1.ts --steps=2-4        # Todos archivos, pasos 2-4');
  console.log('   node test-complete-e2e-validation_1.ts archivo --steps=3  # Un archivo, solo paso 3');
  console.log('   node test-complete-e2e-validation_1.ts --verbose          # Modo verboso');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}