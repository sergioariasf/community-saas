# 🧪 Sistema de Testing de Roles y Permisos

Este sistema permite probar de manera sistemática que cada rol (ADMIN, MANAGER, RESIDENT) ve exactamente lo que debe ver en cada sección de la aplicación.

## 📋 Archivos del Sistema

### 🎭 `role-manager.js`
**Utilidad para gestionar roles durante testing**
- Cambia roles dinámicamente en la base de datos
- Configuraciones predefinidas para diferentes escenarios
- Verificación de roles actuales

### 🎪 `test-roles-permissions.spec.ts`
**Tests E2E completos con Playwright**
- Verificación automática de permisos en todas las páginas
- Tests sistemáticos para cada configuración de rol
- Navegación completa entre secciones

### ⚡ `quick-permission-test.js`
**Pruebas rápidas sin navegador**
- Verificación HTTP directa de acceso a páginas
- Ideal para desarrollo y debugging rápido
- Reportes tabulares de resultados

## 🚀 Cómo Usar

### 1. Gestión de Roles

```bash
# Ver configuraciones disponibles
node e2e/ui-tests/role-manager.js list

# Aplicar configuración específica
node e2e/ui-tests/role-manager.js apply adminOnly
node e2e/ui-tests/role-manager.js apply managerMultiple
node e2e/ui-tests/role-manager.js apply residentOnly

# Verificar roles actuales
node e2e/ui-tests/role-manager.js verify
```

### 2. Pruebas Rápidas (Desarrollo)

```bash
# Prueba sistemática todos los roles
node e2e/ui-tests/quick-permission-test.js full

# Prueba un rol específico
node e2e/ui-tests/quick-permission-test.js single adminOnly

# Prueba rápida con rol actual
node e2e/ui-tests/quick-permission-test.js quick
```

### 3. Tests E2E Completos

```bash
# Ejecutar todos los tests de roles
npx playwright test e2e/ui-tests/test-roles-permissions.spec.ts

# Ejecutar test específico
npx playwright test e2e/ui-tests/test-roles-permissions.spec.ts --grep "ADMIN"

# Con interfaz visual
npx playwright test e2e/ui-tests/test-roles-permissions.spec.ts --ui
```

## 🎯 Configuraciones de Roles Disponibles

### 👑 `adminOnly` - Admin Global
```javascript
roles: [{ role: 'admin', community_id: null }]
```
**Debe ver**: Todas las comunidades, acceso total

### 🏢 `managerMultiple` - Manager de Múltiples Comunidades
```javascript
roles: [
  { role: 'manager', community_id: 'amara' },
  { role: 'manager', community_id: 'losOlivos' },
  { role: 'manager', community_id: 'torres' }
]
```
**Debe ver**: Solo 3 comunidades asignadas, puede gestionar

### 🏢 `managerSingle` - Manager de Una Comunidad
```javascript
roles: [{ role: 'manager', community_id: 'amara' }]
```
**Debe ver**: Solo Amara, gestión limitada a esa comunidad

### 🏠 `residentOnly` - Resident de Una Comunidad
```javascript
roles: [{ role: 'resident', community_id: 'bellaVista' }]
```
**Debe ver**: Solo Bella Vista, solo lectura

### 🚫 `noRoles` - Sin Roles
```javascript
roles: []
```
**Debe ver**: Errores de permisos o redirección a login

### 🎭 `mixedRoles` - Combinación de Roles
```javascript
roles: [
  { role: 'admin', community_id: null },
  { role: 'manager', community_id: 'amara' },
  { role: 'resident', community_id: 'bellaVista' }
]
```
**Debe ver**: Comportamiento de admin (rol más alto)

## 📊 Matriz de Permisos Esperados

