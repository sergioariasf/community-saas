'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createSupabaseClient } from '@/supabase-clients/server';

/**
 * Integración con agentes SaaS usando Gemini Flash 1.5
 * Implementa el sistema de agentes según L1.7_PLAN_SIMPLE.md
 */

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
  };
}

// Inicializar cliente Gemini
let genAI: GoogleGenerativeAI | null = null;

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
 * Llama a un agente SaaS específico con texto de documento
 */
export async function callSaaSAgent(
  agentName: string, 
  inputs: Record<string, any>
): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    console.log(`[SaaS Agent] Calling agent: ${agentName}`);
    
    // 1. Obtener configuración del agente desde BD
    const agent = await getAgentConfig(agentName);
    if (!agent) {
      return {
        success: false,
        error: `Agent '${agentName}' not found`,
        metadata: { agent: agentName }
      };
    }

    // 2. Preparar el prompt con variables
    const prompt = buildPrompt(agent.prompt_template, inputs);
    console.log(`[SaaS Agent] Prompt prepared for ${agentName}: ${prompt.substring(0, 100)}...`);

    // 3. Llamar a Gemini
    const geminiResponse = await callGemini(prompt, agentName);
    if (!geminiResponse.success) {
      return geminiResponse;
    }

    // 4. Procesar respuesta según el tipo de agente
    const processedData = processAgentResponse(agentName, geminiResponse.data);

    const processingTime = Date.now() - startTime;
    console.log(`[SaaS Agent] ${agentName} completed in ${processingTime}ms`);

    return {
      success: true,
      data: processedData,
      metadata: {
        agent: agentName,
        processingTime
      }
    };

  } catch (error) {
    console.error(`[SaaS Agent] Error calling ${agentName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: { 
        agent: agentName,
        processingTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Obtiene la configuración de un agente desde la base de datos
 */
async function getAgentConfig(agentName: string): Promise<SaaSAgent | null> {
  try {
    const supabase = await createSupabaseClient();
    
    // Buscar agente global primero, luego específico de organización
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('name', agentName)
      .order('organization_id', { nullsFirst: true }) // Globales primero
      .limit(1)
      .single();

    if (error) {
      console.error(`[Agent Config] Error fetching agent ${agentName}:`, error);
      return null;
    }

    return data as SaaSAgent;
  } catch (error) {
    console.error(`[Agent Config] Error:`, error);
    return null;
  }
}

/**
 * Construye el prompt final reemplazando variables
 */
function buildPrompt(template: string, inputs: Record<string, any>): string {
  let prompt = template;
  
  // Reemplazar variables {variable_name}
  for (const [key, value] of Object.entries(inputs)) {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
  }

  // Agregar instrucciones de formato según el tipo de agente
  const formatInstructions = getFormatInstructions(template);
  if (formatInstructions) {
    prompt += '\n\n' + formatInstructions;
  }

  return prompt;
}

/**
 * Obtiene instrucciones de formato específicas según el tipo de agente
 */
function getFormatInstructions(template: string): string {
  // Detectar tipo de agente basado en el template
  if (template.includes('acta') && template.includes('presidente')) {
    return `
IMPORTANTE: Responde SOLO con un JSON válido sin texto adicional:
{
  "president_in": "nombre del presidente entrante o null",
  "president_out": "nombre del presidente saliente o null", 
  "administrator": "nombre del administrador o null",
  "summary": "resumen breve del acta",
  "decisions": "decisiones principales tomadas"
}`;
  }

  if (template.includes('factura') && template.includes('proveedor')) {
    return `
IMPORTANTE: Responde SOLO con un JSON válido sin texto adicional:
{
  "provider_name": "nombre del proveedor",
  "client_name": "nombre del cliente",
  "amount": 123.45,
  "invoice_date": "YYYY-MM-DD",
  "category": "categoría de la factura"
}`;
  }

  if (template.includes('acta') || template.includes('factura')) {
    return `
IMPORTANTE: Responde SOLO con "acta" o "factura", sin texto adicional.`;
  }

  return '';
}

/**
 * Llama a Gemini con el prompt preparado
 */
async function callGemini(prompt: string, agentName: string): Promise<AgentResponse> {
  try {
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash', // Más rápido y económico
      generationConfig: {
        temperature: 0.1, // Respuestas más deterministas para extracción de datos
        maxOutputTokens: (agentName === 'acta_extractor_v2' || agentName === 'contrato_extractor_v1') ? 3000 : 1000, // Más tokens para extractores complejos
      }
    });

    console.log(`[Gemini] Calling model for agent: ${agentName}`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return {
        success: false,
        error: 'Empty response from Gemini',
        metadata: { agent: agentName }
      };
    }

    console.log(`[Gemini] Response received: ${text.substring(0, 100)}...`);
    
    // Auto-parse JSON responses for consistency across all agents
    let responseData = text.trim();
    try {
      // Try to parse as JSON - if successful, return parsed object
      responseData = JSON.parse(text.trim());
      console.log(`[Gemini] JSON parsed successfully for agent: ${agentName}`);
    } catch (parseError) {
      // If parsing fails, return as string (for non-JSON responses)
      console.log(`[Gemini] Response is not JSON for agent: ${agentName}, returning as string`);
    }
    
    return {
      success: true,
      data: responseData,
      metadata: { agent: agentName }
    };

  } catch (error) {
    console.error(`[Gemini] Error:`, error);
    
    // Manejo específico de errores comunes
    let errorMessage = 'Gemini API error';
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Invalid or missing Gemini API key';
      } else if (error.message.includes('quota')) {
        errorMessage = 'Gemini API quota exceeded';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
      metadata: { agent: agentName }
    };
  }
}

/**
 * Procesa la respuesta del agente según su tipo
 */
function processAgentResponse(agentName: string, rawResponse: any): any {
  try {
    // Para el clasificador, la respuesta debe ser simple
    if (agentName === 'document_classifier') {
      const cleaned = rawResponse.toLowerCase().trim();
      if (cleaned.includes('acta')) return 'acta';
      if (cleaned.includes('factura')) return 'factura';
      return null; // Documento no clasificado
    }

    // Para extractores, esperamos JSON
    const extractorAgents = [
      'minutes_extractor', 'invoice_extractor', 'acta_extractor_v2',
      'factura_extractor_v2', 'comunicado_extractor_v1', 'albaran_extractor_v1',
      'contrato_extractor_v1', 'presupuesto_extractor_v1', 'escritura_extractor_v1'
    ];
    
    if (extractorAgents.includes(agentName)) {
      // Si rawResponse ya es un objeto, usarlo directamente
      let parsed;
      if (typeof rawResponse === 'object' && rawResponse !== null) {
        parsed = rawResponse;
      } else if (typeof rawResponse === 'string') {
        // Limpiar la respuesta por si tiene texto extra - buscar JSON en bloques de código o directo
        let jsonMatch = rawResponse.match(/```json\s*(\{[\s\S]*?\})\s*```/) || rawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.warn(`[Agent Response] No JSON found in response of length ${rawResponse.length}:`);
          console.warn(`[Agent Response] Full response (first 2000 chars):`, rawResponse.substring(0, 2000));
          if (rawResponse.length > 2000) {
            console.warn(`[Agent Response] ... (response continues for ${rawResponse.length - 2000} more characters)`);
          }
          return null;
        }
        // Si encontró un match con grupo capturado (```json), usar el grupo 1, sino usar el match completo
        const jsonString = jsonMatch[1] || jsonMatch[0];
        parsed = JSON.parse(jsonString);
      } else {
        console.warn(`[Agent Response] Invalid response type: ${typeof rawResponse}`);
        return null;
      }
      
      // Validar y limpiar datos según el tipo
      if (agentName === 'minutes_extractor' || agentName === 'acta_extractor_v2') {
        return validateMinutesData(parsed);
      } else if (agentName === 'invoice_extractor' || agentName === 'factura_extractor_v2') {
        return validateInvoiceData(parsed);
      } else if (agentName === 'comunicado_extractor_v1') {
        return validateComunicadoData(parsed);
      } else if (agentName === 'albaran_extractor_v1') {
        return validateAlbaranData(parsed);
      } else if (agentName === 'contrato_extractor_v1') {
        return validateContratoData(parsed);
      } else if (agentName === 'presupuesto_extractor_v1') {
        return validatePresupuestoData(parsed);
      } else if (agentName === 'escritura_extractor_v1') {
        return validateEscrituraData(parsed);
      }
    }

    // Para otros agentes, retornar texto crudo
    return rawResponse;

  } catch (error) {
    console.error(`[Agent Response] Error processing ${agentName} response:`, error);
    console.error('Raw response:', rawResponse);
    return null;
  }
}

