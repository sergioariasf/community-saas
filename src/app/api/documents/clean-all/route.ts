/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API para limpiar completamente todos los documentos (BD + Storage)
 * ESTADO: production
 * DEPENDENCIAS: @supabase/supabase-js
 * OUTPUTS: Limpieza completa de documentos para testing
 * ACTUALIZADO: 2025-09-15
 */
import { createSupabaseClient } from '@/supabase-clients/server';
import { NextResponse } from 'next/server';

export async function DELETE() {
  try {
    const supabase = await createSupabaseClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cleanupResults = {
      documentsDeleted: 0,
      storageFilesDeleted: 0,
      errors: [] as string[]
    };

    // PASO 1: Obtener todos los documentos
    const { data: documents, error: fetchError } = await supabase
      .from('documents')
      .select('id, filename, file_path');

    if (fetchError) {
      return NextResponse.json({ 
        error: 'Failed to fetch documents', 
        details: fetchError.message 
      }, { status: 500 });
    }

    cleanupResults.documentsDeleted = documents?.length || 0;

    // PASO 2: Eliminar archivos del Storage
    if (documents && documents.length > 0) {
      const filePaths = documents.map(doc => doc.file_path);
      console.log(`[CleanAll] Attempting to delete ${filePaths.length} files from storage:`, filePaths);
      
      try {
        const { data: storageDeleteData, error: storageError } = await supabase.storage
          .from('documents')
          .remove(filePaths);

        if (storageError) {
          console.error('[CleanAll] Storage deletion error:', storageError);
          cleanupResults.errors.push(`Storage deletion error: ${storageError.message}`);
        } else {
          console.log('[CleanAll] Storage deletion successful:', storageDeleteData);
          cleanupResults.storageFilesDeleted = storageDeleteData?.length || filePaths.length;
        }
      } catch (storageErr) {
        console.error('[CleanAll] Storage deletion exception:', storageErr);
        cleanupResults.errors.push(`Storage deletion failed: ${storageErr}`);
      }
    }
    
    // PASO 2.5: Limpiar TODOS los archivos del storage (método nuclear)
    try {
      console.log('[CleanAll] Attempting NUCLEAR cleanup of ALL storage...');
      
      // Método 1: Intentar eliminar toda la organización
      try {
        const orgPath = user.user_metadata?.organization_id || 'e3f4370b-2235-45ad-869a-737ee9fd95ab';
        console.log(`[CleanAll] Attempting to delete organization folder: ${orgPath}`);
        
        const { data: orgFiles, error: orgListError } = await supabase.storage
          .from('documents')
          .list(orgPath, { limit: 1000 });
        
        if (!orgListError && orgFiles && orgFiles.length > 0) {
          // Conseguir TODOS los archivos en la organización
          const getAllFilesRecursively = async (basePath = orgPath) => {
            const allFiles = [];
            const { data: items, error } = await supabase.storage
              .from('documents')
              .list(basePath, { limit: 1000 });
            
            if (error || !items) return allFiles;
            
            for (const item of items) {
              const fullPath = `${basePath}/${item.name}`;
              
              if (item.metadata && item.metadata.mimetype) {
                // Es un archivo
                allFiles.push(fullPath);
                console.log(`[CleanAll] Found file to delete: ${fullPath}`);
              } else {
                // Es carpeta, buscar recursivamente
                const subFiles = await getAllFilesRecursively(fullPath);
                allFiles.push(...subFiles);
              }
            }
            return allFiles;
          };
          
          const allFiles = await getAllFilesRecursively();
          console.log(`[CleanAll] Found ${allFiles.length} total files to delete`);
          
          // Eliminar en lotes para evitar timeouts
          const batchSize = 10;
          for (let i = 0; i < allFiles.length; i += batchSize) {
            const batch = allFiles.slice(i, i + batchSize);
            console.log(`[CleanAll] Deleting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} files`);
            
            const { error: batchError } = await supabase.storage
              .from('documents')
              .remove(batch);
              
            if (batchError) {
              console.error(`[CleanAll] Batch delete failed:`, batchError.message);
              cleanupResults.errors.push(`Batch delete error: ${batchError.message}`);
            } else {
              cleanupResults.storageFilesDeleted += batch.length;
              console.log(`[CleanAll] Successfully deleted batch of ${batch.length} files`);
            }
            
            // Pequeña pausa entre lotes
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (nuclearErr) {
        console.error('[CleanAll] Nuclear cleanup failed:', nuclearErr);
        cleanupResults.errors.push(`Nuclear cleanup failed: ${nuclearErr}`);
      }
      
      // Método 2: Verificación final - listar lo que queda
      try {
        const { data: remainingItems, error: remainingError } = await supabase.storage
          .from('documents')
          .list('', { limit: 100 });
          
        if (!remainingError && remainingItems) {
          console.log(`[CleanAll] Remaining items in storage root: ${remainingItems.length}`);
          remainingItems.forEach(item => {
            console.log(`[CleanAll] Remaining: ${item.name} (${item.metadata ? 'file' : 'folder'})`);
          });
        }
      } catch (verifyErr) {
        console.log('[CleanAll] Verification failed:', verifyErr);
      }
      
      console.log(`[CleanAll] Nuclear cleanup completed. Total files deleted: ${cleanupResults.storageFilesDeleted}`);
      
    } catch (err) {
      console.error('[CleanAll] Nuclear cleanup failed:', err);
      cleanupResults.errors.push(`Nuclear storage cleanup failed: ${err}`);
    }

    // PASO 3: Eliminar todos los documentos (CASCADE eliminará relacionados)
    if (documents && documents.length > 0) {
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos

      if (deleteError) {
        cleanupResults.errors.push(`Database deletion error: ${deleteError.message}`);
        return NextResponse.json({ 
          error: 'Failed to delete documents from database', 
          details: deleteError.message,
          results: cleanupResults
        }, { status: 500 });
      }
    }

    // PASO 4: Verificar limpieza
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar CASCADE

    const { count: remainingDocs } = await supabase
      .from('documents')
      .select('id', { count: 'exact' });

    const success = (remainingDocs || 0) === 0;

    return NextResponse.json({
      success,
      message: success 
        ? 'All documents cleaned successfully' 
        : 'Partial cleanup - some documents may remain',
      results: {
        ...cleanupResults,
        remainingDocuments: remainingDocs || 0
      }
    });

  } catch (error) {
    console.error('Error in clean-all API:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}