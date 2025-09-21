/**
 * ARCHIVO: ClientPage.tsx
 * PROPÓSITO: Componente cliente para upload de documentos con React 19 compatibility
 * ESTADO: development
 * DEPENDENCIAS: react-hook-form, SimpleSelect, uploadAndProcessFormData action
 * OUTPUTS: UI upload con select nativo + pipeline progresivo
 * ACTUALIZADO: 2025-09-15
 */

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { T } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// Replaced with SimpleSelect for React 19 compatibility
import { SimpleSelect, SimpleSelectItem } from './SimpleSelect';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/supabase-clients/client';
import { uploadAndProcessFormData } from '../actions';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, Upload, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';

// Esquema de validación para el formulario
const formSchema = z.object({
  file: z.any().refine((files) => {
    return files?.length == 1;
  }, 'Debes seleccionar un archivo.').refine((files) => {
    return files?.[0]?.type === 'application/pdf';
  }, 'Solo se permiten archivos PDF.').refine((files) => {
    return files?.[0]?.size <= 10 * 1024 * 1024; // 10MB
  }, 'El archivo debe ser menor a 10MB.'),
  community_id: z.string().uuid('Selecciona una comunidad válida').min(1, 'Debes seleccionar una comunidad'),
  processing_level: z.string().refine((val) => ['1', '2', '3', '4'].includes(val), 'Nivel de procesamiento inválido'),
});