/**
 * Valida y limpia datos extraídos de actas
 */
function validateMinutesData(data: any): any {
  // Validar campos básicos
  const validated = {
    president_in: typeof data.president_in === 'string' ? data.president_in.trim() || null : null,
    president_out: typeof data.president_out === 'string' ? data.president_out.trim() || null : null,
    administrator: typeof data.administrator === 'string' ? data.administrator.trim() || null : null,
    summary: typeof data.summary === 'string' ? data.summary.trim() || null : null,
    decisions: typeof data.decisions === 'string' ? data.decisions.trim() || null : null,
    
    // Campos nuevos para plantilla UI
    document_date: validateDate(data.document_date),
    tipo_reunion: validateTipoReunion(data.tipo_reunion),
    lugar: typeof data.lugar === 'string' ? data.lugar.trim() || null : null,
    comunidad_nombre: typeof data.comunidad_nombre === 'string' ? data.comunidad_nombre.trim() || null : null,
    
    // Arrays
    orden_del_dia: Array.isArray(data.orden_del_dia) ? data.orden_del_dia : [],
    acuerdos: Array.isArray(data.acuerdos) ? data.acuerdos : [],
    topic_keywords: Array.isArray(data.topic_keywords) ? data.topic_keywords : [],
    
    // Estructura detectada
    estructura_detectada: validateEstructuraDetectada(data.estructura_detectada),
  };

  // Validar campos topic-xxx como booleanos
  const topicFields = [
    'topic-presupuesto', 'topic-mantenimiento', 'topic-administracion', 'topic-piscina',
    'topic-jardin', 'topic-limpieza', 'topic-balance', 'topic-paqueteria', 
    'topic-energia', 'topic-normativa', 'topic-proveedor', 'topic-dinero',
    'topic-ascensor', 'topic-incendios', 'topic-porteria'
  ];

  topicFields.forEach(field => {
    validated[field] = typeof data[field] === 'boolean' ? data[field] : false;
  });

  return validated;
}

