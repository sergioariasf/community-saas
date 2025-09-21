/**
 * ARCHIVO: CleanAllButton.tsx
 * PROPÓSITO: Botón para limpiar completamente todos los documentos (BD + Storage)
 * ESTADO: production
 * DEPENDENCIAS: @/components/ui, lucide-react
 * OUTPUTS: Botón con confirmación para limpieza completa
 * ACTUALIZADO: 2025-09-15
 */
'use client';

import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle, Database, HardDrive } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CleanAllButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCleanAll = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/documents/clean-all', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('🎉 Limpieza completada', {
          description: `${result.results.documentsDeleted} documentos eliminados. Base de datos y storage limpios.`,
          duration: 5000,
        });
        
        // Recargar la página para mostrar la lista vacía
        window.location.reload();
      } else {
        toast.error('Error en la limpieza', {
          description: result.error || 'No se pudieron eliminar todos los documentos',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error cleaning documents:', error);
      toast.error('Error de conexión', {
        description: 'No se pudo conectar con el servidor',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4" /> 
          Borrar Todo
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            ¿Eliminar todos los documentos?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="text-sm">
              Esta acción <strong>eliminará permanentemente</strong> todos los documentos y sus datos relacionados:
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Database className="h-4 w-4 text-blue-500" />
                <span>Base de datos: documentos, metadatos, chunks, clasificaciones</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <HardDrive className="h-4 w-4 text-green-500" />
                <span>Storage: archivos PDF originales</span>
              </div>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <Badge variant="destructive" className="text-xs mb-2">
                ⚠️ IRREVERSIBLE
              </Badge>
              <div className="text-xs text-destructive">
                No se puede deshacer. Útil para testing y desarrollo.
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCleanAll}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Sí, eliminar todo
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}