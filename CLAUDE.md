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

## 4. Tipificación de Datos en TypeScript

El uso adecuado de los tipos de datos es fundamental para mantener nuestro código robusto, legible y con menos errores. La regla clave a seguir es **evitar el uso de `any` a toda costa**.

### 4.1. `@typescript-eslint/no-explicit-any`

Hemos configurado ESLint para prohibir el uso de `any`. Si te encuentras con un error de linter que te indica que estás usando `any`, **no deshabilites la regla globalmente**. En su lugar, considera una de las siguientes soluciones:

- **Utiliza un tipo específico**: Si sabes qué tipo de datos estás esperando, crea una `interface`, un `type` o usa el tipo de dato primitivo adecuado (por ejemplo, `string`, `number`, `boolean`).

  ❌ **Mal**:
  ```typescript
  function processData(data: any) {
    // ...
  }
  ```

  ✅ **Bien**:
  ```typescript
  interface UserProfile {
    id: number;
    name: string;
  }
  function processData(data: UserProfile) {
    // ...
  }
  ```

- **Usa tipos más flexibles si es necesario**: Si no conoces la estructura completa de un objeto pero sí algunas de sus propiedades, puedes usar un tipo genérico o una combinación de tipos.

  ```typescript
  interface IApiResponse<T = unknown> {
    data: T;
    status: number;
  }
  ```

- **Deshabilita la regla en casos excepcionales**: Si el uso de `any` es inevitable (por ejemplo, al trabajar con una librería de terceros que no tiene buenos tipos), desactiva la regla solo para la línea o bloque de código específico y añade un comentario explicando el motivo.

  ```typescript
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = externalLibrary.fetch();
  ```

  **Nota**: Esta práctica debe ser la excepción, no la norma.

Al hacer esto, no solo resuelves el problema técnico en Vercel, sino que también comunicas una **buena práctica de desarrollo** a todo tu equipo, lo que mejora la calidad del código a largo plazo.
