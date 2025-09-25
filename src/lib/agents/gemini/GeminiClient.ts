/**
 * ARCHIVO: GeminiClient.ts
 * PROPÓSITO: Cliente puro para API de Google Gemini, sin lógica de negocio
 * ESTADO: development
 * DEPENDENCIAS: @google/generative-ai, agentConfig
 * OUTPUTS: Respuestas raw de Gemini API
 * ACTUALIZADO: 2025-09-23
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { getGeminiConfigForAgent, TIMEOUT_CONFIG } from '../../ingesta/config/agentConfig';

export interface GeminiResponse {
  success: boolean;
  text?: string;
  error?: string;
  metadata?: {
    model: string;
    processingTime: number;
  };
}

let genAI: GoogleGenerativeAI | null = null;

/**
 * Inicializa cliente Gemini singleton
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Obtiene modelo configurado para un agente específico
 */
function getModelForAgent(agentName: string): GenerativeModel {
  const genAI = getGeminiClient();
  const geminiConfig = getGeminiConfigForAgent(agentName);
  
  return genAI.getGenerativeModel({ 
    model: geminiConfig.model,
    generationConfig: {
      temperature: geminiConfig.temperature,
      topK: geminiConfig.topK,
      topP: geminiConfig.topP,
      maxOutputTokens: geminiConfig.maxOutputTokens,
    },
  });
}

/**
 * Realiza llamada a Gemini API con timeout y manejo de errores
 */
export async function callGeminiAPI(
  prompt: string, 
  agentName: string
): Promise<GeminiResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`[Gemini] Calling model for agent: ${agentName}`);
    
    const model = getModelForAgent(agentName);
    const geminiConfig = getGeminiConfigForAgent(agentName);
    
    // Configurar timeout
    const timeout = geminiConfig.timeout || TIMEOUT_CONFIG.gemini.default;
    
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Gemini timeout after ${timeout}ms`)), timeout)
      )
    ]);

    const response = result as any;
    const text = response.response.text();
    const processingTime = Date.now() - startTime;
    
    console.log(`[Gemini] Response received: ${text.substring(0, 100)}...`);
    
    return {
      success: true,
      text,
      metadata: {
        model: geminiConfig.model,
        processingTime
      }
    };
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[Gemini] Error:`, error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Gemini API error',
      metadata: {
        model: 'unknown',
        processingTime
      }
    };
  }
}