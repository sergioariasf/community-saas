'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAction } from 'next-safe-action/hooks';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateCommunityAction } from '@/data/anon/communities';
import { Table } from '@/types';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  address: z.string().optional(),
  postal_code: z.string().max(10, 'Máximo 10 caracteres').optional(),
  admin_contact: z.string().email('Debe ser un email válido').optional(),
  max_units: z.coerce.number().int().min(1, 'Mínimo 1 vivienda').default(100),
});

type FormData = z.infer<typeof formSchema>;

interface ClientPageProps {
  community: Table<'communities'>;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const ClientPage: React.FC<ClientPageProps> = ({ community }) => {
  const router = useRouter();
  const toastRef = useRef<string | number | undefined>(undefined);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      name: community.name,
      address: community.address || '',
      postal_code: community.postal_code || '',
      admin_contact: community.admin_contact || '',
      max_units: community.max_units || 100,
    },
  });

  const { execute, status } = useAction(updateCommunityAction, {
    onExecute: () => {
      toastRef.current = toast.loading('Actualizando comunidad...');
    },
    onSuccess: ({ data }) => {
      toast.success('Comunidad actualizada exitosamente', { id: toastRef.current });
      toastRef.current = undefined;
      router.refresh();
      if (data) {
        router.push(`/communities/${data}`);
      } else {
        router.push('/communities');
      }
    },
    onError: ({ error }) => {
      const errorMessage = error.serverError ?? 'Error al actualizar la comunidad';
      toast.error(errorMessage, { id: toastRef.current });
      toastRef.current = undefined;
    },
  });

  const onSubmit = (data: FormData) => {
    execute({
      id: community.id,
      ...data,
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container max-w-2xl mx-auto py-8"
    >
      <div className="mb-6">
        <Link 
          href={`/communities/${community.id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Detalle
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <T.H2>Editar Comunidad</T.H2>
            </div>
          </CardTitle>
          <CardDescription>
            Modifica la información de <strong>{community.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Comunidad *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ej: Residencial Los Álamos" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ej: Calle Principal 123, Madrid"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ej: 28001" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="max_units"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Viviendas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1"
                          placeholder="100"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="admin_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contacto</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="ej: admin@comunidad.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/communities/${community.id}`)}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  className="flex-1"
                  type="submit"
                  disabled={status === 'executing' || !form.formState.isValid}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {status === 'executing' ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};