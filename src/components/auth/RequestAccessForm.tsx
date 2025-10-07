/**
 * ARCHIVO: RequestAccessForm.tsx
 * PROPÓSITO: Formulario para solicitar acceso como administrador
 * ESTADO: production
 * DEPENDENCIAS: createRegistrationRequestAction
 * OUTPUTS: Form component
 * ACTUALIZADO: 2025-10-06
 */

'use client';

import { useState } from 'react';
import { useAction } from 'next-safe-action/hooks';
import { createRegistrationRequestAction } from '@/data/users/registrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function RequestAccessForm() {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    companyName: '',
    phone: '',
    verticalType: 'comunidades' as 'comunidades' | 'oficinas' | 'otro',
    message: '',
    estimatedCommunities: 1,
  });

  const [submitted, setSubmitted] = useState(false);

  const { execute, status, result } = useAction(createRegistrationRequestAction, {
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    execute(formData);
  };

  if (submitted) {
    return (
      <div className="space-y-4 py-8 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h3 className="text-2xl font-bold">¡Solicitud Enviada!</h3>
        <p className="text-gray-600 dark:text-gray-300">
          Gracias por tu interés en Fazil. Hemos recibido tu solicitud y la revisaremos pronto.
        </p>
        <p className="text-sm text-gray-500">
          Te contactaremos al email: <strong>{formData.email}</strong>
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setFormData({
              email: '',
              fullName: '',
              companyName: '',
              phone: '',
              verticalType: 'comunidades',
              message: '',
              estimatedCommunities: 1,
            });
          }}
        >
          Enviar Otra Solicitud
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {result?.serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{result.serverError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email Corporativo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@tuempresa.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={status === 'executing'}
          />
        </div>

        {/* Nombre Completo */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nombre Completo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Juan Pérez"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
            disabled={status === 'executing'}
          />
        </div>
      </div>

      {/* Nombre de la Empresa */}
      <div className="space-y-2">
        <Label htmlFor="companyName">
          Nombre de la Empresa/Organización <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          placeholder="Comunidades Los Robles S.L."
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          required
          disabled={status === 'executing'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+34 600 123 456"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={status === 'executing'}
          />
        </div>

        {/* Tipo de Vertical */}
        <div className="space-y-2">
          <Label htmlFor="verticalType">Tipo de Negocio</Label>
          <Select
            value={formData.verticalType}
            onValueChange={(value: 'comunidades' | 'oficinas' | 'otro') =>
              setFormData({ ...formData, verticalType: value })
            }
            disabled={status === 'executing'}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comunidades">Comunidades de Vecinos</SelectItem>
              <SelectItem value="oficinas">Oficinas/Coworking</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Número de Comunidades Estimadas */}
      <div className="space-y-2">
        <Label htmlFor="estimatedCommunities">
          Número de Comunidades/Propiedades a Gestionar
        </Label>
        <Input
          id="estimatedCommunities"
          type="number"
          min="1"
          max="1000"
          placeholder="5"
          value={formData.estimatedCommunities}
          onChange={(e) =>
            setFormData({ ...formData, estimatedCommunities: parseInt(e.target.value) || 1 })
          }
          disabled={status === 'executing'}
        />
        <p className="text-xs text-gray-500">
          Esto nos ayuda a configurar el plan adecuado para ti
        </p>
      </div>

      {/* Mensaje */}
      <div className="space-y-2">
        <Label htmlFor="message">Mensaje (opcional)</Label>
        <Textarea
          id="message"
          placeholder="Cuéntanos por qué necesitas Fazil y qué funcionalidades te interesan..."
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          disabled={status === 'executing'}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={status === 'executing'}
      >
        {status === 'executing' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando Solicitud...
          </>
        ) : (
          'Enviar Solicitud'
        )}
      </Button>

      <p className="text-xs text-center text-gray-500">
        Al enviar esta solicitud, aceptas nuestros Términos de Servicio y Política de Privacidad.
        Nos pondremos en contacto contigo en un plazo de 24-48 horas.
      </p>
    </form>
  );
}
