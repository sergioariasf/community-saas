<!--
ARCHIVO: deploy-systematization.md
PROPÓSITO: Sistematización completa del proceso de deploy en Vercel
ESTADO: production
DEPENDENCIAS: deployment-checklist.md, pre-deploy-test.js, agentes deploy
OUTPUTS: Proceso sistemático y repetible para deployments seguros
ACTUALIZADO: 2025-09-26
-->

# 🚀 SYSTEMATIZED VERCEL DEPLOYMENT PROCESS

## 📋 OVERVIEW

Este documento sistematiza el proceso completo de deploy en Vercel para **Community SaaS**, incluyendo validaciones automáticas, checklist paso a paso, y configuración específica por cliente.

## 🤖 AGENTS CONFIGURATION

### Agentes Especializados Disponibles:
- **`deployment-master.json`**: Orquestación general del deploy y fases
- **`vercel-master.json`**: Debugging específico de Vercel y troubleshooting
- **`dbmaster-supabase.json`**: Migraciones y configuración de BD
- **`ui-guardian.json`**: Testing de interfaz y validaciones

## 🧪 PRE-DEPLOY VALIDATION

### Comando Automático:
```bash
node scripts/pre-deploy-test.js
```

### Validaciones Incluidas:
1. **Build Validation**: `npm run build` debe completarse sin errores
2. **Environment Variables**: Todas las variables requeridas presentes
3. **Database Connection**: Credenciales y configuración Supabase
4. **Core Functionality**: Archivos críticos del sistema multi-documento

## 📝 STEP-BY-STEP DEPLOYMENT PROCESS

### Phase 1: Preparación y Validación
```bash
# 1. Ejecutar test de pre-deploy
node scripts/pre-deploy-test.js

# 2. Si falla, revisar checklist manual
# Ver: deployment-checklist.md

# 3. Corregir errores encontrados
npm run build  # Debe completarse sin errores
```

### Phase 2: Build Fix y Commit
```bash
# 1. Agregar cambios
git add .

# 2. Crear commit descriptivo
git commit -m "fix: production build ready - all validations passed

- Fixed missing imports for NextBase template compatibility
- Resolved build errors for deployment
- Multi-document analyzer system fully functional
- All environment variables configured

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# 3. Verificar status
git status
```

### Phase 3: Environment Variables Configuration

#### Variables Requeridas en Vercel:
```bash
# Core Supabase (igual que local)
NEXT_PUBLIC_SUPABASE_URL=https://vhybocthkbupgedovovj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from-.env.local]
SUPABASE_SERVICE_ROLE_KEY=[from-.env.local]
SUPABASE_PROJECT_REF=vhybocthkbupgedovovj

# Application (CAMBIAR para producción)
NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app

# Services (igual que local)
GOOGLE_CLIENT_ID=[from-.env.local]
GOOGLE_CLIENT_SECRET=[from-.env.local]
GEMINI_API_KEY=[from-.env.local]

# NO incluir en producción:
# PORT (Vercel maneja automáticamente)
# GOOGLE_APPLICATION_CREDENTIALS (no necesario en Vercel)
```

### Phase 4: Deployment Execution
```bash
# 1. Push to trigger auto-deploy
git push origin main

# 2. Monitor Vercel dashboard
# https://vercel.com/dashboard

# 3. Check deployment status
# Usar vercel-master agent si hay problemas
```

### Phase 5: Post-Deploy Validation
```bash
# 1. Test production URL
curl -I https://tu-dominio.vercel.app

# 2. Test authentication
# Login con: sergioariasf@gmail.com / Elpato_46

# 3. Test core functionality
# - Communities CRUD
# - Documents upload
# - Multi-document analyzer
# - Document viewing
```

## 🔧 CLIENT-SPECIFIC CONFIGURATION

### Template para Nuevos Clientes:

#### 1. Crear Proyecto Supabase
```bash
# Nuevo proyecto en https://supabase.com/dashboard
# Obtener:
PROYECTO_ID=nuevo-proyecto-id
ANON_KEY=eyJ... (desde Settings > API)
SERVICE_ROLE_KEY=eyJ... (desde Settings > API)
```