/**
 * Valida tipo de reunión
 */
function validateTipoReunion(tipo: any): string | null {
  if (typeof tipo !== 'string') return null;
  const cleanTipo = tipo.toLowerCase().trim();
  if (cleanTipo === 'ordinaria' || cleanTipo === 'extraordinaria') {
    return cleanTipo;
  }
  return null;
}

/**
 * Valida estructura detectada
 */
function validateEstructuraDetectada(estructura: any): any {
  if (!estructura || typeof estructura !== 'object') {
    return {
      quorum_alcanzado: false,
      propietarios_totales: null,
      capitulos: [],
      total_paginas: 1,
      votaciones: []
    };
  }

  return {
    quorum_alcanzado: typeof estructura.quorum_alcanzado === 'boolean' ? estructura.quorum_alcanzado : false,
    propietarios_totales: typeof estructura.propietarios_totales === 'number' ? estructura.propietarios_totales : null,
    capitulos: Array.isArray(estructura.capitulos) ? estructura.capitulos : [],
    total_paginas: typeof estructura.total_paginas === 'number' ? estructura.total_paginas : 1,
    votaciones: Array.isArray(estructura.votaciones) ? estructura.votaciones : []
  };
}

/**
 * Valida y limpia datos extraídos de facturas
 */
function validateInvoiceData(data: any): any {
  return {
    // Campos básicos
    provider_name: typeof data.provider_name === 'string' ? data.provider_name.trim() || null : null,
    client_name: typeof data.client_name === 'string' ? data.client_name.trim() || null : null,
    amount: typeof data.amount === 'number' ? data.amount : parseFloat(data.amount) || null,
    invoice_date: validateDate(data.invoice_date),
    category: typeof data.category === 'string' ? data.category.trim() || null : null,
    
    // Campos adicionales para plantilla rica
    invoice_number: typeof data.invoice_number === 'string' ? data.invoice_number.trim() || null : null,
    issue_date: validateDate(data.issue_date),
    due_date: validateDate(data.due_date),
    subtotal: validateNumber(data.subtotal),
    tax_amount: validateNumber(data.tax_amount),
    total_amount: validateNumber(data.total_amount),
    currency: typeof data.currency === 'string' ? data.currency.trim() || null : null,
    payment_method: typeof data.payment_method === 'string' ? data.payment_method.trim() || null : null,
    
    // Información del vendedor
    vendor_address: typeof data.vendor_address === 'string' ? data.vendor_address.trim() || null : null,
    vendor_tax_id: typeof data.vendor_tax_id === 'string' ? data.vendor_tax_id.trim() || null : null,
    vendor_phone: typeof data.vendor_phone === 'string' ? data.vendor_phone.trim() || null : null,
    vendor_email: typeof data.vendor_email === 'string' ? data.vendor_email.trim() || null : null,
    
    // Información del cliente
    client_address: typeof data.client_address === 'string' ? data.client_address.trim() || null : null,
    client_tax_id: typeof data.client_tax_id === 'string' ? data.client_tax_id.trim() || null : null,
    client_phone: typeof data.client_phone === 'string' ? data.client_phone.trim() || null : null,
    client_email: typeof data.client_email === 'string' ? data.client_email.trim() || null : null,
    
    // Productos/servicios
    products: Array.isArray(data.products) ? data.products : [],
    
    // Términos y notas
    payment_terms: typeof data.payment_terms === 'string' ? data.payment_terms.trim() || null : null,
    bank_details: typeof data.bank_details === 'string' ? data.bank_details.trim() || null : null,
    notes: typeof data.notes === 'string' ? data.notes.trim() || null : null,
  };
}

/**
 * Valida y convierte fechas
 */
