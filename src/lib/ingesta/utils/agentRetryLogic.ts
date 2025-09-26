/**
 * ARCHIVO: agentRetryLogic.ts
 * PROPÓSITO: Lógica común de retry para llamadas a agentes SaaS con manejo de errores JSON
 * ESTADO: production
 * DEPENDENCIAS: saasAgents.ts
 * OUTPUTS: Utility function para llamadas robustas a agentes
 * ACTUALIZADO: 2025-09-22
 */

import { callSaaSAgent } from '../../agents/AgentOrchestrator';
import { RETRY_CONFIG } from '../config/agentConfig';

export interface RetryOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  useServiceClient?: boolean;
  logPrefix?: string;
}

export interface AgentRetryResult {
  success: boolean;
  data?: any;
  error?: string;
  retryCount: number;
  processingTime: number;
}

/**
 * Llama a un agente SaaS con lógica de retry robusta para manejar:
 * - JSON truncado/malformado
 * - Timeouts temporales
 * - Errores de red
 */
export async function callAgentWithRetry(
  agentName: string,
  data: Record<string, any>,
  options: RetryOptions = {}
): Promise<AgentRetryResult> {
  const {
    maxRetries = RETRY_CONFIG.maxRetries,
    retryDelayMs = RETRY_CONFIG.retryDelayMs,
    useServiceClient = false,
    logPrefix = RETRY_CONFIG.logPrefix
  } = options;

  const startTime = Date.now();
  let lastError: string = '';
  
  for (let retryCount = 0; retryCount <= maxRetries; retryCount++) {
    try {
      const agentResult = await callSaaSAgent(agentName, data, useServiceClient);
      
      const processingTime = Date.now() - startTime;
      
      if (agentResult.success && agentResult.data) {
        if (retryCount > 0) {
          console.log(`✅ ${logPrefix} Éxito en retry ${retryCount}/${maxRetries} para agente: ${agentName}`);
        }
        
        return {
          success: true,
          data: agentResult.data,
          retryCount,
          processingTime
        };
      } else {
        lastError = agentResult.error || 'Agent returned no data';
        throw new Error(lastError);
      }
    } catch (error) {
      lastError = error.message || String(error);
      
      if (retryCount < maxRetries) {
        console.warn(`🔄 ${logPrefix} Retry ${retryCount + 1}/${maxRetries} para ${agentName}: ${lastError}`);
        
        // Esperar antes del siguiente retry
        if (retryDelayMs > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        }
      } else {
        console.error(`❌ ${logPrefix} Agente ${agentName} falló después de ${maxRetries} reintentos: ${lastError}`);
      }
    }
  }

  return {
    success: false,
    error: lastError,
    retryCount: maxRetries,
    processingTime: Date.now() - startTime
  };
}

/**
 * Versión específica para tests con logging personalizado
 */
export async function callAgentForTest(
  agentName: string,
  documentText: string,
  logPrefix: string = '[TEST]'
): Promise<AgentRetryResult> {
  return callAgentWithRetry(
    agentName,
    { document_text: documentText },
    {
      maxRetries: RETRY_CONFIG.maxRetries,
      retryDelayMs: RETRY_CONFIG.retryDelayMs,
      useServiceClient: true,
      logPrefix
    }
  );
}