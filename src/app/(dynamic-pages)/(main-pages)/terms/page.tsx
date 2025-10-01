/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Página de Términos y Condiciones para SaaS de gestión documental
 * ESTADO: production
 * DEPENDENCIAS: @/components/ui/Typography
 * OUTPUTS: Página legal con términos de servicio
 * ACTUALIZADO: 2025-10-01
 */
'use client';
import { T } from '@/components/ui/Typography';
import { useState, useEffect } from 'react';

export default function TermsConditionsPage() {
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    { id: 'section-1', title: '1. Aceptación de los Términos' },
    { id: 'section-2', title: '2. Descripción del Servicio' },
    { id: 'section-3', title: '3. Registro y Cuenta de Usuario' },
    { id: 'section-4', title: '4. Uso Aceptable' },
    { id: 'section-5', title: '5. Contenido y Propiedad Intelectual' },
    { id: 'section-6', title: '6. Planes y Pagos' },
    { id: 'section-7', title: '7. Disponibilidad del Servicio' },
    { id: 'section-8', title: '8. Responsabilidades y Limitaciones' },
    { id: 'section-9', title: '9. Privacidad y Seguridad' },
    { id: 'section-10', title: '10. Terminación' },
    { id: 'section-11', title: '11. Modificaciones' },
    { id: 'section-12', title: '12. Ley Aplicable y Jurisdicción' },
    { id: 'section-13', title: '13. Disposiciones Generales' },
    { id: 'section-14', title: '14. Contacto' },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id^="section-"]');
      let currentSection = 'section-1';
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100) {
          currentSection = section.id;
        }
      });
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <T.H1>Términos y Condiciones</T.H1>
          <T.Subtle>Última actualización: 1 de octubre de 2024</T.Subtle>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <nav className="space-y-1">
                <div className="text-sm font-semibold text-muted-foreground mb-4">Índice</div>
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6 text-sm leading-relaxed">
          <section id="section-1" className="space-y-3">
            <T.H2>1. Aceptación de los Términos</T.H2>
            <p>Al acceder y utilizar Fazil, aceptas estar sujeto a estos Términos y Condiciones y a nuestra Política de Privacidad. Si no estás de acuerdo con alguno de estos términos, no debes utilizar nuestros servicios.</p>
          </section>

          <section id="section-2" className="space-y-3">
            <T.H2>2. Descripción del Servicio</T.H2>
            <p>Fazil es una plataforma SaaS (Software como Servicio) diseñada para la gestión integral de comunidades de propietarios que ofrece:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gestión documental automatizada con IA</li>
              <li>Procesamiento y clasificación automática de documentos</li>
              <li>Análisis de actas, facturas, contratos y comunicados</li>
              <li>Herramientas de comunicación y colaboración</li>
              <li>Almacenamiento seguro en la nube</li>
              <li>Generación de informes y estadísticas</li>
            </ul>
          </section>

          <section id="section-3" className="space-y-3">
            <T.H2>3. Registro y Cuenta de Usuario</T.H2>
            <div className="space-y-2">
              <T.H3>3.1 Requisitos de Registro</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Debes ser mayor de 18 años</li>
                <li>Proporcionar información veraz y actualizada</li>
                <li>Mantener la confidencialidad de tu contraseña</li>
                <li>Ser responsable de todas las actividades en tu cuenta</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>3.2 Responsabilidades del Usuario</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Notificar inmediatamente cualquier uso no autorizado</li>
                <li>Mantener actualizada la información de contacto</li>
                <li>Cumplir con todas las leyes y regulaciones aplicables</li>
              </ul>
            </div>
          </section>

          <section id="section-4" className="space-y-3">
            <T.H2>4. Uso Aceptable</T.H2>
            <div className="space-y-2">
              <T.H3>4.1 Usos Permitidos</T.H3>
              <p>Puedes utilizar Fazil para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Gestionar documentos legítimos de comunidades de propietarios</li>
                <li>Procesar actas, facturas y documentos oficiales</li>
                <li>Generar informes para fines administrativos</li>
                <li>Facilitar la comunicación con propietarios</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>4.2 Usos Prohibidos</T.H3>
              <p>NO puedes utilizar Fazil para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Subir contenido ilegal, difamatorio o fraudulento</li>
                <li>Violar derechos de propiedad intelectual</li>
                <li>Realizar actividades de hacking o intentos de acceso no autorizado</li>
                <li>Distribuir malware, virus o código malicioso</li>
                <li>Spam o comunicaciones no solicitadas</li>
                <li>Revender o redistribuir el servicio sin autorización</li>
                <li>Realizar ingeniería inversa del software</li>
              </ul>
            </div>
          </section>

          <section id="section-5" className="space-y-3">
            <T.H2>5. Contenido y Propiedad Intelectual</T.H2>
            <div className="space-y-2">
              <T.H3>5.1 Tu Contenido</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Mantienes la propiedad de todos los documentos que subas</li>
                <li>Nos otorgas licencia para procesar y almacenar tu contenido</li>
                <li>Eres responsable de tener los derechos necesarios sobre el contenido</li>
                <li>Garantizas que el contenido no infringe derechos de terceros</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>5.2 Nuestro Contenido</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Fazil y todo su software son propiedad intelectual nuestra</li>
                <li>Te otorgamos licencia limitada para usar la plataforma</li>
                <li>No puedes copiar, modificar o distribuir nuestro software</li>
              </ul>
            </div>
          </section>

          <section id="section-6" className="space-y-3">
            <T.H2>6. Planes y Pagos</T.H2>
            <div className="space-y-2">
              <T.H3>6.1 Suscripciones</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Los pagos se procesan mensual o anualmente según el plan elegido</li>
                <li>Los precios están sujetos a cambio con 30 días de aviso</li>
                <li>No hay reembolsos por cancelaciones voluntarias</li>
                <li>Los impuestos se aplicarán según la legislación local</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>6.2 Cancelación</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Puedes cancelar tu suscripción en cualquier momento</li>
                <li>La cancelación será efectiva al final del período de facturación</li>
                <li>Conservaremos tus datos según nuestra Política de Privacidad</li>
              </ul>
            </div>
          </section>

          <section id="section-7" className="space-y-3">
            <T.H2>7. Disponibilidad del Servicio</T.H2>
            <div className="space-y-2">
              <T.H3>7.1 Tiempo de Actividad</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nos esforzamos por mantener una disponibilidad del 99.9%</li>
                <li>El mantenimiento programado se notificará con antelación</li>
                <li>No garantizamos disponibilidad ininterrumpida</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>7.2 Limitaciones</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Límites de almacenamiento según el plan contratado</li>
                <li>Límites de procesamiento de documentos por mes</li>
                <li>Restricciones de tamaño de archivo y tipos permitidos</li>
              </ul>
            </div>
          </section>

          <section id="section-8" className="space-y-3">
            <T.H2>8. Responsabilidades y Limitaciones</T.H2>
            <div className="space-y-2">
              <T.H3>8.1 Limitación de Responsabilidad</T.H3>
              <p>En la máxima medida permitida por la ley:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>No seremos responsables de daños indirectos o consecuentes</li>
                <li>Nuestra responsabilidad total no excederá el importe pagado en los últimos 12 meses</li>
                <li>No garantizamos la precisión al 100% del procesamiento de IA</li>
                <li>No somos responsables de pérdidas de datos por causas externas</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>8.2 Indemnización</T.H3>
              <p>Aceptas indemnizarnos contra cualquier reclamación derivada de:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Tu uso indebido de la plataforma</li>
                <li>Violación de estos términos</li>
                <li>Infracción de derechos de terceros</li>
                <li>Contenido ilegal que subas</li>
              </ul>
            </div>
          </section>

          <section id="section-9" className="space-y-3">
            <T.H2>9. Privacidad y Seguridad</T.H2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cumplimos con el RGPD y legislación española de protección de datos</li>
              <li>Implementamos medidas de seguridad técnicas y organizativas</li>
              <li>Los datos se procesan según nuestra Política de Privacidad</li>
              <li>Realizamos copias de seguridad regulares</li>
            </ul>
          </section>

          <section id="section-10" className="space-y-3">
            <T.H2>10. Terminación</T.H2>
            <div className="space-y-2">
              <T.H3>10.1 Terminación por tu parte</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Puedes cerrar tu cuenta en cualquier momento</li>
                <li>Debes descargar tus datos antes de la terminación</li>
                <li>La terminación no libera obligaciones de pago pendientes</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>10.2 Terminación por nuestra parte</T.H3>
              <p>Podemos suspender o terminar tu cuenta si:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Violas estos términos</li>
                <li>No pagas las tarifas correspondientes</li>
                <li>Utilizas el servicio para actividades ilegales</li>
                <li>Por razones de seguridad o técnicas</li>
              </ul>
            </div>
          </section>

          <section id="section-11" className="space-y-3">
            <T.H2>11. Modificaciones</T.H2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Podemos modificar estos términos con 30 días de aviso</li>
              <li>Las modificaciones se notificarán por correo electrónico</li>
              <li>El uso continuado constituye aceptación de los nuevos términos</li>
              <li>Si no aceptas los cambios, puedes cancelar tu cuenta</li>
            </ul>
          </section>

          <section id="section-12" className="space-y-3">
            <T.H2>12. Ley Aplicable y Jurisdicción</T.H2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Estos términos se rigen por la legislación española</li>
              <li>Los tribunales de Madrid tendrán jurisdicción exclusiva</li>
              <li>Para disputas de consumidores, se aplicará la ley de protección al consumidor</li>
            </ul>
          </section>

          <section id="section-13" className="space-y-3">
            <T.H2>13. Disposiciones Generales</T.H2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Si alguna disposición es inválida, el resto permanece en vigor</li>
              <li>La falta de aplicación de un término no constituye renuncia</li>
              <li>Estos términos constituyen el acuerdo completo entre las partes</li>
              <li>No puedes transferir tus derechos sin nuestro consentimiento</li>
            </ul>
          </section>

          <section id="section-14" className="space-y-3">
            <T.H2>14. Contacto</T.H2>
            <p>Para cualquier pregunta sobre estos términos, contacta con nosotros:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Fazil</strong></p>
              <p>Las Rozas, Madrid, España</p>
              <p><strong>Email:</strong> contacto@fazil-ai.com</p>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}