function validateDate(dateStr: any): string | null {
  if (typeof dateStr !== 'string') return null;
  
  try {
    // Intentar parsear la fecha
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    
    // Retornar en formato ISO (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}


/**
 * Guarda metadatos completos de actas en document_metadata (para nueva estructura)
 */
export async function saveCompleteActaMetadata(documentId: string, data: any): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    // Obtener organization_id del documento
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Acta Metadata] Document not found:', documentId);
      return false;
    }

    // Insertar en document_metadata con estructura completa
    const { error } = await supabase
      .from('document_metadata')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        metadata: data, // Todos los metadatos como JSON
        confidence: 0.9, // Alta confianza para el nuevo extractor
        extraction_method: 'gemini',
        document_type: 'acta',
        document_date: data.document_date,
        topic_keywords: data.topic_keywords || [],
        is_current: true
      });

    if (error) {
      console.error('[Save Acta Metadata] Error:', error);
      return false;
    }

    console.log(`[Save Acta Metadata] Saved complete metadata for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Acta Metadata] Error:', error);
    return false;
  }
}

/**
 * Guarda datos extraídos de actas en la base de datos (versión simple para compatibilidad)
 */
export async function saveExtractedMinutes(documentId: string, data: any): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    // Obtener organization_id del documento
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Minutes] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_minutes')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Minutes] Error:', error);
      return false;
    }

    console.log(`[Save Minutes] Saved minutes for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Minutes] Error:', error);
    return false;
  }
}

/**
 * Valida y limpia datos extraídos de comunicados
 */
function validateComunicadoData(data: any): any {
  return {
    fecha: validateDate(data.fecha),
    comunidad: typeof data.comunidad === 'string' ? data.comunidad.trim() || null : null,
    remitente: typeof data.remitente === 'string' ? data.remitente.trim() || null : null,
    resumen: typeof data.resumen === 'string' ? data.resumen.trim() || null : null,
    category: typeof data.category === 'string' ? data.category.trim() || null : null,
    asunto: typeof data.asunto === 'string' ? data.asunto.trim() || null : null,
    tipo_comunicado: typeof data.tipo_comunicado === 'string' ? data.tipo_comunicado.trim() || null : null,
    urgencia: validateUrgencia(data.urgencia),
    comunidad_direccion: typeof data.comunidad_direccion === 'string' ? data.comunidad_direccion.trim() || null : null,
    remitente_cargo: typeof data.remitente_cargo === 'string' ? data.remitente_cargo.trim() || null : null,
    destinatarios: Array.isArray(data.destinatarios) ? data.destinatarios : [],
    fecha_limite: validateDate(data.fecha_limite),
    categoria_comunicado: typeof data.categoria_comunicado === 'string' ? data.categoria_comunicado.trim() || null : null,
    requiere_respuesta: typeof data.requiere_respuesta === 'boolean' ? data.requiere_respuesta : false,
    accion_requerida: Array.isArray(data.accion_requerida) ? data.accion_requerida : [],
    anexos: Array.isArray(data.anexos) ? data.anexos : [],
    contacto_info: validateContactoInfo(data.contacto_info)
  };
}

/**
 * Valida y limpia datos extraídos de albaranes
 */
function validateAlbaranData(data: any): any {
  return {
    emisor_name: typeof data.emisor_name === 'string' ? data.emisor_name.trim() || null : null,
    receptor_name: typeof data.receptor_name === 'string' ? data.receptor_name.trim() || null : null,
    numero_albaran: typeof data.numero_albaran === 'string' ? data.numero_albaran.trim() || null : null,
    fecha_emision: validateDate(data.fecha_emision),
    numero_pedido: typeof data.numero_pedido === 'string' ? data.numero_pedido.trim() || null : null,
    category: typeof data.category === 'string' ? data.category.trim() || null : null,
    emisor_direccion: typeof data.emisor_direccion === 'string' ? data.emisor_direccion.trim() || null : null,
    emisor_telefono: typeof data.emisor_telefono === 'string' ? data.emisor_telefono.trim() || null : null,
    emisor_email: typeof data.emisor_email === 'string' ? data.emisor_email.trim() || null : null,
    receptor_direccion: typeof data.receptor_direccion === 'string' ? data.receptor_direccion.trim() || null : null,
    receptor_telefono: typeof data.receptor_telefono === 'string' ? data.receptor_telefono.trim() || null : null,
    mercancia: Array.isArray(data.mercancia) ? data.mercancia : [],
    cantidad_total: validateNumber(data.cantidad_total),
    peso_total: validateNumber(data.peso_total),
    observaciones: typeof data.observaciones === 'string' ? data.observaciones.trim() || null : null,
    estado_entrega: typeof data.estado_entrega === 'string' ? data.estado_entrega.trim() || null : null,
    firma_receptor: typeof data.firma_receptor === 'boolean' ? data.firma_receptor : false,
    transportista: typeof data.transportista === 'string' ? data.transportista.trim() || null : null,
    vehiculo_matricula: typeof data.vehiculo_matricula === 'string' ? data.vehiculo_matricula.trim() || null : null
  };
}

/**
 * Valida y limpia datos extraídos de contratos
 */
