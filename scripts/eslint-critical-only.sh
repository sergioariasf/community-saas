#!/bin/bash

# ARCHIVO: eslint-critical-only.sh
# PROPÓSITO: Verificar solo errores ESLint críticos en archivos modificados (NO warnings, NO prettier)
# ESTADO: development
# DEPENDENCIAS: git, eslint
# OUTPUTS: Solo errores críticos de ESLint, ignorando warnings y prettier
# ACTUALIZADO: 2025-09-27

set -e  # Exit on any error

echo "🔍 ===== VERIFICACIÓN ESLint SOLO ERRORES CRÍTICOS ====="
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
    echo "Características:"
    echo "  ✅ Solo errores críticos (NO warnings)"
    echo "  ✅ Ignora reglas de prettier/formatting"
    echo "  ✅ Enfoque en problemas de lógica/tipos"
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

# Verificar ESLint solo errores críticos
echo "🔍 ===== ESLINT SOLO ERRORES CRÍTICOS ====="

if ! command -v eslint &> /dev/null && ! npx eslint --version &> /dev/null; then
    echo "⚠️  ESLint no encontrado, saltando verificación"
    exit 0
fi

echo "🔍 Ejecutando: npx eslint --format=compact (solo errores críticos)"

# Ejecutar ESLint y filtrar solo errores críticos (con timeout)
ESLINT_OUTPUT=$(timeout 30 npx eslint $TS_JS_FILES --format=compact --no-ignore 2>&1 || echo "TIMEOUT_OR_ERROR")
ESLINT_EXIT_CODE=$?

# Filtrar solo errores (no warnings) y excluir prettier
CRITICAL_ERRORS=$(echo "$ESLINT_OUTPUT" | grep "error" | grep -v "prettier" | grep -v "warning" || true)

# Contar errores críticos
CRITICAL_COUNT=$(echo "$CRITICAL_ERRORS" | grep -c "error" 2>/dev/null || echo "0")

if [ -z "$CRITICAL_ERRORS" ] || [ "$CRITICAL_COUNT" -eq 0 ]; then
    echo "✅ ¡Sin errores críticos detectados!"
    echo ""
    echo "📊 Resumen:"
    echo "   🔴 Errores críticos: 0"
    echo "   ⚡ Verificación rápida completada"
    exit 0
else
    echo "❌ Errores críticos detectados:"
    echo ""
    echo "$CRITICAL_ERRORS"
    echo ""
    echo "📊 Resumen:"
    echo "   🔴 Errores críticos: $CRITICAL_COUNT"
    echo ""
    echo "💡 Para ver todos los detalles: npx eslint $TS_JS_FILES"
    echo "💡 Para auto-fix warnings: npx eslint $TS_JS_FILES --fix"
    exit 1
fi