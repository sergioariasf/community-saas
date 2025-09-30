/**
 * ARCHIVO: SupabaseApiHelper.ts
 * PROPÓSITO: Centralizar toda comunicación Supabase en APIs con inicialización segura
 * ESTADO: development
 * DEPENDENCIAS: @supabase/ssr, server client
 * OUTPUTS: Cliente Supabase preparado para APIs
 * ACTUALIZADO: 2025-09-28
 */

import { Database } from '@/lib/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton para evitar múltiples inicializaciones
let supabaseClientCache: SupabaseClient<Database> | null = null;
let supabaseServiceCache: SupabaseClient<Database> | null = null;

export interface SupabaseApiConfig {
  useServiceRole?: boolean;
  timeoutMs?: number;
  retries?: number;
}

/**
 * Helper centralizado para APIs que necesitan Supabase
 * Garantiza inicialización segura y lazy loading
 */
export class SupabaseApiHelper {
  
  /**
   * Obtiene cliente Supabase con configuración apropiada
   * Usa import dinámico para evitar problemas durante build
   */
  static async getClient(config: SupabaseApiConfig = {}): Promise<SupabaseClient<Database>> {
    const { useServiceRole = false } = config;
    
    try {
      if (useServiceRole) {
        if (!supabaseServiceCache) {
          const { createSupabaseServiceClient } = await import('@/supabase-clients/server');
          supabaseServiceCache = createSupabaseServiceClient();
        }
        return supabaseServiceCache;
      } else {
        if (!supabaseClientCache) {
          const { createSupabaseClient } = await import('@/supabase-clients/server');
          supabaseClientCache = await createSupabaseClient() as any;
        }
        return supabaseClientCache as any;
      }
    } catch (error) {
      console.error('[SUPABASE API HELPER] Error initializing client:', error);
      throw new Error(`Failed to initialize Supabase client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Wrapper para operaciones de base de datos con manejo de errores
   */
  static async executeQuery<T>(
    operation: (client: SupabaseClient<Database>) => Promise<T>,
    config: SupabaseApiConfig = {}
  ): Promise<T> {
    const { timeoutMs = 30000, retries = 1 } = config;
    
    let lastError: Error | null = null;
    
    console.log(`🔧 [SUPABASE API HELPER] Starting executeQuery with config:`, config);
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔧 [SUPABASE API HELPER] Attempt ${attempt}/${retries} - Getting client...`);
        const client = await this.getClient(config);
        console.log(`🔧 [SUPABASE API HELPER] Client obtained, executing operation...`);
        
        // Ejecutar con timeout
        const result = await Promise.race([
          operation(client),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
          )
        ]);
        
        console.log(`✅ [SUPABASE API HELPER] Operation successful`);
        return result;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`❌ [SUPABASE API HELPER] Attempt ${attempt}/${retries} failed:`, {
          message: lastError.message,
          stack: lastError.stack,
          error: lastError
        });
        
        if (attempt === retries) break;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    console.error(`💥 [SUPABASE API HELPER] All attempts failed. Final error:`, lastError);
    throw lastError || new Error('All attempts failed');
  }

  /**
   * Obtener documento por ID con validación completa
   */
  static async getDocumentById(documentId: string, organizationId?: string) {
    return this.executeQuery(async (supabase) => {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('id', documentId);
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      const { data, error } = await query.single();
      
      if (error) {
        throw new Error(`Document not found: ${error.message}`);
      }
      
      return data;
    }, { useServiceRole: false });
  }

  /**
   * Crear documento con validación
   */
  static async createDocument(documentData: any) {
    return this.executeQuery(async (supabase) => {
      const { data, error } = await supabase
        .from('documents')
        .insert(documentData)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create document: ${error.message}`);
      }
      
      return data;
    }, { useServiceRole: true }); // Usar service role para bypassing RLS
  }

  /**
   * Actualizar documento
   */
  static async updateDocument(documentId: string, updates: Record<string, any>) {
    return this.executeQuery(async (supabase) => {
      const { data, error } = await (supabase as any)
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to update document: ${error.message}`);
      }
      
      return data;
    }, { useServiceRole: true });
  }

  /**
   * Eliminar documento y datos relacionados
   */
  static async deleteDocument(documentId: string) {
    return this.executeQuery(async (supabase) => {
      // Eliminar en cascada manejado por base de datos
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      if (error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }
      
      return { success: true };
    }, { useServiceRole: true });
  }

  /**
   * Verificar disponibilidad de Supabase
   */
  static async healthCheck(): Promise<{ status: 'ok' | 'error', message: string }> {
    try {
      await this.executeQuery(async (supabase) => {
        const { data, error } = await supabase
          .from('documents')
          .select('id')
          .limit(1);
        
        if (error) {
          throw new Error(error.message);
        }
        
        return data;
      });
      
      return { status: 'ok', message: 'Supabase connection successful' };
      
    } catch (error) {
      return { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Limpiar caches (útil para testing)
   */
  static clearCache() {
    supabaseClientCache = null;
    supabaseServiceCache = null;
  }
}

/**
 * Utility functions para uso común en APIs
 */
export const ApiUtils = {
  /**
   * Crear respuesta de error estandardizada
   */
  errorResponse(message: string, status: number = 500, details?: any) {
    return Response.json({
      error: message,
      details,
      timestamp: new Date().toISOString()
    }, { status });
  },

  /**
   * Crear respuesta de éxito estandardizada
   */
  successResponse(data: any, message?: string) {
    return Response.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    });
  },

  /**
   * Validar parámetros requeridos
   */
  validateRequired(params: Record<string, any>, required: string[]): string[] {
    const missing = required.filter(key => !params[key]);
    return missing;
  }
};