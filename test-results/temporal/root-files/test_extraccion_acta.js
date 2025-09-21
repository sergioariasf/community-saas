/**
 * ARCHIVO: test_extraccion_acta.js
 * PROPÓSITO: Test para verificar extracción de datos compatibles con plantilla UI actas
 * ESTADO: testing
 * DEPENDENCIAS: actaMetadataExtractor.ts, Gemini AI
 * OUTPUTS: Comparación datos actuales vs esperados por UI
 * ACTUALIZADO: 2025-09-16
 */

import { createActaMetadataExtractor } from './src/lib/ingesta/modules/metadata/extractors/actaMetadataExtractor.js';

// Texto simulado de acta para testing
const TEXTO_ACTA_SIMULADO = `
ACTA DE JUNTA EXTRAORDINARIA DE PROPIETARIOS
COMUNIDAD RESIDENCIAL LOS OLIVOS
Calle Ejemplo 123, Madrid

Fecha: 15 de marzo de 2024
Lugar: Salón de actos - Calle Ejemplo 123

ASISTENCIA:
- Propietarios presentes: 28 de 45 total
- Coeficientes representados: 67.5%
- Quórum alcanzado: SÍ

PRESIDENCIA Y SECRETARÍA:
- Presidente entrante: María González Rodríguez
- Presidente saliente: Juan Pérez Martín
- Administrador: Administraciones ABC S.L.
- Secretario: Carlos López García

ORDEN DEL DÍA:
1. Presentación presupuesto 2024
2. Renovación contrato limpieza
3. Instalación nuevos buzones
4. Ruegos y preguntas

DESARROLLO DE LA REUNIÓN:

1. PRESUPUESTO 2024
Se presenta el presupuesto anual con un incremento del 3.2%. 
Incluye gastos de piscina, jardinería, limpieza y mantenimiento de ascensores.
Presupuesto total: 125.000€
VOTACIÓN: APROBADO por unanimidad (45 votos a favor)

2. CONTRATO LIMPIEZA
Se presentan tres presupuestos de empresas:
- Limpiezas Delta S.L.: 850€/mes
- Servicios Norte: 920€/mes  
- Limpiezas Premium: 1.100€/mes
VOTACIÓN: APROBADA empresa Limpiezas Delta S.L. por mayoría (32 a favor, 13 abstenciones)

3. INSTALACIÓN BUZONES
Necesarios nuevos buzones en portal principal por deterioro.
Presupuesto: 2.400€
VOTACIÓN: APROBADO por mayoría (38 a favor, 7 en contra)

4. RUEGOS Y PREGUNTAS
- Solicitud reparación grietas fachada
- Propuesta mejora iluminación garaje
- Reclamación por ruidos en obras

ACUERDOS TOMADOS:
1. Presupuesto 2024 aprobado por unanimidad
2. Contratación Limpiezas Delta S.L. por 18 meses
3. Instalación buzones antes del 30/04/2024
4. Estudio grietas fachada por administrador

GASTOS APROBADOS:
- Presupuesto anual: 125.000€
- Buzones nuevos: 2.400€
- Total gastos extraordinarios: 2.400€

TEMAS TRATADOS:
- Presupuesto y balance
- Limpieza y mantenimiento
- Piscina y jardín
- Administración comunitaria
- Energía y suministros
- Ascensores
- Portería

Sin más asuntos que tratar, se levanta la sesión siendo las 20:30 horas.

El Presidente                    El Secretario
María González Rodríguez         Carlos López García
`;

