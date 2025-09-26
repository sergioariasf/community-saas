-- ARCHIVO: add_multidocumento_constraint.sql
-- PROPÓSITO: Agregar 'multidocumento' al constraint de document_type para soportar análisis multi-documento
-- ESTADO: production
-- DEPENDENCIAS: documents table
-- OUTPUTS: Migración de constraint para permitir tipo 'multidocumento'
-- ACTUALIZADO: 2025-09-25

-- Eliminar el constraint existente
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_document_type_check;

-- Recrear el constraint con 'multidocumento' incluido
ALTER TABLE public.documents 
ADD CONSTRAINT documents_document_type_check 
CHECK (
  document_type = ANY (
    ARRAY[
      'acta'::text,
      'factura'::text,
      'comunicado'::text,
      'albaran'::text,
      'contrato'::text,
      'presupuesto'::text,
      'escritura'::text,
      'multidocumento'::text
    ]
  )
);

-- Eliminar el constraint de extraction_method existente
ALTER TABLE public.documents DROP CONSTRAINT IF EXISTS documents_extraction_method_check;

-- Recrear el constraint con 'multi-document-analyzer' incluido
ALTER TABLE public.documents 
ADD CONSTRAINT documents_extraction_method_check 
CHECK (
  extraction_method = ANY (
    ARRAY[
      'pdf-parse'::text,
      'pdf-parse-external'::text,
      'google-vision-ocr'::text,
      'gemini-flash-ocr-ia'::text,
      'pdf-parse + google-vision-ocr'::text,
      'google-vision-ocr-only'::text,
      'multi-document-analyzer'::text
    ]
  )
);

-- Verificar ambos constraints
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.documents'::regclass 
  AND conname IN ('documents_document_type_check', 'documents_extraction_method_check');