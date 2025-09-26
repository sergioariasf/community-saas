<!--
ARCHIVO: deployment-checklist.md
PROPÓSITO: Checklist sistemático para deploy en Vercel
ESTADO: development
DEPENDENCIAS: .env.local, package.json, agentes deploy
OUTPUTS: Lista de validaciones y pasos para deploy seguro
ACTUALIZADO: 2025-09-26
-->

# 🚀 DEPLOYMENT CHECKLIST - COMMUNITY SAAS

## 📋 PRE-DEPLOY VALIDATION

### ✅ 1. BUILD VALIDATION
- [ ] `npm run build` executes without errors
- [ ] No TypeScript compilation errors
- [ ] All imports resolved (no missing modules)
- [ ] No ESLint critical warnings

### ✅ 2. CODE QUALITY CHECK
- [ ] No `any` types in production code
- [ ] All components have proper TypeScript interfaces
- [ ] Server actions properly typed
- [ ] Database operations use typed clients

### ✅ 3. ENVIRONMENT VARIABLES AUDIT

#### 🔐 Local Environment (.env.local)
```bash
# Core Supabase
✅ NEXT_PUBLIC_SUPABASE_URL=https://vhybocthkbupgedovovj.supabase.co
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY=[encrypted]
✅ SUPABASE_SERVICE_ROLE_KEY=[encrypted]
✅ SUPABASE_PROJECT_REF=vhybocthkbupgedovovj

# Application
⚠️  NEXT_PUBLIC_APP_URL=http://localhost:3001 (DEBE CAMBIAR EN PRODUCCIÓN)
✅ PORT=3001

# Services
✅ GOOGLE_CLIENT_ID=[configured]
✅ GOOGLE_CLIENT_SECRET=[encrypted]
✅ GEMINI_API_KEY=[encrypted]
✅ GOOGLE_APPLICATION_CREDENTIALS=[path configured]
```

#### 🌐 Production Environment (Vercel)
- [ ] `NEXT_PUBLIC_APP_URL` = `https://tu-dominio.vercel.app`
- [ ] `NEXT_PUBLIC_SUPABASE_URL` = mismo valor
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = mismo valor  
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = mismo valor
- [ ] `SUPABASE_PROJECT_REF` = mismo valor
- [ ] `GOOGLE_CLIENT_ID` = mismo valor
- [ ] `GOOGLE_CLIENT_SECRET` = mismo valor
- [ ] `GEMINI_API_KEY` = mismo valor
- [ ] **NO incluir:** `PORT`, `GOOGLE_APPLICATION_CREDENTIALS`

### ✅ 4. DATABASE VALIDATION
- [ ] Supabase project accessible: `vhybocthkbupgedovovj`
- [ ] All tables exist with proper structure
- [ ] RLS policies configured and tested
- [ ] Migrations applied successfully
- [ ] Test user exists: `sergioariasf@gmail.com`

### ✅ 5. CORE FUNCTIONALITY TEST
- [ ] Login with test credentials works
- [ ] Multi-tenant isolation verified
- [ ] Communities CRUD functional
- [ ] Incidents system operational
- [ ] Documents pipeline working
- [ ] Multi-document analyzer functional

## 🔧 BUILD FIX REQUIRED

### ❌ Current Build Errors
```
Module not found: Can't resolve '@/data/anon/items'
Module not found: Can't resolve '@/data/anon/privateItems' 
Module not found: Can't resolve '@/data/user/privateItems'
```

### 🛠️ Fix Strategy
1. **Option A:** Create missing data files
2. **Option B:** Remove NextBase template references
3. **Option C:** Replace with existing community/documents functionality

### 📁 Affected Files
```
src/app/(dynamic-pages)/(main-pages)/new/ClientPage.tsx
src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/private-item/[privateItemId]/ConfirmDeleteItemDialog.tsx
src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/private-item/[privateItemId]/page.tsx
src/app/(dynamic-pages)/(main-pages)/item/[itemId]/ConfirmDeleteItemDialog.tsx
src/app/(dynamic-pages)/(main-pages)/item/[itemId]/page.tsx
```

## 🚀 DEPLOYMENT PROCESS

### Phase 1: Fix & Test
1. [ ] Fix missing imports/modules
2. [ ] Run `npm run build` - must succeed
3. [ ] Test locally: `npm run dev`
4. [ ] Verify core functionality works

### Phase 2: Deploy
1. [ ] Commit fixes: `git add . && git commit -m "fix: resolve missing imports for production build"`
2. [ ] Push to GitHub: `git push origin main`
3. [ ] Configure Vercel environment variables
4. [ ] Monitor Vercel auto-deployment

### Phase 3: Validation
1. [ ] Production URL accessible
2. [ ] Login flow works with test credentials
3. [ ] Multi-document analyzer functional
4. [ ] No console errors in production
5. [ ] Performance acceptable (< 3s load time)

## 🆘 ROLLBACK PLAN
- [ ] Previous working deployment identified
- [ ] Database backup available if needed
- [ ] DNS/domain revert process ready
- [ ] User notification plan if needed

## 📊 SUCCESS CRITERIA
- [ ] Build passes without errors
- [ ] Authentication works (sergioariasf@gmail.com / Elpato_46)
- [ ] Multi-document system functional
- [ ] Core CRUD operations work
- [ ] Performance under 3 seconds
- [ ] Zero critical console errors

## 🤖 AUTOMATION COMMANDS

```bash
# Pre-deploy validation
npm run build
npm run lint  # if available

# Deploy process (GitHub + Vercel auto-deploy)
git add .
git commit -m "feat: production ready with all build fixes"
git push origin main

# Post-deploy validation
curl -I https://tu-dominio.vercel.app
curl https://tu-dominio.vercel.app/api/health  # if exists
```

## 📝 VARIABLES FOR EACH CLIENT

### Template para nuevos clientes:
```bash
# Core (siempre igual)
NEXT_PUBLIC_SUPABASE_URL=https://[PROYECTO-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from-supabase-dashboard]
SUPABASE_SERVICE_ROLE_KEY=[from-supabase-dashboard]
SUPABASE_PROJECT_REF=[PROYECTO-ID]

# Cliente específico
NEXT_PUBLIC_APP_URL=https://[cliente-domain].vercel.app
GOOGLE_CLIENT_ID=[cliente-oauth-id]
GOOGLE_CLIENT_SECRET=[cliente-oauth-secret]
GEMINI_API_KEY=[shared-or-client-specific]
```

### Pasos para cada cliente:
1. [ ] Crear proyecto Supabase nuevo
2. [ ] Configurar OAuth específico del cliente
3. [ ] Obtener dominio Vercel específico
4. [ ] Configurar variables de entorno por cliente
5. [ ] Test completo del cliente específico