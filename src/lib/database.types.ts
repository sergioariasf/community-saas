export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string | null
          prompt_template: string
          purpose: string
          updated_at: string
          variables: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id?: string | null
          prompt_template: string
          purpose: string
          updated_at?: string
          variables?: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string | null
          prompt_template?: string
          purpose?: string
          updated_at?: string
          variables?: Json
        }
        Relationships: [
          {
            foreignKeyName: "agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          address: string | null
          admin_contact: string | null
          city: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_units: number | null
          name: string
          organization_id: string
          postal_code: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admin_contact?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_units?: number | null
          name: string
          organization_id: string
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admin_contact?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_units?: number | null
          name?: string
          organization_id?: string
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_chunks: {
        Row: {
          chunk_metadata: Json | null
          chunk_number: number
          chunk_type: string
          chunked_by: string | null
          chunking_config: Json | null
          chunking_method: string
          confidence: number | null
          content: string
          content_length: number
          created_at: string
          document_id: string
          embedding: string | null
          embedding_created_at: string | null
          embedding_model: string | null
          end_position: number | null
          id: string
          input_sample_length: number | null
          organization_id: string
          page_numbers: number[] | null
          processing_time_ms: number | null
          quality_score: number | null
          start_position: number | null
          tokens_used: number | null
        }
        Insert: {
          chunk_metadata?: Json | null
          chunk_number: number
          chunk_type: string
          chunked_by?: string | null
          chunking_config?: Json | null
          chunking_method: string
          confidence?: number | null
          content: string
          content_length?: number
          created_at?: string
          document_id: string
          embedding?: string | null
          embedding_created_at?: string | null
          embedding_model?: string | null
          end_position?: number | null
          id?: string
          input_sample_length?: number | null
          organization_id: string
          page_numbers?: number[] | null
          processing_time_ms?: number | null
          quality_score?: number | null
          start_position?: number | null
          tokens_used?: number | null
        }
        Update: {
          chunk_metadata?: Json | null
          chunk_number?: number
          chunk_type?: string
          chunked_by?: string | null
          chunking_config?: Json | null
          chunking_method?: string
          confidence?: number | null
          content?: string
          content_length?: number
          created_at?: string
          document_id?: string
          embedding?: string | null
          embedding_created_at?: string | null
          embedding_model?: string | null
          end_position?: number | null
          id?: string
          input_sample_length?: number | null
          organization_id?: string
          page_numbers?: number[] | null
          processing_time_ms?: number | null
          quality_score?: number | null
          start_position?: number | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_chunks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      document_classifications: {
        Row: {
          classification_method: string
          classified_by: string | null
          confidence: number
          created_at: string
          document_id: string
          document_type: string
          filename_analyzed: string | null
          id: string
          input_sample_length: number | null
          is_current: boolean | null
          organization_id: string
          processing_time_ms: number | null
          raw_response: string | null
          superseded_by: string | null
          tokens_used: number | null
        }
        Insert: {
          classification_method: string
          classified_by?: string | null
          confidence: number
          created_at?: string
          document_id: string
          document_type: string
          filename_analyzed?: string | null
          id?: string
          input_sample_length?: number | null
          is_current?: boolean | null
          organization_id: string
          processing_time_ms?: number | null
          raw_response?: string | null
          superseded_by?: string | null
          tokens_used?: number | null
        }
        Update: {
          classification_method?: string
          classified_by?: string | null
          confidence?: number
          created_at?: string
          document_id?: string
          document_type?: string
          filename_analyzed?: string | null
          id?: string
          input_sample_length?: number | null
          is_current?: boolean | null
          organization_id?: string
          processing_time_ms?: number | null
          raw_response?: string | null
          superseded_by?: string | null
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_classifications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_classifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_classifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_classifications_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "document_classifications"
            referencedColumns: ["id"]
          },
        ]
      }
      document_metadata: {
        Row: {
          confidence: number
          created_at: string
          document_date: string | null
          document_id: string
          document_type: string | null
          extracted_by: string | null
          extraction_method: string
          filename_analyzed: string | null
          id: string
          input_sample_length: number | null
          is_current: boolean | null
          metadata: Json
          metadata_version: string | null
          organization_id: string
          processing_time_ms: number | null
          raw_response: string | null
          superseded_by: string | null
          tokens_used: number | null
          topic_keywords: string[] | null
          validation_errors: string[] | null
          validation_status: string | null
          validation_warnings: string[] | null
        }
        Insert: {
          confidence: number
          created_at?: string
          document_date?: string | null
          document_id: string
          document_type?: string | null
          extracted_by?: string | null
          extraction_method: string
          filename_analyzed?: string | null
          id?: string
          input_sample_length?: number | null
          is_current?: boolean | null
          metadata?: Json
          metadata_version?: string | null
          organization_id: string
          processing_time_ms?: number | null
          raw_response?: string | null
          superseded_by?: string | null
          tokens_used?: number | null
          topic_keywords?: string[] | null
          validation_errors?: string[] | null
          validation_status?: string | null
          validation_warnings?: string[] | null
        }
        Update: {
          confidence?: number
          created_at?: string
          document_date?: string | null
          document_id?: string
          document_type?: string | null
          extracted_by?: string | null
          extraction_method?: string
          filename_analyzed?: string | null
          id?: string
          input_sample_length?: number | null
          is_current?: boolean | null
          metadata?: Json
          metadata_version?: string | null
          organization_id?: string
          processing_time_ms?: number | null
          raw_response?: string | null
          superseded_by?: string | null
          tokens_used?: number | null
          topic_keywords?: string[] | null
          validation_errors?: string[] | null
          validation_status?: string | null
          validation_warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "document_metadata_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_metadata_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "document_metadata"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          chunking_completed_at: string | null
          chunking_error: string | null
          chunking_status: string | null
          chunks_count: number | null
          classification_completed_at: string | null
          classification_error: string | null
          classification_status: string | null
          community_id: string | null
          created_at: string
          document_type: string | null
          estimated_cost_usd: number | null
          extracted_text: string | null
          extraction_completed_at: string | null
          extraction_error: string | null
          extraction_method: string | null
          extraction_status: string | null
          file_hash: string
          file_path: string
          file_size: number
          filename: string
          id: string
          last_processed_by: string | null
          legacy_status: string
          metadata_completed_at: string | null
          metadata_error: string | null
          metadata_status: string | null
          mime_type: string | null
          organization_id: string
          original_filename: string | null
          page_count: number | null
          processed_at: string | null
          processing_completed_at: string | null
          processing_config: Json | null
          processing_level: number | null
          processing_started_at: string | null
          text_length: number | null
          total_processing_time_ms: number | null
          total_tokens_used: number | null
          uploaded_by: string | null
        }
        Insert: {
          chunking_completed_at?: string | null
          chunking_error?: string | null
          chunking_status?: string | null
          chunks_count?: number | null
          classification_completed_at?: string | null
          classification_error?: string | null
          classification_status?: string | null
          community_id?: string | null
          created_at?: string
          document_type?: string | null
          estimated_cost_usd?: number | null
          extracted_text?: string | null
          extraction_completed_at?: string | null
          extraction_error?: string | null
          extraction_method?: string | null
          extraction_status?: string | null
          file_hash: string
          file_path: string
          file_size: number
          filename: string
          id?: string
          last_processed_by?: string | null
          legacy_status?: string
          metadata_completed_at?: string | null
          metadata_error?: string | null
          metadata_status?: string | null
          mime_type?: string | null
          organization_id: string
          original_filename?: string | null
          page_count?: number | null
          processed_at?: string | null
          processing_completed_at?: string | null
          processing_config?: Json | null
          processing_level?: number | null
          processing_started_at?: string | null
          text_length?: number | null
          total_processing_time_ms?: number | null
          total_tokens_used?: number | null
          uploaded_by?: string | null
        }
        Update: {
          chunking_completed_at?: string | null
          chunking_error?: string | null
          chunking_status?: string | null
          chunks_count?: number | null
          classification_completed_at?: string | null
          classification_error?: string | null
          classification_status?: string | null
          community_id?: string | null
          created_at?: string
          document_type?: string | null
          estimated_cost_usd?: number | null
          extracted_text?: string | null
          extraction_completed_at?: string | null
          extraction_error?: string | null
          extraction_method?: string | null
          extraction_status?: string | null
          file_hash?: string
          file_path?: string
          file_size?: number
          filename?: string
          id?: string
          last_processed_by?: string | null
          legacy_status?: string
          metadata_completed_at?: string | null
          metadata_error?: string | null
          metadata_status?: string | null
          mime_type?: string | null
          organization_id?: string
          original_filename?: string | null
          page_count?: number | null
          processed_at?: string | null
          processing_completed_at?: string | null
          processing_config?: Json | null
          processing_level?: number | null
          processing_started_at?: string | null
          text_length?: number | null
          total_processing_time_ms?: number | null
          total_tokens_used?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_budgets: {
        Row: {
          cantidades: Json | null
          category: string | null
          cliente_direccion: string | null
          cliente_identificacion_fiscal: string | null
          cliente_name: string | null
          condiciones_pago: string | null
          created_at: string
          descripcion_servicios: Json | null
          descripciones_detalladas: Json | null
          document_id: string
          emisor_direccion: string | null
          emisor_email: string | null
          emisor_identificacion_fiscal: string | null
          emisor_name: string | null
          emisor_telefono: string | null
          fecha_emision: string | null
          fecha_validez: string | null
          garantia: string | null
          id: string
          importe_impuestos: number | null
          importes_totales: Json | null
          impuestos: number | null
          moneda: string | null
          notas_adicionales: string | null
          numero_presupuesto: string | null
          organization_id: string
          pago_inicial_requerido: boolean | null
          plazos_entrega: string | null
          porcentaje_impuestos: number | null
          precios_unitarios: Json | null
          subtotal: number | null
          tipo_documento: string | null
          titulo: string | null
          total: number | null
        }
        Insert: {
          cantidades?: Json | null
          category?: string | null
          cliente_direccion?: string | null
          cliente_identificacion_fiscal?: string | null
          cliente_name?: string | null
          condiciones_pago?: string | null
          created_at?: string
          descripcion_servicios?: Json | null
          descripciones_detalladas?: Json | null
          document_id: string
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_identificacion_fiscal?: string | null
          emisor_name?: string | null
          emisor_telefono?: string | null
          fecha_emision?: string | null
          fecha_validez?: string | null
          garantia?: string | null
          id?: string
          importe_impuestos?: number | null
          importes_totales?: Json | null
          impuestos?: number | null
          moneda?: string | null
          notas_adicionales?: string | null
          numero_presupuesto?: string | null
          organization_id: string
          pago_inicial_requerido?: boolean | null
          plazos_entrega?: string | null
          porcentaje_impuestos?: number | null
          precios_unitarios?: Json | null
          subtotal?: number | null
          tipo_documento?: string | null
          titulo?: string | null
          total?: number | null
        }
        Update: {
          cantidades?: Json | null
          category?: string | null
          cliente_direccion?: string | null
          cliente_identificacion_fiscal?: string | null
          cliente_name?: string | null
          condiciones_pago?: string | null
          created_at?: string
          descripcion_servicios?: Json | null
          descripciones_detalladas?: Json | null
          document_id?: string
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_identificacion_fiscal?: string | null
          emisor_name?: string | null
          emisor_telefono?: string | null
          fecha_emision?: string | null
          fecha_validez?: string | null
          garantia?: string | null
          id?: string
          importe_impuestos?: number | null
          importes_totales?: Json | null
          impuestos?: number | null
          moneda?: string | null
          notas_adicionales?: string | null
          numero_presupuesto?: string | null
          organization_id?: string
          pago_inicial_requerido?: boolean | null
          plazos_entrega?: string | null
          porcentaje_impuestos?: number | null
          precios_unitarios?: Json | null
          subtotal?: number | null
          tipo_documento?: string | null
          titulo?: string | null
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_budgets_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_communications: {
        Row: {
          accion_requerida: Json | null
          anexos: Json | null
          asunto: string | null
          categoria_comunicado: string | null
          category: string | null
          comunidad: string | null
          comunidad_direccion: string | null
          contacto_info: Json | null
          created_at: string
          destinatarios: Json | null
          document_id: string
          fecha: string | null
          fecha_limite: string | null
          id: string
          organization_id: string
          remitente: string | null
          remitente_cargo: string | null
          requiere_respuesta: boolean | null
          resumen: string | null
          tipo_comunicado: string | null
          topic_administracion: boolean | null
          topic_ascensor: boolean | null
          topic_balance: boolean | null
          topic_dinero: boolean | null
          topic_energia: boolean | null
          topic_incendios: boolean | null
          topic_jardin: boolean | null
          topic_limpieza: boolean | null
          topic_mantenimiento: boolean | null
          topic_normativa: boolean | null
          topic_paqueteria: boolean | null
          topic_piscina: boolean | null
          topic_porteria: boolean | null
          topic_presupuesto: boolean | null
          topic_proveedor: boolean | null
          urgencia: string | null
        }
        Insert: {
          accion_requerida?: Json | null
          anexos?: Json | null
          asunto?: string | null
          categoria_comunicado?: string | null
          category?: string | null
          comunidad?: string | null
          comunidad_direccion?: string | null
          contacto_info?: Json | null
          created_at?: string
          destinatarios?: Json | null
          document_id: string
          fecha?: string | null
          fecha_limite?: string | null
          id?: string
          organization_id: string
          remitente?: string | null
          remitente_cargo?: string | null
          requiere_respuesta?: boolean | null
          resumen?: string | null
          tipo_comunicado?: string | null
          topic_administracion?: boolean | null
          topic_ascensor?: boolean | null
          topic_balance?: boolean | null
          topic_dinero?: boolean | null
          topic_energia?: boolean | null
          topic_incendios?: boolean | null
          topic_jardin?: boolean | null
          topic_limpieza?: boolean | null
          topic_mantenimiento?: boolean | null
          topic_normativa?: boolean | null
          topic_paqueteria?: boolean | null
          topic_piscina?: boolean | null
          topic_porteria?: boolean | null
          topic_presupuesto?: boolean | null
          topic_proveedor?: boolean | null
          urgencia?: string | null
        }
        Update: {
          accion_requerida?: Json | null
          anexos?: Json | null
          asunto?: string | null
          categoria_comunicado?: string | null
          category?: string | null
          comunidad?: string | null
          comunidad_direccion?: string | null
          contacto_info?: Json | null
          created_at?: string
          destinatarios?: Json | null
          document_id?: string
          fecha?: string | null
          fecha_limite?: string | null
          id?: string
          organization_id?: string
          remitente?: string | null
          remitente_cargo?: string | null
          requiere_respuesta?: boolean | null
          resumen?: string | null
          tipo_comunicado?: string | null
          topic_administracion?: boolean | null
          topic_ascensor?: boolean | null
          topic_balance?: boolean | null
          topic_dinero?: boolean | null
          topic_energia?: boolean | null
          topic_incendios?: boolean | null
          topic_jardin?: boolean | null
          topic_limpieza?: boolean | null
          topic_mantenimiento?: boolean | null
          topic_normativa?: boolean | null
          topic_paqueteria?: boolean | null
          topic_piscina?: boolean | null
          topic_porteria?: boolean | null
          topic_presupuesto?: boolean | null
          topic_proveedor?: boolean | null
          urgencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_communications_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_communications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_contracts: {
        Row: {
          alcance_servicios: Json | null
          category: string | null
          condiciones_terminacion: string | null
          confidencialidad: boolean | null
          created_at: string
          descripcion_detallada: string | null
          document_id: string
          duracion: string | null
          fecha_fin: string | null
          fecha_firma: string | null
          fecha_inicio: string | null
          firmas_presentes: boolean | null
          forma_pago: string | null
          id: string
          importe_total: number | null
          jurisdiccion: string | null
          legislacion_aplicable: string | null
          lugar_firma: string | null
          moneda: string | null
          objeto_contrato: string | null
          obligaciones_parte_a: Json | null
          obligaciones_parte_b: Json | null
          organization_id: string
          parte_a: string | null
          parte_a_direccion: string | null
          parte_a_identificacion_fiscal: string | null
          parte_a_representante: string | null
          parte_b: string | null
          parte_b_direccion: string | null
          parte_b_identificacion_fiscal: string | null
          parte_b_representante: string | null
          penalizaciones: string | null
          plazos_pago: Json | null
          tipo_contrato: string | null
          titulo_contrato: string | null
          topic_agua: boolean | null
          topic_ascensores: boolean | null
          topic_climatizacion: boolean | null
          topic_electricidad: boolean | null
          topic_emergencias: boolean | null
          topic_gas: boolean | null
          topic_instalaciones: boolean | null
          topic_jardines: boolean | null
          topic_keywords: string[] | null
          topic_limpieza: boolean | null
          topic_mantenimiento: boolean | null
          topic_parking: boolean | null
          topic_seguridad: boolean | null
        }
        Insert: {
          alcance_servicios?: Json | null
          category?: string | null
          condiciones_terminacion?: string | null
          confidencialidad?: boolean | null
          created_at?: string
          descripcion_detallada?: string | null
          document_id: string
          duracion?: string | null
          fecha_fin?: string | null
          fecha_firma?: string | null
          fecha_inicio?: string | null
          firmas_presentes?: boolean | null
          forma_pago?: string | null
          id?: string
          importe_total?: number | null
          jurisdiccion?: string | null
          legislacion_aplicable?: string | null
          lugar_firma?: string | null
          moneda?: string | null
          objeto_contrato?: string | null
          obligaciones_parte_a?: Json | null
          obligaciones_parte_b?: Json | null
          organization_id: string
          parte_a?: string | null
          parte_a_direccion?: string | null
          parte_a_identificacion_fiscal?: string | null
          parte_a_representante?: string | null
          parte_b?: string | null
          parte_b_direccion?: string | null
          parte_b_identificacion_fiscal?: string | null
          parte_b_representante?: string | null
          penalizaciones?: string | null
          plazos_pago?: Json | null
          tipo_contrato?: string | null
          titulo_contrato?: string | null
          topic_agua?: boolean | null
          topic_ascensores?: boolean | null
          topic_climatizacion?: boolean | null
          topic_electricidad?: boolean | null
          topic_emergencias?: boolean | null
          topic_gas?: boolean | null
          topic_instalaciones?: boolean | null
          topic_jardines?: boolean | null
          topic_keywords?: string[] | null
          topic_limpieza?: boolean | null
          topic_mantenimiento?: boolean | null
          topic_parking?: boolean | null
          topic_seguridad?: boolean | null
        }
        Update: {
          alcance_servicios?: Json | null
          category?: string | null
          condiciones_terminacion?: string | null
          confidencialidad?: boolean | null
          created_at?: string
          descripcion_detallada?: string | null
          document_id?: string
          duracion?: string | null
          fecha_fin?: string | null
          fecha_firma?: string | null
          fecha_inicio?: string | null
          firmas_presentes?: boolean | null
          forma_pago?: string | null
          id?: string
          importe_total?: number | null
          jurisdiccion?: string | null
          legislacion_aplicable?: string | null
          lugar_firma?: string | null
          moneda?: string | null
          objeto_contrato?: string | null
          obligaciones_parte_a?: Json | null
          obligaciones_parte_b?: Json | null
          organization_id?: string
          parte_a?: string | null
          parte_a_direccion?: string | null
          parte_a_identificacion_fiscal?: string | null
          parte_a_representante?: string | null
          parte_b?: string | null
          parte_b_direccion?: string | null
          parte_b_identificacion_fiscal?: string | null
          parte_b_representante?: string | null
          penalizaciones?: string | null
          plazos_pago?: Json | null
          tipo_contrato?: string | null
          titulo_contrato?: string | null
          topic_agua?: boolean | null
          topic_ascensores?: boolean | null
          topic_climatizacion?: boolean | null
          topic_electricidad?: boolean | null
          topic_emergencias?: boolean | null
          topic_gas?: boolean | null
          topic_instalaciones?: boolean | null
          topic_jardines?: boolean | null
          topic_keywords?: string[] | null
          topic_limpieza?: boolean | null
          topic_mantenimiento?: boolean | null
          topic_parking?: boolean | null
          topic_seguridad?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_contracts_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_delivery_notes: {
        Row: {
          cantidad_total: number | null
          category: string | null
          created_at: string
          document_id: string
          emisor_direccion: string | null
          emisor_email: string | null
          emisor_name: string | null
          emisor_telefono: string | null
          estado_entrega: string | null
          fecha_emision: string | null
          firma_receptor: boolean | null
          id: string
          mercancia: Json | null
          numero_albaran: string | null
          numero_pedido: string | null
          observaciones: string | null
          organization_id: string
          peso_total: number | null
          receptor_direccion: string | null
          receptor_name: string | null
          receptor_telefono: string | null
          transportista: string | null
          vehiculo_matricula: string | null
        }
        Insert: {
          cantidad_total?: number | null
          category?: string | null
          created_at?: string
          document_id: string
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_name?: string | null
          emisor_telefono?: string | null
          estado_entrega?: string | null
          fecha_emision?: string | null
          firma_receptor?: boolean | null
          id?: string
          mercancia?: Json | null
          numero_albaran?: string | null
          numero_pedido?: string | null
          observaciones?: string | null
          organization_id: string
          peso_total?: number | null
          receptor_direccion?: string | null
          receptor_name?: string | null
          receptor_telefono?: string | null
          transportista?: string | null
          vehiculo_matricula?: string | null
        }
        Update: {
          cantidad_total?: number | null
          category?: string | null
          created_at?: string
          document_id?: string
          emisor_direccion?: string | null
          emisor_email?: string | null
          emisor_name?: string | null
          emisor_telefono?: string | null
          estado_entrega?: string | null
          fecha_emision?: string | null
          firma_receptor?: boolean | null
          id?: string
          mercancia?: Json | null
          numero_albaran?: string | null
          numero_pedido?: string | null
          observaciones?: string | null
          organization_id?: string
          peso_total?: number | null
          receptor_direccion?: string | null
          receptor_name?: string | null
          receptor_telefono?: string | null
          transportista?: string | null
          vehiculo_matricula?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_delivery_notes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_delivery_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_delivery_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_invoices: {
        Row: {
          amount: number | null
          bank_details: string | null
          category: string | null
          client_address: string | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          client_tax_id: string | null
          created_at: string
          currency: string | null
          document_id: string
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          issue_date: string | null
          notes: string | null
          organization_id: string
          payment_method: string | null
          payment_terms: string | null
          products: Json | null
          products_count: number | null
          products_summary: string | null
          provider_name: string | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          vendor_address: string | null
          vendor_email: string | null
          vendor_phone: string | null
          vendor_tax_id: string | null
        }
        Insert: {
          amount?: number | null
          bank_details?: string | null
          category?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_tax_id?: string | null
          created_at?: string
          currency?: string | null
          document_id: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          notes?: string | null
          organization_id: string
          payment_method?: string | null
          payment_terms?: string | null
          products?: Json | null
          products_count?: number | null
          products_summary?: string | null
          provider_name?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          vendor_address?: string | null
          vendor_email?: string | null
          vendor_phone?: string | null
          vendor_tax_id?: string | null
        }
        Update: {
          amount?: number | null
          bank_details?: string | null
          category?: string | null
          client_address?: string | null
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          client_tax_id?: string | null
          created_at?: string
          currency?: string | null
          document_id?: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          notes?: string | null
          organization_id?: string
          payment_method?: string | null
          payment_terms?: string | null
          products?: Json | null
          products_count?: number | null
          products_summary?: string | null
          provider_name?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          vendor_address?: string | null
          vendor_email?: string | null
          vendor_phone?: string | null
          vendor_tax_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_invoices_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_minutes: {
        Row: {
          acuerdos: Json | null
          administrator: string | null
          comunidad_nombre: string | null
          created_at: string
          decisions: string | null
          document_date: string | null
          document_id: string
          estructura_detectada: Json | null
          id: string
          lugar: string | null
          orden_del_dia: Json | null
          organization_id: string
          president_in: string | null
          president_out: string | null
          summary: string | null
          tipo_reunion: string | null
          topic_administracion: boolean | null
          topic_ascensor: boolean | null
          topic_balance: boolean | null
          topic_dinero: boolean | null
          topic_energia: boolean | null
          topic_incendios: boolean | null
          topic_jardin: boolean | null
          topic_keywords: string[] | null
          topic_limpieza: boolean | null
          topic_mantenimiento: boolean | null
          topic_normativa: boolean | null
          topic_paqueteria: boolean | null
          topic_piscina: boolean | null
          topic_porteria: boolean | null
          topic_presupuesto: boolean | null
          topic_proveedor: boolean | null
        }
        Insert: {
          acuerdos?: Json | null
          administrator?: string | null
          comunidad_nombre?: string | null
          created_at?: string
          decisions?: string | null
          document_date?: string | null
          document_id: string
          estructura_detectada?: Json | null
          id?: string
          lugar?: string | null
          orden_del_dia?: Json | null
          organization_id: string
          president_in?: string | null
          president_out?: string | null
          summary?: string | null
          tipo_reunion?: string | null
          topic_administracion?: boolean | null
          topic_ascensor?: boolean | null
          topic_balance?: boolean | null
          topic_dinero?: boolean | null
          topic_energia?: boolean | null
          topic_incendios?: boolean | null
          topic_jardin?: boolean | null
          topic_keywords?: string[] | null
          topic_limpieza?: boolean | null
          topic_mantenimiento?: boolean | null
          topic_normativa?: boolean | null
          topic_paqueteria?: boolean | null
          topic_piscina?: boolean | null
          topic_porteria?: boolean | null
          topic_presupuesto?: boolean | null
          topic_proveedor?: boolean | null
        }
        Update: {
          acuerdos?: Json | null
          administrator?: string | null
          comunidad_nombre?: string | null
          created_at?: string
          decisions?: string | null
          document_date?: string | null
          document_id?: string
          estructura_detectada?: Json | null
          id?: string
          lugar?: string | null
          orden_del_dia?: Json | null
          organization_id?: string
          president_in?: string | null
          president_out?: string | null
          summary?: string | null
          tipo_reunion?: string | null
          topic_administracion?: boolean | null
          topic_ascensor?: boolean | null
          topic_balance?: boolean | null
          topic_dinero?: boolean | null
          topic_energia?: boolean | null
          topic_incendios?: boolean | null
          topic_jardin?: boolean | null
          topic_keywords?: string[] | null
          topic_limpieza?: boolean | null
          topic_mantenimiento?: boolean | null
          topic_normativa?: boolean | null
          topic_paqueteria?: boolean | null
          topic_piscina?: boolean | null
          topic_porteria?: boolean | null
          topic_presupuesto?: boolean | null
          topic_proveedor?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_minutes_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_minutes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_minutes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_property_deeds: {
        Row: {
          autorizacion_notarial: boolean | null
          base_imponible_itp: number | null
          cargas_existentes: Json | null
          category: string | null
          clausulas_particulares: Json | null
          coeficiente_participacion: string | null
          comprador_direccion: string | null
          comprador_dni: string | null
          comprador_estado_civil: string | null
          comprador_nacionalidad: string | null
          comprador_nombre: string | null
          comprador_profesion: string | null
          condicion_suspensiva: boolean | null
          condiciones_especiales: Json | null
          created_at: string
          descripcion_inmueble: string | null
          direccion_inmueble: string | null
          document_id: string
          entrega_inmediata: boolean | null
          estado_conservacion: string | null
          fecha_entrega: string | null
          fecha_escritura: string | null
          finca: string | null
          folio: string | null
          forma_pago: string | null
          gastos_a_cargo_comprador: Json | null
          gastos_a_cargo_vendedor: Json | null
          hipotecas_pendientes: string | null
          id: string
          impuestos_incluidos: boolean | null
          inscripcion: string | null
          inscripcion_registro: string | null
          inventario_incluido: string | null
          itp_aplicable: number | null
          libre_cargas: boolean | null
          libro: string | null
          moneda: string | null
          notaria_direccion: string | null
          notario_nombre: string | null
          notario_numero_colegiado: string | null
          numero_banos: number | null
          numero_habitaciones: number | null
          organization_id: string
          orientacion: string | null
          planta: string | null
          precio_en_letras: string | null
          precio_venta: number | null
          protocolo_numero: string | null
          referencia_catastral: string | null
          registro_propiedad: string | null
          servidumbres: string | null
          superficie_m2: number | null
          superficie_util: number | null
          tipo_inmueble: string | null
          tomo: string | null
          valor_catastral: number | null
          vendedor_direccion: string | null
          vendedor_dni: string | null
          vendedor_estado_civil: string | null
          vendedor_nacionalidad: string | null
          vendedor_nombre: string | null
          vendedor_profesion: string | null
        }
        Insert: {
          autorizacion_notarial?: boolean | null
          base_imponible_itp?: number | null
          cargas_existentes?: Json | null
          category?: string | null
          clausulas_particulares?: Json | null
          coeficiente_participacion?: string | null
          comprador_direccion?: string | null
          comprador_dni?: string | null
          comprador_estado_civil?: string | null
          comprador_nacionalidad?: string | null
          comprador_nombre?: string | null
          comprador_profesion?: string | null
          condicion_suspensiva?: boolean | null
          condiciones_especiales?: Json | null
          created_at?: string
          descripcion_inmueble?: string | null
          direccion_inmueble?: string | null
          document_id: string
          entrega_inmediata?: boolean | null
          estado_conservacion?: string | null
          fecha_entrega?: string | null
          fecha_escritura?: string | null
          finca?: string | null
          folio?: string | null
          forma_pago?: string | null
          gastos_a_cargo_comprador?: Json | null
          gastos_a_cargo_vendedor?: Json | null
          hipotecas_pendientes?: string | null
          id?: string
          impuestos_incluidos?: boolean | null
          inscripcion?: string | null
          inscripcion_registro?: string | null
          inventario_incluido?: string | null
          itp_aplicable?: number | null
          libre_cargas?: boolean | null
          libro?: string | null
          moneda?: string | null
          notaria_direccion?: string | null
          notario_nombre?: string | null
          notario_numero_colegiado?: string | null
          numero_banos?: number | null
          numero_habitaciones?: number | null
          organization_id: string
          orientacion?: string | null
          planta?: string | null
          precio_en_letras?: string | null
          precio_venta?: number | null
          protocolo_numero?: string | null
          referencia_catastral?: string | null
          registro_propiedad?: string | null
          servidumbres?: string | null
          superficie_m2?: number | null
          superficie_util?: number | null
          tipo_inmueble?: string | null
          tomo?: string | null
          valor_catastral?: number | null
          vendedor_direccion?: string | null
          vendedor_dni?: string | null
          vendedor_estado_civil?: string | null
          vendedor_nacionalidad?: string | null
          vendedor_nombre?: string | null
          vendedor_profesion?: string | null
        }
        Update: {
          autorizacion_notarial?: boolean | null
          base_imponible_itp?: number | null
          cargas_existentes?: Json | null
          category?: string | null
          clausulas_particulares?: Json | null
          coeficiente_participacion?: string | null
          comprador_direccion?: string | null
          comprador_dni?: string | null
          comprador_estado_civil?: string | null
          comprador_nacionalidad?: string | null
          comprador_nombre?: string | null
          comprador_profesion?: string | null
          condicion_suspensiva?: boolean | null
          condiciones_especiales?: Json | null
          created_at?: string
          descripcion_inmueble?: string | null
          direccion_inmueble?: string | null
          document_id?: string
          entrega_inmediata?: boolean | null
          estado_conservacion?: string | null
          fecha_entrega?: string | null
          fecha_escritura?: string | null
          finca?: string | null
          folio?: string | null
          forma_pago?: string | null
          gastos_a_cargo_comprador?: Json | null
          gastos_a_cargo_vendedor?: Json | null
          hipotecas_pendientes?: string | null
          id?: string
          impuestos_incluidos?: boolean | null
          inscripcion?: string | null
          inscripcion_registro?: string | null
          inventario_incluido?: string | null
          itp_aplicable?: number | null
          libre_cargas?: boolean | null
          libro?: string | null
          moneda?: string | null
          notaria_direccion?: string | null
          notario_nombre?: string | null
          notario_numero_colegiado?: string | null
          numero_banos?: number | null
          numero_habitaciones?: number | null
          organization_id?: string
          orientacion?: string | null
          planta?: string | null
          precio_en_letras?: string | null
          precio_venta?: number | null
          protocolo_numero?: string | null
          referencia_catastral?: string | null
          registro_propiedad?: string | null
          servidumbres?: string | null
          superficie_m2?: number | null
          superficie_util?: number | null
          tipo_inmueble?: string | null
          tomo?: string | null
          valor_catastral?: number | null
          vendedor_direccion?: string | null
          vendedor_dni?: string | null
          vendedor_estado_civil?: string | null
          vendedor_nacionalidad?: string | null
          vendedor_nombre?: string | null
          vendedor_profesion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_property_deeds_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_property_deeds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extracted_property_deeds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          assigned_to: string | null
          community_id: string
          created_at: string | null
          description: string
          id: string
          organization_id: string
          priority: string
          reported_by: string
          resolved_at: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          community_id: string
          created_at?: string | null
          description: string
          id?: string
          organization_id: string
          priority?: string
          reported_by: string
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          community_id?: string
          created_at?: string | null
          description?: string
          id?: string
          organization_id?: string
          priority?: string
          reported_by?: string
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      items: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          locale: string | null
          max_communities: number
          max_users_per_community: number
          name: string
          owner_id: string
          subscription_plan: string
          timezone: string | null
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          locale?: string | null
          max_communities?: number
          max_users_per_community?: number
          name: string
          owner_id: string
          subscription_plan?: string
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          locale?: string | null
          max_communities?: number
          max_users_per_community?: number
          name?: string
          owner_id?: string
          subscription_plan?: string
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      private_items: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          community_id: string | null
          created_at: string | null
          id: string
          organization_id: string
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          community_id?: string | null
          created_at?: string | null
          id?: string
          organization_id: string
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vector_embeddings: {
        Row: {
          chunk_index: number | null
          chunk_size: number | null
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          organization_id: string
        }
        Insert: {
          chunk_index?: number | null
          chunk_size?: number | null
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          organization_id: string
        }
        Update: {
          chunk_index?: number | null
          chunk_size?: number | null
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vector_embeddings_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vector_embeddings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_dashboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vector_embeddings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      incidents_summary: {
        Row: {
          community_city: string | null
          community_name: string | null
          created_at: string | null
          days_open: number | null
          id: string | null
          priority: string | null
          reporter_email: string | null
          resolved_at: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      organization_dashboard: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          max_communities: number | null
          max_users_per_community: number | null
          name: string | null
          open_incidents: number | null
          owner_email: string | null
          subscription_plan: string | null
          total_communities: number | null
          total_incidents: number | null
          total_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      can_access_organization: {
        Args: { org_id: string }
        Returns: boolean
      }
      debug_user_permissions: {
        Args: { check_user_id?: string }
        Returns: {
          can_see_all_incidents: boolean
          community_name: string
          role_type: string
          total_visible_incidents: number
          user_email: string
        }[]
      }
      ensure_user_has_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_documents_needing_processing: {
        Args: { target_level?: number }
        Returns: {
          current_status: string
          filename: string
          id: string
          organization_id: string
          processing_level: number
        }[]
      }
      get_organization_document_stats: {
        Args: { org_id?: string }
        Returns: {
          completed_documents: number
          error_documents: number
          processing_documents: number
          total_actas: number
          total_documents: number
          total_facturas: number
          total_size_mb: number
        }[]
      }
      get_user_id_by_email: {
        Args: { email_address: string }
        Returns: string
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      search_documents_by_content: {
        Args: {
          max_results?: number
          query_embedding: string
          search_query: string
          similarity_threshold?: number
        }
        Returns: {
          content_snippet: string
          created_at: string
          document_id: string
          document_type: string
          filename: string
          similarity_score: number
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_processing_status: {
        Args: {
          doc_id: string
          error_message?: string
          new_status: string
          step_name: string
        }
        Returns: boolean
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
