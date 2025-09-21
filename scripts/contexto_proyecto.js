/**
 * ARCHIVO: contexto_proyecto.js
 * PROPÓSITO: Generar contexto completo del proyecto para LLMs de forma eficiente
 * ESTADO: production
 * DEPENDENCIAS: fs, path, child_process (Node.js nativo)
 * OUTPUTS: scripts/CONTEXTO_PROYECTO_OUT.md con índice completo
 * ACTUALIZADO: 2025-09-14
 */

const fs = require('fs');
const path = require('path');

// Configuración
const CONFIG = {
    projectRoot: process.cwd(),
    outputFile: 'scripts/CONTEXTO_PROYECTO_OUT.md',
    ignoreFolders: ['node_modules', '.git', '.next', 'dist', 'build', '.vercel'],
    
    // Extensiones de archivo y sus formatos de comentario
    commentFormats: {
        '.js': { start: '/**', line: ' * ', end: ' */' },
        '.jsx': { start: '/**', line: ' * ', end: ' */' },
        '.ts': { start: '/**', line: ' * ', end: ' */' },
        '.tsx': { start: '/**', line: ' * ', end: ' */' },
        '.css': { start: '/**', line: ' * ', end: ' */' },
        '.scss': { start: '/**', line: ' * ', end: ' */' },
        '.json': { start: '/*', line: ' * ', end: ' */', note: 'JSON no soporta comentarios nativamente' },
        '.md': { start: '<!--', line: '', end: '-->' },
        '.html': { start: '<!--', line: '', end: '-->' },
        '.sql': { start: '--', line: '-- ', end: '' },
        '.py': { start: '"""', line: '', end: '"""' },
        '.sh': { start: '#', line: '# ', end: '' },
        '.env': { start: '#', line: '# ', end: '' },
        '.gitignore': { start: '#', line: '# ', end: '' },
        '.yml': { start: '#', line: '# ', end: '' },
        '.yaml': { start: '#', line: '# ', end: '' }
    }
};

class ContextoProyecto {
    constructor() {
        this.files = [];
        this.stats = {
            totalFiles: 0,
            totalLines: 0,
            filesWithHeaders: 0,
            filesWithoutHeaders: 0,
            alerts: []
        };
    }

    // Verificar si un archivo debe ser ignorado
    shouldIgnoreFile(filePath) {
        const relativePath = path.relative(CONFIG.projectRoot, filePath);
        return CONFIG.ignoreFolders.some(folder => 
            relativePath.startsWith(folder + '/') || relativePath === folder
        );
    }

    // Obtener formato de comentario para un archivo
    getCommentFormat(extension) {
        return CONFIG.commentFormats[extension] || CONFIG.commentFormats['.js'];
    }

