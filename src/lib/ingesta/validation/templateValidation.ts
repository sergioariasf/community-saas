/**
 * ARCHIVO: templateValidation.ts
 * PROPÓSITO: Validación compartida entre tests y UI para compatibilidad datos extraídos ↔ templates
 * ESTADO: development
 * DEPENDENCIAS: tipos extracted_*, templates UI
 * OUTPUTS: Validaciones reutilizables producción/test
 * ACTUALIZADO: 2025-09-22
 */

export interface FieldValidation {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  validator?: (value: any) => boolean;
  description?: string;
}

export interface ValidationResult {
  valid: boolean;
  score: number;
  present_fields: string[];
  missing_fields: string[];
  invalid_fields: string[];
  field_validations: Record<string, {
    present: boolean;
    valid: boolean;
    value?: any;
    error?: string;
  }>;
}

export interface TemplateSchema {
  name: string;
  document_type: string;
  extractor_agent: string;
  fields: FieldValidation[];
  custom_validations?: ((data: any) => { valid: boolean; error?: string })[];
}

// Validadores comunes reutilizables
export const COMMON_VALIDATORS = {
  date: (value: any): boolean => {
    if (!value) return false;
    // Validación más flexible para fechas ISO
    const dateStr = value.toString();
    return /\d{4}-\d{2}-\d{2}/.test(dateStr) && !isNaN(Date.parse(dateStr));
  },
  
  positive_number: (value: any): boolean => {
    return typeof value === 'number' && value > 0;
  },
  
  non_empty_string: (value: any): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
  },
  
  currency_code: (value: any): boolean => {
    return !value || ['EUR', 'USD', 'GBP'].includes(value);
  },
  
  urgency_level: (value: any): boolean => {
    return !value || ['baja', 'media', 'alta', 'urgente'].includes(value);
  },
  
  meeting_type: (value: any): boolean => {
    return !value || ['ordinaria', 'extraordinaria'].includes(value);
  },
  
  array_not_empty: (value: any): boolean => {
    return Array.isArray(value) && value.length > 0;
  }
};

