/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API para descargar archivos de documentos desde Supabase Storage
 * ESTADO: production
 * DEPENDENCIAS: @/data/anon/documents, @/supabase-clients/server
 * OUTPUTS: Descarga directa del archivo PDF
 * ACTUALIZADO: 2025-09-15
 */
import { getDocument } from '@/data/anon/documents';
import { createSupabaseClient } from '@/supabase-clients/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const viewMode = searchParams.get('view'); // 'inline' para visualizar en navegador

    // Obtener información del documento
    const documentResult = await getDocument(id);
    if (!documentResult.success || !documentResult.data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = documentResult.data;
    
    // Descargar archivo desde Supabase Storage
    const supabase = await createSupabaseClient();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_path);

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Convertir blob a buffer
    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Determinar tipo de contenido
    const contentType = document.filename.toLowerCase().endsWith('.pdf') 
      ? 'application/pdf' 
      : 'application/octet-stream';

    // Determinar Content-Disposition según el modo de visualización
    const disposition = viewMode === 'inline' 
      ? `inline; filename="${encodeURIComponent(document.filename)}"` 
      : `attachment; filename="${encodeURIComponent(document.filename)}"`;

    // Retornar archivo con headers apropiados
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache por 1 año
        'ETag': document.file_hash, // Usar hash como ETag
      },
    });
  } catch (error) {
    console.error('Error in document download API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}