    // Extraer encabezado de un archivo (formato simplificado)
    extractHeader(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // Buscar líneas con campos del encabezado en las primeras 15 líneas
            const headerLines = [];
            let foundHeader = false;
            
            for (let i = 0; i < Math.min(15, lines.length); i++) {
                const line = lines[i];
                const cleanLine = line
                    .replace(/^[\s]*[\/\*\-#<>!]*[\s]*/, '')
                    .replace(/[\*\/\->]*[\s]*$/, '')
                    .trim();
                
                // Si encontramos algún campo del encabezado
                if (cleanLine.startsWith('ARCHIVO:') || 
                    cleanLine.startsWith('PROPÓSITO:') || 
                    cleanLine.startsWith('PROPOSITO:') ||
                    cleanLine.startsWith('ESTADO:') ||
                    cleanLine.startsWith('DEPENDENCIAS:') ||
                    cleanLine.startsWith('OUTPUTS:') ||
                    cleanLine.startsWith('ACTUALIZADO:')) {
                    headerLines.push(cleanLine);
                    foundHeader = true;
                }
            }
            
            if (foundHeader && headerLines.length > 0) {
                return this.parseHeader(headerLines.join('\n'));
            }
            
            return null;
        } catch (error) {
            console.warn(`Error leyendo archivo ${filePath}:`, error.message);
            return null;
        }
    }

    // Parsear contenido del encabezado
    parseHeader(headerContent) {
        const header = {
            archivo: '',
            proposito: '',
            estado: '',
            dependencias: '',
            outputs: '',
            actualizado: ''
        };

        const lines = headerContent.split('\n');
        for (const line of lines) {
            // Limpiar línea de caracteres de comentario pero mantener el contenido
            const cleanLine = line
                .replace(/^[\s]*[\/\*\-#<>!]*[\s]*/, '') // Quitar prefijos de comentario
                .replace(/[\*\/\->]*[\s]*$/, '') // Quitar sufijos de comentario
                .trim();
            
            if (cleanLine.startsWith('ARCHIVO:')) {
                header.archivo = cleanLine.replace('ARCHIVO:', '').trim();
            } else if (cleanLine.startsWith('PROPÓSITO:') || cleanLine.startsWith('PROPOSITO:')) {
                header.proposito = cleanLine.replace(/PROP[ÓO]SITO:/, '').trim();
            } else if (cleanLine.startsWith('ESTADO:')) {
                header.estado = cleanLine.replace('ESTADO:', '').trim();
            } else if (cleanLine.startsWith('DEPENDENCIAS:')) {
                header.dependencias = cleanLine.replace('DEPENDENCIAS:', '').trim();
            } else if (cleanLine.startsWith('OUTPUTS:')) {
                header.outputs = cleanLine.replace('OUTPUTS:', '').trim();
            } else if (cleanLine.startsWith('ACTUALIZADO:')) {
                header.actualizado = cleanLine.replace('ACTUALIZADO:', '').trim();
            }
        }

        return header;
    }

    // Escanear directorio recursivamente
    scanDirectory(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (this.shouldIgnoreFile(fullPath)) {
                    continue;
                }
                
                if (entry.isDirectory()) {
                    this.scanDirectory(fullPath);
                } else {
                    this.processFile(fullPath);
                }
            }
        } catch (error) {
            console.warn(`Error escaneando directorio ${dir}:`, error.message);
        }
    }

    // Procesar un archivo individual
    processFile(filePath) {
        const stats = fs.statSync(filePath);
        const extension = path.extname(filePath);
        const relativePath = path.relative(CONFIG.projectRoot, filePath);
        
        // Contar líneas
        let lineCount = 0;
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            lineCount = content.split('\n').length;
        } catch (error) {
            lineCount = 0;
        }

        const header = this.extractHeader(filePath);
        
        const fileInfo = {
            path: relativePath,
            extension,
            size: stats.size,
            lines: lineCount,
            modified: stats.mtime,
            header: header,
            hasHeader: !!header
        };

        this.files.push(fileInfo);
        this.stats.totalFiles++;
        this.stats.totalLines += lineCount;
        
        if (header) {
            this.stats.filesWithHeaders++;
            
            // Verificar discrepancias de fecha
            if (header.actualizado) {
                const headerDate = new Date(header.actualizado);
                const modifiedDate = stats.mtime;
                const daysDiff = Math.abs(modifiedDate - headerDate) / (1000 * 60 * 60 * 24);
                
                if (daysDiff > 7) { // Alerta si hay más de 7 días de diferencia
                    this.stats.alerts.push(`📅 ${relativePath}: Header (${header.actualizado}) vs Modified (${modifiedDate.toISOString().split('T')[0]})`);
                }
            }
        } else {
            this.stats.filesWithoutHeaders++;
            this.stats.alerts.push(`📄 ${relativePath}: Archivo sin encabezado`);
        }
    }