function validateContratoData(data: any): any {
  return {
    titulo_contrato: typeof data.titulo_contrato === 'string' ? data.titulo_contrato.trim() || null : null,
    parte_a: typeof data.parte_a === 'string' ? data.parte_a.trim() || null : null,
    parte_b: typeof data.parte_b === 'string' ? data.parte_b.trim() || null : null,
    objeto_contrato: typeof data.objeto_contrato === 'string' ? data.objeto_contrato.trim() || null : null,
    duracion: typeof data.duracion === 'string' ? data.duracion.trim() || null : null,
    importe_total: validateNumber(data.importe_total),
    fecha_inicio: validateDate(data.fecha_inicio),
    fecha_fin: validateDate(data.fecha_fin),
    category: typeof data.category === 'string' ? data.category.trim() || null : null,
    tipo_contrato: typeof data.tipo_contrato === 'string' ? data.tipo_contrato.trim() || null : null,
    parte_a_direccion: typeof data.parte_a_direccion === 'string' ? data.parte_a_direccion.trim() || null : null,
    parte_a_identificacion_fiscal: typeof data.parte_a_identificacion_fiscal === 'string' ? data.parte_a_identificacion_fiscal.trim() || null : null,
    parte_a_representante: typeof data.parte_a_representante === 'string' ? data.parte_a_representante.trim() || null : null,
    parte_b_direccion: typeof data.parte_b_direccion === 'string' ? data.parte_b_direccion.trim() || null : null,
    parte_b_identificacion_fiscal: typeof data.parte_b_identificacion_fiscal === 'string' ? data.parte_b_identificacion_fiscal.trim() || null : null,
    parte_b_representante: typeof data.parte_b_representante === 'string' ? data.parte_b_representante.trim() || null : null,
    descripcion_detallada: typeof data.descripcion_detallada === 'string' ? data.descripcion_detallada.trim() || null : null,
    alcance_servicios: Array.isArray(data.alcance_servicios) ? data.alcance_servicios : [],
    obligaciones_parte_a: Array.isArray(data.obligaciones_parte_a) ? data.obligaciones_parte_a : [],
    obligaciones_parte_b: Array.isArray(data.obligaciones_parte_b) ? data.obligaciones_parte_b : [],
    moneda: typeof data.moneda === 'string' ? data.moneda.trim() || 'EUR' : 'EUR',
    forma_pago: typeof data.forma_pago === 'string' ? data.forma_pago.trim() || null : null,
    plazos_pago: Array.isArray(data.plazos_pago) ? data.plazos_pago : [],
    penalizaciones: typeof data.penalizaciones === 'string' ? data.penalizaciones.trim() || null : null,
    confidencialidad: typeof data.confidencialidad === 'boolean' ? data.confidencialidad : false,
    condiciones_terminacion: typeof data.condiciones_terminacion === 'string' ? data.condiciones_terminacion.trim() || null : null,
    legislacion_aplicable: typeof data.legislacion_aplicable === 'string' ? data.legislacion_aplicable.trim() || null : null,
    jurisdiccion: typeof data.jurisdiccion === 'string' ? data.jurisdiccion.trim() || null : null,
    fecha_firma: validateDate(data.fecha_firma),
    lugar_firma: typeof data.lugar_firma === 'string' ? data.lugar_firma.trim() || null : null,
    firmas_presentes: typeof data.firmas_presentes === 'boolean' ? data.firmas_presentes : false
  };
}

/**
 * Valida y limpia datos extraídos de presupuestos
 */
function validatePresupuestoData(data: any): any {
  return {
    numero_presupuesto: typeof data.numero_presupuesto === 'string' ? data.numero_presupuesto.trim() || null : null,
    emisor_name: typeof data.emisor_name === 'string' ? data.emisor_name.trim() || null : null,
    cliente_name: typeof data.cliente_name === 'string' ? data.cliente_name.trim() || null : null,
    fecha_emision: validateDate(data.fecha_emision),
    fecha_validez: validateDate(data.fecha_validez),
    subtotal: validateNumber(data.subtotal),
    impuestos: validateNumber(data.impuestos),
    total: validateNumber(data.total),
    category: typeof data.category === 'string' ? data.category.trim() || null : null,
    titulo: typeof data.titulo === 'string' ? data.titulo.trim() || null : null,
    tipo_documento: typeof data.tipo_documento === 'string' ? data.tipo_documento.trim() || null : null,
    emisor_direccion: typeof data.emisor_direccion === 'string' ? data.emisor_direccion.trim() || null : null,
    emisor_telefono: typeof data.emisor_telefono === 'string' ? data.emisor_telefono.trim() || null : null,
    emisor_email: typeof data.emisor_email === 'string' ? data.emisor_email.trim() || null : null,
    emisor_identificacion_fiscal: typeof data.emisor_identificacion_fiscal === 'string' ? data.emisor_identificacion_fiscal.trim() || null : null,
    cliente_direccion: typeof data.cliente_direccion === 'string' ? data.cliente_direccion.trim() || null : null,
    cliente_identificacion_fiscal: typeof data.cliente_identificacion_fiscal === 'string' ? data.cliente_identificacion_fiscal.trim() || null : null,
    descripcion_servicios: Array.isArray(data.descripcion_servicios) ? data.descripcion_servicios : [],
    cantidades: Array.isArray(data.cantidades) ? data.cantidades : [],
    precios_unitarios: Array.isArray(data.precios_unitarios) ? data.precios_unitarios : [],
    importes_totales: Array.isArray(data.importes_totales) ? data.importes_totales : [],
    descripciones_detalladas: Array.isArray(data.descripciones_detalladas) ? data.descripciones_detalladas : [],
    porcentaje_impuestos: validateNumber(data.porcentaje_impuestos),
    importe_impuestos: validateNumber(data.importe_impuestos),
    moneda: typeof data.moneda === 'string' ? data.moneda.trim() || 'EUR' : 'EUR',
    condiciones_pago: typeof data.condiciones_pago === 'string' ? data.condiciones_pago.trim() || null : null,
    plazos_entrega: typeof data.plazos_entrega === 'string' ? data.plazos_entrega.trim() || null : null,
    pago_inicial_requerido: typeof data.pago_inicial_requerido === 'boolean' ? data.pago_inicial_requerido : false,
    notas_adicionales: typeof data.notas_adicionales === 'string' ? data.notas_adicionales.trim() || null : null,
    garantia: typeof data.garantia === 'string' ? data.garantia.trim() || null : null
  };
}

