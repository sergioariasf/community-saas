#!/bin/bash

# ARCHIVO: verify-modified.sh
# PROPÓSITO: Verificar TypeScript y ESLint solo en archivos modificados
# ESTADO: development
# DEPENDENCIAS: git, tsc, eslint
# OUTPUTS: Verificación incremental de archivos modificados
# ACTUALIZADO: 2025-09-27
# chmod +x scripts/verify-modified.sh
set -e  # Exit on any error

echo "🔍 ===== VERIFICACIÓN INCREMENTAL DE ARCHIVOS MODIFICADOS ====="
echo ""

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [opciones]"
    echo ""
    echo "Opciones:"
    echo "  --staged     Solo archivos en staging (git add)"
    echo "  --committed  Archivos del último commit vs HEAD~1"
    echo "  --working    Archivos modificados en working directory (default)"
    echo "  --help       Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0                    # Verificar archivos modificados"
    echo "  $0 --staged          # Verificar solo archivos en staging"
    echo "  $0 --committed       # Verificar archivos del último commit"
}

# Parsear argumentos
MODE="working"
while [[ $# -gt 0 ]]; do
    case $1 in
        --staged)
            MODE="staged"
            shift
            ;;
        --committed)
            MODE="committed"
            shift
            ;;
        --working)
            MODE="working"
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "❌ Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Detectar archivos modificados según el modo
echo "📂 Detectando archivos modificados (modo: $MODE)..."

case $MODE in
    "staged")
        CHANGED_FILES=$(git diff --cached --name-only)
        echo "🎯 Verificando archivos en staging area"
        ;;
    "committed")
        CHANGED_FILES=$(git diff --name-only HEAD~1)
        echo "🎯 Verificando archivos del último commit"
        ;;
    "working")
        CHANGED_FILES=$(git diff --name-only)
        echo "🎯 Verificando archivos modificados en working directory"
        ;;
esac

# Filtrar solo archivos TypeScript/JavaScript
TS_JS_FILES=""
for file in $CHANGED_FILES; do
    if [[ -f "$file" && ("$file" == *.ts || "$file" == *.tsx || "$file" == *.js || "$file" == *.jsx) ]]; then
        TS_JS_FILES="$TS_JS_FILES $file"
    fi
done

# Verificar si hay archivos para verificar
if [ -z "$TS_JS_FILES" ]; then
    echo "✅ No hay archivos TypeScript/JavaScript modificados para verificar"
    exit 0
fi

echo "📋 Archivos a verificar:"
for file in $TS_JS_FILES; do
    echo "   - $file"
done
echo ""

# Función para verificar TypeScript
check_typescript() {
    echo "📝 ===== TYPESCRIPT CHECK ====="
    
    if ! command -v tsc &> /dev/null; then
        echo "⚠️  TypeScript no encontrado, saltando verificación"
        return 0
    fi
    
    echo "🔍 Ejecutando: npx tsc --noEmit $TS_JS_FILES"
    
    # Capturar output de TypeScript
    TSC_OUTPUT=$(npx tsc --noEmit $TS_JS_FILES 2>&1)
    TSC_EXIT_CODE=$?
    
    if [ $TSC_EXIT_CODE -eq 0 ]; then
        echo "✅ TypeScript check EXITOSO"
        return 0
    else
        echo "❌ TypeScript check FALLÓ"
        echo ""
        echo "🚨 ===== ERRORES TYPESCRIPT DETECTADOS ====="
        
        # Mostrar errores filtrados por relevancia
        echo "$TSC_OUTPUT" | grep -E "(error TS|Cannot find module)" | head -10
        
        # Contar errores
        TOTAL_TS_ERRORS=$(echo "$TSC_OUTPUT" | grep -c "error TS" 2>/dev/null || echo "0")
        
        echo ""
        echo "📊 Total errores TypeScript: $TOTAL_TS_ERRORS"
        
        if [ "$TOTAL_TS_ERRORS" -gt 10 ]; then
            echo "   (Mostrando solo los primeros 10)"
            echo ""
            echo "💡 Para ver todos: npx tsc --noEmit $TS_JS_FILES"
        fi
        
        return 1
    fi
}

# Función para verificar ESLint
check_eslint() {
    echo ""
    echo "🔍 ===== ESLINT CHECK ====="
    
    if ! command -v eslint &> /dev/null && ! npx eslint --version &> /dev/null; then
        echo "⚠️  ESLint no encontrado, saltando verificación"
        return 0
    fi
    
    echo "🔍 Ejecutando: npx eslint $TS_JS_FILES"
    
    # Capturar output completo
    ESLINT_OUTPUT=$(npx eslint $TS_JS_FILES 2>&1)
    ESLINT_EXIT_CODE=$?
    
    if [ $ESLINT_EXIT_CODE -eq 0 ]; then
        echo "✅ ESLint check EXITOSO"
        return 0
    else
        echo "❌ ESLint check FALLÓ"
        echo ""
        echo "🚨 ===== ERRORES CRÍTICOS DETECTADOS ====="
        
        # Mostrar solo errores críticos (no warnings)
        echo "$ESLINT_OUTPUT" | grep -E "(error|Error)" || echo "No se encontraron errores críticos específicos"
        
        # Contar errores vs warnings
        ERRORS_COUNT=$(echo "$ESLINT_OUTPUT" | grep -c "error" 2>/dev/null || echo "0")
        WARNINGS_COUNT=$(echo "$ESLINT_OUTPUT" | grep -c "warning" 2>/dev/null || echo "0")
        
        echo ""
        echo "📊 Resumen de problemas:"
        echo "   🔴 Errores críticos: $ERRORS_COUNT"
        echo "   🟡 Warnings: $WARNINGS_COUNT"
        
        if [ "$ERRORS_COUNT" -gt 0 ]; then
            echo ""
            echo "💡 Para ver todos los detalles: npx eslint $TS_JS_FILES"
            echo "💡 Para auto-fix warnings: npx eslint $TS_JS_FILES --fix"
        fi
        
        return 1
    fi
}

# Ejecutar verificaciones
TYPESCRIPT_SUCCESS=0
ESLINT_SUCCESS=0

check_typescript || TYPESCRIPT_SUCCESS=1
check_eslint || ESLINT_SUCCESS=1

# Resumen final
echo ""
echo "📊 ===== RESUMEN FINAL ====="
echo "📂 Archivos verificados: $(echo $TS_JS_FILES | wc -w)"

if [ $TYPESCRIPT_SUCCESS -eq 0 ]; then
    echo "✅ TypeScript: ÉXITO"
else
    echo "❌ TypeScript: FALLÓ"
fi

if [ $ESLINT_SUCCESS -eq 0 ]; then
    echo "✅ ESLint: ÉXITO"
else
    echo "❌ ESLint: FALLÓ"
fi

# Exit code general
if [ $TYPESCRIPT_SUCCESS -eq 0 ] && [ $ESLINT_SUCCESS -eq 0 ]; then
    echo ""
    echo "🎉 ¡VERIFICACIÓN COMPLETA EXITOSA!"
    exit 0
else
    echo ""
    echo "💥 ¡VERIFICACIÓN FALLÓ! Revisa los errores arriba."
    exit 1
fi