    // Generar árbol de directorios usando Node.js puro
    generateDirectoryTree() {
        try {
            let treeOutput = 'community-saas/\n';
            
            // Archivos importantes en la raíz
            const rootFiles = ['package.json', 'CLAUDE.md', 'README.md', '.env.local', 'next.config.js', 'tailwind.config.js'];
            const existingRootFiles = rootFiles.filter(file => 
                fs.existsSync(path.join(CONFIG.projectRoot, file))
            );
            
            existingRootFiles.forEach((file, index) => {
                const isLast = index === existingRootFiles.length - 1;
                const prefix = isLast ? '├── ' : '├── ';
                treeOutput += `${prefix}${file}\n`;
            });
            
            // Carpetas importantes del proyecto
            const importantFolders = ['src', 'scripts', 'supabase', 'e2e', 'credenciales', 'datos'];
            
            importantFolders.forEach(folder => {
                const folderPath = path.join(CONFIG.projectRoot, folder);
                
                if (fs.existsSync(folderPath)) {
                    treeOutput += `├── ${folder}/\n`;
                    
                    try {
                        // Leer contenido de la carpeta
                        const items = fs.readdirSync(folderPath);
                        const relevantItems = items
                            .filter(item => {
                                // Incluir más extensiones importantes
                                return item.endsWith('.js') || item.endsWith('.ts') || 
                                       item.endsWith('.tsx') || item.endsWith('.sql') || 
                                       item.endsWith('.md') || item.endsWith('.json') ||
                                       item.endsWith('.pdf') || item.endsWith('.png') ||
                                       item.endsWith('.jpg') || item.endsWith('.txt') ||
                                       item.endsWith('.spec.ts') || item.endsWith('.test.ts') ||
                                       item.endsWith('.yml') || item.endsWith('.yaml') ||
                                       item.endsWith('.sh') || item.endsWith('.env') ||
                                       !item.includes('.');  // directorios
                            })
                            .slice(0, 10); // Aumentar límite a 10 items
                        
                        // Usar objeto para pasar treeOutput por referencia
                        const treeRef = { value: treeOutput };
                        this.renderDirectoryRecursive(folderPath, treeRef, '    ', relevantItems);
                        treeOutput = treeRef.value;
                        
                        if (items.length > relevantItems.length) {
                            treeOutput += '    └── ... (más archivos)\n';
                        }
                        
                    } catch (readErr) {
                        treeOutput += '    └── (no se puede leer contenido)\n';
                    }
                    
                    treeOutput += '\n';
                } else {
                    treeOutput += `├── ${folder}/ (no existe)\n\n`;
                }
            });
            
            return '```\n' + treeOutput + '```\n';
        } catch (error) {
            console.warn('Error generando estructura con Node.js:', error.message);
            return this.generateSimpleTree();
        }
    }

    // Fallback para generar árbol simple
    generateSimpleTree() {
        const folders = new Set();
        this.files.forEach(file => {
            const parts = file.path.split('/');
            if (parts.length > 1) {
                folders.add(parts[0]);
            }
        });
        
        let tree = '```\n.\n';
        Array.from(folders).sort().forEach(folder => {
            tree += `├── ${folder}/\n`;
        });
        tree += '```\n';
        
        return tree;
    }

    // Renderizar árbol como markdown
    renderTree(node, depth) {
        let result = '';
        const indent = '  '.repeat(depth);
        
        Object.keys(node).sort().forEach(key => {
            if (key === 'type') return;
            
            const item = node[key];
            if (item.type === 'directory') {
                result += `${indent}- 📁 **${key}/**\n`;
                result += this.renderTree(item, depth + 1);
            } else if (item.type === 'file') {
                const icon = item.hasHeader ? '✅' : '❌';
                const ext = item.extension || '';
                result += `${indent}- ${icon} \`${key}\`${ext}\n`;
            }
        });
        
        return result;
    }


    // Renderizar directorio de forma recursiva (todos los niveles)
    renderDirectoryRecursive(dirPath, treeOutput, indent, items, maxDepth = 5, currentDepth = 0) {
        if (currentDepth >= maxDepth) return treeOutput;
        
        items.forEach((item, index) => {
            const itemPath = path.join(dirPath, item);
            
            try {
                const isDirectory = fs.statSync(itemPath).isDirectory();
                const isLast = index === items.length - 1;
                const prefix = isLast ? `${indent}└── ` : `${indent}├── `;
                const suffix = isDirectory ? '/' : '';
                
                treeOutput.value += `${prefix}${item}${suffix}\n`;
                
                // Si es directorio, mostrar su contenido recursivamente
                if (isDirectory) {
                    try {
                        const subItems = fs.readdirSync(itemPath);
                        const subRelevant = subItems
                            .filter(subItem => {
                                return subItem.endsWith('.js') || subItem.endsWith('.ts') || 
                                       subItem.endsWith('.tsx') || subItem.endsWith('.sql') || 
                                       subItem.endsWith('.md') || subItem.endsWith('.json') ||
                                       subItem.endsWith('.pdf') || subItem.endsWith('.png') ||
                                       subItem.endsWith('.jpg') || subItem.endsWith('.txt') ||
                                       subItem.endsWith('.spec.ts') || subItem.endsWith('.test.ts') ||
                                       subItem.endsWith('.yml') || subItem.endsWith('.yaml') ||
                                       subItem.endsWith('.sh') || subItem.endsWith('.env') ||
                                       !subItem.includes('.');  // directorios
                            })
                            .slice(0, 15); // Límite por directorio
                        
                        if (subRelevant.length > 0) {
                            const nextIndent = isLast ? `${indent}    ` : `${indent}│   `;
                            this.renderDirectoryRecursive(itemPath, treeOutput, nextIndent, subRelevant, maxDepth, currentDepth + 1);
                        }
                        
                        if (subItems.length > subRelevant.length) {
                            const nextIndent = isLast ? `${indent}    ` : `${indent}│   `;
                            treeOutput.value += `${nextIndent}└── ... (más archivos)\n`;
                        }
                        
                    } catch (subErr) {
                        // Error leyendo subdirectorio
                    }
                }
            } catch (err) {
                // Error accediendo al archivo/directorio
            }
        });
        
        return treeOutput;
    }

