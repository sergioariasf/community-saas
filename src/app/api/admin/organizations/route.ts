/**
 * ARCHIVO: route.ts
 * PROPÓSITO: API endpoint para obtener todas las organizaciones (solo admin)
 * ESTADO: development
 * DEPENDENCIAS: supabase-admin, auth verification
 * OUTPUTS: Lista completa de organizaciones
 * ACTUALIZADO: 2025-10-01
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllOrganizations, isAdminUser } from '@/lib/supabase-admin';
import { createBrowserClient } from '@supabase/ssr';

// Configurar runtime para usar Node.js en lugar de Edge
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Verificar que sea admin
    if (!await isAdminUser(user.email || '')) {
      return NextResponse.json({ error: 'Acceso denegado - Solo admin' }, { status: 403 });
    }

    // Obtener todas las organizaciones sin restricciones RLS
    const { data, error } = await getAllOrganizations();

    if (error) {
      console.error('Error obteniendo organizaciones:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });

  } catch (error) {
    console.error('Error en API organizaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}