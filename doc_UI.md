# 🎨 Fazil - Guía de Sistema de Diseño UI

**Versión:** 1.0  
**Actualizado:** 2025-09-18  
**Stack:** Next.js 15 + Tailwind CSS 4.1.3 + shadcn/ui + Framer Motion

---

## 📋 Tabla de Contenidos

1. [Principios de Diseño](#principios-de-diseño)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Sistema de Colores](#sistema-de-colores)
4. [Tipografía](#tipografía)
5. [Espaciado y Layout](#espaciado-y-layout)
6. [Componentes](#componentes)
7. [Iconos](#iconos)
8. [Animaciones](#animaciones)
9. [Responsive Design](#responsive-design)
10. [Mejores Prácticas](#mejores-prácticas)
11. [Ejemplos de Código](#ejemplos-de-código)

---

## 🎯 Principios de Diseño

### **Identidad de Marca: Fazil**

- **Sector:** SaaS de IA para digitalización y gestión de datos
- **Personalidad:** Profesional, innovador, confiable, eficiente
- **Target:** Organizaciones que buscan transformación digital con IA

### **Principios Clave:**

1. **Consistencia** - Mismo look & feel en toda la aplicación
2. **Claridad** - UI intuitiva y fácil de usar
3. **Eficiencia** - Workflows optimizados para productividad
4. **Confianza** - Diseño profesional que inspira credibilidad
5. **Accesibilidad** - Usable para todos los usuarios

---

## 🛠️ Stack Tecnológico

### **Core UI Framework:**

```json
{
  "tailwindcss": "^4.1.3", // Framework CSS utility-first
  "next": "15.3.0", // React framework con Turbopack
  "framer-motion": "^11.18.2", // Animaciones suaves
  "lucide-react": "^0.279.0" // Iconos consistentes
}
```

### **Componentes UI:**

```json
{
  "@radix-ui/*": "^1.x", // Primitivos accesibles
  "class-variance-authority": "^0.7.1", // Variantes de componentes
  "clsx": "^2.1.1", // Conditional classes
  "tailwind-merge": "^1.14.0" // Merge conflicting classes
}
```

### **Utilidades de Desarrollo:**

```json
{
  "tailwindcss-animate": "^1.0.7", // Animaciones predefinidas
  "@tailwindcss/typography": "^0.5.16", // Tipografía mejorada
  "@tailwindcss/forms": "^0.5.10" // Estilos de formularios
}
```

---

## 🎨 Sistema de Colores

### **Variables CSS (OKLCH Color Space)**

_Inspirado en SolarOne - Elegante y sofisticado_

#### **Colores Principales:**

```css
/* Light Mode - Elegante y refinado */
:root {
  --primary: oklch(0.45 0.18 250); /* Azul sofisticado profundo */
  --primary-foreground: oklch(0.98 0 0); /* Blanco limpio */
  --foreground: oklch(0.12 0 0); /* Charcoal rico (no negro puro) */
  --background: oklch(1 0 0); /* Blanco puro protagonista */
  --card: oklch(0.995 0 0); /* Off-white sutil */
  --border: oklch(0.9 0 0); /* Borde limpio y visible */
  --muted: oklch(0.96 0 0); /* Gris elegante claro */
  --muted-foreground: oklch(0.45 0 0); /* Gris medio sofisticado */
}

/* Dark Mode - Elegante y suave */
.dark {
  --primary: oklch(0.65 0.2 250); /* Azul brillante elegante */
  --primary-foreground: oklch(0.08 0 0); /* Contraste oscuro */
  --foreground: oklch(0.95 0 0); /* Blanco suave (no harsh) */
  --background: oklch(0.08 0 0); /* Gris oscuro rico */
  --card: oklch(0.1 0 0); /* Ligeramente más claro para cards */
  --border: oklch(0.2 0 0); /* Borde visible pero no harsh */
  --muted: oklch(0.12 0 0); /* Gris oscuro refinado */
  --muted-foreground: oklch(0.65 0 0); /* Gris claro sofisticado */
}
```

#### **Paleta de Colores Elegante:**

```css
/* Colores de Estado Sofisticados */
--destructive: oklch(0.55 0.22 15); /* Rojo elegante */
--chart-1: oklch(0.45 0.18 250); /* Azul principal */
--chart-2: oklch(0.55 0.15 180); /* Teal elegante */
--chart-3: oklch(0.5 0.12 280); /* Púrpura sofisticado */
--chart-4: oklch(0.6 0.14 150); /* Verde refinado */
--chart-5: oklch(0.65 0.16 50); /* Ámbar cálido */

/* Border radius más elegante */
--radius: 0.75rem; /* Más redondeado para elegancia */
```

### **Gradientes Elegantes (Inspirados en SolarOne):**

```css
/* Gradientes principales */
.fazil-gradient-hero {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%);
}

.fazil-gradient-primary {
  background: linear-gradient(
    135deg,
    oklch(0.45 0.18 250) 0%,
    oklch(0.5 0.12 280) 100%
  );
}

.fazil-gradient-subtle {
  background: linear-gradient(135deg, #f8fafc 0%, #f0f8ff 100%);
}

/* Gradientes suaves para cards */
.fazil-gradient-card-blue {
  background: linear-gradient(
    135deg,
    oklch(0.45 0.18 250) 0%,
    oklch(0.5 0.15 260) 100%
  );
}

.fazil-gradient-card-teal {
  background: linear-gradient(
    135deg,
    oklch(0.55 0.15 180) 0%,
    oklch(0.6 0.12 190) 100%
  );
}

.fazil-gradient-card-purple {
  background: linear-gradient(
    135deg,
    oklch(0.5 0.12 280) 0%,
    oklch(0.55 0.1 290) 100%
  );
}

.fazil-gradient-card-green {
  background: linear-gradient(
    135deg,
    oklch(0.6 0.14 150) 0%,
    oklch(0.65 0.12 160) 100%
  );
}
```

### **Uso de Colores:**

#### **✅ CORRECTO:**

```tsx
// Usar variables del sistema
<div className="bg-primary text-primary-foreground">
<Button variant="destructive">Eliminar</Button>
<Card className="border-border bg-card">
```

#### **❌ INCORRECTO:**

```tsx
// NO usar colores hardcodeados
<div className="bg-blue-600 text-white">
<button className="bg-red-500">Delete</button>
```

---

## 📝 Tipografía

### **Font Stack:**

```css
/* Sistema de fuentes nativas optimizado */
font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
  sans-serif;
```

### **Escalas Tipográficas:**

```tsx
// Headings
<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
<h3 className="text-xl font-bold text-gray-900">

// Body text
<p className="text-gray-600 md:text-xl leading-relaxed">
<span className="text-sm text-gray-500">
```

### **Jerarquía de Texto:**

1. **Hero Title** - `text-7xl font-bold` - Para landing page
2. **Section Title** - `text-5xl font-bold` - Títulos de sección
3. **Card Title** - `text-xl font-bold` - Títulos de cards
4. **Body Large** - `text-xl` - Texto principal destacado
5. **Body** - `text-base` - Texto principal
6. **Caption** - `text-sm text-gray-500` - Texto secundario

---

## 📐 Espaciado y Layout

### **Sistema de Espaciado (Tailwind):**

```tsx
// Espaciado interno (padding)
p-2  = 0.5rem = 8px
p-4  = 1rem   = 16px  ← Estándar para cards pequeñas
p-6  = 1.5rem = 24px  ← Estándar para cards medianas
p-8  = 2rem   = 32px  ← Estándar para cards grandes

// Espaciado externo (margin)
space-y-4  = 1rem gaps verticales    ← Estándar entre elementos
space-y-8  = 2rem gaps verticales    ← Entre secciones pequeñas
space-y-12 = 3rem gaps verticales    ← Entre secciones grandes
```

### **Grid y Layout:**

```tsx
// Grid principal (como en landing page)
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">

// Container estándar
<div className="container px-4 md:px-6 mx-auto">

// Secciones de página
<section className="w-full py-16 md:py-24 lg:py-32">
```

### **Responsive Breakpoints:**

```css
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeño */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

---

## 🧱 Componentes

### **Estructura de Componentes shadcn/ui:**

#### **Botones:**

```tsx
import { Button } from '@/components/ui/button'

// Variantes disponibles
<Button variant="default">Principal</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="outline">Secundario</Button>
<Button variant="ghost">Sutil</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="default">Normal</Button>
<Button size="lg">Grande</Button>
```

#### **Cards:**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

<Card className="hover:shadow-xl transition-shadow">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Contenido...</p>
  </CardContent>
</Card>;
```

#### **Formularios:**

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="tu@email.com" />
</div>;
```

### **Patrones de UI Fazil:**

#### **Grid 2x2 (Landing Page):**

```tsx
<section className="w-full py-16 md:py-24 lg:py-32 bg-gray-50">
  <div className="container px-4 md:px-6 mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
      {/* Cards con iconos coloridos */}
      <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Título</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Descripción...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

#### **Hero Section (Landing):**

```tsx
<section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100">
  <div className="container px-4 md:px-6 mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Contenido izquierda, mockup derecha */}
    </div>
  </div>
</section>
```

---

## 🎯 Iconos

### **Lucide React - Biblioteca Principal:**

```tsx
import {
  ArrowRight, Zap, Brain, TrendingUp, AlertTriangle,
  Search, FileText, Database, Mail, Phone, Sparkles,
  Target, CheckCircle, Rocket, Home, Building2, Users
} from 'lucide-react'

// Tamaños estándar
<Icon className="h-4 w-4" />  // Pequeño (en texto)
<Icon className="h-5 w-5" />  // Medio (botones)
<Icon className="h-6 w-6" />  // Grande (cards)
<Icon className="h-8 w-8" />  // Extra grande (hero icons)
```

### **Iconos por Contexto:**

#### **Navegación:**

- `Home` - Dashboard, inicio
- `Building2` - Comunidades
- `AlertTriangle` - Incidencias
- `FileText` - Documentos
- `Users` - Usuarios
- `MessageSquare` - Chat IA

#### **Acciones:**

- `ArrowRight` - CTAs, navegación
- `CheckCircle` - Éxito, completado
- `Search` - Búsqueda
- `Edit` - Editar
- `Trash` - Eliminar

#### **Estados/Conceptos:**

- `Zap` - IA, energía, velocidad
- `Brain` - IA, inteligencia
- `Sparkles` - Mejoras, optimización
- `TrendingUp` - Crecimiento, tendencias
- `Target` - Objetivos, precisión

---

## ✨ Animaciones

### **Framer Motion - Configuraciones:**

```tsx
import { motion } from 'framer-motion'

// Fade in básico
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

// Hover effects
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 300 }}
>
```

### **Animaciones CSS (Tailwind):**

```tsx
// Transiciones estándar
className = 'transition-all duration-300 ease-in-out';
className = 'hover:shadow-xl transition-shadow';
className = 'hover:scale-105 transition-transform';

// Animaciones predefinidas
className = 'animate-pulse'; // Loading
className = 'animate-bounce'; // Atención
className = 'animate-spin'; // Loading spinner
```

### **Principios de Animación:**

1. **Subtle** - Animaciones suaves, no distractivas
2. **Fast** - 200-300ms para hover, 500ms para transiciones
3. **Purposeful** - Cada animación debe tener un propósito UX
4. **Consistent** - Mismos timing y easing en toda la app

---

## 📱 Responsive Design

### **Estrategia Mobile-First:**

```tsx
// Orden de breakpoints
className = 'text-sm sm:text-base md:text-lg lg:text-xl';
className = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
className = 'p-4 md:p-6 lg:p-8';
```

### **Patrones Responsivos:**

#### **Navigation:**

```tsx
// Mobile: hamburger menu
// Desktop: horizontal nav
<nav className="hidden md:flex items-center gap-6">
<nav className="md:hidden">Mobile menu</nav>
```

#### **Cards Grid:**

```tsx
// Mobile: 1 columna
// Tablet: 2 columnas
// Desktop: 3-4 columnas
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

#### **Hero Layout:**

```tsx
// Mobile: stack vertical
// Desktop: lado a lado
<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
```

---

## ✅ Mejores Prácticas

### **1. Consistencia de Clases:**

```tsx
// ✅ BIEN - Usar utilities consistentes
className = 'space-y-4 p-6 rounded-lg shadow-lg';

// ❌ MAL - Valores arbitrarios sin razón
className = 'pt-[13px] ml-[27px] rounded-[9px]';
```

### **2. Semantic HTML:**

```tsx
// ✅ BIEN
<main>
  <section>
    <h1>Título principal</h1>
    <article>
      <h2>Subtítulo</h2>
    </article>
  </section>
</main>
```

### **3. Accesibilidad:**

```tsx
// ✅ BIEN - Siempre incluir
<button aria-label="Cerrar modal">
<img alt="Logo de Fazil">
<Link href="/dashboard" aria-current="page">
```

### **4. Performance:**

```tsx
// ✅ BIEN - Lazy loading
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./Heavy'));

// ✅ BIEN - Optimized images
import Image from 'next/image';
<Image src="/logo.svg" alt="Logo" width={140} height={36} />;
```

### **5. Organización de Clases:**

```tsx
// Orden sugerido:
// Layout → Spacing → Typography → Colors → Effects
className =
  'flex items-center gap-4 p-6 text-lg font-semibold text-gray-900 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow';
```

---

## 💻 Ejemplos de Código

### **Componente Card Típico:**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import Link from 'next/link';

interface FeatureCardProps {
  title: string;
  description: string;
  stat: string;
  statLabel: string;
  href: string;
  gradient: string;
}

export function FeatureCard({
  title,
  description,
  stat,
  statLabel,
  href,
  gradient,
}: FeatureCardProps) {
  return (
    <Card className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start space-x-4">
        <div
          className={`w-16 h-16 ${gradient} rounded-xl flex items-center justify-center`}
        >
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-xl font-bold text-gray-900 mb-3">
            {title}
          </CardTitle>
          <CardContent className="p-0">
            <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-blue-600">{stat}</span>
              <span className="text-sm text-gray-500">{statLabel}</span>
            </div>
            <Link
              href={href}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Conocer más →
            </Link>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
```

### **Layout de Página Estándar:**

```tsx
export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          {/* Navigation content */}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-8 px-4">{/* Footer content */}</div>
      </footer>
    </div>
  );
}
```

---

## 📚 Referencias Rápidas

### **Comandos de Desarrollo:**

```bash
# Desarrollo local
npm run dev                    # Puerto 3001 con Turbopack
npm run build                  # Build de producción
npm run lint                   # ESLint + Prettier

# Componentes shadcn/ui
npx shadcn@latest add button   # Añadir componente
npx shadcn@latest add card     # Añadir card
```

### **Variables CSS Importantes:**

```css
--radius: 0.625rem; /* Border radius estándar */
--primary: oklch(0.205 0 0); /* Color principal */
--background: oklch(1 0 0); /* Fondo principal */
```

### **Breakpoints Tailwind:**

```css
sm: 640px   md: 768px   lg: 1024px   xl: 1280px   2xl: 1536px
```

---

## 🔄 Actualizaciones

**v1.1 (2025-09-18) - ELEGANT REDESIGN:**

- ✅ **Sistema de colores elegante** inspirado en SolarOne
- ✅ **Charcoal en lugar de negro puro** para mayor sofisticación
- ✅ **Azul principal** oklch(0.45 0.18 250) más refinado
- ✅ **Grises premium** con mejor jerarquía visual
- ✅ **Border radius aumentado** a 0.75rem para modernidad
- ✅ **Gradientes sutiles** para fondos más elegantes
- ✅ **Dark mode sofisticado** con colores más suaves

**v1.0 (2025-09-18):**

- ✅ Sistema de colores OKLCH implementado
- ✅ Grid 2x2 para landing page
- ✅ Hero section con laptop mockup
- ✅ Componentes shadcn/ui integrados
- ✅ Responsive design mobile-first

---

**📝 Nota:** Esta guía debe actualizarse cada vez que se añadan nuevos patrones, componentes o se modifique la identidad visual de Fazil.

## Refernecia

https://themes.ainoblocks.io/solarone/pricing/