| Rol | Dashboard | Comunidades | Documentos | Upload | Incidencias | Usuarios |
|-----|-----------|-------------|------------|--------|-------------|----------|
| **ADMIN** | ✅ Total | ✅ Todas (7) | ✅ Ver/Gestión | ✅ Todas | ✅ Todas | ✅ Gestión |
| **MANAGER** | ✅ Limitado | ✅ Asignadas (3) | ✅ Ver/Gestión | ✅ Asignadas | ✅ Asignadas | ❌ Sin acceso |
| **RESIDENT** | ✅ Básico | ✅ Propia (1) | ✅ Solo ver | ❌ Sin upload | ✅ Propias | ❌ Sin acceso |
| **SIN ROLES** | ❌ Error | ❌ Error | ❌ Error | ❌ Error | ❌ Error | ❌ Error |

## 🔍 Debugging y Troubleshooting

### Ver estado actual de roles:
```bash
node e2e/ui-tests/role-manager.js verify
```

### Ver logs de la aplicación:
```bash
# En otra terminal, observa los logs del servidor
npm run dev
```

### Verificar datos en base de datos:
```bash
node debug-database-state.js
```

### Restablecer roles completos:
```bash
node create-systematic-test-roles.js
```

## 🧪 Flujo de Testing Recomendado

### 1. **Desarrollo Rápido**
```bash
# Durante desarrollo, usa pruebas rápidas
node e2e/ui-tests/role-manager.js apply adminOnly
# Prueba manual en navegador: http://localhost:3001

node e2e/ui-tests/role-manager.js apply residentOnly  
# Verificar que solo ve lo que debe ver
```

### 2. **Verificación Sistemática**
```bash
# Antes de commit, ejecuta prueba completa
node e2e/ui-tests/quick-permission-test.js full
```

### 3. **CI/CD Completo**
```bash
# En pipeline, ejecuta tests E2E
npx playwright test e2e/ui-tests/test-roles-permissions.spec.ts
```

## ⚙️ Configuración Técnica

### Variables de Entorno Requeridas
```bash
# .env.local debe contener:
NEXT_PUBLIC_SUPABASE_URL=https://vhybocthkbupgedovovj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Usuario de Prueba
- **Email**: `sergioariasf@gmail.com`
- **Password**: `Elpato_46`
- **ID**: `12e1976b-4bd0-4062-833c-9d1cf78c49eb`

### Datos de Prueba
- **Organización**: `Organización Principal`
- **Comunidades**: Amara, Los Olivos, Torres del Parque, Bella Vista, etc.

## 🎯 Resultados Esperados

Cuando ejecutes las pruebas, deberías ver:

```bash
🔍 Probando acceso con rol: ADMINONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Dashboard             - ACCESIBLE (200)
✅ Comunidades          - ACCESIBLE (200)
✅ Documentos           - ACCESIBLE (200)
✅ Subir Documentos     - ACCESIBLE (200)
✅ Incidencias          - ACCESIBLE (200)
❌ Usuarios             - ERROR PERMISOS (403)
```

## 🚨 Troubleshooting Común

### Error "No communities found"
```bash
# Verificar que el usuario tiene roles asignados
node e2e/ui-tests/role-manager.js verify

# Si no tiene roles, crear configuración base
node create-systematic-test-roles.js
```

### Error "Authentication required"
```bash
# Verificar que el servidor está corriendo
curl http://localhost:3001/dashboard

# Verificar usuario en base de datos
node debug-database-state.js
```

### Tests fallan constantemente
```bash
# Limpiar estado y recrear roles
node e2e/ui-tests/role-manager.js apply adminOnly
node e2e/ui-tests/quick-permission-test.js quick
```

---

## 🎉 ¡Listo para Testing!

Con este sistema puedes:
- ✅ **Verificar permisos** de manera sistemática
- ✅ **Cambiar roles** dinámicamente durante desarrollo  
- ✅ **Automatizar testing** de toda la matriz de permisos
- ✅ **Debuggear problemas** de autorización rápidamente

**¡Empieza con una prueba rápida!**
```bash
node e2e/ui-tests/quick-permission-test.js full
```