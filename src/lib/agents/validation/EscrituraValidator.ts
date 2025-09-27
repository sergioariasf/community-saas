/**
 * ARCHIVO: EscrituraValidator.ts
 * PROPÓSITO: Validación específica para datos extraídos de escritura de compraventas
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validateEscrituraData completa y robusta
 * ACTUALIZADO: 2025-09-27
 */

import { 
  validateString, validateNumber, validateDate, validateBoolean, validateArray
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de escritura de compraventas
 * Generado automáticamente por master-generator
 */
export function validateEscrituraData(data: any): any {
  return {
    vendedor_nombre: validateString(data.vendedor_nombre, 200),
    comprador_nombre: validateString(data.comprador_nombre, 200),
    direccion_inmueble: validateString(data.direccion_inmueble, 200),
    precio_venta: validateNumber(data.precio_venta),
    fecha_escritura: validateDate(data.fecha_escritura),
    notario_nombre: validateString(data.notario_nombre, 200),
    referencia_catastral: validateString(data.referencia_catastral, 200),
    superficie_m2: validateNumber(data.superficie_m2),
    category: validateString(data.category, 200),
    vendedor_dni: validateString(data.vendedor_dni, 200),
    vendedor_direccion: validateString(data.vendedor_direccion, 200),
    vendedor_estado_civil: validateString(data.vendedor_estado_civil, 200),
    vendedor_nacionalidad: validateString(data.vendedor_nacionalidad, 200),
    vendedor_profesion: validateString(data.vendedor_profesion, 200),
    comprador_dni: validateString(data.comprador_dni, 200),
    comprador_direccion: validateString(data.comprador_direccion, 200),
    comprador_estado_civil: validateString(data.comprador_estado_civil, 200),
    comprador_nacionalidad: validateString(data.comprador_nacionalidad, 200),
    comprador_profesion: validateString(data.comprador_profesion, 200),
    tipo_inmueble: validateString(data.tipo_inmueble, 200),
    superficie_util: validateNumber(data.superficie_util),
    numero_habitaciones: validateNumber(data.numero_habitaciones, true), // entero
    numero_banos: validateNumber(data.numero_banos, true), // entero
    planta: validateString(data.planta, 200),
    orientacion: validateString(data.orientacion, 200),
    descripcion_inmueble: validateString(data.descripcion_inmueble, 200),
    registro_propiedad: validateString(data.registro_propiedad, 200),
    tomo: validateString(data.tomo, 200),
    libro: validateString(data.libro, 200),
    folio: validateString(data.folio, 200),
    finca: validateString(data.finca, 200),
    inscripcion: validateString(data.inscripcion, 200),
    moneda: validateString(data.moneda, 200),
    forma_pago: validateString(data.forma_pago, 200),
    precio_en_letras: validateString(data.precio_en_letras, 200),
    impuestos_incluidos: validateBoolean(data.impuestos_incluidos),
    gastos_a_cargo_comprador: validateArray(data.gastos_a_cargo_comprador || []),
    gastos_a_cargo_vendedor: validateArray(data.gastos_a_cargo_vendedor || []),
    cargas_existentes: validateArray(data.cargas_existentes || []),
    hipotecas_pendientes: validateString(data.hipotecas_pendientes, 200),
    servidumbres: validateString(data.servidumbres, 200),
    libre_cargas: validateBoolean(data.libre_cargas),
    condicion_suspensiva: validateBoolean(data.condicion_suspensiva),
    condiciones_especiales: validateArray(data.condiciones_especiales || []),
    clausulas_particulares: validateArray(data.clausulas_particulares || []),
    fecha_entrega: validateDate(data.fecha_entrega),
    entrega_inmediata: validateBoolean(data.entrega_inmediata),
    estado_conservacion: validateString(data.estado_conservacion, 200),
    inventario_incluido: validateString(data.inventario_incluido, 200),
    notario_numero_colegiado: validateString(data.notario_numero_colegiado, 200),
    notaria_direccion: validateString(data.notaria_direccion, 200),
    protocolo_numero: validateString(data.protocolo_numero, 200),
    autorizacion_notarial: validateBoolean(data.autorizacion_notarial),
    valor_catastral: validateNumber(data.valor_catastral),
    coeficiente_participacion: validateString(data.coeficiente_participacion, 200),
    itp_aplicable: validateNumber(data.itp_aplicable),
    base_imponible_itp: validateNumber(data.base_imponible_itp),
    inscripcion_registro: validateString(data.inscripcion_registro, 200),
  };
}