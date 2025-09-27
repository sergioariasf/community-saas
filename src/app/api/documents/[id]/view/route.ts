/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API endpoint para servir documentos desde Supabase Storage
 * ESTADO: development
 * DEPENDENCIAS: NextRequest, Supabase Storage
 * OUTPUTS: Stream de documento (PDF, texto, etc.)
 * ACTUALIZADO: 2025-09-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/supabase-clients/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('👁️ [DOCUMENT VIEWER] Starting document view request...');
    const { id } = await params;
    console.log('📄 [DOCUMENT VIEWER] Document ID:', id);

    const supabase = await createSupabaseClient();

    // Obtener información del documento
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('filename, file_path, mime_type, file_size, organization_id, extracted_text')
      .eq('id', id)
      .single();

    if (docError || !document) {
      console.error('❌ [DOCUMENT VIEWER] Document not found:', docError);
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    console.log('📁 [DOCUMENT VIEWER] Document found:', {
      filename: document.filename,
      path: document.file_path,
      mimeType: document.mime_type,
      size: document.file_size
    });

    let buffer: Uint8Array;

    // Para documentos de texto (hijos de multidocumento), servir directamente desde extracted_text
    if (document.mime_type === 'text/plain' && document.extracted_text) {
      console.log('📝 [DOCUMENT VIEWER] Serving text document from database');
      buffer = new TextEncoder().encode(document.extracted_text);
    } else {
      // Para PDFs y otros archivos, descargar desde Supabase Storage
      const { data: fileData, error: storageError } = await supabase.storage
        .from('documents')
        .download(document.file_path);

      if (storageError || !fileData) {
        console.error('❌ [DOCUMENT VIEWER] Storage error:', storageError);
        return NextResponse.json(
          { error: 'Error al acceder al archivo' },
          { status: 500 }
        );
      }

      console.log('✅ [DOCUMENT VIEWER] File downloaded successfully');

      // Convertir blob a buffer
      const arrayBuffer = await fileData.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);
    }

    // Determinar headers apropiados
    const headers = new Headers();
    headers.set('Content-Type', document.mime_type || 'application/octet-stream');
    headers.set('Content-Length', buffer.length.toString());
    
    // Para PDFs, mostrar en el navegador. Para texto, también.
    if (document.mime_type === 'application/pdf' || document.mime_type === 'text/plain') {
      headers.set('Content-Disposition', `inline; filename="${document.filename}"`);
    } else {
      headers.set('Content-Disposition', `attachment; filename="${document.filename}"`);
    }

    // Cache headers
    headers.set('Cache-Control', 'private, max-age=3600');

    console.log('📤 [DOCUMENT VIEWER] Serving document with headers:', {
      contentType: headers.get('Content-Type'),
      contentLength: headers.get('Content-Length'),
      disposition: headers.get('Content-Disposition')
    });

    return new NextResponse(buffer as BodyInit, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('💥 [DOCUMENT VIEWER] Unexpected error:', error);
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseClient();

    // Obtener información del documento
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('filename, file_path, mime_type, file_size')
      .eq('id', id)
      .single();

    if (docError || !document) {
      return new NextResponse(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', document.mime_type || 'application/octet-stream');
    headers.set('Content-Length', document.file_size.toString());
    
    if (document.mime_type === 'application/pdf' || document.mime_type === 'text/plain') {
      headers.set('Content-Disposition', `inline; filename="${document.filename}"`);
    } else {
      headers.set('Content-Disposition', `attachment; filename="${document.filename}"`);
    }

    return new NextResponse(null, {
      status: 200,
      headers
    });

  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}