/**
 * ARCHIVO: AgentOrchestrator.ts
 * PROPÓSITO: Orquesta todas las capas - reemplaza la función callSaaSAgent principal
 * ESTADO: development
 * DEPENDENCIAS: GeminiClient, PromptBuilder, ResponseParser, Supabase
 * OUTPUTS: Respuestas procesadas y validadas de agentes
 * ACTUALIZADO: 2025-09-23
 */

'use server';

import { createSupabaseClient, createSupabaseServiceClient } from '@/supabase-clients/server';
import { callGeminiAPI } from './gemini/GeminiClient';
import { buildPrompt } from './gemini/PromptBuilder';
import { parseAgentResponse } from './gemini/ResponseParser';

export interface SaaSAgent {
  id: string;
  name: string;
  purpose: string;
  prompt_template: string;
  variables: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    agent: string;
    tokensUsed?: number;
    processingTime?: number;
    method?: string;
  };
}

/**
 * Función principal que orquesta todo el flujo de agentes
 * Reemplaza callSaaSAgent de saasAgents.ts manteniendo misma interface
 */
/**
 * Función especializada para análisis de PDF con OCR usando Gemini
 */
export async function callGeminiFlashOCRIA(
  pdfBuffer: Buffer,
  agentName: string,
  agentPrompt: string
): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`[Gemini Flash OCR IA] Starting analysis for agent: ${agentName}`);
    console.log(`[Gemini Flash OCR IA] PDF size: ${pdfBuffer.length} bytes`);

    // Preparar datos para Gemini Vision API con PDF
    const inputs = {
      pdfBuffer: pdfBuffer.toString('base64'),
      document_text: `Analyzing PDF with ${pdfBuffer.length} bytes`,
      custom_prompt: agentPrompt
    };

    // Usar el mismo sistema modular pero con datos del PDF
    const prompt = buildPrompt(agentName, agentPrompt, inputs);
    const response = await callGeminiAPI(prompt, agentName);
    const parsedResponse = parseAgentResponse(response, agentName);

    const processingTime = Date.now() - startTime;
    console.log(`[Gemini Flash OCR IA] Completed in ${processingTime}ms`);

    return {
      ...parsedResponse,
      metadata: {
        agent: agentName,
        processingTime,
        pdfSize: pdfBuffer.length
      }
    };
  } catch (error) {
    console.error(`[Gemini Flash OCR IA] Error:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en análisis de PDF',
      metadata: {
        agent: agentName,
        processingTime: Date.now() - startTime
      }
    };
  }
}

export async function callSaaSAgent(
  agentName: string,
  inputs: Record<string, any>,
  useServiceClient = false
): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`[SaaS Agent] Calling agent: ${agentName}`);
    
    // 1. Obtener configuración del agente
    const agentConfig = await getAgentConfig(agentName, useServiceClient);
    if (!agentConfig) {
      return {
        success: false,
        error: `Agent configuration not found: ${agentName}`,
        metadata: { agent: agentName, processingTime: Date.now() - startTime }
      };
    }

    // 2. Construir prompt
    const prompt = buildPrompt(agentConfig.prompt_template, inputs);
    console.log(`[SaaS Agent] Prompt prepared for ${agentName}: ${prompt.substring(0, 100)}...`);

    // 3. Llamar a Gemini API
    const geminiResponse = await callGeminiAPI(prompt, agentName);
    if (!geminiResponse.success) {
      return {
        success: false,
        error: geminiResponse.error,
        metadata: { 
          agent: agentName, 
          processingTime: Date.now() - startTime,
          method: 'gemini-api-error'
        }
      };
    }

    // 4. Parsear y validar respuesta
    const parsedResponse = await parseAgentResponse(agentName, geminiResponse.text!);
    if (!parsedResponse.success) {
      return {
        success: false,
        error: parsedResponse.error,
        metadata: { 
          agent: agentName, 
          processingTime: Date.now() - startTime,
          method: 'response-parsing-error'
        }
      };
    }

    // 5. Preparar respuesta final
    const totalTime = Date.now() - startTime;
    console.log(`[SaaS Agent] ${agentName} completed in ${totalTime}ms`);

    return {
      success: true,
      data: parsedResponse.data,
      metadata: {
        agent: agentName,
        processingTime: totalTime,
        method: 'gemini-flash-orchestrated'
      }
    };

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[SaaS Agent] Exception in ${agentName}:`, error);
    
    return {
      success: false,
      error: `Agent orchestration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      metadata: { 
        agent: agentName, 
        processingTime: totalTime,
        method: 'orchestration-exception'
      }
    };
  }
}

/**
 * Obtiene configuración del agente desde Supabase
 */
async function getAgentConfig(agentName: string, useServiceClient = false): Promise<SaaSAgent | null> {
  try {
    const supabase = useServiceClient ? createSupabaseServiceClient() : await createSupabaseClient();
    
    const { data: agent, error } = await supabase
      .from('agents')
      .select('id, name, purpose, prompt_template, variables')
      .eq('name', agentName)
      .eq('is_active', true)
      .single();

    if (error || !agent) {
      console.error(`[Agent Orchestrator] Agent not found: ${agentName}`, error);
      return null;
    }

    return {
      id: agent.id,
      name: agent.name,
      purpose: agent.purpose,
      prompt_template: agent.prompt_template,
      variables: typeof agent.variables === 'string' ? JSON.parse(agent.variables) : agent.variables
    };
    
  } catch (error) {
    console.error(`[Agent Orchestrator] Error fetching agent config: ${agentName}`, error);
    return null;
  }
}