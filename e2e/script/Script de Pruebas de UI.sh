#!/bin/bash

# Este script automatiza el flujo de trabajo de pruebas de UI para un SaaS.
# Asegúrate de que Playwright está instalado globalmente o en tu proyecto
# y que los scripts de prueba están en la ruta especificada.

# Nombre del archivo de log con marca de tiempo
LOG_FILE="test_log_$(date +%Y%m%d%H%M%S).txt"

echo "▶️ Iniciando el flujo de trabajo de pruebas de UI..."
echo "Los logs se guardarán en: $LOG_FILE"
echo "----------------------------------------"

# Paso 1: Limpiar el servidor y verificar el puerto
echo "▶️ Paso 1: Limpiando procesos de 'next-server' y verificando el puerto 3001..." | tee -a $LOG_FILE
pkill -f 'next-server'

sleep 2

# Verificación del puerto
if ! ss -tlnp | grep -q 3001; then
    echo "✅ Éxito: El puerto 3001 está libre." | tee -a $LOG_FILE
else
    echo "❌ Error: El puerto 3001 sigue ocupado. Saliendo del script." | tee -a $LOG_FILE
    exit 1
fi
echo "----------------------------------------"

# Paso 2: Iniciar el servidor de desarrollo
echo "▶️ Paso 2: Iniciando el servidor de desarrollo en segundo plano..." | tee -a $LOG_FILE
npm run dev &
NEXT_PID=$!

echo "⏳ Esperando a que el servidor esté listo (máximo 60 segundos)..." | tee -a $LOG_FILE
TIMEOUT=60
while [ $TIMEOUT -gt 0 ] && ! curl -I http://localhost:3001 2>/dev/null | grep -q "200 OK"; do
    echo "⏳ Esperando..." | tee -a $LOG_FILE
    sleep 2
    TIMEOUT=$((TIMEOUT-2))
done

if [ $TIMEOUT -le 0 ]; then
    echo "❌ Error: Tiempo de espera agotado. El servidor no se inició a tiempo." | tee -a $LOG_FILE
    kill $NEXT_PID
    exit 1
fi

echo "✅ Éxito: Servidor iniciado en localhost:3001" | tee -a $LOG_FILE
echo "----------------------------------------"

# Paso 3: Realizar un health check
echo "▶️ Paso 3: Realizando health check..." | tee -a $LOG_FILE
if curl -I http://localhost:3001 2>/dev/null | grep -q "HTTP/1.1 200 OK"; then
    echo "✅ Éxito: Health check superado. El servidor está operativo." | tee -a $LOG_FILE
else
    echo "❌ Error: Health check fallido. La UI no está respondiendo." | tee -a $LOG_FILE
    kill $NEXT_PID
    exit 1
fi
echo "----------------------------------------"

# Paso 4: Ejecutar las pruebas de Playwright
# Si no se especifica un archivo de prueba, se ejecutarán todos los archivos que terminen con .test.js.
TEST_SCRIPT=${1:-"e2e/ui-tests/*.test.js"}

echo "▶️ Paso 4: Ejecutando pruebas de Playwright con el script: $TEST_SCRIPT" | tee -a $LOG_FILE

# Este comando ejecuta las pruebas y su salida es redirigida al log.
# Playwright guarda las capturas de pantalla de los fallos por defecto.
node $TEST_SCRIPT >> $LOG_FILE 2>&1
PLAYWRIGHT_EXIT_CODE=$?

if [ $PLAYWRIGHT_EXIT_CODE -eq 0 ]; then
    echo "✅ Éxito: La verificación con Playwright se completó correctamente." | tee -a $LOG_FILE
else
    echo "❌ Error: Las pruebas de Playwright fallaron. Código de salida: $PLAYWRIGHT_EXIT_CODE." | tee -a $LOG_FILE
fi
echo "----------------------------------------"

# Paso final: Detener el servidor
echo "▶️ Deteniendo el servidor de desarrollo..." | tee -a $LOG_FILE
kill $NEXT_PID

echo "✅ Proceso de testing automatizado finalizado." | tee -a $LOG_FILE

exit $PLAYWRIGHT_EXIT_CODE
