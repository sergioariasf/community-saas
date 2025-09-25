/**
 * ARCHIVO: ResponseParser.ts
 * PROPÓSITO: Parsing y limpieza de respuestas JSON de Gemini - 100% DINÁMICO
 * ESTADO: development
 * DEPENDENCIAS: schemaBasedConfig para auto-discovery
 * OUTPUTS: Datos parseados y validados dinámicamente
 * ACTUALIZADO: 2025-09-24
 */

import { getDocumentConfigs } from '../../ingesta/core/schemaBasedConfig';

export interface ParsedResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    agent: string;
    validationType?: string;
  };
}

/**
 * Parsea respuesta raw de Gemini y aplica validaciones según el agente - DINÁMICO
 */
export async function parseAgentResponse(
  agentName: string, 
  rawResponse: string
): Promise<ParsedResponse> {
  try {
    // Limpiar JSON de markdown code blocks
    const cleanedResponse = cleanJSONResponse(rawResponse);
    
    if (!cleanedResponse) {
      return {
        success: false,
        error: `No se encontró JSON válido en respuesta de ${agentName}`,
        metadata: { agent: agentName }
      };
    }

    // Parsear JSON
    let parsed: any;
    try {
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.warn(`[Response Parser] JSON parse error for ${agentName}:`, parseError);
      console.warn(`[Response Parser] Raw response:`, rawResponse.substring(0, 500));
      
      return {
        success: false,
        error: `JSON inválido desde agente ${agentName}: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`,
        metadata: { agent: agentName }
      };
    }

    // Aplicar validación específica según el agente - DINÁMICO
    const validatedData = await applyAgentValidation(agentName, parsed);
    
    return {
      success: true,
      data: validatedData,
      metadata: { 
        agent: agentName,
        validationType: await getValidationType(agentName)
      }
    };

  } catch (error) {
    console.error(`[Response Parser] Error processing ${agentName} response:`, error);
    
    return {
      success: false,
      error: `Error procesando respuesta de ${agentName}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      metadata: { agent: agentName }
    };
  }
}

/**
 * Limpia respuestas JSON de markdown code blocks y otros artifacts
 */
function cleanJSONResponse(rawResponse: string): string | null {
  if (!rawResponse || typeof rawResponse !== 'string') {
    return null;
  }

  let cleanText = rawResponse.trim();
  
  // Remover markdown code blocks
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
  }
  
  // Verificar que empiece y termine con llaves
  const jsonStart = cleanText.indexOf('{');
  const jsonEnd = cleanText.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
    return null;
  }
  
  return cleanText.substring(jsonStart, jsonEnd + 1);
}

/**
 * Aplica validación específica según el tipo de agente - 100% DINÁMICO
 */
async function applyAgentValidation(agentName: string, data: any): Promise<any> {
  try {
    // 1. Auto-discovery de agentes desde schema
    const documentConfigs = getDocumentConfigs();
    const extractorAgents = Object.values(documentConfigs).map(config => config.agentName);
    
    // 2. Si no es un agente extractor, devolver sin validar
    if (!extractorAgents.includes(agentName)) {
      return data;
    }
    
    // 3. Encontrar el tipo de documento para este agente
    const documentType = Object.keys(documentConfigs).find(
      type => documentConfigs[type].agentName === agentName
    );
    
    if (!documentType) {
      console.warn(`[ResponseParser] Document type not found for agent: ${agentName}`);
      return data;
    }
    
    // 4. Cargar dinámicamente el validador correspondiente
    const validatorName = getValidatorNameByConvention(documentType);
    const validationResult = await loadAndApplyValidator(validatorName, data);
    
    return validationResult || data;
    
  } catch (error) {
    console.error(`[ResponseParser] Dynamic validation error for ${agentName}:`, error);
    return data; // Fallback: devolver datos sin validar
  }
}

/**
 * Genera el nombre del validador siguiendo convenciones
 */
function getValidatorNameByConvention(documentType: string): string {
  const typeToValidator = {
    'acta': 'ActaValidator',
    'escritura': 'EscrituraValidator', 
    'albaran': 'AlbaranValidator',
    'factura': 'FacturaValidator',
    'comunicado': 'ComunicadoValidator',
    'contrato': 'ContratoValidator',
    'presupuesto': 'PresupuestoValidator'
  };
  
  return typeToValidator[documentType as keyof typeof typeToValidator] || 'DefaultValidator';
}

/**
 * Carga dinámicamente un validador y aplica la validación
 */
async function loadAndApplyValidator(validatorName: string, data: any): Promise<any> {
  try {
    // Mapeo de validadores a funciones específicas
    const validatorFunctions = {
      'ActaValidator': async () => {
        const { validateMinutesData } = await import('../validation/ActaValidator');
        return validateMinutesData(data);
      },
      'EscrituraValidator': async () => {
        const { validateEscrituraData } = await import('../validation/EscrituraValidator');
        return validateEscrituraData(data);
      },
      'AlbaranValidator': async () => {
        try {
          const { validateAlbaranData } = await import('../validation/AlbaranValidator');
          return validateAlbaranData(data);
        } catch (error) {
          console.warn(`[ResponseParser] AlbaranValidator not found, skipping validation`);
          return data;
        }
      },
      'FacturaValidator': async () => {
        try {
          const { validateFacturaData } = await import('../validation/FacturaValidator');
          return validateFacturaData(data);
        } catch (error) {
          console.warn(`[ResponseParser] FacturaValidator not found, skipping validation`);
          return data;
        }
      },
      'ComunicadoValidator': async () => {
        try {
          const { validateComunicadoData } = await import('../validation/ComunicadoValidator');
          return validateComunicadoData(data);
        } catch (error) {
          console.warn(`[ResponseParser] ComunicadoValidator not found, skipping validation`);
          return data;
        }
      },
      'ContratoValidator': async () => {
        try {
          const { validateContratoData } = await import('../validation/ContratoValidator');
          return validateContratoData(data);
        } catch (error) {
          console.warn(`[ResponseParser] ContratoValidator not found, skipping validation`);
          return data;
        }
      },
      'PresupuestoValidator': async () => {
        try {
          const { validatePresupuestoData } = await import('../validation/PresupuestoValidator');
          return validatePresupuestoData(data);
        } catch (error) {
          console.warn(`[ResponseParser] PresupuestoValidator not found, skipping validation`);
          return data;
        }
      }
    };

    const validatorFunction = validatorFunctions[validatorName as keyof typeof validatorFunctions];
    if (validatorFunction) {
      return await validatorFunction();
    }

    console.warn(`[ResponseParser] No validator function found for: ${validatorName}`);
    return data;
    
  } catch (error) {
    console.error(`[ResponseParser] Error loading validator ${validatorName}:`, error);
    return data;
  }
}

/**
 * Obtiene el tipo de validación aplicada - 100% DINÁMICO
 */
async function getValidationType(agentName: string): Promise<string> {
  try {
    // 1. Auto-discovery de agentes desde schema
    const documentConfigs = getDocumentConfigs();
    
    // 2. Encontrar el tipo de documento para este agente
    const documentType = Object.keys(documentConfigs).find(
      type => documentConfigs[type].agentName === agentName
    );
    
    if (!documentType) {
      return 'none';
    }
    
    // 3. Obtener nombre del validador por convención
    const validatorName = getValidatorNameByConvention(documentType);
    
    // 4. Verificar si el validador existe
    try {
      if (validatorName === 'ActaValidator') {
        await import('../validation/ActaValidator');
        return 'ActaValidator';
      } else if (validatorName === 'EscrituraValidator') {
        await import('../validation/EscrituraValidator');
        return 'EscrituraValidator';
      } else if (validatorName === 'AlbaranValidator') {
        await import('../validation/AlbaranValidator');
        return 'AlbaranValidator';
      } else if (validatorName === 'FacturaValidator') {
        await import('../validation/FacturaValidator');
        return 'FacturaValidator';
      } else if (validatorName === 'ComunicadoValidator') {
        await import('../validation/ComunicadoValidator');
        return 'ComunicadoValidator';
      } else if (validatorName === 'ContratoValidator') {
        await import('../validation/ContratoValidator');
        return 'ContratoValidator';
      } else if (validatorName === 'PresupuestoValidator') {
        await import('../validation/PresupuestoValidator');
        return 'PresupuestoValidator';
      }
    } catch (error) {
      // Validador no existe, devolver 'pending'
      return `${validatorName} (pending)`;
    }
    
    return 'none';
    
  } catch (error) {
    console.error(`[ResponseParser] Error determining validation type for ${agentName}:`, error);
    return 'error';
  }
}