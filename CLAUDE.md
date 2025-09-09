# Community SaaS - Master Context

## Project Info
**SaaS:** Community management with RAG/AI  
**Stack:** NextBase + Supabase + Next.js 15  
**DB:** `vhybocthkbupgedovovj` | **Local:** `http://localhost:3001`
**Learning:** Step-by-step lessons approach with documentation

## Current State ✅ (Lessons 1.1-1.4 Completed)
**Core Features Implemented:**
- Complete Communities CRUD with permissions (`/communities`)
- Role system: `admin`, `manager`, `resident` with middleware
- Auth: `sergioariasf@gmail.com` / `Elpato_46`

**Database:** 5 tables (`communities`, `user_roles`, `items`, `private_items`, `auth.users`)
**Test Data:** 3 communities, user has ADMIN + MANAGER roles

## Key Files
```
src/hooks/usePermissions.ts       # Role system
src/lib/auth/permissions.ts       # Auth middleware  
src/data/anon/communities.ts      # CRUD actions
docs/lecciones/L1.{1-4}.md        # Learning documentation
```

## Tech Stack Mastery
- **Next.js 15:** Server/Client Components, Server Actions, dynamic routes
- **Supabase:** RLS, real-time sync, SQL migrations, TypeScript types
- **Architecture:** Multi-tenant roles, NextBase patterns, error handling

## Commands
```bash
npm run dev      # Start development
npm run build    # TypeScript check
npm run lint     # Code formatting
```

## Next Lessons
- **1.5:** Incidents system (reports/tickets by community)
- **2.1:** RAG/AI chat with documents (embeddings)
- **2.2:** Analytics dashboard (metrics per community)

**Teaching Approach:** Each lesson builds on previous knowledge with step-by-step implementation and documentation.