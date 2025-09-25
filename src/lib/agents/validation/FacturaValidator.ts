/**
 * ARCHIVO: FacturaValidator.ts
 * PROPÓSITO: Validación específica para datos extraídos de factura comercials
 * ESTADO: development
 * DEPENDENCIAS: BaseValidator
 * OUTPUTS: Función validateFacturaData completa y robusta
 * ACTUALIZADO: 2025-09-24
 */

import { 
  validateString, validateNumber, validateDate, validateArray
} from './BaseValidator';

/**
 * Valida y limpia datos extraídos de factura comercials
 * Generado automáticamente por master-generator
 */
export function validateFacturaData(data: any): any {
  return {
    provider_name: validateString(data.provider_name, 200),
    client_name: validateString(data.client_name, 200),
    amount: validateNumber(data.amount),
    invoice_date: validateDate(data.invoice_date),
    category: validateString(data.category, 200),
    invoice_number: validateString(data.invoice_number, 200),
    issue_date: validateDate(data.issue_date),
    due_date: validateDate(data.due_date),
    subtotal: validateNumber(data.subtotal),
    tax_amount: validateNumber(data.tax_amount),
    total_amount: validateNumber(data.total_amount),
    currency: validateString(data.currency, 200),
    payment_method: validateString(data.payment_method, 200),
    vendor_address: validateString(data.vendor_address, 200),
    vendor_tax_id: validateString(data.vendor_tax_id, 200),
    vendor_phone: validateString(data.vendor_phone, 200),
    vendor_email: validateString(data.vendor_email, 200),
    client_address: validateString(data.client_address, 200),
    client_tax_id: validateString(data.client_tax_id, 200),
    client_phone: validateString(data.client_phone, 200),
    client_email: validateString(data.client_email, 200),
    products_summary: validateString(data.products_summary, 200),
    products_count: validateNumber(data.products_count, true), // entero
    products: validateArray(data.products || []),
    payment_terms: validateString(data.payment_terms, 200),
    notes: validateString(data.notes, 200),
    bank_details: validateString(data.bank_details, 200),
  };
}