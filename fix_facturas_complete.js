/**
 * ARCHIVO: fix_facturas_complete.js
 * PROPÓSITO: Corregir tabla extracted_invoices y agente para campos faltantes de plantilla
 * ESTADO: fixing
 * DEPENDENCIAS: supabase
 * OUTPUTS: SQL para añadir campos + prompt actualizado
 * ACTUALIZADO: 2025-09-20
 */

require('dotenv').config({path:'.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixFacturasComplete() {
  console.log('🔍 [FACTURAS FIX] Análisis completo de plantilla vs BD vs agente...\n');
  
  // 1. Verificar campos actuales en BD
  console.log('📋 PASO 1: Campos actuales en extracted_invoices:');
  const { data: currentData } = await supabase
    .from('extracted_invoices')
    .select('*')
    .limit(1);
    
  if (currentData && currentData.length > 0) {
    Object.keys(currentData[0]).forEach(field => {
      console.log(`  ✅ ${field}`);
    });
  }
  
  // 2. Campos que faltan según la plantilla
  const missingFields = [
    'vendor_phone', 'vendor_email', 'vendor_website',
    'client_phone', 'client_email',
    'issue_date', 'due_date', 
    'subtotal', 'tax_amount', 'total_amount', 'currency',
    'payment_method', 'payment_terms', 'bank_details',
    'products_description', 'products_quantities', 'products_unit_prices',
    'notes'
  ];
  
  console.log('\n❌ CAMPOS FALTANTES EN BD:');
  missingFields.forEach(field => {
    console.log(`  - ${field}`);
  });
  
  // 3. SQL para añadir campos faltantes
  console.log('\n🛠️ PASO 2: SQL para añadir campos faltantes:\n');
  
  const addFieldsSQL = `
-- Añadir campos de contacto del vendedor
ALTER TABLE extracted_invoices 
ADD COLUMN IF NOT EXISTS vendor_phone TEXT,
ADD COLUMN IF NOT EXISTS vendor_email TEXT,
ADD COLUMN IF NOT EXISTS vendor_website TEXT;

-- Añadir campos de contacto del cliente  
ALTER TABLE extracted_invoices
ADD COLUMN IF NOT EXISTS client_phone TEXT,
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Añadir campos de fechas adicionales
ALTER TABLE extracted_invoices
ADD COLUMN IF NOT EXISTS issue_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Añadir campos de montos adicionales
ALTER TABLE extracted_invoices
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- Añadir campos de pago
ALTER TABLE extracted_invoices
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS payment_terms TEXT,
ADD COLUMN IF NOT EXISTS bank_details TEXT;

-- Añadir campos de productos (JSON arrays)
ALTER TABLE extracted_invoices
ADD COLUMN IF NOT EXISTS products_description JSONB,
ADD COLUMN IF NOT EXISTS products_quantities JSONB,
ADD COLUMN IF NOT EXISTS products_unit_prices JSONB;

-- Añadir notas
ALTER TABLE extracted_invoices
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Verificar que se añadieron correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'extracted_invoices' 
AND table_schema = 'public'
ORDER BY ordinal_position;
`;

  console.log(addFieldsSQL);
  
  // 4. Nuevo prompt para el agente
  console.log('\n🤖 PASO 3: Prompt actualizado para agente facturas:\n');
  
  const newPrompt = `Eres un experto en análisis de documentos comerciales especializado en facturas. Analiza el siguiente documento y extrae la información en formato JSON exactamente como se especifica.

DOCUMENTO:
{document_text}

INSTRUCCIONES:
1. Lee todo el documento cuidadosamente
2. Extrae SOLO la información que esté presente en el documento
3. Si un campo no está presente, usar null
4. Para fechas usar formato YYYY-MM-DD
5. Para montos usar solo números decimales
6. Para arrays usar formato JSON válido

CAMPOS A EXTRAER:
{
  "provider_name": "nombre completo del proveedor/emisor",
  "client_name": "nombre completo del cliente/receptor",
  "amount": 1250.00,
  "invoice_date": "fecha de la factura (YYYY-MM-DD)",
  "category": "categoría de la factura (servicios, productos, etc.)",
  "invoice_number": "número de factura",
  "issue_date": "fecha de emisión (YYYY-MM-DD)",
  "due_date": "fecha de vencimiento (YYYY-MM-DD)",
  "subtotal": 1033.06,
  "tax_amount": 216.94,
  "total_amount": 1250.00,
  "currency": "EUR",
  "payment_method": "método de pago",
  "vendor_address": "dirección completa del vendedor",
  "vendor_tax_id": "NIF/CIF del vendedor",
  "vendor_phone": "teléfono del vendedor",
  "vendor_email": "email del vendedor",
  "vendor_website": "sitio web del vendedor",
  "client_address": "dirección completa del cliente",
  "client_tax_id": "NIF/CIF del cliente",
  "client_phone": "teléfono del cliente",
  "client_email": "email del cliente",
  "products": [
    {
      "description": "descripción del producto/servicio",
      "quantity": 2,
      "unit_price": 125.50,
      "total_price": 251.00
    }
  ],
  "payment_terms": "condiciones de pago",
  "bank_details": "datos bancarios (IBAN, cuenta, etc.)",
  "notes": "observaciones o notas adicionales"
}

IMPORTANTE: Devuelve SOLO el JSON, sin texto adicional.`;

  console.log(newPrompt);
  
  console.log('\n📝 PASO 4: Instrucciones de implementación:');
  console.log('1. Ejecuta el SQL en Supabase SQL Editor');
  console.log('2. Actualiza el agente factura_extractor_v2 con el nuevo prompt');
  console.log('3. Actualiza la función validateInvoiceData() con los nuevos campos');
  console.log('4. Prueba con un PDF real');
  
  console.log('\n✅ RESULTADO ESPERADO:');
  console.log('- Plantilla mostrará teléfono y email del vendedor');
  console.log('- Todos los campos de la plantilla estarán disponibles');
  console.log('- El agente extraerá información completa de facturas');
}

fixFacturasComplete().catch(console.error);