/**
 * ARCHIVO: AlbaranValidator.ts
 * PROPÓSITO: Validación específica para datos extraídos de albarán de entregas
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validateAlbaranData completa y robusta
 * ACTUALIZADO: 2025-09-24
 */

import { 
  validateString, validateDate, validateArray, validateNumber, validateBoolean
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de albarán de entregas
 * Generado automáticamente por master-generator
 */
export function validateAlbaranData(data: any): any {
  return {
    emisor_name: validateString(data.emisor_name, 200),
    receptor_name: validateString(data.receptor_name, 200),
    numero_albaran: validateString(data.numero_albaran, 200),
    fecha_emision: validateDate(data.fecha_emision),
    numero_pedido: validateString(data.numero_pedido, 200),
    category: validateString(data.category, 200),
    emisor_direccion: validateString(data.emisor_direccion, 200),
    emisor_telefono: validateString(data.emisor_telefono, 200),
    emisor_email: validateString(data.emisor_email, 200),
    receptor_direccion: validateString(data.receptor_direccion, 200),
    receptor_telefono: validateString(data.receptor_telefono, 200),
    mercancia: validateArray(data.mercancia || []),
    cantidad_total: validateNumber(data.cantidad_total),
    peso_total: validateNumber(data.peso_total),
    observaciones: validateString(data.observaciones, 200),
    estado_entrega: validateString(data.estado_entrega, 200),
    firma_receptor: validateBoolean(data.firma_receptor),
    transportista: validateString(data.transportista, 200),
    vehiculo_matricula: validateString(data.vehiculo_matricula, 200),
  };
}