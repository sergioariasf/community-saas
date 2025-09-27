/**
 * ARCHIVO: PresupuestoValidator.ts
 * PROPÓSITO: Validación específica para datos extraídos de presupuesto comercials
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validatePresupuestoData completa y robusta
 * ACTUALIZADO: 2025-09-27
 */

import { 
  validateString, validateDate, validateNumber, validateArray, validateBoolean
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de presupuesto comercials
 * Generado automáticamente por master-generator
 */
export function validatePresupuestoData(data: any): any {
  return {
    numero_presupuesto: validateString(data.numero_presupuesto, 200),
    emisor_name: validateString(data.emisor_name, 200),
    cliente_name: validateString(data.cliente_name, 200),
    fecha_emision: validateDate(data.fecha_emision),
    fecha_validez: validateDate(data.fecha_validez),
    total: validateNumber(data.total),
    category: validateString(data.category, 200),
    titulo: validateString(data.titulo, 200),
    tipo_documento: validateString(data.tipo_documento, 200),
    emisor_direccion: validateString(data.emisor_direccion, 200),
    emisor_telefono: validateString(data.emisor_telefono, 200),
    emisor_email: validateString(data.emisor_email, 200),
    emisor_identificacion_fiscal: validateString(data.emisor_identificacion_fiscal, 200),
    cliente_direccion: validateString(data.cliente_direccion, 200),
    cliente_identificacion_fiscal: validateString(data.cliente_identificacion_fiscal, 200),
    subtotal: validateNumber(data.subtotal),
    impuestos: validateNumber(data.impuestos),
    porcentaje_impuestos: validateNumber(data.porcentaje_impuestos),
    moneda: validateString(data.moneda, 200),
    descripcion_servicios: validateArray(data.descripcion_servicios || []),
    cantidades: validateArray(data.cantidades || []),
    precios_unitarios: validateArray(data.precios_unitarios || []),
    importes_totales: validateArray(data.importes_totales || []),
    descripciones_detalladas: validateArray(data.descripciones_detalladas || []),
    condiciones_pago: validateString(data.condiciones_pago, 200),
    plazos_entrega: validateString(data.plazos_entrega, 200),
    pago_inicial_requerido: validateBoolean(data.pago_inicial_requerido),
    notas_adicionales: validateString(data.notas_adicionales, 200),
    garantia: validateString(data.garantia, 200),
  };
}