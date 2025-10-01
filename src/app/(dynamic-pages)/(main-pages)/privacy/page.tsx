/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Página de Política de Privacidad para SaaS de gestión documental
 * ESTADO: production
 * DEPENDENCIAS: @/components/ui/Typography
 * OUTPUTS: Página legal con políticas de privacidad
 * ACTUALIZADO: 2025-10-01
 */
'use client';
import { T } from '@/components/ui/Typography';
import { useState, useEffect } from 'react';

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('section-1');

  const sections = [
    { id: 'section-1', title: '1. Información que Recopilamos' },
    { id: 'section-2', title: '2. Cómo Utilizamos la Información' },
    { id: 'section-3', title: '3. Procesamiento con IA' },
    { id: 'section-4', title: '4. Compartir Información' },
    { id: 'section-5', title: '5. Seguridad de los Datos' },
    { id: 'section-6', title: '6. Retención de Datos' },
    { id: 'section-7', title: '7. Tus Derechos (RGPD)' },
    { id: 'section-8', title: '8. Cookies' },
    { id: 'section-9', title: '9. Transferencias Internacionales' },
    { id: 'section-10', title: '10. Menores de Edad' },
    { id: 'section-11', title: '11. Cambios en esta Política' },
    { id: 'section-12', title: '12. Información de Contacto' },
    { id: 'section-13', title: '13. Autoridad de Control' },
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
          <T.H1>Política de Privacidad</T.H1>
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
            <T.H2>1. Información que Recopilamos</T.H2>
            <div className="space-y-2">
              <T.H3>1.1 Información Personal</T.H3>
              <p>Recopilamos la siguiente información personal cuando utilizas Fazil:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Nombre completo y dirección de correo electrónico</li>
                <li>Información de la comunidad de propietarios que gestionas</li>
                <li>Dirección postal de las propiedades administradas</li>
                <li>Información de facturación y pago</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>1.2 Documentos y Contenido</T.H3>
              <p>Como plataforma de gestión documental, procesamos:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Actas de reuniones de comunidades</li>
                <li>Facturas y documentos financieros</li>
                <li>Contratos de servicios y mantenimiento</li>
                <li>Comunicados oficiales</li>
                <li>Presupuestos y albaranes</li>
                <li>Escrituras y documentos legales</li>
              </ul>
            </div>

            <div className="space-y-2">
              <T.H3>1.3 Información Técnica</T.H3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Dirección IP y datos de ubicación aproximada</li>
                <li>Información del navegador y dispositivo</li>
                <li>Cookies y tecnologías de seguimiento</li>
                <li>Registros de actividad en la plataforma</li>
              </ul>
            </div>
          </section>

          <section id="section-2" className="space-y-3">
            <T.H2>2. Cómo Utilizamos la Información</T.H2>
            <p>Utilizamos tu información para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionar servicios de gestión documental y análisis automatizado</li>
              <li>Procesar y clasificar documentos mediante inteligencia artificial</li>
              <li>Generar informes y estadísticas sobre la gestión de comunidades</li>
              <li>Facilitar la comunicación entre administradores y propietarios</li>
              <li>Mantener la seguridad y prevenir el uso fraudulento</li>
              <li>Mejorar nuestros servicios y desarrollar nuevas funcionalidades</li>
              <li>Cumplir con obligaciones legales y regulatorias</li>
            </ul>
          </section>

          <section id="section-3" className="space-y-3">
            <T.H2>3. Procesamiento con Inteligencia Artificial</T.H2>
            <p>Fazil utiliza tecnologías de IA para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Extraer texto automáticamente de documentos escaneados </li>
              <li>Clasificar documentos según su tipo y contenido</li>
              <li>Extraer metadatos relevantes para facilitar la búsqueda</li>
              <li>Generar resúmenes y análisis de contenido</li>
            </ul>
            <p>Todo procesamiento de IA se realiza con los más altos estándares de seguridad y confidencialidad.</p>
          </section>

          <section id="section-4" className="space-y-3">
            <T.H2>4. Compartir Información</T.H2>
            <p>No vendemos, alquilamos ni compartimos tu información personal con terceros, excepto en los siguientes casos:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o autoridades competentes</li>
              <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos legales o los de nuestros usuarios</li>
              <li><strong>Consentimiento:</strong> Cuando tengas nuestro consentimiento explícito</li>
            </ul>
          </section>

          <section id="section-5" className="space-y-3">
            <T.H2>5. Seguridad de los Datos</T.H2>
            <p>Implementamos medidas de seguridad técnicas y organizativas:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cifrado de datos en tránsito y en reposo</li>
              <li>Autenticación de dos factores disponible</li>
              <li>Acceso restringido basado en roles y permisos</li>
              <li>Auditorías regulares de seguridad</li>
              <li>Copias de seguridad automáticas y seguras</li>
              <li>Monitoreo continuo de actividades sospechosas</li>
            </ul>
          </section>

          <section id="section-6" className="space-y-3">
            <T.H2>6. Retención de Datos</T.H2>
            <p>Conservamos tu información durante:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Datos de cuenta:</strong> Mientras mantengas una cuenta activa</li>
              <li><strong>Documentos:</strong> Según las obligaciones legales de conservación documental (generalmente 5-10 años)</li>
              <li><strong>Registros de actividad:</strong> 2 años para fines de seguridad y auditoría</li>
              <li><strong>Datos de facturación:</strong> 10 años según la legislación española</li>
            </ul>
          </section>

          <section id="section-7" className="space-y-3">
            <T.H2>7. Tus Derechos (RGPD)</T.H2>
            <p>Bajo el Reglamento General de Protección de Datos tienes derecho a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acceso:</strong> Solicitar una copia de los datos que tenemos sobre ti</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de tus datos ("derecho al olvido")</li>
              <li><strong>Limitación:</strong> Restringir el procesamiento de tus datos</li>
              <li><strong>Portabilidad:</strong> Recibir tus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerte al procesamiento de tus datos</li>
              <li><strong>Retirada de consentimiento:</strong> Retirar el consentimiento en cualquier momento</li>
            </ul>
            <p>Para ejercer estos derechos, contacta con nosotros en: <strong>privacy@fazil.es</strong></p>
          </section>

          <section id="section-8" className="space-y-3">
            <T.H2>8. Cookies y Tecnologías de Seguimiento</T.H2>
            <p>Utilizamos cookies para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Mantener tu sesión iniciada</li>
              <li>Recordar tus preferencias de interfaz</li>
              <li>Analizar el uso de la plataforma</li>
              <li>Mejorar la experiencia de usuario</li>
            </ul>
            <p>Puedes gestionar las cookies desde la configuración de tu navegador.</p>
          </section>

          <section id="section-9" className="space-y-3">
            <T.H2>9. Transferencias Internacionales</T.H2>
            <p>Algunos de nuestros proveedores de servicios pueden estar ubicados fuera de la UE. Garantizamos que todas las transferencias internacionales cumplen con:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Decisiones de adecuación de la Comisión Europea</li>
              <li>Cláusulas contractuales tipo</li>
              <li>Medidas de seguridad adicionales según el RGPD</li>
            </ul>
          </section>

          <section id="section-10" className="space-y-3">
            <T.H2>10. Menores de Edad</T.H2>
            <p>Fazil no está dirigido a menores de 18 años. No recopilamos conscientemente información personal de menores. Si descubrimos que hemos recopilado información de un menor, la eliminaremos inmediatamente.</p>
          </section>

          <section id="section-11" className="space-y-3">
            <T.H2>11. Cambios en esta Política</T.H2>
            <p>Podemos actualizar esta política de privacidad ocasionalmente. Te notificaremos cambios significativos por correo electrónico o mediante un aviso prominente en la plataforma. Te recomendamos revisar esta política periódicamente.</p>
          </section>

          <section id="section-12" className="space-y-3">
            <T.H2>12. Información de Contacto</T.H2>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Responsable del Tratamiento:</strong> Fazil</p>
              <p><strong>Dirección:</strong> Las Rozas, Madrid, España</p>
              <p><strong>Email:</strong> privacy@fazil.es</p>
              <p><strong>Email de soporte:</strong> soporte@fazil.es</p>
              <p><strong>Delegado de Protección de Datos:</strong> dpo@fazil.es</p>
            </div>
          </section>

          <section id="section-13" className="space-y-3">
            <T.H2>13. Autoridad de Control</T.H2>
            <p>Si consideras que el tratamiento de tus datos no cumple con la normativa, puedes presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD):</p>
            <div className="bg-muted p-4 rounded-lg">
              <p><strong>Agencia Española de Protección de Datos</strong></p>
              <p>C/ Jorge Juan, 6</p>
              <p>28001 Madrid</p>
              <p>Web: www.aepd.es</p>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}