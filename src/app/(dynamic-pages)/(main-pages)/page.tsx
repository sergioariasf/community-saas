/**
 * ARCHIVO: page.tsx (Landing Page)
 * PROPÓSITO: Landing page principal con estrategia de conversión de IA
 * ESTADO: development
 * DEPENDENCIAS: UI components, Lucide icons
 * OUTPUTS: Página de aterrizaje optimizada para conversión
 * ACTUALIZADO: 2025-09-16
 */
import { 
  ArrowRight, 
  Zap, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  FileText, 
  Database, 
  Mail, 
  Phone,
  Sparkles,
  Target,
  CheckCircle,
  Rocket
} from 'lucide-react';
import Link from 'next/link';
import { AuthCodeHandler } from '@/components/auth/AuthCodeHandler';


export default function LandingPage() {
  return (
    <>
      <AuthCodeHandler />
      
      {/* HERO SECTION - Inspirado en template con laptop mockup */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/40 via-transparent to-transparent"></div>
        
        {/* Badge de credibilidad elegante */}
        <div className="absolute top-8 right-8 z-20">
          <div className="bg-primary/10 border border-primary/20 text-primary px-6 py-3 rounded-full shadow-sm backdrop-blur-sm transform rotate-12">
            <span className="font-semibold text-sm">IA AVANZADA</span>
          </div>
        </div>

        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* LADO IZQUIERDO: Contenido del Hero */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium">
                  <Zap className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-primary">
                    La Revolución IA ya está aquí
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
                  Convierte tus datos en
                  <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    {' '}
                    tu mayor tesoro
                  </span>
                </h1>
                
                <p className="text-gray-600 text-lg md:text-xl leading-relaxed max-w-[600px]">
                  La IA transformará tu organización para siempre. Tus datos dispersos 
                  se convertirán en respuestas instantáneas, mejor atención al cliente 
                  y decisiones más inteligentes.
                </p>
                
                <div className="bg-muted/50 border border-border rounded-lg p-4 max-w-[600px]">
                  <p className="text-muted-foreground font-medium text-center">
                    💡 No digitalizar hoy es perder la mayor oportunidad de tu organización
                  </p>
                </div>
              </div>

              {/* Botones del Hero (como en template) */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth?mode=register"
                  className="inline-flex h-14 items-center justify-center rounded-lg bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                >
                  Empezar Gratis <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="#grid"
                  className="inline-flex h-14 items-center justify-center rounded-lg border-2 border-border bg-background px-8 text-lg font-semibold text-foreground transition-all hover:bg-muted/50"
                >
                  Ver Demo
                </Link>
              </div>
            </div>

            {/* LADO DERECHO: Laptop Mockup (como en template) */}
            <div className="relative">
              <div className="relative mx-auto max-w-lg">
                {/* Laptop Frame */}
                <div className="relative">
                  {/* Laptop Base */}
                  <div className="bg-gray-800 rounded-b-3xl h-4 w-full relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gray-600 rounded-full mx-auto w-20"></div>
                  </div>
                  
                  {/* Laptop Screen */}
                  <div className="bg-gray-900 rounded-t-2xl p-3 relative">
                    <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
                      {/* Browser Header */}
                      <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 bg-destructive/70 rounded-full"></div>
                          <div className="w-3 h-3 bg-chart-5/70 rounded-full"></div>
                          <div className="w-3 h-3 bg-chart-4/70 rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-white rounded mx-4 px-3 py-1">
                          <span className="text-xs text-gray-500">fazil.ai/dashboard</span>
                        </div>
                      </div>
                      
                      {/* Dashboard Content */}
                      <div className="p-6 bg-gradient-to-br from-primary/5 to-chart-3/5">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-800 text-sm">IA Dashboard</h3>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
                              <span className="text-xs text-gray-600">En línea</span>
                            </div>
                          </div>
                          
                          {/* Metrics Cards */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs text-gray-500">Consultas IA</div>
                              <div className="text-lg font-bold text-primary">2,847</div>
                              <div className="text-xs text-green-600">↗ +23%</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-xs text-gray-500">Tiempo Ahorrado</div>
                              <div className="text-lg font-bold text-chart-3">142h</div>
                              <div className="text-xs text-green-600">↗ +18%</div>
                            </div>
                          </div>
                          
                          {/* Chat Preview */}
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="space-y-2">
                              <div className="flex items-start space-x-2">
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <Brain className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-gray-100 rounded-lg p-2 text-xs">
                                    ¿Cuál es el estado de los proyectos activos?
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start space-x-2">
                                <div className="w-6 h-6 bg-chart-4 rounded-full flex items-center justify-center">
                                  <Sparkles className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="bg-primary/5 rounded-lg p-2 text-xs">
                                    Tienes 12 proyectos activos. 8 están en tiempo, 3 requieren atención...
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Elementos flotantes de decoración - Elegantes */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full opacity-20 animate-bounce"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-chart-2/20 rounded-full opacity-30 animate-pulse"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN PRINCIPAL: GRID 2x2 - Inspirado en template */}
      <section id="grid" className="w-full py-16 md:py-24 lg:py-32 bg-slate-50/50">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* CARD 1: Tendencia Actual */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Tendencia Actual</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    La revolución IA ya está aquí. Los datos harán que tu organización sea más eficiente, 
                    con servicios de mejor calidad y mayor satisfacción del cliente.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary">80%</span>
                    <span className="text-sm text-gray-500">menos tiempo en tareas rutinarias</span>
                  </div>
                  <Link href="#desafios" className="text-primary hover:text-primary/80 font-medium text-sm">
                    Conocer más →
                  </Link>
                </div>
              </div>
            </div>

            {/* CARD 2: Desafíos Actuales */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-destructive to-destructive/80 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Desafíos Actuales</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Información dispersa en documentos, bases de datos, correos y llamadas. 
                    ¿Cómo integrar y explotar el verdadero valor de tus datos?
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-destructive">70%</span>
                    <span className="text-sm text-gray-500">tiempo perdido buscando información</span>
                  </div>
                  <Link href="#propuesta" className="text-destructive hover:text-destructive/80 font-medium text-sm">
                    Ver solución →
                  </Link>
                </div>
              </div>
            </div>

            {/* CARD 3: Propuesta de Valor */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-chart-4 to-chart-4/80 rounded-xl flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Propuesta de Valor</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    La IA convierte tus datos en tu mayor tesoro. Respuestas instantáneas, 
                    decisiones inteligentes y atención al cliente excepcional.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-chart-4">Inmediato</span>
                    <span className="text-sm text-gray-500">acceso a cualquier información</span>
                  </div>
                  <Link href="#cta" className="text-chart-4 hover:text-chart-4/80 font-medium text-sm">
                    Empezar ahora →
                  </Link>
                </div>
              </div>
            </div>

            {/* CARD 4: Soporte y Garantía */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-chart-3 to-chart-3/80 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Soporte Total</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Setup en 24h, ROI inmediato y soporte 24/7. Te acompañamos en cada paso 
                    de la transformación digital de tu organización.
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-chart-3">24/7</span>
                    <span className="text-sm text-gray-500">soporte especializado</span>
                  </div>
                  <Link href="/auth?mode=register" className="text-chart-3 hover:text-chart-3/80 font-medium text-sm">
                    Contactar →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN 4: CALL TO ACTION FINAL - Lanza tu organización */}
      <section id="cta" className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-6 max-w-[900px]">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium">
                <Rocket className="mr-2 h-4 w-4 text-primary/80" />
                <span className="text-primary/90">Es el momento</span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                <span className="bg-gradient-to-r from-primary/90 via-chart-1 to-primary/90 bg-clip-text text-transparent">
                  ¡Lanza tu organización a otro nivel!
                </span>
              </h2>
              <p className="text-gray-300 md:text-xl leading-relaxed">
                No esperes más. Cada día que pases sin aprovechar la IA es una oportunidad perdida. 
                <span className="block mt-2 text-white font-semibold">
                  Tus competidores ya están avanzando. ¿Vas a quedarte atrás?
                </span>
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left max-w-4xl mx-auto">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-chart-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Setup en 24h</h3>
                    <p className="text-gray-300 text-sm">Empieza a ver resultados desde el primer día</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-chart-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">ROI Inmediato</h3>
                    <p className="text-gray-300 text-sm">Recupera la inversión en menos de 30 días</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-chart-4 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Soporte 24/7</h3>
                    <p className="text-gray-300 text-sm">Te acompañamos en cada paso del proceso</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link
                href="/auth?mode=register"
                className="group inline-flex h-16 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-chart-1 px-10 text-xl font-bold text-white shadow-2xl transition-all hover:shadow-primary/25 hover:scale-105 transform"
              >
                🚀 Transformar Mi Organización AHORA
                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#desafios"
                className="inline-flex h-16 items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 text-lg font-semibold text-white transition-all hover:bg-white/20 hover:border-white/50"
              >
                Ver Demo del Sistema
              </Link>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                🔒 Prueba gratuita • Sin compromiso • Resultados garantizados
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
