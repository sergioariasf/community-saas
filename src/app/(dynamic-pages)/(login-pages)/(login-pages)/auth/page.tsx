/**
 * ARCHIVO: auth/page.tsx
 * PROPÓSITO: Página unificada de autenticación con toggle entre login/registro
 * ESTADO: development
 * DEPENDENCIAS: Auth.tsx, zod, search params
 * OUTPUTS: Página de autenticación unificada
 * ACTUALIZADO: 2025-09-16
 */

import { z } from 'zod';
import { Auth } from './Auth';

const SearchParamsSchema = z.object({
  next: z.string().optional(),
  nextActionType: z.string().optional(),
  mode: z.enum(['login', 'register']).optional().default('login'),
});

export default async function AuthPage(props: {
  searchParams: Promise<unknown>;
}) {
  const searchParams = await props.searchParams;
  const { next, nextActionType, mode } = SearchParamsSchema.parse(searchParams);
  return <Auth next={next} nextActionType={nextActionType} defaultMode={mode} />;
}