/**
 * Valida y limpia datos extraídos de escrituras de compraventa
 */
function validateEscrituraData(data: any): any {
  return {
    vendedor_nombre: typeof data.vendedor_nombre === 'string' ? data.vendedor_nombre.trim() || null : null,
    comprador_nombre: typeof data.comprador_nombre === 'string' ? data.comprador_nombre.trim() || null : null,
    direccion_inmueble: typeof data.direccion_inmueble === 'string' ? data.direccion_inmueble.trim() || null : null,
    precio_venta: validateNumber(data.precio_venta),
    fecha_escritura: validateDate(data.fecha_escritura),
    notario_nombre: typeof data.notario_nombre === 'string' ? data.notario_nombre.trim() || null : null,
    referencia_catastral: typeof data.referencia_catastral === 'string' ? data.referencia_catastral.trim() || null : null,
    superficie_m2: validateNumber(data.superficie_m2),
    category: typeof data.category === 'string' ? data.category.trim() || null : null,
    vendedor_dni: typeof data.vendedor_dni === 'string' ? data.vendedor_dni.trim() || null : null,
    vendedor_direccion: typeof data.vendedor_direccion === 'string' ? data.vendedor_direccion.trim() || null : null,
    vendedor_estado_civil: typeof data.vendedor_estado_civil === 'string' ? data.vendedor_estado_civil.trim() || null : null,
    vendedor_nacionalidad: typeof data.vendedor_nacionalidad === 'string' ? data.vendedor_nacionalidad.trim() || null : null,
    vendedor_profesion: typeof data.vendedor_profesion === 'string' ? data.vendedor_profesion.trim() || null : null,
    comprador_dni: typeof data.comprador_dni === 'string' ? data.comprador_dni.trim() || null : null,
    comprador_direccion: typeof data.comprador_direccion === 'string' ? data.comprador_direccion.trim() || null : null,
    comprador_estado_civil: typeof data.comprador_estado_civil === 'string' ? data.comprador_estado_civil.trim() || null : null,
    comprador_nacionalidad: typeof data.comprador_nacionalidad === 'string' ? data.comprador_nacionalidad.trim() || null : null,
    comprador_profesion: typeof data.comprador_profesion === 'string' ? data.comprador_profesion.trim() || null : null,
    tipo_inmueble: typeof data.tipo_inmueble === 'string' ? data.tipo_inmueble.trim() || null : null,
    superficie_util: validateNumber(data.superficie_util),
    numero_habitaciones: validateNumber(data.numero_habitaciones, true),
    numero_banos: validateNumber(data.numero_banos, true),
    planta: typeof data.planta === 'string' ? data.planta.trim() || null : null,
    orientacion: typeof data.orientacion === 'string' ? data.orientacion.trim() || null : null,
    descripcion_inmueble: typeof data.descripcion_inmueble === 'string' ? data.descripcion_inmueble.trim() || null : null,
    registro_propiedad: typeof data.registro_propiedad === 'string' ? data.registro_propiedad.trim() || null : null,
    tomo: typeof data.tomo === 'string' ? data.tomo.trim() || null : null,
    libro: typeof data.libro === 'string' ? data.libro.trim() || null : null,
    folio: typeof data.folio === 'string' ? data.folio.trim() || null : null,
    finca: typeof data.finca === 'string' ? data.finca.trim() || null : null,
    inscripcion: typeof data.inscripcion === 'string' ? data.inscripcion.trim() || null : null,
    moneda: typeof data.moneda === 'string' ? data.moneda.trim() || 'EUR' : 'EUR',
    forma_pago: typeof data.forma_pago === 'string' ? data.forma_pago.trim() || null : null,
    precio_en_letras: typeof data.precio_en_letras === 'string' ? data.precio_en_letras.trim() || null : null,
    impuestos_incluidos: typeof data.impuestos_incluidos === 'boolean' ? data.impuestos_incluidos : false,
    gastos_a_cargo_comprador: Array.isArray(data.gastos_a_cargo_comprador) ? data.gastos_a_cargo_comprador : [],
    gastos_a_cargo_vendedor: Array.isArray(data.gastos_a_cargo_vendedor) ? data.gastos_a_cargo_vendedor : [],
    cargas_existentes: Array.isArray(data.cargas_existentes) ? data.cargas_existentes : [],
    hipotecas_pendientes: typeof data.hipotecas_pendientes === 'string' ? data.hipotecas_pendientes.trim() || null : null,
    servidumbres: typeof data.servidumbres === 'string' ? data.servidumbres.trim() || null : null,
    libre_cargas: typeof data.libre_cargas === 'boolean' ? data.libre_cargas : false,
    condicion_suspensiva: typeof data.condicion_suspensiva === 'boolean' ? data.condicion_suspensiva : false,
    condiciones_especiales: Array.isArray(data.condiciones_especiales) ? data.condiciones_especiales : [],
    clausulas_particulares: Array.isArray(data.clausulas_particulares) ? data.clausulas_particulares : [],
    fecha_entrega: validateDate(data.fecha_entrega),
    entrega_inmediata: typeof data.entrega_inmediata === 'boolean' ? data.entrega_inmediata : false,
    estado_conservacion: typeof data.estado_conservacion === 'string' ? data.estado_conservacion.trim() || null : null,
    inventario_incluido: typeof data.inventario_incluido === 'string' ? data.inventario_incluido.trim() || null : null,
    notario_numero_colegiado: typeof data.notario_numero_colegiado === 'string' ? data.notario_numero_colegiado.trim() || null : null,
    notaria_direccion: typeof data.notaria_direccion === 'string' ? data.notaria_direccion.trim() || null : null,
    protocolo_numero: typeof data.protocolo_numero === 'string' ? data.protocolo_numero.trim() || null : null,
    autorizacion_notarial: typeof data.autorizacion_notarial === 'boolean' ? data.autorizacion_notarial : false,
    valor_catastral: validateNumber(data.valor_catastral),
    coeficiente_participacion: typeof data.coeficiente_participacion === 'string' ? data.coeficiente_participacion.trim() || null : null,
    itp_aplicable: validateNumber(data.itp_aplicable),
    base_imponible_itp: validateNumber(data.base_imponible_itp),
    inscripcion_registro: typeof data.inscripcion_registro === 'string' ? data.inscripcion_registro.trim() || null : null
  };
}

