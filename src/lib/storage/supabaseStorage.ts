'use server';

import { createSupabaseClient } from '@/supabase-clients/server';
import crypto from 'crypto';

/**
 * Utilidades para manejo de archivos en Supabase Storage
 * Configurado con RLS para multi-tenancy por organización
 */

export interface StorageUploadResult {
  success: boolean;
  filePath?: string;
  fileUrl?: string;
  error?: string;
  metadata?: {
    size: number;
    hash: string;
    contentType: string;
  };
}

// Configuración del bucket
const DOCUMENTS_BUCKET = 'documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf'];

/**
 * Sube un archivo PDF a Supabase Storage
 */
export async function uploadDocumentToStorage(
  file: File,
  organizationId: string,
  communityId?: string
): Promise<StorageUploadResult> {
  try {
    console.log(`[Storage Upload] Starting upload: ${file.name} (${file.size} bytes)`);
    console.log(`[Storage Upload] File type: ${file.type}`);
    console.log(`[Storage Upload] Organization: ${organizationId}`);
    console.log(`[Storage Upload] Community: ${communityId || 'none'}`);

    // Validaciones previas
    console.log(`[Storage Upload] Step 1: Validating file...`);
    const validationError = validateFile(file);
    if (validationError) {
      console.error(`[Storage Upload] Validation failed: ${validationError}`);
      return {
        success: false,
        error: validationError
      };
    }
    console.log(`[Storage Upload] ✅ File validation passed`);

    // Generar hash del archivo para detección de duplicados
    console.log(`[Storage Upload] Step 2: Generating file hash...`);
    const startTime = Date.now();
    const buffer = await file.arrayBuffer();
    console.log(`[Storage Upload] ArrayBuffer created: ${buffer.byteLength} bytes in ${Date.now() - startTime}ms`);
    
    const hashStartTime = Date.now();
    const fileHash = generateFileHash(Buffer.from(buffer));
    console.log(`[Storage Upload] Hash generated: ${fileHash.substring(0, 16)}... in ${Date.now() - hashStartTime}ms`);

    // Generar ruta única
    console.log(`[Storage Upload] Step 3: Generating file path...`);
    const filePath = generateFilePath(organizationId, file.name, fileHash, communityId);
    console.log(`[Storage Upload] File path: ${filePath}`);

    // Subir archivo
    console.log(`[Storage Upload] Step 4: Creating Supabase client...`);
    const supabase = await createSupabaseClient();
    console.log(`[Storage Upload] ✅ Supabase client created`);
    
    console.log(`[Storage Upload] Step 5: Starting Supabase Storage upload...`);
    console.log(`[Storage Upload] Bucket: ${DOCUMENTS_BUCKET}`);
    console.log(`[Storage Upload] Path: ${filePath}`);
    console.log(`[Storage Upload] Size: ${buffer.byteLength} bytes`);
    console.log(`[Storage Upload] Content-Type: ${file.type}`);
    
    const uploadStartTime = Date.now();
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600', // Cache por 1 hora
        upsert: false, // No sobrescribir si existe
      });
    
    const uploadTime = Date.now() - uploadStartTime;
    console.log(`[Storage Upload] Upload attempt completed in ${uploadTime}ms`);

    if (error) {
      console.error('[Storage Upload] Error:', error);
      
      // Manejo específico de errores
      if (error.message.includes('already exists')) {
        return {
          success: false,
          error: 'Este archivo ya ha sido subido anteriormente'
        };
      }
      
      return {
        success: false,
        error: `Error al subir archivo: ${error.message}`
      };
    }

    // Generar URL pública (signed para seguridad)
    const { data: urlData } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(filePath, 3600); // URL válida por 1 hora

    console.log(`[Storage Upload] Success: ${filePath}`);

    return {
      success: true,
      filePath: data.path,
      fileUrl: urlData?.signedUrl,
      metadata: {
        size: file.size,
        hash: fileHash,
        contentType: file.type
      }
    };

  } catch (error) {
    console.error('[Storage Upload] Unexpected error:', error);
    return {
      success: false,
      error: 'Error inesperado al subir el archivo'
    };
  }
}

/**
 * Descarga un archivo desde Supabase Storage
 */
export async function downloadDocumentFromStorage(filePath: string): Promise<Buffer | null> {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .download(filePath);

    if (error) {
      console.error('[Storage Download] Error:', error);
      return null;
    }

    return Buffer.from(await data.arrayBuffer());
  } catch (error) {
    console.error('[Storage Download] Unexpected error:', error);
    return null;
  }
}

