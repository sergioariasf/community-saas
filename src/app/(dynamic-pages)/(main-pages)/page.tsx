/**
 * ARCHIVO: page.tsx (Landing Page)
 * PROPÓSITO: Landing page principal con 3 secciones full-screen estilo Cloudflare
 * ESTADO: development
 * DEPENDENCIAS: UI components, Lucide icons
 * OUTPUTS: Página de aterrizaje optimizada para conversión
 * ACTUALIZADO: 2025-10-01
 */
import { 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Users,
  Clock,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { AuthCodeHandler } from '@/components/auth/AuthCodeHandler';

export default function LandingPage() {
  return (
    <>
      <AuthCodeHandler />
      
      {/* SECCIÓN 1: HERO - Mensaje Principal (Fondo Blanco) */}
      <section className="relative min-h-screen w-full bg-white flex items-center justify-center overflow-hidden">{/* Navegación manejada por ConditionalNavigation en layout.tsx */}
        
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            
            {/* LADO IZQUIERDO: Contenido del Hero */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-gray-900">
                  Convierte tus datos en
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                    tu mayor tesoro
                  </span>
                </h1>
                
                <p className="text-gray-600 text-xl leading-relaxed max-w-[600px]">
                  La IA transformará tu organización para siempre. Tus datos dispersos 
                  se convertirán en respuestas instantáneas, mejor atención al cliente 
                  y decisiones más inteligentes.
                </p>
              </div>

              {/* Botón del Hero */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth?mode=register"
                  className="inline-flex h-16 items-center justify-center rounded-xl bg-blue-600 px-10 text-xl font-semibold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
                >
                  Empezar Gratis <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </div>
            </div>

            {/* LADO DERECHO: Hero Image */}
            <div className="relative">
              <div className="relative mx-auto max-w-2xl">
                <img
                  src="/images/landing-hero.jpg"
                  alt="Transformación digital con IA - De oficina tradicional a análisis de datos avanzado"
                  className="w-full h-auto rounded-2xl shadow-2xl min-h-[400px] object-cover"
                  width={1182}
                  height={665}
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN 2: FEATURES - ¿En qué podemos ayudarte? (Fondo Gris) */}
      <section className="relative min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* Título de la sección */}
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                ¿En qué podemos ayudarte?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transforma tu gestión documental con inteligencia artificial avanzada
              </p>
            </div>
            
            {/* Grid de características - Basado en el mockup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              
              {/* CARD 1: Tendencia Actual */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Tendencia Actual</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      La revolución IA ya está aquí. Los datos harán que tu organización sea más eficiente, 
                      con servicios de mejor calidad y mayor satisfacción del cliente.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl font-bold text-blue-600">80%</span>
                      <span className="text-sm text-gray-500">menos tiempo en tareas rutinarias</span>
                    </div>
                    <Link href="#features" className="text-blue-600 hover:text-blue-700 font-medium">
                      Conocer más →
                    </Link>
                  </div>
                </div>
              </div>

              {/* CARD 2: Desafíos Actuales */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Desafíos Actuales</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Información dispersa en documentos, bases de datos, correos y llamadas. 
                      ¿Cómo integrar y explotar el verdadero valor de tus datos?
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl font-bold text-red-600">70%</span>
                      <span className="text-sm text-gray-500">tiempo perdido buscando información</span>
                    </div>
                    <Link href="#solution" className="text-red-600 hover:text-red-700 font-medium">
                      Ver solución →
                    </Link>
                  </div>
                </div>
              </div>

              {/* CARD 3: Propuesta de Valor */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Propuesta de Valor</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      La IA convierte tus datos en tu mayor tesoro. Respuestas instantáneas, 
                      decisiones inteligentes y atención al cliente excepcional.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl font-bold text-green-600">Inmediato</span>
                      <span className="text-sm text-gray-500">acceso a cualquier información</span>
                    </div>
                    <Link href="#cta" className="text-green-600 hover:text-green-700 font-medium">
                      Empezar ahora →
                    </Link>
                  </div>
                </div>
              </div>

              {/* CARD 4: Soporte Total */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Soporte Total</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      Setup en 24h, ROI inmediato y soporte 24/7. Te acompañamos en cada paso 
                      de la transformación digital de tu organización.
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl font-bold text-purple-600">24/7</span>
                      <span className="text-sm text-gray-500">soporte especializado</span>
                    </div>
                    <Link href="/auth?mode=register" className="text-purple-600 hover:text-purple-700 font-medium">
                      Contactar →
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: CTA - Acción (Fondo Oscuro) */}
      <section id="cta" className="relative min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center space-y-12 text-center max-w-5xl mx-auto">
            
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-6 py-3 text-lg font-medium">
                <Users className="mr-3 h-5 w-5 text-blue-400" />
                <span className="text-blue-300">Es el momento</span>
              </div>
              
              <h2 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent">
                  ¡Lanza tu organización a otro nivel!
                </span>
              </h2>
              
              <p className="text-gray-300 text-xl lg:text-2xl leading-relaxed max-w-4xl mx-auto">
                Transforma tu organización con inteligencia artificial avanzada y convierte tus datos en respuestas instantáneas.
              </p>
            </div>
            
            {/* Features destacadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 max-w-4xl mx-auto">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold text-white mb-2 text-lg">Setup en 24h</h3>
                  <p className="text-gray-300">Empieza a ver resultados desde el primer día</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold text-white mb-2 text-lg">ROI Inmediato</h3>
                  <p className="text-gray-300">Recupera la inversión en menos de 30 días</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-8 w-8 text-green-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold text-white mb-2 text-lg">Soporte 24/7</h3>
                  <p className="text-gray-300">Te acompañamos en cada paso del proceso</p>
                </div>
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <Link
                href="/auth?mode=register"
                className="group inline-flex h-20 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-12 text-2xl font-bold text-white shadow-2xl transition-all hover:shadow-blue-500/25 hover:scale-105 transform"
              >
                🚀 Transformar Mi Organización AHORA
                <ArrowRight className="ml-4 h-7 w-7 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex h-20 items-center justify-center rounded-2xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-10 text-xl font-semibold text-white transition-all hover:bg-white/20 hover:border-white/50"
              >
                Ver Demo del Sistema
              </Link>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-lg">
                🔒 Prueba gratuita • Sin compromiso • Resultados garantizados
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}