// Esquemas de validación por tipo de documento
export const TEMPLATE_SCHEMAS: Record<string, TemplateSchema> = {
  factura: {
    name: 'FacturaDetailView',
    document_type: 'factura',
    extractor_agent: 'factura_extractor_v2',
    fields: [
      { name: 'provider_name', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'client_name', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'amount', type: 'number', required: true, validator: COMMON_VALIDATORS.positive_number },
      { name: 'invoice_date', type: 'date', required: true, validator: COMMON_VALIDATORS.date },
      { name: 'category', type: 'string', required: false },
      { name: 'invoice_number', type: 'string', required: false },
      { name: 'total_amount', type: 'number', required: false, validator: COMMON_VALIDATORS.positive_number },
      { name: 'currency', type: 'string', required: false, validator: COMMON_VALIDATORS.currency_code },
      { name: 'payment_method', type: 'string', required: false },
      // Campos optimizados para facturas complejas
      { name: 'products_summary', type: 'string', required: false },
      { name: 'products_count', type: 'number', required: false },
      // Campos legacy para facturas simples
      { name: 'products', type: 'array', required: false },
      { name: 'bank_details', type: 'string', required: false }
    ],
    custom_validations: [
      (data) => {
        // Debe tener resumen O detalle de productos
        const hasProductsInfo = data.products_summary || 
                               (data.products && Array.isArray(data.products) && data.products.length > 0);
        return {
          valid: hasProductsInfo,
          error: hasProductsInfo ? undefined : 'Debe tener products_summary o products array'
        };
      },
      (data) => {
        // Si tiene products_count, debe ser coherente con products array (si existe)
        if (data.products_count && data.products && Array.isArray(data.products)) {
          const valid = data.products_count === data.products.length;
          return {
            valid,
            error: valid ? undefined : 'products_count no coincide con products.length'
          };
        }
        return { valid: true };
      }
    ]
  },

  acta: {
    name: 'ActaDetailView',
    document_type: 'acta',
    extractor_agent: 'acta_extractor_v2',
    fields: [
      { name: 'document_date', type: 'date', required: true, validator: COMMON_VALIDATORS.date },
      { name: 'tipo_reunion', type: 'string', required: true, validator: COMMON_VALIDATORS.meeting_type },
      { name: 'lugar', type: 'string', required: false },
      { name: 'comunidad_nombre', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'president_in', type: 'string', required: false },
      { name: 'president_out', type: 'string', required: false },
      { name: 'administrator', type: 'string', required: false },
      { name: 'summary', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'decisions', type: 'string', required: false },
      { name: 'orden_del_dia', type: 'array', required: false },
      { name: 'acuerdos', type: 'array', required: false },
      { name: 'topic_keywords', type: 'array', required: false },
      { name: 'estructura_detectada', type: 'object', required: false }
    ],
    custom_validations: [
      (data) => {
        // Summary debe tener contenido significativo
        const valid = data.summary && data.summary.length >= 20;
        return {
          valid,
          error: valid ? undefined : 'Summary debe tener al menos 20 caracteres'
        };
      }
    ]
  },

  comunicado: {
    name: 'ComunicadoDetailView',
    document_type: 'comunicado',
    extractor_agent: 'comunicado_extractor_v1',
    fields: [
      { name: 'fecha', type: 'date', required: true, validator: COMMON_VALIDATORS.date },
      { name: 'comunidad', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'remitente', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'resumen', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'category', type: 'string', required: false },
      { name: 'asunto', type: 'string', required: false },
      { name: 'tipo_comunicado', type: 'string', required: false },
      { name: 'urgencia', type: 'string', required: false, validator: COMMON_VALIDATORS.urgency_level },
      { name: 'requiere_respuesta', type: 'boolean', required: false },
      { name: 'destinatarios', type: 'array', required: false },
      { name: 'contacto_info', type: 'object', required: false }
    ]
  },

  contrato: {
    name: 'ContratoDetailView',
    document_type: 'contrato',
    extractor_agent: 'contrato_extractor_v1',
    fields: [
      { name: 'titulo_contrato', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'parte_a', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'parte_b', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'objeto_contrato', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string },
      { name: 'importe_total', type: 'number', required: false, validator: COMMON_VALIDATORS.positive_number },
      { name: 'fecha_inicio', type: 'date', required: false, validator: COMMON_VALIDATORS.date },
      { name: 'fecha_fin', type: 'date', required: false, validator: COMMON_VALIDATORS.date },
      { name: 'category', type: 'string', required: false },
      { name: 'duracion', type: 'string', required: false },
      { name: 'topic_keywords', type: 'array', required: false },
      { name: 'alcance_servicios', type: 'array', required: false },
      { name: 'confidencialidad', type: 'boolean', required: false }
    ],
    custom_validations: [
      (data) => {
        // Si hay fechas, fecha_fin debe ser posterior a fecha_inicio
        if (data.fecha_inicio && data.fecha_fin) {
          const valid = new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
          return {
            valid,
            error: valid ? undefined : 'fecha_fin debe ser posterior a fecha_inicio'
          };
        }
        return { valid: true };
      }
    ]
  },

  escritura: {
    name: 'EscrituraCompraventaDetailView',
    document_type: 'escritura',
    extractor_agent: 'escritura_extractor_v1',
    fields: [
      // Campos OBLIGATORIOS (críticos para la UI)
      { name: 'vendedor_nombre', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string, description: 'Nombre del vendedor' },
      { name: 'comprador_nombre', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string, description: 'Nombre del comprador' },
      { name: 'direccion_inmueble', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string, description: 'Dirección del inmueble' },
      { name: 'precio_venta', type: 'number', required: true, validator: COMMON_VALIDATORS.positive_number, description: 'Precio de venta en euros' },
      { name: 'fecha_escritura', type: 'date', required: true, validator: COMMON_VALIDATORS.date, description: 'Fecha de escritura' },
      { name: 'notario_nombre', type: 'string', required: true, validator: COMMON_VALIDATORS.non_empty_string, description: 'Nombre del notario' },
      
      // Campos IMPORTANTES (altamente recomendados)
      { name: 'referencia_catastral', type: 'string', required: false, description: 'Referencia catastral del inmueble' },
      { name: 'superficie_util', type: 'number', required: false, validator: COMMON_VALIDATORS.positive_number, description: 'Superficie útil en m²' },
      { name: 'tipo_inmueble', type: 'string', required: false, description: 'Tipo de inmueble (vivienda, local, etc.)' },
      { name: 'category', type: 'string', required: false, description: 'Categoría del inmueble' },
      
      // Campos VENDEDOR
      { name: 'vendedor_dni', type: 'string', required: false, description: 'DNI/CIF del vendedor' },
      { name: 'vendedor_direccion', type: 'string', required: false, description: 'Dirección del vendedor' },
      { name: 'vendedor_estado_civil', type: 'string', required: false, description: 'Estado civil del vendedor' },
      { name: 'vendedor_nacionalidad', type: 'string', required: false, description: 'Nacionalidad del vendedor' },
      { name: 'vendedor_profesion', type: 'string', required: false, description: 'Profesión del vendedor' },
      
      // Campos COMPRADOR
      { name: 'comprador_dni', type: 'string', required: false, description: 'DNI/CIF del comprador' },
      { name: 'comprador_direccion', type: 'string', required: false, description: 'Dirección del comprador' },
      { name: 'comprador_estado_civil', type: 'string', required: false, description: 'Estado civil del comprador' },
      { name: 'comprador_nacionalidad', type: 'string', required: false, description: 'Nacionalidad del comprador' },
      { name: 'comprador_profesion', type: 'string', required: false, description: 'Profesión del comprador' },
      
      // Campos INMUEBLE DETALLE
      { name: 'superficie_m2', type: 'number', required: false, validator: COMMON_VALIDATORS.positive_number, description: 'Superficie total en m²' },
      { name: 'numero_habitaciones', type: 'number', required: false, description: 'Número de habitaciones' },
      { name: 'numero_banos', type: 'number', required: false, description: 'Número de baños' },
      { name: 'planta', type: 'string', required: false, description: 'Planta del inmueble' },
      { name: 'orientacion', type: 'string', required: false, description: 'Orientación del inmueble' },
      { name: 'descripcion_inmueble', type: 'string', required: false, description: 'Descripción detallada del inmueble' },
      
      // Campos REGISTRO
      { name: 'registro_propiedad', type: 'string', required: false, description: 'Registro de la propiedad' },
      { name: 'tomo', type: 'string', required: false, description: 'Tomo del registro' },
      { name: 'libro', type: 'string', required: false, description: 'Libro del registro' },
      { name: 'folio', type: 'string', required: false, description: 'Folio del registro' },
      { name: 'finca', type: 'string', required: false, description: 'Número de finca' },
      { name: 'inscripcion', type: 'string', required: false, description: 'Número de inscripción' },
      
      // Campos PAGO
      { name: 'moneda', type: 'string', required: false, validator: COMMON_VALIDATORS.currency_code, description: 'Moneda de la transacción' },
      { name: 'forma_pago', type: 'string', required: false, description: 'Forma de pago' },
      { name: 'precio_en_letras', type: 'string', required: false, description: 'Precio escrito en letras' },
      { name: 'impuestos_incluidos', type: 'boolean', required: false, description: 'Si los impuestos están incluidos' },
      
      // Campos ARRAYS (gastos y cargas)
      { name: 'gastos_a_cargo_comprador', type: 'array', required: false, description: 'Gastos a cargo del comprador' },
      { name: 'gastos_a_cargo_vendedor', type: 'array', required: false, description: 'Gastos a cargo del vendedor' },
      { name: 'cargas_existentes', type: 'array', required: false, description: 'Cargas existentes sobre el inmueble' },
      { name: 'condiciones_especiales', type: 'array', required: false, description: 'Condiciones especiales' },
      { name: 'clausulas_particulares', type: 'array', required: false, description: 'Cláusulas particulares' },
      
      // Campos ESTADO LEGAL
      { name: 'hipotecas_pendientes', type: 'string', required: false, description: 'Hipotecas pendientes' },
      { name: 'servidumbres', type: 'string', required: false, description: 'Servidumbres' },
      { name: 'estado_conservacion', type: 'string', required: false, description: 'Estado de conservación' },
      { name: 'inventario_incluido', type: 'string', required: false, description: 'Inventario incluido' },
      { name: 'libre_cargas', type: 'boolean', required: false, description: 'Si está libre de cargas' },
      { name: 'condicion_suspensiva', type: 'boolean', required: false, description: 'Si tiene condición suspensiva' },
      { name: 'entrega_inmediata', type: 'boolean', required: false, description: 'Si hay entrega inmediata' },
      { name: 'autorizacion_notarial', type: 'boolean', required: false, description: 'Si tiene autorización notarial' },
      
      // Campos FECHAS Y NOTARÍA
      { name: 'fecha_entrega', type: 'date', required: false, validator: COMMON_VALIDATORS.date, description: 'Fecha de entrega' },
      { name: 'notario_numero_colegiado', type: 'string', required: false, description: 'Número de colegiado del notario' },
      { name: 'notaria_direccion', type: 'string', required: false, description: 'Dirección de la notaría' },
      { name: 'protocolo_numero', type: 'string', required: false, description: 'Número de protocolo' },
      
      // Campos VALORACIÓN E IMPUESTOS
      { name: 'valor_catastral', type: 'number', required: false, description: 'Valor catastral' },
      { name: 'coeficiente_participacion', type: 'number', required: false, description: 'Coeficiente de participación' },
      { name: 'itp_aplicable', type: 'string', required: false, description: 'ITP aplicable' },
      { name: 'base_imponible_itp', type: 'number', required: false, description: 'Base imponible para ITP' },
      { name: 'inscripcion_registro', type: 'string', required: false, description: 'Inscripción en registro' }
    ],
    custom_validations: [
      (data) => {
        // Validación: precio_venta debe coincidir con precio_en_letras (si ambos existen)
        if (data.precio_venta && data.precio_en_letras) {
          // Si ambos campos están presentes, consideramos válido
          // (validación semántica compleja requeriría procesamiento NLP)
          const hasNumericPrice = typeof data.precio_venta === 'number';
          const hasTextPrice = typeof data.precio_en_letras === 'string' && data.precio_en_letras.length > 10;
          
          return {
            valid: hasNumericPrice && hasTextPrice,
            error: (hasNumericPrice && hasTextPrice) ? undefined : 'precio_venta o precio_en_letras malformados'
          };
        }
        return { valid: true };
      },
      (data) => {
        // Validación: fecha_entrega no puede ser anterior a fecha_escritura
        if (data.fecha_escritura && data.fecha_entrega) {
          const valid = new Date(data.fecha_entrega) >= new Date(data.fecha_escritura);
          return {
            valid,
            error: valid ? undefined : 'fecha_entrega no puede ser anterior a fecha_escritura'
          };
        }
        return { valid: true };
      },
      (data) => {
        // Validación: superficie_util no puede ser mayor que superficie_m2
        if (data.superficie_util && data.superficie_m2) {
          const valid = data.superficie_util <= data.superficie_m2;
          return {
            valid,
            error: valid ? undefined : 'superficie_util no puede ser mayor que superficie_m2'
          };
        }
        return { valid: true };
      }
    ]
  }
};

