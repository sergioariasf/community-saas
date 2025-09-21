/**
 * ARCHIVO: page.tsx (test-simple)
 * PROPÓSITO: Página de prueba ultra simple para debuggear autenticación
 * ESTADO: testing
 * DEPENDENCIAS: supabase auth
 * OUTPUTS: Debug de autenticación básica
 * ACTUALIZADO: 2025-09-16
 */

import { createSupabaseClient } from '@/supabase-clients/server';
import { redirect } from 'next/navigation';
import { T } from '@/components/ui/Typography';

export default async function TestSimplePage() {
  console.log('TestSimplePage - Starting...');
  
  try {
    const supabase = await createSupabaseClient();
    console.log('TestSimplePage - Supabase client created');

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('TestSimplePage - Auth result:', {
      user: user ? `${user.email} (${user.id})` : 'NO USER',
      error: authError ? authError.message : 'NO ERROR',
      hasUser: !!user,
      authError: !!authError
    });
    
    if (authError || !user) {
      console.log('TestSimplePage - NO USER - Redirecting to login');
      redirect('/login');
      return null;
    }

    console.log('TestSimplePage - USER FOUND - Rendering page');
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <T.H2>🧪 TEST SIMPLE - Debug Auth</T.H2>
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-green-100 border border-green-300 rounded">
            <T.H4 className="text-green-800">✅ Usuario Autenticado</T.H4>
            <div className="mt-2 text-sm">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Created:</strong> {user.created_at}</div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-100 border border-blue-300 rounded">
            <T.H4 className="text-blue-800">🔍 Próximo paso</T.H4>
            <T.P className="text-sm text-blue-700 mt-2">
              Si ves este mensaje, la autenticación funciona. Ahora podemos probar la página completa test-acta.
            </T.P>
          </div>
        </div>
      </div>
    );
    
  } catch (error: any) {
    console.error('TestSimplePage - Error:', error);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <T.H2>❌ ERROR EN TEST</T.H2>
        <div className="mt-4">
          <div className="p-4 bg-red-100 border border-red-300 rounded">
            <T.H4 className="text-red-800">Error detectado</T.H4>
            <pre className="text-xs mt-2 bg-white p-2 rounded overflow-auto">
              {JSON.stringify({
                message: error.message,
                stack: error.stack,
                name: error.name
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }
}