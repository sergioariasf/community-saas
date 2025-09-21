/**
 * ARCHIVO: page.tsx
 * PROPÓSITO: Página de test simple para comunicado SIN autenticación
 * ESTADO: testing
 * DEPENDENCIAS: Ninguna - datos hardcoded del test exitoso
 * OUTPUTS: Vista simple de datos extraídos por el agente
 * ACTUALIZADO: 2025-09-18
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Datos reales extraídos por el agente en el test exitoso
const TEST_DATA = {
  "fecha": "2025-04-07",
  "comunidad": "C.P. \"Amara Homes\"",
  "remitente": "Beltrán y Romera, S.L. U.",
  "resumen": "Los contadores de lectura de SunFlower se están rompiendo. Se ha recibido un documento de un vecino sobre el problema de los contadores de energía. Se solicita a los vecinos estar pendientes del email y la aplicación de SF para cambios de contadores.",
  "category": "mantenimiento",
  "asunto": "INFORMACIÓN RELACIONADA CONTADORES LECTURA DE SUNFLOWER C.P. \"AMARA HOMES\"",
  "tipo_comunicado": "notificación",
  "urgencia": "media",
  "comunidad_direccion": null,
  "remitente_cargo": null,
  "destinatarios": ["rebeca@beltranyromera.com"],
  "fecha_limite": null,
  "categoria_comunicado": "mantenimiento",
  "requiere_respuesta": false,
  "accion_requerida": [
    "Estar pendientes del e-mail y de la aplicación de SF",
    "Cambiar el contador lo antes posible si es necesario"
  ],
  "anexos": ["CONTADORES DE ENERGIěA.pdf"],
  "contacto_info": {
    "telefono": "91-815.22.56",
    "email": "amarahomes.cp@gmail.com",
    "horario_atencion": "de lunes a jueves de 9-14h y de 17-20h y los viernes de 8-15h. LOS PRÓXIMOS DÍAS 14, 15 Y 16 DE ABRIL EL HORARIO DE OFICINA SERÁ DE 8 A 15H."
  }
};

const TEST_METADATA = {
  documentId: '4d41ca1d-bcae-4a85-b3e6-d8393bd5fa26',
  extractedId: '039f994a-7c19-46a8-89db-eb28e1451713',
  agentName: 'comunicado_extractor_v1',
  processingTime: 1047,
  fieldsExtracted: 17,
  success: true
};

export default function TestComunicadoSimplePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">🧪 Test Exitoso: Comunicado</h1>
        <p className="text-muted-foreground">
          Datos reales extraídos por el agente <code>comunicado_extractor_v1</code>
        </p>
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            ✅ {TEST_METADATA.fieldsExtracted} campos extraídos
          </Badge>
          <Badge variant="outline">
            ⏱️ {TEST_METADATA.processingTime}ms
          </Badge>
          <Badge variant="outline">
            🤖 {TEST_METADATA.agentName}
          </Badge>
        </div>
      </div>

      {/* Datos Principales */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            📢 Información del Comunicado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium text-green-700">Fecha:</span>
              <p className="text-gray-700">{TEST_DATA.fecha}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Urgencia:</span>
              <p className="text-gray-700">
                <Badge variant={TEST_DATA.urgencia === 'alta' ? 'destructive' : 'secondary'}>
                  {TEST_DATA.urgencia}
                </Badge>
              </p>
            </div>
            <div>
              <span className="font-medium text-green-700">Comunidad:</span>
              <p className="text-gray-700">{TEST_DATA.comunidad}</p>
            </div>
            <div>
              <span className="font-medium text-green-700">Categoría:</span>
              <p className="text-gray-700">
                <Badge variant="outline">{TEST_DATA.category}</Badge>
              </p>
            </div>
          </div>
          
          <div>
            <span className="font-medium text-green-700">Remitente:</span>
            <p className="text-gray-700">{TEST_DATA.remitente}</p>
          </div>
          
          <div>
            <span className="font-medium text-green-700">Asunto:</span>
            <p className="text-gray-700 font-medium">{TEST_DATA.asunto}</p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Resumen del Comunicado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{TEST_DATA.resumen}</p>
        </CardContent>
      </Card>

      {/* Acciones Requeridas */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Acciones Requeridas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {TEST_DATA.accion_requerida.map((accion, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">{index + 1}.</span>
                <span className="text-gray-700">{accion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader>
          <CardTitle>📞 Información de Contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="font-medium">Teléfono:</span>
            <p className="text-gray-700">{TEST_DATA.contacto_info.telefono}</p>
          </div>
          <div>
            <span className="font-medium">Email:</span>
            <p className="text-gray-700">{TEST_DATA.contacto_info.email}</p>
          </div>
          <div>
            <span className="font-medium">Horario de Atención:</span>
            <p className="text-gray-700 text-sm">{TEST_DATA.contacto_info.horario_atencion}</p>
          </div>
        </CardContent>
      </Card>

      {/* Datos Técnicos */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-gray-700 text-sm">🔍 Datos Técnicos del Test</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Document ID:</span>
              <p className="font-mono text-gray-600">{TEST_METADATA.documentId}</p>
            </div>
            <div>
              <span className="font-medium">Extracted ID:</span>
              <p className="font-mono text-gray-600">{TEST_METADATA.extractedId}</p>
            </div>
          </div>
          
          <details className="mt-4">
            <summary className="cursor-pointer font-medium text-gray-600">
              Ver todos los datos extraídos (JSON)
            </summary>
            <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-auto max-h-64">
              {JSON.stringify(TEST_DATA, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>

      {/* Conclusiones */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🎉 Conclusiones del Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">✅</div>
              <p className="text-sm font-medium">Agente Funciona</p>
              <p className="text-xs text-gray-600">JSON parseado correctamente</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">17</div>
              <p className="text-sm font-medium">Campos Extraídos</p>
              <p className="text-xs text-gray-600">Más de los 5 esperados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">💾</div>
              <p className="text-sm font-medium">Guardado en BD</p>
              <p className="text-xs text-gray-600">extracted_communications</p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-green-100 rounded-lg">
            <p className="text-green-800 font-medium text-center">
              🚀 El agente está LISTO para integración en el pipeline principal
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}