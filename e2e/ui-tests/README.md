# UI Guardian Tests

Este directorio contiene las pruebas automatizadas de UI siguiendo la metodología UI Guardian.

## Estructura

- `test-incident-creation-v2.js` - ✅ **Exitoso** - Test completo de creación de incidencias con análisis detallado de formularios
- `test-incident-creation.js` - ✅ **Básico** - Test básico de flujo de incidencias

## Metodología UI Guardian

### Principios

1. **Análisis detallado de formularios**: Inspeccionar todos los campos, botones y selectores disponibles
2. **Múltiples estrategias de selector**: Probar varios selectores CSS para encontrar elementos
3. **Verificación de estado**: Confirmar redirecciones y cambios de URL para validar éxito
4. **Logging detallado**: Output con emojis para fácil identificación de estados
5. **Inspección manual**: Mantener navegador abierto para validación visual

### Patrón de Éxito

```javascript
🎯 TESTING {FEATURE} - UI Guardian Methodology
🔐 Step 1: Login
✅ Login successful
📋 Step 2: Analyze form structure
✅ Form fields identified
📝 Step 3: Fill form with flexible selectors
✅ Form filled successfully
🚀 Step 4: Submit and verify
✅ SUCCESS: {Feature} working correctly
```

### Configuración

- **URL Base**: http://localhost:3001
- **Usuario de prueba**: sergioariasf@gmail.com
- **Navegador**: Chromium (headless: false, slowMo: 500)
- **Timeout**: 10000ms

## Uso

```bash
# Ejecutar test específico
node e2e/ui-tests/test-incident-creation-v2.js

# Desde el directorio del proyecto
cd /home/sergi/proyectos/community-saas
npm run dev # Asegurar servidor ejecutándose
node e2e/ui-tests/test-{feature}-v{version}.js
```

## Convenciones

- **Nombre**: `test-{feature}-v{version}.js`
- **Mantener**: Tests exitosos que demuestran patrones útiles
- **Eliminar**: Tests obsoletos o que no siguen la metodología
- **Actualizar**: Versionar tests cuando se mejoran significativamente

## Tests Exitosos Documentados

### test-incident-creation-v2.js

- ✅ Identificó problema en archivo backend incorrecto (`incidents_simple.ts` vs `incidents.ts`)
- ✅ Análisis detallado de estructura de formulario
- ✅ Verificación exitosa de redirección tras creación
- ✅ Patrón replicable para otros features

Este test fue clave para resolver el problema de `organization_id` NULL en la creación de incidencias.