/**
 * ARCHIVO: ContratoValidator.ts
 * PROPÓSITO: Validación específica para datos extraídos de contrato legals
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validateContratoData completa y robusta
 * ACTUALIZADO: 2025-09-27
 */

import { 
  validateString, validateNumber, validateDate, validateArray, validateBoolean
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de contrato legals
 * Generado automáticamente por master-generator
 */
export function validateContratoData(data: any): any {
  return {
    titulo_contrato: validateString(data.titulo_contrato, 200),
    parte_a: validateString(data.parte_a, 200),
    parte_b: validateString(data.parte_b, 200),
    objeto_contrato: validateString(data.objeto_contrato, 200),
    duracion: validateString(data.duracion, 200),
    importe_total: validateNumber(data.importe_total),
    fecha_inicio: validateDate(data.fecha_inicio),
    fecha_fin: validateDate(data.fecha_fin),
    category: validateString(data.category, 200),
    tipo_contrato: validateString(data.tipo_contrato, 200),
    parte_a_direccion: validateString(data.parte_a_direccion, 200),
    parte_a_identificacion_fiscal: validateString(data.parte_a_identificacion_fiscal, 200),
    parte_a_representante: validateString(data.parte_a_representante, 200),
    parte_b_direccion: validateString(data.parte_b_direccion, 200),
    parte_b_identificacion_fiscal: validateString(data.parte_b_identificacion_fiscal, 200),
    parte_b_representante: validateString(data.parte_b_representante, 200),
    alcance_servicios: validateArray(data.alcance_servicios || []),
    obligaciones_parte_a: validateArray(data.obligaciones_parte_a || []),
    obligaciones_parte_b: validateArray(data.obligaciones_parte_b || []),
    moneda: validateString(data.moneda, 200),
    forma_pago: validateString(data.forma_pago, 200),
    plazos_pago: validateArray(data.plazos_pago || []),
    confidencialidad: validateBoolean(data.confidencialidad),
    legislacion_aplicable: validateString(data.legislacion_aplicable, 200),
    fecha_firma: validateDate(data.fecha_firma),
    lugar_firma: validateString(data.lugar_firma, 200),
    topic_keywords: validateArray(data.topic_keywords, undefined, (item) => validateString(item)),
    topic_mantenimiento: validateBoolean(data.topic_mantenimiento),
    topic_jardines: validateBoolean(data.topic_jardines),
    topic_ascensores: validateBoolean(data.topic_ascensores),
    topic_limpieza: validateBoolean(data.topic_limpieza),
    topic_emergencias: validateBoolean(data.topic_emergencias),
    topic_instalaciones: validateBoolean(data.topic_instalaciones),
    topic_electricidad: validateBoolean(data.topic_electricidad),
    topic_seguridad: validateBoolean(data.topic_seguridad),
    topic_agua: validateBoolean(data.topic_agua),
    topic_gas: validateBoolean(data.topic_gas),
    topic_climatizacion: validateBoolean(data.topic_climatizacion),
    topic_parking: validateBoolean(data.topic_parking),
  };
}