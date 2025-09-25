/**
 * ARCHIVO: PromptBuilder.ts
 * PROPÓSITO: Construcción de prompts para agentes, sin lógica de API
 * ESTADO: development
 * DEPENDENCIAS: ninguna
 * OUTPUTS: Prompts formateados listos para Gemini
 * ACTUALIZADO: 2025-09-23
 */

export interface SaaSAgent {
  id: string;
  name: string;
  purpose: string;
  prompt_template: string;
  variables: Record<string, any>;
}

/**
 * Construye prompt reemplazando variables en template
 */
export function buildPrompt(template: string, inputs: Record<string, any>): string {
  let prompt = template;
  
  // Reemplazar variables en formato {variable_name}
  Object.entries(inputs).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    const replacement = typeof value === 'string' ? value : JSON.stringify(value);
    prompt = prompt.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
  });
  
  // Agregar instrucciones de formato específicas si es necesario
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
 * Valida que el template tenga las variables necesarias
 */
export function validateTemplate(template: string, requiredVariables: string[]): boolean {
  return requiredVariables.every(variable => 
    template.includes(`{${variable}}`)
  );
}

/**
 * Extrae variables requeridas de un template
 */
export function extractRequiredVariables(template: string): string[] {
  const matches = template.match(/\{([^}]+)\}/g) || [];
  return matches.map(match => match.slice(1, -1)); // Remover { y }
}