/**
 * Valida niveles de urgencia
 */
function validateUrgencia(urgencia: any): string | null {
  if (typeof urgencia !== 'string') return null;
  const cleanUrgencia = urgencia.toLowerCase().trim();
  if (['baja', 'media', 'alta', 'urgente'].includes(cleanUrgencia)) {
    return cleanUrgencia;
  }
  return null;
}

/**
 * Valida información de contacto
 */
function validateContactoInfo(contacto: any): any {
  if (!contacto || typeof contacto !== 'object') {
    return {
      telefono: null,
      email: null,
      horario_atencion: null
    };
  }

  return {
    telefono: typeof contacto.telefono === 'string' ? contacto.telefono.trim() || null : null,
    email: typeof contacto.email === 'string' ? contacto.email.trim() || null : null,
    horario_atencion: typeof contacto.horario_atencion === 'string' ? contacto.horario_atencion.trim() || null : null
  };
}

/**
 * Valida números (enteros o decimales)
 */
function validateNumber(value: any, isInteger: boolean = false): number | null {
  if (typeof value === 'number') {
    return isInteger ? Math.round(value) : value;
  }
  if (typeof value === 'string') {
    const parsed = isInteger ? parseInt(value) : parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

/**
 * Guarda datos extraídos de facturas en la base de datos
 */
export async function saveExtractedInvoice(documentId: string, data: any): Promise<boolean> {
  try {
    // Use Service Role client for pipeline operations to bypass RLS
    const { createSupabaseServiceClient } = await import('@/supabase-clients/server');
    const supabase = createSupabaseServiceClient();
    
    // Obtener organization_id del documento
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Invoice] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_invoices')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Invoice] Error:', error);
      return false;
    }

    console.log(`[Save Invoice] Saved invoice for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Invoice] Error:', error);
    return false;
  }
}

/**
 * Guarda datos extraídos de comunicados en la base de datos
 */
export async function saveExtractedComunicado(documentId: string, data: any): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Comunicado] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_communications')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Comunicado] Error:', error);
      return false;
    }

    console.log(`[Save Comunicado] Saved comunicado for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Comunicado] Error:', error);
    return false;
  }
}

/**
 * Guarda datos extraídos de albaranes en la base de datos
 */
export async function saveExtractedAlbaran(documentId: string, data: any): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Albaran] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_delivery_notes')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Albaran] Error:', error);
      return false;
    }

    console.log(`[Save Albaran] Saved albaran for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Albaran] Error:', error);
    return false;
  }
}

/**
 * Guarda datos extraídos de contratos en la base de datos
 */
export async function saveExtractedContrato(documentId: string, data: any): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Contrato] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_contracts')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Contrato] Error:', error);
      return false;
    }

    console.log(`[Save Contrato] Saved contrato for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Contrato] Error:', error);
    return false;
  }
}

