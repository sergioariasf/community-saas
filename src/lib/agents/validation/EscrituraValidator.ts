/**
 * ARCHIVO: EscrituraValidator.ts
 * PROPÓSITO: Validación específica para datos extraídos de escrituras de compraventa
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validateEscrituraData completa y robusta
 * ACTUALIZADO: 2025-09-23
 */

import { 
  validateDate, 
  validateNumber, 
  validateString, 
  validateArray, 
  validateBoolean, 
  validateEnum 
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de escrituras de compraventa
 * Aplica todas las validaciones necesarias y límites de caracteres
 */
export function validateEscrituraData(data: any): any {
  return {
    // === CAMPOS BÁSICOS ===
    vendedor_nombre: validateString(data.vendedor_nombre, 200),
    comprador_nombre: validateString(data.comprador_nombre, 200),
    direccion_inmueble: validateString(data.direccion_inmueble, 300),
    precio_venta: validateNumber(data.precio_venta),
    fecha_escritura: validateDate(data.fecha_escritura),
    notario_nombre: validateString(data.notario_nombre, 200),
    referencia_catastral: validateString(data.referencia_catastral, 50),
    superficie_m2: validateNumber(data.superficie_m2),
    
    // === CATEGORIZACIÓN ===
    category: validateEnum(data.category, [
      'vivienda', 'local', 'terreno', 'garaje', 'trastero', 
      'vivienda_con_garajes', 'oficina', 'nave', 'parking'
    ], 'vivienda'),
    
    // === DATOS VENDEDOR ===
    vendedor_dni: validateString(data.vendedor_dni, 20),
    vendedor_direccion: validateString(data.vendedor_direccion, 300),
    vendedor_estado_civil: validateString(data.vendedor_estado_civil, 50),
    vendedor_nacionalidad: validateString(data.vendedor_nacionalidad, 50),
    vendedor_profesion: validateString(data.vendedor_profesion, 100),
    
    // === DATOS COMPRADOR ===
    comprador_dni: validateString(data.comprador_dni, 50), // Puede ser múltiple
    comprador_direccion: validateString(data.comprador_direccion, 300),
    comprador_estado_civil: validateString(data.comprador_estado_civil, 100),
    comprador_nacionalidad: validateString(data.comprador_nacionalidad, 50),
    comprador_profesion: validateString(data.comprador_profesion, 100),
    
    // === CARACTERÍSTICAS INMUEBLE ===
    tipo_inmueble: validateString(data.tipo_inmueble, 100),
    superficie_util: validateNumber(data.superficie_util),
    numero_habitaciones: validateNumber(data.numero_habitaciones, true), // entero
    numero_banos: validateNumber(data.numero_banos, true), // entero
    planta: validateString(data.planta, 20),
    orientacion: validateString(data.orientacion, 50),
    
    // === DESCRIPCIÓN LIMITADA (máximo 240 chars como en prompt) ===
    descripcion_inmueble: validateString(data.descripcion_inmueble, 240),
    
    // === DATOS REGISTRALES ===
    registro_propiedad: validateString(data.registro_propiedad, 150),
    tomo: validateString(data.tomo, 20),
    libro: validateString(data.libro, 20),
    folio: validateString(data.folio, 20),
    finca: validateString(data.finca, 20),
    inscripcion: validateString(data.inscripcion, 20),
    
    // === CONDICIONES ECONÓMICAS ===
    moneda: validateEnum(data.moneda, ['EUR', 'USD', 'GBP'], 'EUR'),
    forma_pago: validateString(data.forma_pago, 150), // límite del prompt
    precio_en_letras: validateString(data.precio_en_letras, 100), // límite del prompt
    impuestos_incluidos: validateBoolean(data.impuestos_incluidos),
    
    // === ARRAYS LIMITADOS (máximo 4 elementos como en prompt) ===
    gastos_a_cargo_comprador: validateArray(
      data.gastos_a_cargo_comprador, 
      4, 
      (item: any) => validateString(item, 40)
    ),
    gastos_a_cargo_vendedor: validateArray(
      data.gastos_a_cargo_vendedor, 
      4, 
      (item: any) => validateString(item, 40)
    ),
    cargas_existentes: validateArray(
      data.cargas_existentes, 
      3, 
      (item: any) => validateString(item, 50)
    ),
    condiciones_especiales: validateArray(
      data.condiciones_especiales, 
      3, 
      (item: any) => validateString(item, 60)
    ),
    clausulas_particulares: validateArray(
      data.clausulas_particulares, 
      3, 
      (item: any) => validateString(item, 60)
    ),
    
    // === CAMPOS DESCRIPTIVOS LIMITADOS ===
    hipotecas_pendientes: validateString(data.hipotecas_pendientes, 100),
    servidumbres: validateString(data.servidumbres, 100),
    estado_conservacion: validateString(data.estado_conservacion, 150), // enum + detalle
    inventario_incluido: validateString(data.inventario_incluido, 100),
    
    // === CAMPOS BOOLEANOS ===
    libre_cargas: validateBoolean(data.libre_cargas),
    condicion_suspensiva: validateBoolean(data.condicion_suspensiva),
    entrega_inmediata: validateBoolean(data.entrega_inmediata),
    autorizacion_notarial: validateBoolean(data.autorizacion_notarial),
    
    // === FECHAS ADICIONALES ===
    fecha_entrega: validateDate(data.fecha_entrega),
    
    // === DATOS NOTARIALES ===
    notario_numero_colegiado: validateString(data.notario_numero_colegiado, 20),
    notaria_direccion: validateString(data.notaria_direccion, 200),
    protocolo_numero: validateString(data.protocolo_numero, 20),
    
    // === DATOS FISCALES ===
    valor_catastral: validateNumber(data.valor_catastral),
    coeficiente_participacion: validateString(data.coeficiente_participacion, 20),
    itp_aplicable: validateNumber(data.itp_aplicable),
    base_imponible_itp: validateNumber(data.base_imponible_itp),
    inscripcion_registro: validateString(data.inscripcion_registro, 100)
  };
}