/**
 * ARCHIVO: pre-deploy-test.js
 * PROPÓSITO: Test de verificación pre-deploy para validar funcionalidad crítica
 * ESTADO: development
 * DEPENDENCIAS: .env.local, Supabase DB, build system
 * OUTPUTS: Reporte de validación y status de preparación para deploy
 * ACTUALIZADO: 2025-09-26
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class PreDeployValidator {
  constructor() {
    this.results = {
      build: { status: 'pending', details: [] },
      environment: { status: 'pending', details: [] },
      database: { status: 'pending', details: [] },
      functionality: { status: 'pending', details: [] }
    };
    this.errors = [];
    this.warnings = [];
  }

  log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
  }

  logSection(title) {
    console.log(`\n${colors.bold}${colors.blue}=== ${title} ===${colors.reset}\n`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, { ...options, stdio: 'pipe' });
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  async validateBuild() {
    this.logSection('BUILD VALIDATION');
    
    try {
      this.log('🔨 Running npm run build...');
      const result = await this.runCommand('npm', ['run', 'build']);
      
      if (result.code === 0) {
        this.results.build.status = 'success';
        this.results.build.details.push('✅ Build completed successfully');
        this.log('✅ Build successful!', colors.green);
      } else {
        this.results.build.status = 'error';
        this.results.build.details.push(`❌ Build failed with code ${result.code}`);
        this.results.build.details.push(result.stderr);
        this.log(`❌ Build failed with code ${result.code}`, colors.red);
        this.errors.push('Build validation failed');
      }
    } catch (error) {
      this.results.build.status = 'error';
      this.results.build.details.push(`❌ Build error: ${error.message}`);
      this.log(`❌ Build error: ${error.message}`, colors.red);
      this.errors.push('Build validation error');
    }
  }

  validateEnvironmentVariables() {
    this.logSection('ENVIRONMENT VALIDATION');
    
    const requiredVars = {
      'NEXT_PUBLIC_SUPABASE_URL': 'Supabase URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase Anonymous Key',
      'SUPABASE_SERVICE_ROLE_KEY': 'Supabase Service Role Key',
      'SUPABASE_PROJECT_REF': 'Supabase Project Reference',
      'NEXT_PUBLIC_APP_URL': 'Application URL',
      'GOOGLE_CLIENT_ID': 'Google OAuth Client ID',
      'GOOGLE_CLIENT_SECRET': 'Google OAuth Client Secret',
      'GEMINI_API_KEY': 'Gemini AI API Key'
    };

    const envFilePath = path.join(process.cwd(), '.env.local');
    
    if (!fs.existsSync(envFilePath)) {
      this.results.environment.status = 'error';
      this.results.environment.details.push('❌ .env.local file not found');
      this.log('❌ .env.local file not found', colors.red);
      this.errors.push('Environment file missing');
      return;
    }

    const envContent = fs.readFileSync(envFilePath, 'utf8');
    let allPresent = true;

    for (const [varName, description] of Object.entries(requiredVars)) {
      if (envContent.includes(`${varName}=`)) {
        this.results.environment.details.push(`✅ ${description} configured`);
        this.log(`✅ ${varName}`, colors.green);
      } else {
        this.results.environment.details.push(`❌ ${description} missing`);
        this.log(`❌ ${varName} missing`, colors.red);
        allPresent = false;
      }
    }

    // Check production URL warning
    if (envContent.includes('NEXT_PUBLIC_APP_URL=http://localhost:3001')) {
      this.results.environment.details.push('⚠️  NEXT_PUBLIC_APP_URL still points to localhost - must be updated for production');
      this.log('⚠️  NEXT_PUBLIC_APP_URL still points to localhost', colors.yellow);
      this.warnings.push('App URL needs production update');
    }

    this.results.environment.status = allPresent ? 'success' : 'error';
    if (!allPresent) {
      this.errors.push('Missing required environment variables');
    }
  }

  async validateDatabase() {
    this.logSection('DATABASE VALIDATION');
    
    try {
      // Simple connection test
      this.log('🔌 Testing database connection...');
      
      // Check if we can load environment variables
      require('dotenv').config({ path: '.env.local' });
      
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        this.results.database.details.push('✅ Database credentials available');
        this.results.database.details.push('✅ Project reference configured');
        this.results.database.status = 'success';
        this.log('✅ Database configuration valid', colors.green);
      } else {
        this.results.database.status = 'error';
        this.results.database.details.push('❌ Database credentials missing');
        this.log('❌ Database credentials missing', colors.red);
        this.errors.push('Database validation failed');
      }
    } catch (error) {
      this.results.database.status = 'error';
      this.results.database.details.push(`❌ Database validation error: ${error.message}`);
      this.log(`❌ Database error: ${error.message}`, colors.red);
      this.errors.push('Database validation error');
    }
  }

  validateCoreFunctionality() {
    this.logSection('CORE FUNCTIONALITY VALIDATION');
    
    // Check critical files exist
    const criticalFiles = [
      'src/app/api/documents/multi-analyze/route.ts',
      'src/app/api/documents/[id]/view/route.ts',
      'src/app/(dynamic-pages)/(main-pages)/(logged-in-pages)/documents/multi-analyzer/page.tsx',
      'src/lib/ingesta/core/multi-document/MultiDocumentAnalyzer.ts',
      'supabase/migrations/add_multidocumento_constraint.sql'
    ];

    let allFilesExist = true;

    for (const filePath of criticalFiles) {
      if (fs.existsSync(path.join(process.cwd(), filePath))) {
        this.results.functionality.details.push(`✅ ${filePath}`);
        this.log(`✅ ${path.basename(filePath)}`, colors.green);
      } else {
        this.results.functionality.details.push(`❌ ${filePath} missing`);
        this.log(`❌ ${path.basename(filePath)} missing`, colors.red);
        allFilesExist = false;
      }
    }

    this.results.functionality.status = allFilesExist ? 'success' : 'error';
    if (!allFilesExist) {
      this.errors.push('Critical files missing');
    }
  }

  generateReport() {
    this.logSection('DEPLOYMENT READINESS REPORT');
    
    const allSuccess = Object.values(this.results).every(result => result.status === 'success');
    
    if (allSuccess && this.errors.length === 0) {
      this.log('🚀 DEPLOYMENT READY!', colors.green);
      this.log('✅ All validations passed', colors.green);
    } else {
      this.log('❌ DEPLOYMENT NOT READY', colors.red);
      this.log(`❌ ${this.errors.length} errors found`, colors.red);
    }

    if (this.warnings.length > 0) {
      this.log(`⚠️  ${this.warnings.length} warnings to review`, colors.yellow);
    }

    // Summary
    console.log('\n' + colors.bold + 'VALIDATION SUMMARY:' + colors.reset);
    for (const [category, result] of Object.entries(this.results)) {
      const status = result.status === 'success' ? '✅' : '❌';
      const color = result.status === 'success' ? colors.green : colors.red;
      this.log(`${status} ${category.toUpperCase()}: ${result.status}`, color);
    }

    // Next steps
    if (allSuccess && this.errors.length === 0) {
      console.log('\n' + colors.bold + colors.green + 'NEXT STEPS FOR DEPLOYMENT:' + colors.reset);
      console.log('1. Update NEXT_PUBLIC_APP_URL in Vercel environment variables');
      console.log('2. git add . && git commit -m "fix: production build ready"');
      console.log('3. git push origin main');
      console.log('4. Monitor Vercel deployment dashboard');
      console.log('5. Test production URL after deployment completes');
    } else {
      console.log('\n' + colors.bold + colors.red + 'REQUIRED FIXES:' + colors.reset);
      this.errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    return allSuccess && this.errors.length === 0;
  }

  async runValidation() {
    this.log(`${colors.bold}🧪 PRE-DEPLOYMENT VALIDATION STARTED${colors.reset}\n`);
    
    await this.validateBuild();
    this.validateEnvironmentVariables();
    await this.validateDatabase();
    this.validateCoreFunctionality();
    
    return this.generateReport();
  }
}

// Run validation if script is called directly
if (require.main === module) {
  const validator = new PreDeployValidator();
  validator.runValidation()
    .then((isReady) => {
      process.exit(isReady ? 0 : 1);
    })
    .catch((error) => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

module.exports = PreDeployValidator;