type FormData = z.infer<typeof formSchema>;

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ClientPage() {
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingSteps, setProcessingSteps] = useState({
    upload: false,
    textExtraction: false,
    classification: false,
    dataExtraction: false,
  });
  const [processingProgress, setProcessingProgress] = useState(0);
  const [pipelineDetails, setPipelineDetails] = useState<{
    processing_level?: number;
    completed_steps?: string[];
    failed_steps?: string[];
    total_processing_time_ms?: number;
    total_tokens_used?: number;
    estimated_total_cost_usd?: number;
  }>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      community_id: '',
      processing_level: '4', // Default to full processing
    },
  });

  // Cargar comunidades al montar el componente
  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    console.log('🏘️ [loadCommunities] Iniciando carga de comunidades...');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 [loadCommunities] Usuario obtenido:', user?.id, user?.email);
      
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      // Verificar si es admin
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, community_id')
        .eq('user_id', user.id);

      if (rolesError) {
        console.error('❌ [loadCommunities] Error fetching user roles:', rolesError);
        toast.error('Error al cargar roles de usuario');
        return;
      }

      console.log('🔰 [loadCommunities] Roles del usuario:', userRoles);
      const isAdmin = userRoles?.some(role => role.role === 'admin') || false;
      console.log('👑 [loadCommunities] ¿Es admin?', isAdmin);

      if (isAdmin) {
        // Admin puede ver TODAS las comunidades
        const { data: allCommunities, error: communitiesError } = await supabase
          .from('communities')
          .select('id, name')
          .order('name');

        if (communitiesError) {
          console.error('Error fetching all communities:', communitiesError);
          toast.error('Error al cargar las comunidades');
          return;
        }

        const processedCommunities = allCommunities.map(community => ({
          id: community.id,
          name: community.name
        }));
        console.log('🏘️ [loadCommunities] Comunidades cargadas (admin):', processedCommunities);
        setCommunities(processedCommunities);
      } else {
        // Para managers y residents, solo comunidades asignadas
        const { data, error } = await supabase
          .from('user_roles')
          .select(`
            communities:community_id (
              id,
              name
            )
          `)
          .eq('user_id', user.id)
          .not('community_id', 'is', null);

        if (error) {
          console.error('Error fetching user communities:', error);
          toast.error('Error al cargar las comunidades');
          return;
        }

        interface SupabaseUserRoleResponse {
          communities: {
            id: string;
            name: string;
          } | null;
        }
        
        const communities = (data as unknown as SupabaseUserRoleResponse[])
          .map(item => item.communities)
          .filter((community): community is { id: string; name: string } => Boolean(community))
          .map(community => ({
            id: community.id,
            name: community.name
          }));

        console.log('🏘️ [loadCommunities] Comunidades cargadas (no-admin):', communities);
        setCommunities(communities);
      }
    } catch (error) {
      console.error('Error loading communities:', error);
      toast.error('Error al cargar las comunidades');
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('📤 [onSubmit] INICIANDO PROCESO DE UPLOAD');
    console.log('📄 [onSubmit] Datos del formulario:', {
      file: data.file?.[0]?.name,
      fileSize: data.file?.[0]?.size,
      community_id: data.community_id,
      processing_level: data.processing_level,
      description: data.description
    });
    
    setIsSubmitting(true);
    setProcessingProgress(0);
    setProcessingSteps({
      upload: false,
      textExtraction: false,
      classification: false,
      dataExtraction: false,
    });

    toastRef.current = toast.loading('Iniciando procesamiento...');

    try {
      const file = data.file[0] as File;
      console.log('📄 [onSubmit] Archivo seleccionado:', file.name, file.size, 'bytes');
      
      // Crear FormData para enviar al servidor
      const formData = new FormData();
      formData.append('file', file);
      formData.append('community_id', data.community_id);
      formData.append('processing_level', data.processing_level);
      console.log('📦 [onSubmit] FormData preparado:', {
        community_id: data.community_id,
        processing_level: data.processing_level
      });

      // Simular progreso mientras procesamos
      setProcessingProgress(10);
      toast.loading('Subiendo archivo...', { id: toastRef.current });
      
      console.log('🚀 [onSubmit] Llamando a uploadAndProcessFormData...');
      // Llamar a la función de procesamiento real
      const result = await uploadAndProcessFormData(formData);
      console.log('📥 [onSubmit] Resultado de uploadAndProcessFormData:', result);

      if (result.success) {
        // Actualizar progreso basado en los pasos completados
        setProcessingSteps(result.steps || {
          upload: true,
          textExtraction: true,
          classification: true,
          dataExtraction: true,
        });
        
        // Capturar detalles del pipeline progresivo
        if (result.pipelineResult) {
          setPipelineDetails(result.pipelineResult);
          console.log('🎯 [onSubmit] Pipeline details:', result.pipelineResult);
        }
        
        setProcessingProgress(100);
        
        const successMessage = result.pipelineResult 
          ? `¡Documento procesado exitosamente! Nivel ${result.pipelineResult.processing_level} completado en ${Math.round(result.pipelineResult.total_processing_time_ms / 1000)}s`
          : '¡Documento procesado exitosamente!';
        
        toast.success(successMessage, { id: toastRef.current });
        
        // Redirigir al documento procesado
        setTimeout(() => {
          if (result.documentId) {
            router.push(`/documents/${result.documentId}`);
          } else {
            router.push('/documents');
          }
        }, 1500);
      } else {
        // Mostrar error y estado parcial si está disponible
        if (result.steps) {
          setProcessingSteps(result.steps);
          const completedSteps = Object.values(result.steps).filter(Boolean).length;
          setProcessingProgress((completedSteps / 4) * 100);
        }
        
        toast.error(result.error || 'Error durante el procesamiento', { id: toastRef.current });
      }

    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      
      // Mensajes específicos para errores comunes
      if (errorMessage.includes('ya ha sido subido anteriormente')) {
        errorMessage = '📁 Este archivo ya existe. Por favor, elimínalo primero o usa un archivo diferente.';
      } else if (errorMessage.includes('The resource already exists')) {
        errorMessage = '📁 Archivo duplicado. Por favor, usa un nombre diferente o elimina el archivo existente.';
      } else if (errorMessage.includes('Could not find')) {
        errorMessage = '🗄️ Error de base de datos. Por favor, contacta al administrador.';
      }
      
      toast.error(errorMessage, { id: toastRef.current, duration: 6000 });
    } finally {
      toastRef.current = undefined;
      setIsSubmitting(false);
    }
  };

  // Función para generar hash del archivo (simulado)
  const generateFileHash = async (file: File): Promise<string> => {
    // En producción, usar crypto.subtle.digest
    // Por ahora retornamos un hash simulado
    return `hash_${file.name}_${file.size}_${Date.now()}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Watch file para mostrar información
  const watchedFile = form.watch('file');
  const selectedFile = watchedFile?.[0];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container max-w-2xl mx-auto py-8"
    >
      <div className="mb-6">
        <Link 
          href="/documents" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Documentos
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <T.H2>Subir Documento</T.H2>
            </div>
          </CardTitle>
          <CardDescription>
            Sube un documento PDF para procesamiento automático (actas, facturas, comunicados)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Archivo PDF *</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <Input
                          {...fieldProps}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => onChange(e.target.files)}
                          className="cursor-pointer"
                        />
                        {selectedFile && (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {selectedFile.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatFileSize(selectedFile.size)} • PDF
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Solo archivos PDF, máximo 10MB. El sistema clasificará automáticamente el tipo de documento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="community_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comunidad *</FormLabel>
                    <FormControl>
                      <SimpleSelect 
                        onValueChange={field.onChange} 
                        value={field.value}
                        placeholder="Selecciona una comunidad"
                      >
                        {communities.map((community) => (
                          <SimpleSelectItem key={community.id} value={community.id}>
                            {community.name}
                          </SimpleSelectItem>
                        ))}
                      </SimpleSelect>
                    </FormControl>
                    <FormDescription>
                      Selecciona la comunidad a la que pertenece este documento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="processing_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nivel de Procesamiento *</FormLabel>
                    <FormControl>
                      <SimpleSelect 
                        onValueChange={field.onChange} 
                        value={field.value}
                        placeholder="Selecciona el nivel de procesamiento"
                      >
                        <SimpleSelectItem value="1">Nivel 1 - Básico (Solo almacenamiento y extracción de texto)</SimpleSelectItem>
                        <SimpleSelectItem value="2">Nivel 2 - Clasificación (+ Clasificación automática del documento)</SimpleSelectItem>
                        <SimpleSelectItem value="3">Nivel 3 - Metadatos (+ Extracción de fechas, importes y datos estructurados)</SimpleSelectItem>
                        <SimpleSelectItem value="4">Nivel 4 - Completo (+ Segmentación para búsqueda avanzada RAG)</SimpleSelectItem>
                      </SimpleSelect>
                    </FormControl>
                    <FormDescription>
                      Selecciona el nivel de procesamiento deseado. Niveles superiores incluyen todas las funcionalidades de los niveles anteriores.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Progreso de procesamiento */}
              {isSubmitting && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">Procesando documento...</p>
                      <p className="text-sm text-gray-600">{Math.round(processingProgress)}%</p>
                    </div>
                    
                    <Progress value={processingProgress} className="h-2" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {processingSteps.upload ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : isSubmitting ? (
                          <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300" />
                        )}
                        <span className={processingSteps.upload ? 'text-green-700' : 'text-gray-600'}>
                          Subida a storage
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {processingSteps.textExtraction ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : processingSteps.upload && isSubmitting ? (
                          <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300" />
                        )}
                        <span className={processingSteps.textExtraction ? 'text-green-700' : 'text-gray-600'}>
                          Extracción de texto
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {processingSteps.classification ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : processingSteps.textExtraction && isSubmitting ? (
                          <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300" />
                        )}
                        <span className={processingSteps.classification ? 'text-green-700' : 'text-gray-600'}>
                          Clasificación de documento
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {processingSteps.dataExtraction ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : processingSteps.classification && isSubmitting ? (
                          <Clock className="h-4 w-4 text-yellow-500 animate-spin" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-300" />
                        )}
                        <span className={processingSteps.dataExtraction ? 'text-green-700' : 'text-gray-600'}>
                          Extracción de metadatos y segmentación
                        </span>
                      </div>
                    </div>
                    
                    {/* Pipeline Progress Details */}
                    {pipelineDetails.processing_level && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                        <div className="flex justify-between items-center mb-1">
                          <span>Nivel de procesamiento:</span>
                          <span className="font-medium">Nivel {pipelineDetails.processing_level}</span>
                        </div>
                        {pipelineDetails.completed_steps && pipelineDetails.completed_steps.length > 0 && (
                          <div className="flex justify-between items-center mb-1">
                            <span>Etapas completadas:</span>
                            <span className="font-medium">{pipelineDetails.completed_steps.join(', ')}</span>
                          </div>
                        )}
                        {pipelineDetails.total_processing_time_ms && (
                          <div className="flex justify-between items-center mb-1">
                            <span>Tiempo de procesamiento:</span>
                            <span className="font-medium">{Math.round(pipelineDetails.total_processing_time_ms / 1000)}s</span>
                          </div>
                        )}
                        {pipelineDetails.total_tokens_used && pipelineDetails.total_tokens_used > 0 && (
                          <div className="flex justify-between items-center">
                            <span>Tokens utilizados:</span>
                            <span className="font-medium">{pipelineDetails.total_tokens_used.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              {!isSubmitting && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Pipeline de Procesamiento Progresivo</p>
                      <p>
                        El sistema procesará el documento según el nivel seleccionado: extracción de texto, 
                        clasificación automática, extracción de metadatos estructurados y segmentación para búsqueda avanzada.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/documents')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  disabled={isSubmitting || !form.formState.isValid}
                >
                  {isSubmitting ? 'Subiendo...' : 'Subir Documento'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}