/**
 * Valida datos extraídos contra el esquema de template correspondiente
 */
export function validateExtractedData(
  documentType: string, 
  extractedData: any
): ValidationResult {
  const schema = TEMPLATE_SCHEMAS[documentType];
  
  if (!schema) {
    return {
      valid: false,
      score: 0,
      present_fields: [],
      missing_fields: [],
      invalid_fields: [],
      field_validations: {}
    };
  }

  const fieldValidations: ValidationResult['field_validations'] = {};
  const presentFields: string[] = [];
  const missingFields: string[] = [];
  const invalidFields: string[] = [];

  // Validar cada campo
  schema.fields.forEach(field => {
    const value = extractedData[field.name];
    const isPresent = value !== undefined && value !== null && value !== '';
    
    let isValid = true;
    let error: string | undefined;

    if (isPresent) {
      presentFields.push(field.name);
      
      // Aplicar validador específico si existe
      if (field.validator) {
        isValid = field.validator(value);
        if (!isValid) {
          error = `Invalid ${field.type} value`;
          invalidFields.push(field.name);
        }
      }
    } else if (field.required) {
      missingFields.push(field.name);
      isValid = false;
      error = 'Required field missing';
    }

    fieldValidations[field.name] = {
      present: isPresent,
      valid: isValid,
      value: isPresent ? value : undefined,
      error
    };
  });

  // Aplicar validaciones personalizadas
  let customValidationErrors: string[] = [];
  if (schema.custom_validations) {
    schema.custom_validations.forEach(validation => {
      const result = validation(extractedData);
      if (!result.valid && result.error) {
        customValidationErrors.push(result.error);
        invalidFields.push('custom_validation');
      }
    });
  }

  // Calcular score
  const totalFields = schema.fields.length;
  const requiredFields = schema.fields.filter(f => f.required).length;
  const presentRequiredFields = schema.fields.filter(f => f.required && fieldValidations[f.name].present).length;
  const validFields = Object.values(fieldValidations).filter(f => f.valid).length;

  // Score basado en: campos requeridos presentes (60%) + campos válidos totales (40%)
  const requiredScore = requiredFields > 0 ? (presentRequiredFields / requiredFields) * 60 : 60;
  const validScore = (validFields / totalFields) * 40;
  const score = requiredScore + validScore;

  // Considerado válido si tiene al menos 70% y todos los campos requeridos
  const valid = score >= 70 && 
                missingFields.filter(f => schema.fields.find(field => field.name === f)?.required).length === 0 &&
                customValidationErrors.length === 0;

  return {
    valid,
    score: Math.round(score),
    present_fields: presentFields,
    missing_fields: missingFields,
    invalid_fields: invalidFields,
    field_validations: fieldValidations
  };
}

