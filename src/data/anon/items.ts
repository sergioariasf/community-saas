/**
 * ARCHIVO: items.ts
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

const insertItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
});

// Placeholder action que redirige a communities
export const insertItemAction = actionClient.schema(insertItemSchema).action(async () => {
  // TODO: Remove this placeholder and the entire items system
  redirect('/communities');
});

// Placeholder para resolver imports
export const getItem = async () => null;
export const deleteItemAction = actionClient.schema(z.object({ id: z.string() })).action(async () => {
  redirect('/communities');
});