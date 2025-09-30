import { createSupabaseClient } from '@/supabase-clients/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import type { Database } from '@/lib/database.types';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ [DELETE] Eliminando documento:', id);
    
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 1. Obtener información del documento
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single() as { data: Database['public']['Tables']['documents']['Row'] | null, error: any };

    if (fetchError || !document) {
      return Response.json({ error: 'Documento no encontrado' }, { status: 404 });
    }

    console.log('📄 [DELETE] Documento encontrado:', document.filename, document.file_path);

    // 2. Verificar y eliminar archivo de Storage
    if (document.file_path) {
      console.log('🗑️ [DELETE] Intentando eliminar de storage:', document.file_path);
      
      // Primero verificar que el archivo existe
      const pathParts = document.file_path.split('/');
      const fileName = pathParts.pop();
      const dirPath = pathParts.join('/');
      
      console.log('🔍 [DELETE] Verificando existencia en:', dirPath);
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('documents')
        .list(dirPath, {
          limit: 100,
          search: fileName
        });
      
      if (listError) {
        console.warn('⚠️ [DELETE] Error verificando archivo:', listError);
      } else {
        console.log('📁 [DELETE] Archivos encontrados:', existingFiles?.length || 0);
        for (const file of existingFiles || []) {
          console.log('  -', file.name, file.metadata?.size || 'unknown', 'bytes');
        }
      }
      
      // Intentar eliminar con cliente Service Role (más robusto)
      console.log('🗑️ [DELETE] Eliminando archivo usando Service Role...');
      
      let storageDeleted = false;
      
      try {
        // Usar Service Role Key directamente para eliminar
        const serviceSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: removeData, error: serviceError } = await serviceSupabase.storage
          .from('documents')
          .remove([document.file_path]);
          
        if (serviceError) {
          console.error('❌ [DELETE] Error con Service Role:', serviceError);
        } else {
          console.log('✅ [DELETE] Service Role eliminación ejecutada');
          console.log('📊 [DELETE] Resultado:', removeData);
          
          // Verificar eliminación
          const { data: verifyFiles, error: verifyError } = await serviceSupabase.storage
            .from('documents')
            .list(dirPath, {
              limit: 100,
              search: fileName
            });
            
          if (verifyError) {
            console.log('🔍 [DELETE] Verificación: directorio no existe (archivo eliminado)');
            storageDeleted = true;
          } else {
            const remainingFiles = verifyFiles?.length || 0;
            console.log('🔍 [DELETE] Verificación:', remainingFiles, 'archivos restantes');
            if (remainingFiles === 0) {
              console.log('✅ [DELETE] Verificado: archivo eliminado correctamente');
              storageDeleted = true;
            } else {
              console.error('❌ [DELETE] ARCHIVO PERSISTE después de Service Role');
              for (const file of verifyFiles || []) {
                console.error('  - PERSISTENTE:', file.name);
              }
            }
          }
        }
        
      } catch (serviceRoleError) {
        console.error('💥 [DELETE] Error crítico con Service Role:', serviceRoleError);
      }
      
      // Si Service Role falló, intentar con cliente regular
      if (!storageDeleted) {
        console.log('🔄 [DELETE] Intentando con cliente regular como fallback...');
        const { data: removeData, error: storageError } = await supabase.storage
          .from('documents')
          .remove([document.file_path]);
        
        if (storageError) {
          console.error('❌ [DELETE] Error también con cliente regular:', storageError);
          console.warn('⚠️ [DELETE] ARCHIVO QUEDARÁ HUÉRFANO - continuando con BD...');
        } else {
          console.log('✅ [DELETE] Cliente regular funcionó como fallback');
          storageDeleted = true;
        }
      }
    } else {
      console.warn('⚠️ [DELETE] No hay file_path para eliminar');
    }

    // 3. Eliminar registro de BD
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('❌ [DELETE] Error eliminando de BD:', deleteError);
      return Response.json({ error: 'Error al eliminar documento' }, { status: 500 });
    }

    console.log('✅ [DELETE] Documento eliminado exitosamente');
    return Response.json({ success: true });

  } catch (error) {
    console.error('❌ [DELETE] Error general:', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}