// Datos esperados por la plantilla UI (estructura completa)
const DATOS_ESPERADOS_UI = {
  // Datos de extracted_minutes
  president_in: "María González Rodríguez",
  president_out: "Juan Pérez Martín", 
  administrator: "Administraciones ABC S.L.",
  summary: "Reunión extraordinaria para aprobar el presupuesto anual 2024 y la renovación del contrato de limpieza...",
  decisions: "1. Aprobado presupuesto 2024 por unanimidad. 2. Contratación de Limpiezas Delta S.L. por 18 meses. 3. Instalación de nuevos buzones en el portal principal.",

  // Datos de document_metadata
  document_date: "2024-03-15",
  tipo_reunion: "extraordinaria",
  lugar: "Salón de actos - Calle Ejemplo 123", 
  comunidad_nombre: "Comunidad Residencial Los Olivos",
  
  orden_del_dia: [
    "Presentación presupuesto 2024",
    "Renovación contrato limpieza",
    "Instalación nuevos buzones", 
    "Ruegos y preguntas"
  ],
  
  acuerdos: [
    "Presupuesto 2024 aprobado por unanimidad",
    "Contratación Limpiezas Delta S.L.",
    "Instalación buzones antes del 30/04/2024"
  ],

  topic_keywords: ["presupuesto", "limpieza", "buzones", "votación", "administracion"],

  // Los 13 temas como booleanos
  "topic-presupuesto": true,
  "topic-mantenimiento": true, 
  "topic-administracion": true,
  "topic-piscina": true,
  "topic-jardin": true,
  "topic-limpieza": true,
  "topic-balance": true,
  "topic-paqueteria": false,
  "topic-energia": true,
  "topic-normativa": false,
  "topic-proveedor": true,
  "topic-dinero": true,
  "topic-ascensor": true,
  "topic-incendios": false,
  "topic-porteria": true,

  estructura_detectada: {
    quorum_alcanzado: true,
    propietarios_totales: 45,
    capitulos: [
      {
        numero: 1,
        titulo: "Apertura y Verificación de Quórum", 
        pagina: 1,
        subsecciones: [
          { titulo: "Lista de asistentes", pagina: 1 },
          { titulo: "Verificación del quórum", pagina: 1 }
        ]
      },
      {
        numero: 2, 
        titulo: "Orden del Día",
        pagina: 1,
        subsecciones: [
          { titulo: "Punto 1: Presupuesto 2024", pagina: 1 },
          { titulo: "Punto 2: Contrato de limpieza", pagina: 1 },
          { titulo: "Punto 3: Instalación buzones", pagina: 1 }
        ]
      }
    ],
    total_paginas: 1,
    votaciones: [
      { tema: "Presupuesto 2024", resultado: "aprobado", votos: "unanimidad", pagina: 1 },
      { tema: "Empresa limpieza", resultado: "aprobado", votos: "mayoría", pagina: 1 }
    ]
  }
};

