-- ARCHIVO: fix_document_types_constraint.sql
-- PROPÓSITO: Actualizar constraint de document_type para permitir todos los tipos nuevos
-- ESTADO: testing
-- DEPENDENCIAS: tabla documents
-- OUTPUTS: Constraint actualizado para permitir todos los tipos de documentos
-- ACTUALIZADO: 2025-09-18

-- Ver constraint actual
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'documents'::regclass 
AND conname LIKE '%document_type%';

-- Eliminar constraint existente
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Crear nuevo constraint con todos los tipos
ALTER TABLE documents ADD CONSTRAINT documents_document_type_check 
CHECK (document_type IN (
  'acta', 
  'factura', 
  'comunicado', 
  'albaran', 
  'contrato', 
  'presupuesto', 
  'escritura'
));

-- Verificar que se aplicó correctamente
SELECT conname, pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'documents'::regclass 
AND conname LIKE '%document_type%';