/**
 * Guarda datos extraídos de presupuestos en la base de datos
 */
export async function saveExtractedPresupuesto(documentId: string, data: any): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Presupuesto] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_budgets')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Presupuesto] Error:', error);
      return false;
    }

    console.log(`[Save Presupuesto] Saved presupuesto for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Presupuesto] Error:', error);
    return false;
  }
}

/**
 * Guarda datos extraídos de escrituras de compraventa en la base de datos
 */
export async function saveExtractedEscritura(documentId: string, data: any): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Escritura] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_property_deeds')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Escritura] Error:', error);
      return false;
    }

    console.log(`[Save Escritura] Saved escritura for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Escritura] Error:', error);
    return false;
  }
}

/**
 * Guarda datos extraídos de contratos en la base de datos
 */
export async function saveExtractedContract(documentId: string, data: any): Promise<boolean> {
  try {
    // Use Service Role client for pipeline operations to bypass RLS
    const { createSupabaseServiceClient } = await import('@/supabase-clients/server');
    const supabase = createSupabaseServiceClient();
    
    // Obtener organization_id del documento
    const { data: document } = await supabase
      .from('documents')
      .select('organization_id')
      .eq('id', documentId)
      .single();

    if (!document) {
      console.error('[Save Contract] Document not found:', documentId);
      return false;
    }

    const { error } = await supabase
      .from('extracted_contracts')
      .insert({
        document_id: documentId,
        organization_id: document.organization_id,
        ...data
      });

    if (error) {
      console.error('[Save Contract] Error:', error);
      return false;
    }

    console.log(`[Save Contract] Saved contract for document: ${documentId}`);
    return true;
  } catch (error) {
    console.error('[Save Contract] Error:', error);
    return false;
  }
}

/**
 * Gemini Flash OCR IA - Analiza PDF como imagen y extrae datos directamente
 * Esta función implementa el flujo todo-en-uno para documentos escaneados
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
    
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.1, // Determinista para extracción precisa
        maxOutputTokens: 2000, // Suficiente para respuesta JSON completa
      }
    });

    // Construir prompt especial para OCR IA
    const ocrIAPrompt = `
INSTRUCCIÓN ESPECIAL - GEMINI FLASH OCR IA:

1. ANALIZA VISUALMENTE este PDF escaneado como imagen
2. EXTRAE TODO EL TEXTO visible en el documento  
3. PROCESA el texto extraído usando este prompt especializado:

${agentPrompt}

4. RESPONDE EN FORMATO JSON VÁLIDO con todos los campos requeridos

IMPORTANTE: 
- Analiza la imagen del PDF directamente
- No asumas datos - solo extrae lo que ves
- Si un campo no es visible, usa null
- Responde solo con JSON válido
`;

    console.log(`[Gemini Flash OCR IA] Sending PDF to Gemini Flash...`);
    
    // Llamar a Gemini Flash con PDF como imagen
    const result = await model.generateContent([
      {
        text: ocrIAPrompt
      },
      {
        inlineData: {
          mimeType: "application/pdf",
          data: pdfBuffer.toString('base64')
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      return {
        success: false,
        error: 'Empty response from Gemini Flash OCR IA',
        metadata: { agent: agentName, processingTime: Date.now() - startTime }
      };
    }

    console.log(`[Gemini Flash OCR IA] Response received: ${text.substring(0, 200)}...`);
    
    // Procesar respuesta JSON
    let responseData = text.trim();
    try {
      // Extraer JSON de la respuesta (remover markdown si existe)
      const jsonMatch = responseData.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseData.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        responseData = jsonMatch[1] || jsonMatch[0];
      }
      
      const parsedData = JSON.parse(responseData);
      
      // Procesar datos según el tipo de agente
      const processedData = processAgentResponse(agentName, parsedData);
      
      const processingTime = Date.now() - startTime;
      console.log(`[Gemini Flash OCR IA] ${agentName} completed successfully in ${processingTime}ms`);
      
      return {
        success: true,
        data: processedData,
        metadata: {
          agent: agentName,
          processingTime,
          method: 'gemini-flash-ocr-ia'
        }
      };
      
    } catch (parseError) {
      console.log(`[Gemini Flash OCR IA] Response is not JSON for agent: ${agentName}, returning as string`);
      
      const processingTime = Date.now() - startTime;
      return {
        success: true,
        data: { raw_response: responseData },
        metadata: {
          agent: agentName,
          processingTime,
          method: 'gemini-flash-ocr-ia',
          note: 'Non-JSON response'
        }
      };
    }

  } catch (error) {
    console.error(`[Gemini Flash OCR IA] Error with agent ${agentName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      metadata: { 
        agent: agentName,
        processingTime: Date.now() - startTime,
        method: 'gemini-flash-ocr-ia'
      }
    };
  }
}