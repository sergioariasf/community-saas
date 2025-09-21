/**
 * ARCHIVO: DocumentsList.tsx
 * PROPÓSITO: Lista de documentos con información del pipeline progresivo
 * ESTADO: production
 * DEPENDENCIAS: @/components/ui, @/data/anon/documents
 * OUTPUTS: Tabla de documentos con estado real del pipeline
 * ACTUALIZADO: 2025-09-15
 */
'use client';

import { T } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Clock, FileText, Eye, Upload, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Document } from '@/data/anon/documents';

interface DocumentsListProps {
  documents: Document[];
  showActions?: boolean;
}

export const DocumentsList = ({ documents, showActions = true }: DocumentsListProps) => {
  // Calcular estado general del pipeline progresivo
  const getPipelineStatus = (document: Document) => {
    const { processing_level, extraction_status, classification_status, metadata_status, chunking_status } = document;
    
    // Verificar si hay errores
    const statuses = [extraction_status, classification_status, metadata_status, chunking_status].filter(Boolean);
    if (statuses.some(s => s === 'failed')) {
      return { status: 'error', text: 'Error' };
    }
    
    // Verificar si está procesando
    if (statuses.some(s => s === 'processing')) {
      return { status: 'processing', text: 'Procesando' };
    }
    
    // Verificar completitud según nivel
    const extractionDone = extraction_status === 'completed';
    const classificationOk = processing_level < 2 || classification_status === 'completed';
    const metadataOk = processing_level < 3 || metadata_status === 'completed';
    const chunkingOk = processing_level < 4 || chunking_status === 'completed';
    
    if (extractionDone && classificationOk && metadataOk && chunkingOk) {
      return { status: 'completed', text: `Nivel ${processing_level} Completo` };
    }
    
    // En progreso
    return { status: 'processing', text: `Procesando Nivel ${processing_level}` };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'default';
      case 'completed': return 'secondary';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };

  const getDocumentTypeIcon = (type: string | null) => {
    switch (type) {
      case 'acta': return '📋';
      case 'factura': return '🧾';
      case 'comunicado': return '📢';
      case 'contrato': return '📄';
      case 'presupuesto': return '💰';
      default: return '📄';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {showActions && (
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <T.H2>Mis Documentos</T.H2>
            <T.Subtle>
              Gestiona todos los documentos subidos a tus comunidades
            </T.Subtle>
          </div>
          <Link href="/documents/upload">
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Subir Documento
            </Button>
          </Link>
        </div>
      )}

      {documents.length ? (
        <Card className="shadow-sm border-muted/40">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Documento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Tamaño</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{document.filename}</div>
                        {document.created_at && (
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground text-xs">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(document.created_at).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getDocumentTypeIcon(document.document_type)}</span>
                      <span className="capitalize">
                        {document.document_type || 'Sin clasificar'}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    {(() => {
                      const pipelineStatus = getPipelineStatus(document);
                      return (
                        <div className="space-y-1">
                          <Badge variant={getStatusColor(pipelineStatus.status)} className="flex items-center gap-1 w-fit">
                            {getStatusIcon(pipelineStatus.status)}
                            <span>{pipelineStatus.text}</span>
                          </Badge>
                          <div className="flex gap-1 text-xs">
                            <span className={`px-1 py-0.5 rounded text-xs ${document.extraction_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              E{document.extraction_status === 'completed' ? '✓' : '○'}
                            </span>
                            {document.processing_level >= 2 && (
                              <span className={`px-1 py-0.5 rounded text-xs ${document.classification_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                C{document.classification_status === 'completed' ? '✓' : '○'}
                              </span>
                            )}
                            {document.processing_level >= 3 && (
                              <span className={`px-1 py-0.5 rounded text-xs ${document.metadata_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                M{document.metadata_status === 'completed' ? '✓' : '○'}
                              </span>
                            )}
                            {document.processing_level >= 4 && (
                              <span className={`px-1 py-0.5 rounded text-xs ${document.chunking_status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                Ch{document.chunking_status === 'completed' ? '✓' : '○'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </TableCell>

                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatFileSize(document.file_size)}
                  </TableCell>

                  <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                    {document.processing_completed_at ? (
                      <div className="space-y-1">
                        <div className="font-medium text-green-600">✅ Completado</div>
                        <div className="text-xs">
                          {new Date(document.processing_completed_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ) : document.processed_at ? (
                      <div className="space-y-1">
                        <div className="text-yellow-600">⚡ En proceso</div>
                        <div className="text-xs">
                          Iniciado: {new Date(document.processed_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">⏳ Pendiente</div>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/documents/${document.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Ver
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex items-center gap-1"
                        onClick={async () => {
                          if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
                            try {
                              const response = await fetch(`/api/documents/${document.id}`, {
                                method: 'DELETE',
                              });
                              if (response.ok) {
                                window.location.reload();
                              } else {
                                alert('Error al eliminar el documento');
                              }
                            } catch (error) {
                              alert('Error al eliminar el documento');
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No hay documentos</CardTitle>
            <CardDescription>
              Aún no tienes documentos subidos. ¡Sube tu primer documento!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documents/upload">
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" /> Subir Primer Documento
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};