    // Contar palabras para estimación de tokens
    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    // Generar reporte markdown
    generateReport() {
        const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];
        
        let report = `# 📊 CONTEXTO DEL PROYECTO\n`;
        report += `> Generado automáticamente el ${timestamp}\n\n`;

        // Métricas
        report += `## 📈 MÉTRICAS DEL PROYECTO\n`;
        report += `- **Total archivos:** ${this.stats.totalFiles}\n`;
        report += `- **Líneas de código:** ${this.stats.totalLines.toLocaleString()}\n`;
        report += `- **Archivos con encabezado:** ${this.stats.filesWithHeaders}\n`;
        report += `- **Archivos sin encabezado:** ${this.stats.filesWithoutHeaders}\n`;
        report += `- **Cobertura encabezados:** ${((this.stats.filesWithHeaders / this.stats.totalFiles) * 100).toFixed(1)}%\n\n`;

        // Estructura
        report += `## 📁 ESTRUCTURA DEL PROYECTO\n`;
        report += this.generateDirectoryTree();
        report += '\n';

        // Índice de archivos - Solo archivos con encabezado
        report += `## 📋 ÍNDICE DE ARCHIVOS CON ENCABEZADO\n`;
        report += `| Archivo | Propósito | Estado | Dependencias | Outputs | Actualizado |\n`;
        report += `|---------|-----------|--------|--------------|---------|-------------|\n`;

        // Solo archivos con encabezado
        this.files
            .filter(file => file.hasHeader)
            .sort((a, b) => a.path.localeCompare(b.path))
            .forEach(file => {
                const h = file.header;
                report += `| \`${file.path}\` | ${h.proposito || '-'} | ${h.estado || '-'} | ${h.dependencias || '-'} | ${h.outputs || '-'} | ${h.actualizado || '-'} |\n`;
            });

        report += '\n';

        // Estimación de tokens
        const wordCount = this.countWords(report);
        const tokenEstimate = Math.ceil(wordCount * 1.3); // Aproximación: 1 token ≈ 0.75 palabras
        
        report += `## 🔢 ESTIMACIÓN DE TOKENS\n`;
        report += `- **Palabras en este reporte:** ${wordCount.toLocaleString()}\n`;
        report += `- **Tokens estimados:** ~${tokenEstimate.toLocaleString()}\n`;
        report += `- **Costo aproximado GPT-4:** $${(tokenEstimate * 0.00003).toFixed(4)}\n\n`;

        report += `---\n`;
        report += `*Generado por contexto_proyecto.js - ${timestamp}*\n`;

        return report;
    }

    // Ejecutar análisis completo
    async run() {
        console.log('🚀 Iniciando análisis del contexto del proyecto...');
        console.log(`📁 Directorio raíz: ${CONFIG.projectRoot}`);
        
        this.scanDirectory(CONFIG.projectRoot);
        
        console.log(`📊 Archivos procesados: ${this.stats.totalFiles}`);
        console.log(`✅ Con encabezado: ${this.stats.filesWithHeaders}`);
        console.log(`❌ Sin encabezado: ${this.stats.filesWithoutHeaders}`);
        
        const report = this.generateReport();
        
        fs.writeFileSync(CONFIG.outputFile, report, 'utf8');
        
        console.log(`📄 Reporte generado: ${CONFIG.outputFile}`);
        console.log(`📝 Palabras: ${this.countWords(report)}`);
        console.log(`🔢 Tokens estimados: ~${Math.ceil(this.countWords(report) * 1.3)}`);
        
        if (this.stats.alerts.length > 0) {
            console.log(`⚠️  ${this.stats.alerts.length} alertas encontradas`);
        }
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    const contexto = new ContextoProyecto();
    contexto.run().catch(console.error);
}

module.exports = ContextoProyecto;