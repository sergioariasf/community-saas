<!--
ARCHIVO: doc_autentificacion.md
PROPÓSITO: Documentación completa del sistema de autenticación y autorización
ESTADO: development
DEPENDENCIAS: Supabase Auth, user_roles, organizations
OUTPUTS: Documentación técnica y funcional
ACTUALIZADO: 2025-10-01
-->

# 📋 DOCUMENTACIÓN SISTEMA DE AUTENTICACIÓN

## 📖 ÍNDICE
1. [Estado Actual](#-estado-actual)
2. [Arquitectura Multi-Tenant](#-arquitectura-multi-tenant)
3. [Flujo de Autenticación](#-flujo-de-autenticación)
4. [Sistema de Roles y Permisos](#-sistema-de-roles-y-permisos)
5. [Problema Identificado](#-problema-identificado)
6. [Solución Propuesta](#-solución-propuesta)
7. [Implementación Técnica](#-implementación-técnica)

---

## 🎯 ESTADO ACTUAL

### ✅ **FUNCIONALIDADES IMPLEMENTADAS**

#### **Página de Autenticación Unificada**
- **Ubicación:** `/auth` con parámetros `?mode=login|register`
- **Componente principal:** `src/app/(dynamic-pages)/(login-pages)/(login-pages)/auth/Auth.tsx`
- **Toggle dinámico:** Login ↔ Registro en la misma interfaz

#### **Métodos de Autenticación (3 opciones)**

1. **📧 Email + Password**
   - Validación con Zod schemas
   - Formularios separados para login/registro
   - Autocompletado correcto (`current-password`/`new-password`)

2. **🔗 Magic Link (Passwordless)**
   - Envío de enlaces mágicos por email
   - Sin necesidad de contraseña
   - Redirección automática tras verificación

3. **🌐 Social Login (OAuth)**
   - **Google** ✅ (configurado y funcionando)
   - **GitHub** ✅ (disponible)
   - **Twitter** ✅ (disponible)

#### **Components Modulares**
```
src/components/Auth/
├── Auth.tsx                    # Componente principal unificado
├── EmailAndPassword.tsx        # Formulario credenciales
├── Email.tsx                   # Solo email para magic links
├── RenderProviders.tsx         # Botones OAuth
├── EmailConfirmationPendingCard.tsx  # Estado confirmación
└── RedirectingPleaseWaitCard.tsx     # Estado redirección
```

#### **Server Actions (Next.js 15)**
```typescript
// src/data/auth/auth.ts
- signUpAction                  # Registro con email/password
- signInWithPasswordAction      # Login con credenciales
- signInWithMagicLinkAction     # Enlaces mágicos
- signInWithProviderAction      # OAuth social
- resetPasswordAction           # Recuperación contraseña
```

---

## 🏗️ ARQUITECTURA MULTI-TENANT

### **Estructura de Base de Datos**

```sql
-- 1. AUTENTICACIÓN BASE (Supabase Auth)
auth.users {
  id: UUID PRIMARY KEY,
  email: TEXT,
  -- Manejo automático por Supabase
}

-- 2. ORGANIZACIONES (Tenant Level)
organizations {
  id: UUID PRIMARY KEY,
  name: TEXT NOT NULL,
  owner_id: UUID → auth.users(id),
  subscription_plan: TEXT,
  vertical_type: TEXT,           -- 'comunidades' | 'oficinas'
  vertical_config: JSONB,        -- Configuración específica
  max_communities: INTEGER,
  is_active: BOOLEAN,
  created_at: TIMESTAMP
}

-- 3. ROLES Y PERMISOS (Multi-tenant Security)
user_roles {
  id: UUID PRIMARY KEY,
  user_id: UUID → auth.users(id),
  organization_id: UUID → organizations(id),
  community_id: UUID → communities(id),  -- Opcional
  role: TEXT CHECK IN ('admin', 'manager', 'resident'),
  created_at: TIMESTAMP
}

-- 4. COMUNIDADES/DEPARTAMENTOS (Data Level)
communities {
  id: UUID PRIMARY KEY,
  name: TEXT,
  organization_id: UUID → organizations(id),
  -- Datos específicos de cada comunidad/departamento
}
```

### **Jerarquía de Permisos**

```
📊 NIVELES DE ACCESO:

🔴 ADMIN (Super Usuario)
├── Acceso a TODAS las organizaciones
├── Gestión completa de usuarios
├── Configuración de sistema
└── Panel de desarrollo

🟡 MANAGER (Gestor)
├── Acceso a SU organización
├── Gestión de incidencias/tickets
├── Gestión de comunidades asignadas
└── Reportes y estadísticas

🟢 RESIDENT (Usuario Final)
├── Acceso a SUS comunidades asignadas
├── Crear incidencias/tickets
├── Ver documentos permitidos
└── Funcionalidades básicas
```

---

## 🔄 FLUJO DE AUTENTICACIÓN

### **Estado Actual - Funcional**

```
1. Usuario → /auth?mode=login
2. Elige método (password/magic/social)
3. Supabase valida credenciales
4. Redirect → /dashboard
```

### **Rutas de Acceso**

```typescript
// Puntos de entrada
Landing Page → "Acceso Clientes" → /auth?mode=login
Landing Page → "Empezar Gratis" → /auth?mode=register
Header → "Acceso Clientes" → /auth?mode=login

// Protección de rutas
Middleware → checkAuth() → redirect si no autenticado
Layout → getCachedLoggedInVerifiedSupabaseUser()
```

### **Hooks y Providers**

```typescript
// Sistema de permisos
usePermissions() → { isAdmin, isManager, isResident }
getCurrentUserPermissions() → server-side validation
hasPermission(role, communityId?) → boolean validation

// Sistema vertical (multi-tenant UI)
useVertical() → configuración UI según organización
useUserOrganization() → datos organización actual
VerticalProvider → contexto global vertical
```

---

## ⚠️ PROBLEMA IDENTIFICADO

### **🚨 GAP CRÍTICO EN FLUJO DE REGISTRO**

#### **Situación Actual Problemática:**

```
❌ FLUJO ROTO:
1. Nuevo usuario → /auth?mode=register ✅
2. Se registra exitosamente ✅  
3. Confirma email ✅
4. Queda en auth.users ✅
5. PERO no tiene user_roles ❌
6. PERO no tiene organization_id ❌  
7. PERO no puede acceder a nada ❌
8. Usuario registrado pero BLOQUEADO 💥
```

#### **Causa Raíz:**
- **No hay flujo de onboarding** post-registro
- **No hay asignación automática** a organización
- **No hay creación automática** de roles iniciales
- **Sistema asume usuarios pre-configurados**

#### **Código Problema:**
```typescript
// src/hooks/useUserOrganization.ts línea 66-72
if (rolesError) {
  throw new Error(`Error al obtener organización: ${rolesError.message}`);
}

if (!userRoles?.organizations) {
  throw new Error('Usuario no tiene organización asignada'); // 💥 AQUÍ FALLA
}
```

---

## 🎯 SOLUCIÓN PROPUESTA

### **SISTEMA DE INVITACIONES CONTROLADAS**

#### **🎯 Objetivo:**
- **Tú mantienes control total** de quién accede
- **Usuario solo elige contraseña** (UX simple)
- **Asignación automática** de roles y organización
- **Auditoría completa** de accesos

#### **📋 Flujo Propuesto:**

```
🔥 NUEVO FLUJO CONTROLADO:

1. Admin → Panel de invitaciones
   ├── Especifica: email, organización, rol, comunidades
   ├── Sistema genera token único
   └── Envía email automático

2. Usuario → Recibe invitación por email
   ├── Click en enlace único: /auth/accept-invitation?token=ABC123
   ├── Ve detalles: organización, rol asignado
   └── Solo completa: nombre + contraseña

3. Sistema → Procesamiento automático  
   ├── Crea cuenta en auth.users
   ├── Asigna organización en user_roles
   ├── Configura permisos específicos
   └── Redirect automático al dashboard

4. Usuario → Acceso inmediato ✅
   ├── Cuenta configurada completamente
   ├── Roles y permisos asignados
   ├── UI adaptada a su vertical
   └── Funcionalidades disponibles
```

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **1. Nueva Tabla: user_invitations**

```sql
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Datos de invitación
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Configuración pre-asignada
  organization_id UUID NOT NULL REFERENCES organizations(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'resident')),
  community_ids UUID[] DEFAULT '{}', -- Array de comunidades específicas
  
  -- Metadata y auditoría
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  custom_message TEXT,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  accepted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_invitations_token ON user_invitations(token);
CREATE INDEX idx_invitations_email ON user_invitations(email);
CREATE INDEX idx_invitations_status ON user_invitations(status);
```

### **2. Server Actions - Sistema de Invitaciones**

```typescript
// src/data/admin/invitations.ts

// Crear nueva invitación
export const createInvitationAction = actionClient
  .schema(createInvitationSchema)
  .action(async ({ parsedInput }) => {
    // 1. Validar permisos admin
    // 2. Generar token único
    // 3. Crear registro en user_invitations
    // 4. Enviar email con Resend/Supabase
    // 5. Return success + invitation_id
  });

// Aceptar invitación
export const acceptInvitationAction = actionClient
  .schema(acceptInvitationSchema)
  .action(async ({ parsedInput }) => {
    // 1. Validar token y expiración
    // 2. Crear usuario en auth.users
    // 3. Crear user_roles según invitación
    // 4. Marcar invitación como aceptada
    // 5. Return success + redirect_url
  });

// Listar invitaciones (admin)
export const getInvitationsAction = actionClient
  .action(async () => {
    // 1. Verificar permisos admin
    // 2. Obtener invitaciones con JOIN de datos
    // 3. Return lista paginada + stats
  });
```

### **3. Componentes React - Panel de Admin**

```typescript
// src/app/(admin)/invitations/page.tsx
export default function InvitationsPage() {
  return (
    <AdminLayout>
      <InvitationManager />
    </AdminLayout>
  );
}

// src/components/admin/InvitationManager.tsx
export function InvitationManager() {
  return (
    <div className="space-y-6">
      <InviteUserForm />          // Crear nueva invitación
      <PendingInvitationsList />  // Tabla de pendientes
      <InvitationHistory />       // Historial completo
    </div>
  );
}

// src/app/auth/accept-invitation/page.tsx
export default function AcceptInvitationPage({ searchParams }) {
  const { token } = searchParams;
  
  return (
    <AcceptInvitationFlow token={token}>
      <InvitationDetails />       // Mostrar org, rol, etc.
      <SetPasswordForm />         // Usuario elige contraseña
      <TermsAcceptance />         // Aceptar términos
    </AcceptInvitationFlow>
  );
}
```

### **4. Modificaciones al Sistema Actual**

```typescript
// 1. Deshabilitar registro público
// src/app/auth/Auth.tsx - Ocultar tab "Registrarse"

// 2. Modificar landing page
// Cambiar "Empezar Gratis" → "Solicitar Acceso"

// 3. Agregar middleware de protección
// Verificar user_roles válido en todas las rutas protegidas

// 4. Página de "Acceso Pendiente" 
// Para usuarios en auth.users sin user_roles
```

### **5. Sistema de Emails**

```typescript
// src/lib/email/invitation-emails.ts
export async function sendInvitationEmail({
  email,
  inviterName,
  organizationName,
  token,
  customMessage
}: InvitationEmailProps) {
  
  const invitationUrl = `${siteUrl}/auth/accept-invitation?token=${token}`;
  
  // Template HTML personalizado
  const htmlContent = `
    <h1>Invitación a ${organizationName}</h1>
    <p>${inviterName} te ha invitado a unirte a la plataforma.</p>
    <p>${customMessage || 'Haz click en el enlace para aceptar:'}</p>
    <a href="${invitationUrl}">Aceptar Invitación</a>
    <p>Este enlace expira en 7 días.</p>
  `;
  
  // Enviar con Resend/Supabase/SendGrid
  return await sendEmail({
    to: email,
    subject: `Invitación a ${organizationName}`,
    html: htmlContent
  });
}
```

---

## 📊 BENEFICIOS DEL NUEVO SISTEMA

### **🔒 Control y Seguridad**
- ✅ **Control total** de accesos
- ✅ **Tokens únicos** con expiración
- ✅ **Auditoría completa** de invitaciones
- ✅ **Prevención de registros** no autorizados

### **🚀 Experiencia de Usuario**
- ✅ **UX simple:** Usuario solo elige contraseña
- ✅ **Acceso inmediato** tras aceptar
- ✅ **Configuración automática** de permisos
- ✅ **Mensajes personalizados** en invitaciones

### **⚙️ Escalabilidad y Mantenimiento**
- ✅ **Fácil agregar múltiples admins** invitadores
- ✅ **Sistema reutilizable** para diferentes roles
- ✅ **Integración limpia** con sistema existente
- ✅ **Base sólida** para futuras funcionalidades

---

## 🛣️ ROADMAP DE IMPLEMENTACIÓN

### **🎯 Fase 1: Base del Sistema (2-3 días)**
1. Crear tabla `user_invitations` en Supabase
2. Implementar server actions básicos
3. Desarrollar panel de admin simple
4. Testing básico del flujo

### **🎯 Fase 2: Interfaz Completa (2-3 días)**  
1. Componentes React para invitaciones
2. Página de aceptación de invitación
3. Sistema de emails automático
4. Validaciones y error handling

### **🎯 Fase 3: Integración y Pulido (1-2 días)**
1. Modificar sistema de registro actual
2. Middleware de protección mejorado
3. Testing completo E2E
4. Documentación de usuario final

### **🎯 Fase 4: Producción (1 día)**
1. Deploy y configuración
2. Testing en producción
3. Invitaciones iniciales
4. Monitoreo y ajustes

---

## 📝 NOTAS DE IMPLEMENTACIÓN

### **🔧 Consideraciones Técnicas**
- **RLS Policies:** Actualizar para incluir invitaciones
- **Error Handling:** Gestión de tokens expirados/inválidos
- **Rate Limiting:** Prevenir spam de invitaciones
- **Email Templates:** Diseño responsive y profesional

### **🎨 Consideraciones UX**
- **Feedback claro** en cada paso del proceso
- **Mensajes de error** descriptivos y accionables
- **Loading states** durante procesamiento
- **Confirmaciones visuales** tras acciones exitosas

### **🛡️ Consideraciones de Seguridad**
- **Tokens criptográficamente seguros**
- **Validación estricta** de permisos admin
- **Logs de auditoría** completos
- **Expiración automática** de invitaciones

---

## ✅ CONCLUSIÓN

El sistema de invitaciones controladas soluciona completamente el problema actual y establece una base sólida para el crecimiento futuro de la plataforma, manteniendo el control total sobre los accesos mientras proporciona una excelente experiencia de usuario.

**Estado:** ✅ Diseño completo y listo para implementación
**Prioridad:** 🔥 Alta - Resolver GAP crítico
**Estimación:** 📅 5-8 días desarrollo completo