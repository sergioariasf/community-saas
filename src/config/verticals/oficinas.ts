/**
 * ARCHIVO: oficinas.ts
 * PROPÓSITO: Configuración vertical para oficinas corporativas y empresas
 * ESTADO: development
 * DEPENDENCIAS: types.ts
 * OUTPUTS: Configuración completa vertical oficinas
 * ACTUALIZADO: 2025-10-01
 */

import { VerticalConfig } from './types';

export const oficinasVertical: VerticalConfig = {
  id: 'oficinas',
  name: 'Oficinas Corporativas',
  description: 'Gestión empresarial para oficinas, startups y consultorías',
  
  modules: {
    visible: ['documents', 'incidents', 'communities', 'chat'],
    hidden: ['forum']  // Las oficinas no necesitan foro público
  },
  
  labels: {
    // Módulos principales - CAMBIOS CLAVE
    'incidents': 'Tickets',           // ← CAMBIO: Incidencias → Tickets
    'communities': 'Departamentos',   // ← CAMBIO: Comunidades → Departamentos
    'documents': 'Documentos',
    'chat': 'Chat IA',
    
    // Acciones de tickets (antes incidencias)
    'incidents.new': 'Crear Ticket',
    'incidents.list': 'Lista de Tickets',
    'incidents.edit': 'Editar Ticket',
    'incidents.view': 'Ver Ticket',
    
    // Acciones de departamentos (antes comunidades)
    'communities.new': 'Nuevo Departamento',
    'communities.list': 'Departamentos',
    'communities.edit': 'Editar Departamento',
    'communities.view': 'Ver Departamento',
    
    // Estados corporativos
    'status.pending': 'Pendiente',
    'status.in_progress': 'En Desarrollo',
    'status.resolved': 'Completado',
    'status.closed': 'Archivado',
    
    // Terminología corporativa adicional
    'priority.low': 'Baja',
    'priority.medium': 'Media',
    'priority.high': 'Alta',
    'priority.urgent': 'Urgente'
  },
  
  navigation: {
    mainMenu: [
      { key: 'dashboard', label: 'Dashboard', icon: 'Home', href: '/dashboard' },
      { key: 'documents', label: 'Documentos', icon: 'FileText', href: '/documents' },
      { key: 'incidents', label: 'Tickets', icon: 'Ticket', href: '/incidents' },
      { key: 'communities', label: 'Departamentos', icon: 'Building2', href: '/communities' },
      { key: 'chat', label: 'Chat IA', icon: 'Bot', href: '/chat-ia' }
      // Nota: 'forum' no aparece en navigation porque está en hidden
    ]
  },
  
  theme: {
    primary: '#2563eb',     // Azul corporativo
    accent: '#3b82f6',      // Azul medio
    background: '#eff6ff'   // Azul muy claro
  }
};