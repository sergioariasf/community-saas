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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Clock, FileText, Eye, Upload, AlertCircle, CheckCircle2, Trash2, Filter, X, Info, FileIcon } from 'lucide-react';
import Link from 'next/link';
import { Document } from '@/data/anon/documents';
import { useState, useMemo } from 'react';

interface DocumentsListProps {
  documents: Document[];
  showActions?: boolean;
}

export const DocumentsList = ({ documents, showActions = true }: DocumentsListProps) => {
  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    sizeMin: '',
    sizeMax: ''
  });

  // Función para borrar documentos filtrados
  const deleteFilteredDocuments = async () => {
    if (filteredDocuments.length === 0) {
      alert('No hay documentos filtrados para eliminar');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar ${filteredDocuments.length} documentos filtrados?`)) {
      return;
    }

    try {
      const promises = filteredDocuments.map(doc => 
        fetch(`/api/documents/${doc.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(promises);
      window.location.reload();
    } catch (error) {
      alert('Error al eliminar algunos documentos');
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      type: 'all', 
      status: 'all',
      dateFrom: '',
      dateTo: '',
      sizeMin: '',
      sizeMax: ''
    });
  };

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

  // Documentos filtrados
  const filteredDocuments = useMemo(() => {
    return documents.filter(document => {
      // Filtro de búsqueda por nombre
      if (filters.search && !document.filename.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Filtro por tipo
      if (filters.type !== 'all' && document.document_type !== filters.type) {
        return false;
      }

      // Filtro por estado
      if (filters.status !== 'all') {
        const pipelineStatus = getPipelineStatus(document);
        if (pipelineStatus.status !== filters.status) {
          return false;
        }
      }

      // Filtro por fecha
      if (filters.dateFrom && document.created_at) {
        const docDate = new Date(document.created_at);
        const fromDate = new Date(filters.dateFrom);
        if (docDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo && document.created_at) {
        const docDate = new Date(document.created_at);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59); // Incluir todo el día
        if (docDate > toDate) {
          return false;
        }
      }

      // Filtro por tamaño
      if (filters.sizeMin) {
        const minBytes = parseFloat(filters.sizeMin) * 1024 * 1024; // MB a bytes
        if (document.file_size < minBytes) {
          return false;
        }
      }

      if (filters.sizeMax) {
        const maxBytes = parseFloat(filters.sizeMax) * 1024 * 1024; // MB a bytes
        if (document.file_size > maxBytes) {
          return false;
        }
      }

      return true;
    });
  }, [documents, filters]);

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

      {/* Panel de filtros */}
      {documents.length > 0 && (
        <Card className="border-muted/40 bg-muted/20">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <T.H3 className="text-base">Filtros ({filteredDocuments.length} de {documents.length})</T.H3>
              </div>
              <div className="flex gap-2">
                {filteredDocuments.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={deleteFilteredDocuments}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Borrar Filtrados ({filteredDocuments.length})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5 mr-1" />
                  Limpiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Búsqueda por nombre */}
              <div className="col-span-2">
                <Label htmlFor="search" className="text-xs">Buscar por nombre</Label>
                <Input
                  id="search"
                  placeholder="Buscar documento..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              {/* Filtro por tipo */}
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="acta">📋 Actas</SelectItem>
                    <SelectItem value="factura">🧾 Facturas</SelectItem>
                    <SelectItem value="comunicado">📢 Comunicados</SelectItem>
                    <SelectItem value="contrato">📄 Contratos</SelectItem>
                    <SelectItem value="presupuesto">💰 Presupuestos</SelectItem>
                    <SelectItem value="albaran">📦 Albaranes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por estado */}
              <div>
                <Label className="text-xs">Estado</Label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">✅ Completado</SelectItem>
                    <SelectItem value="processing">⏳ Procesando</SelectItem>
                    <SelectItem value="error">❌ Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha desde */}
              <div>
                <Label htmlFor="dateFrom" className="text-xs">Desde</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <Label htmlFor="dateTo" className="text-xs">Hasta</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Tamaño mínimo */}
              <div>
                <Label htmlFor="sizeMin" className="text-xs">Tamaño mín (MB)</Label>
                <Input
                  id="sizeMin"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={filters.sizeMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, sizeMin: e.target.value }))}
                />
              </div>

              {/* Tamaño máximo */}
              <div>
                <Label htmlFor="sizeMax" className="text-xs">Tamaño máx (MB)</Label>
                <Input
                  id="sizeMax"
                  type="number"
                  step="0.1"
                  placeholder="100.0"
                  value={filters.sizeMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, sizeMax: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredDocuments.length ? (
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
              {filteredDocuments.map((document) => (
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
                          title="Ver detalles y metadatos"
                        >
                          <Info className="h-3.5 w-3.5" /> Detalles
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        title="Ver contenido del documento"
                        onClick={() => {
                          // Abrir el documento en una nueva pestaña
                          window.open(`/api/documents/${document.id}/view`, '_blank');
                        }}
                      >
                        <FileIcon className="h-3.5 w-3.5" /> Abrir
                      </Button>
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
      ) : documents.length > 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>No hay documentos que coincidan con los filtros</CardTitle>
            <CardDescription>
              Ajusta los filtros para ver más documentos o limpia todos los filtros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" /> Limpiar Filtros
            </Button>
          </CardContent>
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