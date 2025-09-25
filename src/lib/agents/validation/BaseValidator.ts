/**
 * ARCHIVO: BaseValidator.ts
 * PROPÓSITO: Funciones de validación comunes para todos los tipos de documentos
 * ESTADO: development
 * DEPENDENCIAS: ninguna
 * OUTPUTS: Funciones de validación reutilizables
 * ACTUALIZADO: 2025-09-23
 */

/**
 * Valida y formatea fechas en formato YYYY-MM-DD
 */
export function validateDate(dateStr: any): string | null {
  if (typeof dateStr !== 'string') return null;
  
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  
  // Intentar parsear fecha en varios formatos
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (dateRegex.test(trimmed)) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return trimmed;
    }
  }
  
  // Intentar convertir desde otros formatos comunes
  try {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch {
    // Si falla, retornar null
  }
  
  return null;
}

/**
 * Valida y convierte números, con opción de enteros
 */
export function validateNumber(value: any, isInteger: boolean = false): number | null {
  if (typeof value === 'number') {
    if (isNaN(value)) return null;
    return isInteger ? Math.round(value) : value;
  }
  
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    
    // Limpiar formato español (comas por puntos, espacios)
    const cleaned = trimmed
      .replace(/\s/g, '') // quitar espacios
      .replace(/,/g, '.'); // comas por puntos
    
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return null;
    
    return isInteger ? Math.round(parsed) : parsed;
  }
  
  return null;
}

/**
 * Valida y limpia strings con límites de caracteres
 */
export function validateString(value: any, maxLength?: number): string | null {
  if (typeof value !== 'string') return null;
  
  const trimmed = value.trim();
  if (!trimmed) return null;
  
  if (maxLength && trimmed.length > maxLength) {
    return trimmed.substring(0, maxLength).trim();
  }
  
  return trimmed;
}

/**
 * Valida arrays con límites de elementos y validación de contenido
 */
export function validateArray<T>(
  value: any, 
  maxElements?: number,
  validator?: (item: any) => T | null
): T[] {
  if (!Array.isArray(value)) return [];
  
  let result = value;
  
  // Aplicar validador a cada elemento si se proporciona
  if (validator) {
    result = value
      .map(validator)
      .filter(item => item !== null);
  }
  
  // Aplicar límite de elementos
  if (maxElements && result.length > maxElements) {
    result = result.slice(0, maxElements);
  }
  
  return result;
}

/**
 * Valida valores booleanos
 */
export function validateBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === 'yes' || lower === 'sí' || lower === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return false;
}

/**
 * Valida enums/opciones específicas
 */
export function validateEnum(value: any, validOptions: string[], defaultValue?: string): string | null {
  if (typeof value !== 'string') return defaultValue || null;
  
  const trimmed = value.toLowerCase().trim();
  const found = validOptions.find(option => option.toLowerCase() === trimmed);
  
  return found || defaultValue || null;
}