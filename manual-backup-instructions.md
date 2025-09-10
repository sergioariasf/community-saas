# 📦 Manual Backup Instructions - Community SaaS

## 🎯 **Backup Strategy for Free Supabase Account**

Dado que en cuentas gratuitas no tenemos acceso a backups automáticos ni service keys, vamos a hacer un backup manual pero seguro.

## 💾 **PASO 1: Backup Manual vía SQL Editor**

### **1.1 - Exportar datos actuales**

Ve a **Supabase Dashboard** → **SQL Editor** y ejecuta estos queries uno por uno para ver y copiar tus datos:

```sql
-- 1. Communities
SELECT 'COMMUNITIES:' as info;
SELECT * FROM communities;

-- 2. User Roles  
SELECT 'USER_ROLES:' as info;
SELECT * FROM user_roles;

-- 3. Incidents
SELECT 'INCIDENTS:' as info;
SELECT * FROM incidents;

-- 4. Conteo total
SELECT 'TOTAL COUNTS:' as info;
SELECT 
  'communities' as table_name, COUNT(*) as count FROM communities
UNION ALL
SELECT 
  'user_roles' as table_name, COUNT(*) as count FROM user_roles
UNION ALL
SELECT 
  'incidents' as table_name, COUNT(*) as count FROM incidents;
```

### **1.2 - Backup de esquema actual**

```sql
-- Estructura actual de communities
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'communities' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Políticas RLS actuales  
SELECT tablename, policyname, cmd as command
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('communities', 'incidents', 'user_roles')
ORDER BY tablename, policyname;
```

## 🔐 **PASO 2: Situación Actual (Pre-Migración)**

### **Datos conocidos que tenemos:**
- ✅ **3 comunidades** creadas con tus datos de prueba
- ✅ **4 user_roles** (1 admin global + 3 managers por comunidad)  
- ✅ **6 incidencias** con diferentes estados y prioridades
- ✅ **Usuario admin**: sergioariasf@gmail.com

### **Schema actual:**
```sql
-- Tabla communities (con columnas agregadas)
communities:
  - id, name, address, postal_code, admin_contact, max_units
  - is_active, created_at, updated_at (por defecto)
  - description, city, country, user_id (agregadas recientemente)

-- Tabla incidents (completa)  
incidents:
  - id, title, description, status, priority
  - community_id, reported_by, assigned_to
  - created_at, updated_at, resolved_at

-- Tabla user_roles (existente)
user_roles:
  - id, user_id, community_id, role
  - created_at, updated_at
```

## 🎯 **PASO 3: Plan de Migración Seguro**

### **3.1 - Pre-migración (YA HECHO)**
- ✅ Datos de prueba creados y funcionando
- ✅ Sistema de incidencias operativo
- ✅ RLS policies funcionando correctamente

### **3.2 - Durante la migración**
- 📄 Aplicar migración `010_create_organizations_multi_tenant.sql`
- 🔄 Migrar datos existentes a organización por defecto
- 🔒 Actualizar RLS policies para multi-tenancy

### **3.3 - Post-migración**
- ✅ Verificar que todos los datos siguen visibles
- ✅ Probar funcionalidad del sistema de incidencias
- ✅ Verificar isolation entre organizaciones

## 💡 **PASO 4: Backup de Emergencia Simple**

### **4.1 - Backup rápido de datos críticos:**

```sql
-- Generar INSERT statements para restaurar datos críticos
SELECT 'INSERT INTO communities (id, name, address, city, country, description, user_id, admin_contact, max_units, is_active, created_at, updated_at) VALUES (''' || 
  id || ''', ''' || name || ''', ''' || COALESCE(address, '') || ''', ''' || COALESCE(city, '') || ''', ''' || 
  COALESCE(country, '') || ''', ''' || COALESCE(description, '') || ''', ''' || COALESCE(user_id::text, '') || ''', ''' || 
  COALESCE(admin_contact, '') || ''', ' || COALESCE(max_units, 100) || ', ' || is_active || ', ''' || 
  created_at || ''', ''' || updated_at || ''');' as restore_command
FROM communities;
```

## 🚀 **PASO 5: Proceder con la Migración**

Como tenemos:
- ✅ **Datos de prueba conocidos** (fáciles de recrear)
- ✅ **Sistema funcionando** correctamente
- ✅ **Scripts de restauración** preparados por el agente dbmaster-supabase

**Podemos proceder con confianza a aplicar la migración multi-tenant.**

## ⚠️ **Plan de Rollback**

Si algo sale mal, podemos:
1. **Ejecutar rollback script** creado por dbmaster-supabase
2. **Recrear datos de prueba** usando scripts anteriores
3. **Restaurar desde backup manual** si es necesario

---

## 🎉 **¿Listo para continuar?**

Con esta estrategia de backup manual tenemos suficiente seguridad para proceder con la migración multi-tenant. Los datos de prueba son fáciles de recrear y tenemos scripts de rollback preparados.

**¿Procedemos con la aplicación de la migración 010?**