/**
 * Genera URL firmada para acceso temporal a un archivo
 */
export async function getDocumentSignedUrl(filePath: string, expiresInSeconds: number = 3600): Promise<string | null> {
  try {
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      console.error('[Storage URL] Error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('[Storage URL] Unexpected error:', error);
    return null;
  }
}

/**
 * Elimina un archivo de Supabase Storage
 */
export async function deleteDocumentFromStorage(filePath: string): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();
    
    const { error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('[Storage Delete] Error:', error);
      return false;
    }

    console.log(`[Storage Delete] Deleted: ${filePath}`);
    return true;
  } catch (error) {
    console.error('[Storage Delete] Unexpected error:', error);
    return false;
  }
}

/**
 * Valida el archivo antes de subirlo
 */
function validateFile(file: File): string | null {
  // Verificar tipo
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Solo se permiten archivos PDF';
  }

  // Verificar tamaño
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return `El archivo debe ser menor a ${maxSizeMB}MB`;
  }

  // Verificar nombre
  if (!file.name || file.name.trim().length === 0) {
    return 'El archivo debe tener un nombre válido';
  }

  return null;
}

/**
 * Genera hash SHA-256 del archivo para detección de duplicados
 */
function generateFileHash(buffer: Buffer): string {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
}

/**
 * Genera ruta única para el archivo en storage
 * Estructura: /org_id/[community_id/]year/month/filename_hash.ext
 */
function generateFilePath(
  organizationId: string, 
  originalFilename: string, 
  fileHash: string,
  communityId?: string
): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Limpiar nombre de archivo
  const cleanFilename = sanitizeFilename(originalFilename);
  const fileExtension = cleanFilename.split('.').pop();
  const baseFilename = cleanFilename.replace(`.${fileExtension}`, '');
  
  // Crear nombre único con timestamp para evitar caché de Supabase Storage
  const timestamp = Date.now();
  const uniqueFilename = `${baseFilename}_${fileHash.substring(0, 8)}_${timestamp}.${fileExtension}`;
  
  // Construir ruta
  const pathParts = [organizationId];
  
  if (communityId) {
    pathParts.push(communityId);
  }
  
  pathParts.push(String(year), month, uniqueFilename);
  
  return pathParts.join('/');
}

/**
 * Limpia el nombre del archivo para uso en storage
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales
    .replace(/_{2,}/g, '_')           // Colapsar múltiples guiones bajos
    .replace(/^_|_$/g, '')           // Eliminar guiones bajos al inicio/final
    .toLowerCase();
}

/**
 * Configura el bucket de documentos con las políticas RLS necesarias
 * Esta función debe ejecutarse una vez durante el setup inicial
 */
export async function setupDocumentsBucket(): Promise<boolean> {
  try {
    const supabase = await createSupabaseClient();

    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('[Storage Setup] Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === DOCUMENTS_BUCKET);

    if (!bucketExists) {
      // Crear bucket si no existe
      const { error: createError } = await supabase.storage.createBucket(DOCUMENTS_BUCKET, {
        public: false, // Archivos privados
        allowedMimeTypes: ALLOWED_TYPES,
        fileSizeLimit: MAX_FILE_SIZE,
      });

      if (createError) {
        console.error('[Storage Setup] Error creating bucket:', createError);
        return false;
      }

      console.log(`[Storage Setup] Created bucket: ${DOCUMENTS_BUCKET}`);
    }

    console.log(`[Storage Setup] Bucket ${DOCUMENTS_BUCKET} is ready`);
    return true;

  } catch (error) {
    console.error('[Storage Setup] Unexpected error:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas de uso de storage por organización
 */
export async function getStorageStats(organizationId: string): Promise<{
  totalFiles: number;
  totalSize: number;
  sizeMB: number;
} | null> {
  try {
    const supabase = await createSupabaseClient();
    
    // Obtener lista de archivos de la organización
    const { data: files, error } = await supabase.storage
      .from(DOCUMENTS_BUCKET)
      .list(organizationId, {
        limit: 1000, // Límite razonable
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('[Storage Stats] Error:', error);
      return null;
    }

    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    const sizeMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;

    return {
      totalFiles,
      totalSize,
      sizeMB
    };

  } catch (error) {
    console.error('[Storage Stats] Unexpected error:', error);
    return null;
  }
}