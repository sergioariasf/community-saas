/**
 * ARCHIVO: ComunicadoValidator.ts
 * PROPÓSITO: Validación específica para datos extraídos de comunicado vecinals
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validateComunicadoData completa y robusta
 * ACTUALIZADO: 2025-09-24
 */

import { 
  validateDate, validateString, validateArray, validateBoolean
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de comunicado vecinals
 * Generado automáticamente por master-generator
 */
export function validateComunicadoData(data: any): any {
  return {
    fecha: validateDate(data.fecha),
    comunidad: validateString(data.comunidad, 200),
    remitente: validateString(data.remitente, 200),
    resumen: validateString(data.resumen, 200),
    category: validateString(data.category, 200),
    asunto: validateString(data.asunto, 200),
    tipo_comunicado: validateString(data.tipo_comunicado, 200),
    urgencia: validateString(data.urgencia, 200),
    comunidad_direccion: validateString(data.comunidad_direccion, 200),
    remitente_cargo: validateString(data.remitente_cargo, 200),
    destinatarios: validateArray(data.destinatarios || []),
    fecha_limite: validateDate(data.fecha_limite),
    requiere_respuesta: validateBoolean(data.requiere_respuesta),
    accion_requerida: validateArray(data.accion_requerida || []),
    anexos: validateArray(data.anexos || []),
    contacto_info: validateArray(data.contacto_info || []),
    topic_presupuesto: validateBoolean(data.topic_presupuesto),
    topic_mantenimiento: validateBoolean(data.topic_mantenimiento),
    topic_administracion: validateBoolean(data.topic_administracion),
    topic_piscina: validateBoolean(data.topic_piscina),
    topic_jardin: validateBoolean(data.topic_jardin),
    topic_limpieza: validateBoolean(data.topic_limpieza),
    topic_balance: validateBoolean(data.topic_balance),
    topic_paqueteria: validateBoolean(data.topic_paqueteria),
    topic_energia: validateBoolean(data.topic_energia),
    topic_normativa: validateBoolean(data.topic_normativa),
    topic_proveedor: validateBoolean(data.topic_proveedor),
    topic_dinero: validateBoolean(data.topic_dinero),
    topic_ascensor: validateBoolean(data.topic_ascensor),
    topic_incendios: validateBoolean(data.topic_incendios),
    topic_porteria: validateBoolean(data.topic_porteria),
  };
}