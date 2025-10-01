/**
 * ARCHIVO: comunidades.ts
 * PROPÓSITO: Configuración vertical para comunidades de vecinos y asociaciones
 * ESTADO: development
 * DEPENDENCIAS: types.ts
 * OUTPUTS: Configuración completa vertical comunidades
 * ACTUALIZADO: 2025-10-01
 */

import { VerticalConfig } from './types';

export const comunidadesVertical: VerticalConfig = {
  id: 'comunidades',
  name: 'Comunidades de Vecinos',
  description: 'Gestión integral para comunidades de propietarios y asociaciones',
  
  modules: {
    visible: ['documents', 'incidents', 'communities', 'forum', 'chat'],
    hidden: []
  },
  
  labels: {
    // Módulos principales
    'incidents': 'Incidencias',
    'communities': 'Comunidades',
    'documents': 'Documentos',
    'forum': 'Foro',
    'chat': 'Chat IA',
    
    // Acciones de incidencias
    'incidents.new': 'Crear Incidencia',
    'incidents.list': 'Lista de Incidencias',
    'incidents.edit': 'Editar Incidencia',
    'incidents.view': 'Ver Incidencia',
    
    // Acciones de comunidades
    'communities.new': 'Nueva Comunidad',
    'communities.list': 'Mis Comunidades',
    'communities.edit': 'Editar Comunidad',
    'communities.view': 'Ver Comunidad',
    
    // Estados
    'status.pending': 'Pendiente',
    'status.in_progress': 'En Progreso',
    'status.resolved': 'Resuelta',
    'status.closed': 'Cerrada'
  },
  
  navigation: {
    mainMenu: [
      { key: 'dashboard', label: 'Dashboard', icon: 'Home', href: '/dashboard' },
      { key: 'documents', label: 'Documentos', icon: 'FileText', href: '/documents' },
      { key: 'incidents', label: 'Incidencias', icon: 'AlertCircle', href: '/incidents' },
      { key: 'communities', label: 'Comunidades', icon: 'Users', href: '/communities' },
      { key: 'forum', label: 'Foro', icon: 'MessageSquare', href: '/foro' },
      { key: 'chat', label: 'Chat IA', icon: 'Bot', href: '/chat-ia' }
    ]
  },
  
  theme: {
    primary: '#059669',     // Verde comunidad
    accent: '#10b981',      // Verde claro
    background: '#f0fdf4'   // Verde muy claro
  }
};