async function testExtraccionActa() {
  console.log('🧪 TEST EXTRACCIÓN ACTA - Compatibilidad con Plantilla UI');
  console.log('='.repeat(70));

  try {
    // Crear extractor
    const extractor = createActaMetadataExtractor();
    console.log('✅ Extractor creado correctamente');

    // Extraer metadatos
    console.log('\n🔄 Extrayendo metadatos del texto simulado...');
    const startTime = Date.now();
    
    const resultado = await extractor.extractMetadata(
      TEXTO_ACTA_SIMULADO, 
      'acta_test_simulada.pdf'
    );
    
    const tiempoTotal = Date.now() - startTime;
    
    console.log(`⏱️ Tiempo extracción: ${tiempoTotal}ms`);
    console.log(`✅ Éxito: ${resultado.success}`);
    console.log(`🎯 Método: ${resultado.method}`);
    console.log(`📊 Confianza: ${(resultado.confidence * 100).toFixed(1)}%`);

    if (!resultado.success) {
      console.error('❌ Error en extracción:', resultado.errors);
      return;
    }

    const metadatos = resultado.metadata;
    
    console.log('\n📋 COMPARACIÓN DATOS EXTRAÍDOS vs ESPERADOS:');
    console.log('-'.repeat(70));

    // Comparar campos básicos
    const comparaciones = [
      { campo: 'document_date', actual: metadatos.document_date, esperado: DATOS_ESPERADOS_UI.document_date },
      { campo: 'tipo_reunion', actual: metadatos.tipo_reunion, esperado: DATOS_ESPERADOS_UI.tipo_reunion },
      { campo: 'lugar', actual: metadatos.lugar, esperado: DATOS_ESPERADOS_UI.lugar },
      { campo: 'presidente_entrante', actual: metadatos.presidente_entrante, esperado: DATOS_ESPERADOS_UI.president_in },
      { campo: 'presidente_saliente', actual: metadatos.presidente_saliente, esperado: DATOS_ESPERADOS_UI.president_out },
      { campo: 'administrador', actual: metadatos.administrador, esperado: DATOS_ESPERADOS_UI.administrator },
    ];

    comparaciones.forEach(({ campo, actual, esperado }) => {
      const coincide = actual === esperado;
      const icono = coincide ? '✅' : '❌';
      console.log(`${icono} ${campo}:`);
      console.log(`    Actual: "${actual}"`);
      console.log(`    Esperado: "${esperado}"`);
      if (!coincide) {
        console.log(`    ⚠️ NO COINCIDE`);
      }
    });

    console.log('\n🏷️ TOPIC KEYWORDS:');
    console.log(`Extraídos: [${metadatos.topic_keywords.join(', ')}]`);
    console.log(`Esperados: [${DATOS_ESPERADOS_UI.topic_keywords.join(', ')}]`);

    console.log('\n🔢 CAMPOS TOPIC-XXX COMO BOOLEANOS:');
    const camposTopicEsperados = Object.keys(DATOS_ESPERADOS_UI).filter(k => k.startsWith('topic-'));
    camposTopicEsperados.forEach(campo => {
      const actual = metadatos[campo];
      const esperado = DATOS_ESPERADOS_UI[campo];
      const coincide = actual === esperado;
      const icono = coincide ? '✅' : '❌';
      console.log(`${icono} ${campo}: actual=${actual}, esperado=${esperado}`);
    });

    console.log('\n🏗️ ESTRUCTURA DETECTADA:');
    if (metadatos.estructura_detectada) {
      console.log('✅ Campo estructura_detectada existe');
      console.log(`   quorum_alcanzado: ${metadatos.estructura_detectada.quorum_alcanzado}`);
      console.log(`   propietarios_totales: ${metadatos.estructura_detectada.propietarios_totales}`);
      console.log(`   orden_del_dia: ${metadatos.estructura_detectada.orden_del_dia?.length || 0} elementos`);
      console.log(`   votaciones: ${metadatos.estructura_detectada.votaciones?.length || 0} elementos`);
      console.log(`   capitulos: ${metadatos.estructura_detectada.capitulos?.length || 0} elementos`);
    } else {
      console.log('❌ Campo estructura_detectada NO existe');
    }

    console.log('\n📊 RESUMEN COMPATIBILIDAD:');
    console.log('-'.repeat(40));
    
    // Calcular porcentaje de compatibilidad
    let camposCompatibles = 0;
    let camposTotal = 0;
    
    // Contar campos básicos
    comparaciones.forEach(({ actual, esperado }) => {
      camposTotal++;
      if (actual === esperado) camposCompatibles++;
    });
    
    // Contar campos topic-xxx
    camposTopicEsperados.forEach(campo => {
      camposTotal++;
      if (metadatos[campo] === DATOS_ESPERADOS_UI[campo]) camposCompatibles++;
    });
    
    // Verificar estructura_detectada
    camposTotal++;
    if (metadatos.estructura_detectada) camposCompatibles++;

    const porcentajeCompatibilidad = (camposCompatibles / camposTotal * 100).toFixed(1);
    
    console.log(`📈 Compatibilidad: ${camposCompatibles}/${camposTotal} campos (${porcentajeCompatibilidad}%)`);
    
    if (parseFloat(porcentajeCompatibilidad) >= 80) {
      console.log('✅ BUENA compatibilidad con plantilla UI');
    } else if (parseFloat(porcentajeCompatibilidad) >= 60) {
      console.log('⚠️ Compatibilidad PARCIAL - requiere mejoras');
    } else {
      console.log('❌ Compatibilidad BAJA - requiere trabajo significativo');
    }

    console.log('\n🔧 CAMPOS FALTANTES O INCORRECTOS:');
    if (camposCompatibles < camposTotal) {
      console.log('- Campos topic-xxx como booleanos (probablemente faltan)');
      console.log('- estructura_detectada con capítulos detallados');  
      console.log('- orden_del_dia como array');
      console.log('- votaciones detalladas');
      console.log('- comunidad_nombre');
    } else {
      console.log('✅ Todos los campos esenciales están presentes');
    }

  } catch (error) {
    console.error('❌ Error durante el test:', error);
    console.error(error.stack);
  }
}

// Ejecutar test
testExtraccionActa();