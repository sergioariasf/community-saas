/**
 * ARCHIVO: ActaValidator.ts  
 * PROPÓSITO: Validación específica para datos extraídos de actas de junta
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validateMinutesData migrada y mejorada
 * ACTUALIZADO: 2025-09-23
 */

import { validateDate, validateString, validateArray, validateBoolean } from './BaseValidator';

/**
 * Valida tipo de reunión (ordinaria/extraordinaria)
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
 * Valida estructura detectada del acta
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
 * Valida y limpia datos extraídos de actas de junta
 * Migrado desde saasAgents.ts con mejoras
 */
export function validateMinutesData(data: any): any {
  // Validar campos básicos
  const validated = {
    president_in: validateString(data.president_in),
    president_out: validateString(data.president_out),
    administrator: validateString(data.administrator),
    summary: validateString(data.summary),
    decisions: validateString(data.decisions),
    
    // Campos nuevos para plantilla UI
    document_date: validateDate(data.document_date),
    tipo_reunion: validateTipoReunion(data.tipo_reunion),
    lugar: validateString(data.lugar),
    comunidad_nombre: validateString(data.comunidad_nombre),
    
    // Arrays validados
    orden_del_dia: validateArray(data.orden_del_dia, undefined, (item) => validateString(item)),
    acuerdos: validateArray(data.acuerdos, undefined, (item) => validateString(item)),
    topic_keywords: validateArray(data.topic_keywords, undefined, (item) => validateString(item)),
    
    // Estructura detectada
    estructura_detectada: validateEstructuraDetectada(data.estructura_detectada),
  };

  // Validar campos topic_xxx como booleanos (usar guiones bajos para BD)
  const topicFields = [
    'topic_presupuesto', 'topic_mantenimiento', 'topic_administracion', 'topic_piscina',
    'topic_jardin', 'topic_limpieza', 'topic_balance', 'topic_paqueteria', 
    'topic_energia', 'topic_normativa', 'topic_proveedor', 'topic_dinero',
    'topic_ascensor', 'topic_incendios', 'topic_porteria'
  ];

  topicFields.forEach(field => {
    // Mapear desde guión medio (agente) a guión bajo (BD)
    const agentField = field.replace(/_/g, '-'); // topic_presupuesto -> topic-presupuesto
    validated[field] = validateBoolean(data[agentField]);
  });

  return validated;
}