#### 2. Configurar OAuth Google
```bash
# https://console.cloud.google.com/apis/credentials
# Crear nuevo OAuth 2.0 Client ID:
GOOGLE_CLIENT_ID=nuevo-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-nuevo-secret
```

#### 3. Variables por Cliente
```bash
# Cliente: [NOMBRE_CLIENTE]
# Dominio: [cliente].vercel.app
# Supabase: [proyecto-id].supabase.co

NEXT_PUBLIC_SUPABASE_URL=https://[proyecto-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key-específico]
SUPABASE_SERVICE_ROLE_KEY=[service-key-específico]
SUPABASE_PROJECT_REF=[proyecto-id]
NEXT_PUBLIC_APP_URL=https://[cliente].vercel.app
GOOGLE_CLIENT_ID=[client-id-específico]
GOOGLE_CLIENT_SECRET=[secret-específico]
GEMINI_API_KEY=[compartido-o-específico]
```

## 🆘 TROUBLESHOOTING GUIDE

### Build Failures
```bash
# Error típico: Module not found
# Solución: Crear archivos placeholder como hicimos con items.ts

# Error TypeScript
# Solución: npm run build y corregir errores específicos

# Dependency issues
# Solución: npm ci && npm run build
```

### Deployment Failures
```bash
# Usar vercel-master agent:
# 1. vercel link --yes
# 2. vercel env ls
# 3. vercel logs [deployment-url]
# 4. Identificar problema específico
```

### Authentication Issues
```bash
# Problema típico: Redirect loop
# Causa: NEXT_PUBLIC_APP_URL apunta a localhost
# Solución: Actualizar en Vercel dashboard
```

## 📊 SUCCESS METRICS

### Deployment Success Criteria:
- [ ] Build completes without errors
- [ ] All environment variables configured
- [ ] Production URL accessible (< 3s load time)
- [ ] Authentication working with test credentials
- [ ] Multi-document analyzer functional
- [ ] Document viewing working
- [ ] No critical console errors

### Performance Benchmarks:
- First Contentful Paint: < 2 seconds
- Time to Interactive: < 3 seconds
- Lighthouse Score: > 80

## 🔄 AUTOMATED COMMANDS

### Complete Deployment Script:
```bash
#!/bin/bash
# deploy.sh - Automated deployment script

echo "🧪 Running pre-deploy validation..."
node scripts/pre-deploy-test.js

if [ $? -eq 0 ]; then
    echo "✅ Validation passed, proceeding with deployment..."
    
    git add .
    git commit -m "feat: production deployment - all validations passed"
    git push origin main
    
    echo "🚀 Deployment triggered! Monitor at https://vercel.com/dashboard"
else
    echo "❌ Validation failed, fix issues before deployment"
    exit 1
fi
```

## 📝 DEPLOYMENT LOG TEMPLATE

```bash
# Deployment: [DATE] - [CLIENT_NAME]
# Domain: https://[client].vercel.app
# Supabase: https://[project-id].supabase.co

## Pre-Deploy Checklist:
- [ ] Pre-deploy test passed
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database accessible

## Deploy Actions:
- [ ] Git commit created
- [ ] Pushed to main branch
- [ ] Vercel auto-deploy triggered
- [ ] Environment variables set in Vercel

## Post-Deploy Validation:
- [ ] Production URL accessible
- [ ] Authentication working
- [ ] Core functionality tested
- [ ] Performance acceptable

## Issues Found:
[None / List specific issues and resolutions]

## Next Steps:
[Client-specific setup, training, documentation]
```

## 🚀 QUICK REFERENCE

### Emergency Commands:
```bash
# Quick validation
node scripts/pre-deploy-test.js

# Force rebuild
npm run build

# Check Vercel status
vercel link --yes && vercel env ls

# Rollback if needed
# Via Vercel dashboard: Deployments > Previous > Promote
```

### Key Files:
- `deployment-checklist.md` - Manual checklist detallado
- `scripts/pre-deploy-test.js` - Validación automática
- `.claude/deployment-master.json` - Agente orchestador
- `.claude/vercel-master.json` - Agente debugging Vercel

---

**¡Proceso sistematizado completado!** 🎉
Este flujo garantiza deployments seguros y repetibles para cualquier cliente.