/**
 * ARCHIVO: privateItems.ts
 * PROPÓSITO: Placeholder para compatibilidad de build NextBase template
 * ESTADO: deprecated
 * DEPENDENCIAS: ninguna
 * OUTPUTS: Action temporal para evitar errores de build
 * ACTUALIZADO: 2025-09-26
 */

'use server';

import { z } from 'zod';
import { actionClient } from '@/lib/safe-action';
import { redirect } from 'next/navigation';

// Placeholder para resolver imports
export const deletePrivateItemAction = actionClient.schema(z.object({ id: z.string() })).action(async () => {
  redirect('/documents');
});