/**
 * Genera un reporte legible de validación
 */
export function generateValidationReport(
  documentType: string,
  extractedData: any,
  validation: ValidationResult
): string {
  const schema = TEMPLATE_SCHEMAS[documentType];
  
  let report = `📋 REPORTE VALIDACIÓN: ${documentType.toUpperCase()}\\n`;
  report += `🎯 Template: ${schema?.name || 'Unknown'}\\n`;
  report += `📊 Score: ${validation.score}% (${validation.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'})\\n\\n`;
  
  if (validation.present_fields.length > 0) {
    report += `✅ Campos presentes (${validation.present_fields.length}):\\n`;
    validation.present_fields.forEach(field => {
      const fieldVal = validation.field_validations[field];
      const status = fieldVal.valid ? '✅' : '⚠️';
      report += `   ${status} ${field}: ${JSON.stringify(fieldVal.value)}\\n`;
    });
    report += '\\n';
  }
  
  if (validation.missing_fields.length > 0) {
    report += `❌ Campos faltantes (${validation.missing_fields.length}):\\n`;
    validation.missing_fields.forEach(field => {
      const isRequired = schema?.fields.find(f => f.name === field)?.required;
      report += `   ${isRequired ? '🔴' : '🟡'} ${field} ${isRequired ? '(REQUERIDO)' : '(opcional)'}\\n`;
    });
    report += '\\n';
  }
  
  if (validation.invalid_fields.length > 0) {
    report += `⚠️ Campos inválidos (${validation.invalid_fields.length}):\\n`;
    validation.invalid_fields.forEach(field => {
      const error = validation.field_validations[field]?.error;
      report += `   ⚠️ ${field}: ${error || 'Validation failed'}\\n`;
    });
    report += '\\n';
  }
  
  return report;
}