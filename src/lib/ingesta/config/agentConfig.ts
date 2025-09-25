/**
 * ARCHIVO: agentConfig.ts
 * PROPÓSITO: Configuración centralizada para agentes, tokens y timeouts - compartida entre test y producción
 * ESTADO: production
 * DEPENDENCIAS: ninguna
 * OUTPUTS: Configuraciones consistentes para todo el sistema
 * ACTUALIZADO: 2025-09-22
 */

// ===== CONFIGURACIÓN DE TOKENS =====
export const GEMINI_CONFIG = {
  // Modelo por defecto
  MODEL: 'gemini-1.5-flash',
  
  // Configuración base
  BASE: {
    temperature: 0.1, // Respuestas deterministas
    maxOutputTokens: 1000 // Default para agentes simples
  },
  
  // Agentes que necesitan más tokens (documentos complejos)
  COMPLEX_AGENTS: {
    temperature: 0.1,
    maxOutputTokens: 3000,
    agents: [
      'acta_extractor_v2',        // Actas: estructuras complejas + votaciones
      'contrato_extractor_v1',    // Contratos: arrays de obligaciones + plazos
      'factura_extractor_v2',     // Facturas: arrays de productos + detalles
      'escritura_extractor_v1',   // Escrituras: 58 campos complejos + arrays
      'albaran_extractor_v1',     // Albaranes: 19 campos + mercancía JSONB
      'presupuesto_extractor_v1'  // Presupuestos: 25+ campos + arrays JSONB
    ]
  },
  
  // Clasificador de documentos
  CLASSIFIER: {
    temperature: 0.1,
    maxOutputTokens: 2000
  }
} as const;

// ===== CONFIGURACIÓN DE RETRY =====
export const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelayMs: 1000,
  logPrefix: '[AGENT RETRY]'
} as const;

// ===== CONFIGURACIÓN DE TIMEOUTS =====
export const TIMEOUT_CONFIG = {
  // Extracción de texto
  textExtraction: 30000,    // 30 segundos
  pdfParsing: 30000,        // 30 segundos
  
  // Agentes IA
  agentCall: 60000,         // 60 segundos para agentes complejos
  classification: 30000,    // 30 segundos para clasificación
} as const;

// ===== HELPERS =====

/**
 * Obtiene la configuración de Gemini para un agente específico
 */
export function getGeminiConfigForAgent(agentName: string) {
  // Verificar si es un agente complejo
  if (GEMINI_CONFIG.COMPLEX_AGENTS.agents.includes(agentName)) {
    return {
      model: GEMINI_CONFIG.MODEL,
      temperature: GEMINI_CONFIG.COMPLEX_AGENTS.temperature,
      maxOutputTokens: GEMINI_CONFIG.COMPLEX_AGENTS.maxOutputTokens,
      topK: 40,
      topP: 0.95,
      timeout: TIMEOUT_CONFIG.agentCall
    };
  }
  
  // Verificar si es el clasificador
  if (agentName.includes('classifier') || agentName.includes('classification')) {
    return {
      model: GEMINI_CONFIG.MODEL,
      temperature: GEMINI_CONFIG.CLASSIFIER.temperature,
      maxOutputTokens: GEMINI_CONFIG.CLASSIFIER.maxOutputTokens,
      topK: 40,
      topP: 0.95,
      timeout: TIMEOUT_CONFIG.classification
    };
  }
  
  // Configuración base para agentes simples
  return {
    model: GEMINI_CONFIG.MODEL,
    temperature: GEMINI_CONFIG.BASE.temperature,
    maxOutputTokens: GEMINI_CONFIG.BASE.maxOutputTokens,
    topK: 40,
    topP: 0.95,
    timeout: TIMEOUT_CONFIG.agentCall
  };
}

/**
 * Verifica si un agente necesita configuración de tokens alta
 */
export function isComplexAgent(agentName: string): boolean {
  return GEMINI_CONFIG.COMPLEX_AGENTS.agents.includes(agentName);
}

/**
 * Lista de todos los agentes complejos (para debugging)
 */
export function getComplexAgents(): readonly string[] {
  return GEMINI_CONFIG.COMPLEX_AGENTS.agents;
}