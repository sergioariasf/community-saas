/**
 * ARCHIVO: coherence-validator.js
 * PROPÓSITO: Test de coherencia entre schema, tabla, prompt y pipeline
 * ESTADO: development
 * DEPENDENCIAS: document-types-schema.json, schemaBasedConfig.ts
 * OUTPUTS: Reporte de coherencia y inconsistencias
 * ACTUALIZADO: 2025-09-23
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class CoherenceValidator {
  constructor() {
    this.schemaPath = path.join(process.cwd(), 'src/lib/schemas/document-types-schema.json');
    this.promptsPath = path.join(process.cwd(), 'prompts');
    this.extractorsPath = path.join(process.cwd(), 'src/lib/ingesta/core/strategies');
    this.persistencePath = path.join(process.cwd(), 'src/lib/agents/persistence');
    this.uiPath = path.join(process.cwd(), 'src/components/documents/templates');
    
    this.results = {
      overall: 'pending',
      documents: {},
      summary: {
        total: 0,
        coherent: 0,
        issues: 0
      }
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  loadSchema() {
    try {
      const schemaContent = fs.readFileSync(this.schemaPath, 'utf-8');
      return JSON.parse(schemaContent);
    } catch (error) {
      this.log(`❌ Error loading schema: ${error.message}`, 'red');
      return null;
    }
  }

  validateDocumentType(docType, schema) {
    this.log(`\n🔍 Validating: ${docType}`, 'blue');
    
    const docSchema = schema[docType];
    if (!docSchema) {
      this.log(`❌ Document type not found in schema`, 'red');
      return { valid: false, errors: ['Document type not found in schema'] };
    }

    const errors = [];
    const warnings = [];
    
    // 1. Validar metadata
    const metadata = docSchema.metadata;
    if (!metadata) {
      errors.push('Missing metadata section');
    } else {
      const requiredMetadata = ['display_name', 'table_name', 'agent_name', 'component_name'];
      requiredMetadata.forEach(field => {
        if (!metadata[field]) {
          errors.push(`Missing metadata.${field}`);
        }
      });
    }

    // 2. Validar database_schema
    const dbSchema = docSchema.database_schema;
    if (!dbSchema) {
      errors.push('Missing database_schema section');
    } else {
      if (!dbSchema.primary_fields || !Array.isArray(dbSchema.primary_fields)) {
        errors.push('Missing or invalid primary_fields');
      }
      if (!dbSchema.detail_fields || !Array.isArray(dbSchema.detail_fields)) {
        warnings.push('Missing or invalid detail_fields');
      }
    }

    // 3. Verificar archivos relacionados
    const fileChecks = this.checkRelatedFiles(docType, metadata);
    errors.push(...fileChecks.errors);
    warnings.push(...fileChecks.warnings);

    // 4. Verificar pipeline integration
    const pipelineCheck = this.checkPipelineIntegration(docType);
    errors.push(...pipelineCheck.errors);
    warnings.push(...pipelineCheck.warnings);

    const isValid = errors.length === 0;
    
    if (isValid) {
      this.log(`✅ ${docType}: COHERENT`, 'green');
      this.results.summary.coherent++;
    } else {
      this.log(`❌ ${docType}: ISSUES FOUND`, 'red');
      this.results.summary.issues++;
      
      // Show specific errors
      errors.forEach(error => {
        this.log(`   🔴 ${error}`, 'red');
      });
    }

    if (warnings.length > 0) {
      this.log(`⚠️  ${warnings.length} warnings`, 'yellow');
      warnings.forEach(warning => {
        this.log(`   🟡 ${warning}`, 'yellow');
      });
    }

    return {
      valid: isValid,
      errors,
      warnings,
      fileChecks: fileChecks.details
    };
  }

  checkRelatedFiles(docType, metadata) {
    const errors = [];
    const warnings = [];
    const details = {};

    if (!metadata) return { errors, warnings, details };

    // 1. Prompt file
    const promptFile = path.join(this.promptsPath, `${metadata.agent_name}_prompt.md`);
    details.prompt = fs.existsSync(promptFile);
    if (!details.prompt) {
      errors.push(`Missing prompt file: ${metadata.agent_name}_prompt.md`);
    }

    // 2. Extractor
    const extractorFile = path.join(this.extractorsPath, `${this.capitalize(docType)}Extractor.ts`);
    details.extractor = fs.existsSync(extractorFile);
    if (!details.extractor) {
      errors.push(`Missing extractor: ${this.capitalize(docType)}Extractor.ts`);
    }

    // 3. Persistence
    const persistenceFile = path.join(this.persistencePath, `${this.capitalize(docType)}Persistence.ts`);
    details.persistence = fs.existsSync(persistenceFile);
    if (!details.persistence) {
      errors.push(`Missing persistence: ${this.capitalize(docType)}Persistence.ts`);
    }

    // 4. UI Component
    const uiFile = path.join(this.uiPath, `${metadata.component_name}.tsx`);
    details.ui = fs.existsSync(uiFile);
    if (!details.ui) {
      warnings.push(`Missing UI component: ${metadata.component_name}.tsx`);
    }

    // 5. DEEP VERIFICATION: DocumentDetailRenderer integration
    const rendererCheck = this.checkDocumentDetailRenderer(docType);
    errors.push(...rendererCheck.errors);
    warnings.push(...rendererCheck.warnings);
    details.renderer = rendererCheck.details;

    // 6. DEEP VERIFICATION: templates/index.ts exports
    const exportCheck = this.checkTemplateExports(docType, metadata);
    errors.push(...exportCheck.errors);
    warnings.push(...exportCheck.warnings);
    details.exports = exportCheck.details;

    // 7. DEEP VERIFICATION: UI fields vs schema consistency
    if (details.ui) {
      const uiFieldsCheck = this.checkUIFieldsConsistency(docType, metadata, uiFile);
      errors.push(...uiFieldsCheck.errors);
      warnings.push(...uiFieldsCheck.warnings);
      details.uiFields = uiFieldsCheck.details;
    }

    // 8. DEEP VERIFICATION: Extractor validations
    if (details.extractor) {
      const extractorValidCheck = this.checkExtractorValidations(docType, extractorFile);
      errors.push(...extractorValidCheck.errors);
      warnings.push(...extractorValidCheck.warnings);
      details.extractorValidations = extractorValidCheck.details;
    }

    return { errors, warnings, details };
  }

  checkDocumentDetailRenderer(docType) {
    const errors = [];
    const warnings = [];
    const details = { usesRegistry: false, hasRegistryImport: false };

    try {
      const rendererPath = path.join(process.cwd(), 'src/components/documents/DocumentDetailRenderer.tsx');
      if (!fs.existsSync(rendererPath)) {
        errors.push('DocumentDetailRenderer.tsx not found');
        return { errors, warnings, details };
      }

      const rendererContent = fs.readFileSync(rendererPath, 'utf-8');
      
      // Check for registry pattern (better than hardcoded case statements)
      const usesGetDocumentTemplate = /getDocumentTemplate\s*\(/i.test(rendererContent);
      const hasRegistryImport = /import.*getDocumentTemplate.*from.*templates/i.test(rendererContent);
      
      details.usesRegistry = usesGetDocumentTemplate;
      details.hasRegistryImport = hasRegistryImport;

      if (!usesGetDocumentTemplate) {
        errors.push(`DocumentDetailRenderer not using registry pattern (getDocumentTemplate)`);
      }
      
      if (!hasRegistryImport) {
        errors.push(`DocumentDetailRenderer missing registry import`);
      }

      // This is GOOD - registry pattern is better than hardcoded cases
      if (usesGetDocumentTemplate && hasRegistryImport) {
        // Perfect! Registry pattern means all document types are automatically supported
      }

    } catch (error) {
      warnings.push(`Could not verify DocumentDetailRenderer: ${error.message}`);
    }

    return { errors, warnings, details };
  }

  checkTemplateExports(docType, metadata) {
    const errors = [];
    const warnings = [];
    const details = { hasAutoRegistry: false, hasStaticImport: false, componentName: null };

    if (!metadata || !metadata.component_name) {
      warnings.push('No component_name in metadata to check exports');
      return { errors, warnings, details };
    }

    try {
      const indexPath = path.join(this.uiPath, 'index.ts');
      if (!fs.existsSync(indexPath)) {
        errors.push('templates/index.ts not found');
        return { errors, warnings, details };
      }

      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      details.componentName = metadata.component_name;
      
      // Check for auto-registry pattern (better than hardcoded exports)
      const hasAutoRegistry = /generateDocumentTemplates|getDocumentConfigs/i.test(indexContent);
      const hasSchemaImport = /schemaBasedConfig/i.test(indexContent);
      
      details.hasAutoRegistry = hasAutoRegistry && hasSchemaImport;
      
      // Check if component is statically imported (needed for auto-registry)
      const componentPattern = new RegExp(`import.*${metadata.component_name}.*from`);
      details.hasStaticImport = componentPattern.test(indexContent);

      if (!details.hasAutoRegistry) {
        errors.push(`templates/index.ts not using auto-registry pattern`);
      }
      
      if (!details.hasStaticImport) {
        warnings.push(`templates/index.ts missing static import for ${metadata.component_name}`);
      }

    } catch (error) {
      warnings.push(`Could not verify template registry: ${error.message}`);
    }

    return { errors, warnings, details };
  }

  checkUIFieldsConsistency(docType, metadata, uiFile) {
    const errors = [];
    const warnings = [];
    const details = { fieldMatches: [], missingFields: [], extraFields: [] };

    try {
      const uiContent = fs.readFileSync(uiFile, 'utf-8');
      
      // Load schema for this document type
      const schema = this.loadSchema();
      if (!schema || !schema.document_types || !schema.document_types[docType]) {
        warnings.push('Could not load schema for field comparison');
        return { errors, warnings, details };
      }

      const docSchema = schema.document_types[docType];
      const dbSchema = docSchema.database_schema;
      
      // Get all expected fields from schema
      const expectedFields = [];
      if (dbSchema.primary_fields) {
        expectedFields.push(...dbSchema.primary_fields.map(f => f.name));
      }
      if (dbSchema.detail_fields) {
        expectedFields.push(...dbSchema.detail_fields.map(f => f.name));
      }
      if (dbSchema.topic_fields) {
        expectedFields.push(...dbSchema.topic_fields.map(f => f.name));
      }

      // Check which fields are referenced in UI
      const fieldMatches = [];
      const missingFields = [];
      
      expectedFields.forEach(field => {
        const fieldPattern = new RegExp(`['"]\s*${field}\s*['"]|\\b${field}\\b`);
        if (fieldPattern.test(uiContent)) {
          fieldMatches.push(field);
        } else {
          missingFields.push(field);
        }
      });

      details.fieldMatches = fieldMatches;
      details.missingFields = missingFields;

      // Only warn for missing critical fields
      const criticalMissing = missingFields.filter(field => 
        !field.startsWith('topic_') && !field.includes('estructura_detectada')
      );
      
      if (criticalMissing.length > 0) {
        warnings.push(`UI missing critical fields: ${criticalMissing.join(', ')}`);
      }

    } catch (error) {
      warnings.push(`Could not verify UI field consistency: ${error.message}`);
    }

    return { errors, warnings, details };
  }

  checkExtractorValidations(docType, extractorFile) {
    const errors = [];
    const warnings = [];
    const details = { hasValidation: false, validationMethod: null, validationLocation: null };

    try {
      // FIXED: Check validation in the correct architectural pattern
      // 1. Check if there's a dedicated validator file
      const capitalizedType = docType.charAt(0).toUpperCase() + docType.slice(1);
      const validatorFile = path.join(process.cwd(), `src/lib/agents/validation/${capitalizedType}Validator.ts`);
      
      const hasValidatorFile = fs.existsSync(validatorFile);
      
      // 2. Check if ResponseParser includes this validator (UPDATED FOR DYNAMIC SYSTEM)
      const responseParserFile = path.join(process.cwd(), 'src/lib/agents/gemini/ResponseParser.ts');
      let responseParserUsesValidator = false;
      
      if (fs.existsSync(responseParserFile)) {
        const responseParserContent = fs.readFileSync(responseParserFile, 'utf-8');
        
        // NEW: Check for dynamic validation system patterns
        const hasDynamicValidation = /loadAndApplyValidator\s*\(/i.test(responseParserContent);
        const hasAutoDiscovery = /getDocumentConfigs\s*\(\)/i.test(responseParserContent);
        const hasValidatorConvention = /getValidatorNameByConvention\s*\(/i.test(responseParserContent);
        
        // Check if the validator is included in the dynamic loading function
        const validatorIncluded = responseParserContent.includes(`'${capitalizedType}Validator'`) ||
                                responseParserContent.includes(`${capitalizedType}Validator`) ||
                                responseParserContent.includes(`validate${capitalizedType}Data`);
        
        // ResponseParser uses validator if:
        // A) It has the new dynamic system AND the validator is mapped, OR
        // B) It has the old hardcoded pattern (for backward compatibility)
        if (hasDynamicValidation && hasAutoDiscovery && hasValidatorConvention) {
          // Dynamic system is in place
          responseParserUsesValidator = validatorIncluded; // True if validator is mapped in the dynamic loader
        } else {
          // Fallback: check old hardcoded patterns
          const agentConfig = this.getAgentNameFromSchema(docType);
          const agentName = agentConfig?.agentName || `${docType}_extractor_v1`;
          const agentHandlingPattern = new RegExp(`agentName === ['"]${agentName}['"].*return validate\\w+Data\\(data\\)`, 'is');
          const agentConditionPattern = new RegExp(`\\(agentName === ['"]\\w*['"] \\|\\| agentName === ['"]${agentName}['"]\\).*\\{[\\s\\S]*?return validate\\w+Data\\(data\\)`, 'i');
          const importPattern = new RegExp(`import.*\\{.*validate${capitalizedType}Data.*\\}.*from.*${capitalizedType}Validator`, 'i');
          
          responseParserUsesValidator = agentHandlingPattern.test(responseParserContent) || 
                                      agentConditionPattern.test(responseParserContent) ||
                                      importPattern.test(responseParserContent);
        }
      }

      // Validation is considered present if:
      // A) Has validator file AND ResponseParser uses it, OR
      // B) Has validator file (for future integration)
      details.hasValidation = hasValidatorFile;
      
      if (hasValidatorFile && responseParserUsesValidator) {
        details.validationMethod = `validate${capitalizedType}Data`;
        details.validationLocation = 'ResponseParser + ValidatorFile';
      } else if (hasValidatorFile) {
        details.validationMethod = `validate${capitalizedType}Data (file exists)`;
        details.validationLocation = 'ValidatorFile only';
      } else {
        details.validationMethod = null;
        details.validationLocation = 'none';
      }

      // Check for JSON parsing safety in extractor
      const extractorContent = fs.readFileSync(extractorFile, 'utf-8');
      const hasJSONParse = /JSON\.parse/i.test(extractorContent);
      const hasTryCatch = /try\s*\{[\s\S]*catch/i.test(extractorContent);
      
      if (hasJSONParse && !hasTryCatch) {
        warnings.push('Extractor uses JSON.parse without try-catch protection');
      }

      // Only warn if no validation exists at all
      if (!details.hasValidation) {
        warnings.push('Extractor missing data validation method');
      } else if (hasValidatorFile && !responseParserUsesValidator) {
        warnings.push('Validator file exists but not integrated in ResponseParser yet');
      }

    } catch (error) {
      warnings.push(`Could not verify extractor validations: ${error.message}`);
    }

    return { errors, warnings, details };
  }

  // Helper method to get agent configuration from schema
  getAgentNameFromSchema(docType) {
    try {
      // Read schema directly to avoid TypeScript require issues
      const schemaPath = path.join(process.cwd(), 'src/lib/schemas/document-types-schema.json');
      if (fs.existsSync(schemaPath)) {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
        const docConfig = schema.document_types?.[docType];
        if (docConfig?.metadata?.agent_name) {
          return { agentName: docConfig.metadata.agent_name };
        }
      }
    } catch (error) {
      console.warn(`Could not read schema for ${docType}:`, error.message);
    }
    
    // Fallback: use naming convention
    return { agentName: `${docType}_extractor_v1` };
  }

  checkPipelineIntegration(docType) {
    const errors = [];
    const warnings = [];

    try {
      // Check if document type is detected by auto-discovery
      const { getSupportedDocumentTypes } = require('../core/schemaBasedConfig.ts');
      const supportedTypes = getSupportedDocumentTypes();
      
      if (!supportedTypes.includes(docType)) {
        errors.push(`Document type not detected by auto-discovery system`);
      }

      // Check DocumentExtractorFactory
      const factoryPath = path.join(this.extractorsPath, 'DocumentExtractorFactory.ts');
      if (fs.existsSync(factoryPath)) {
        const factoryContent = fs.readFileSync(factoryPath, 'utf-8');
        const importPattern = new RegExp(`import.*${this.capitalize(docType)}Extractor.*from`);
        const casePattern = new RegExp(`case\\s+['"]${docType}['"]:`);
        
        if (!importPattern.test(factoryContent)) {
          errors.push(`Missing import in DocumentExtractorFactory`);
        }
        if (!casePattern.test(factoryContent)) {
          errors.push(`Missing case in DocumentExtractorFactory`);
        }
      }

    } catch (error) {
      warnings.push(`Could not verify pipeline integration: ${error.message}`);
    }

    return { errors, warnings };
  }

  checkArchitectureCompliance() {
    this.log(`\n🏗️  Checking Architecture Compliance...`, 'blue');
    
    const issues = [];
    
    // 1. Verificar que existe auto-discovery
    const schemaConfigPath = path.join(process.cwd(), 'src/lib/ingesta/core/schemaBasedConfig.ts');
    if (!fs.existsSync(schemaConfigPath)) {
      issues.push('❌ Missing schemaBasedConfig.ts - auto-discovery not implemented');
    } else {
      this.log('✅ Auto-discovery engine exists', 'green');
    }

    // 2. Verificar progressivePipelineSimple usa auto-discovery
    const pipelinePath = path.join(process.cwd(), 'src/lib/ingesta/core/progressivePipelineSimple.ts');
    if (fs.existsSync(pipelinePath)) {
      const pipelineContent = fs.readFileSync(pipelinePath, 'utf-8');
      if (pipelineContent.includes('getSupportedDocumentTypes')) {
        this.log('✅ Pipeline uses auto-discovery', 'green');
      } else {
        issues.push('❌ Pipeline still has hardcoded types');
      }
    }

    // 3. Verificar DocumentExtractorFactory usa auto-discovery
    const factoryPath = path.join(this.extractorsPath, 'DocumentExtractorFactory.ts');
    if (fs.existsSync(factoryPath)) {
      const factoryContent = fs.readFileSync(factoryPath, 'utf-8');
      if (factoryContent.includes('getSupportedDocumentTypes')) {
        this.log('✅ Factory uses auto-discovery', 'green');
      } else {
        issues.push('❌ Factory still has hardcoded types');
      }
    }

    // 4. Verificar AgentOrchestrator architecture
    const orchestratorPath = path.join(process.cwd(), 'src/lib/agents/AgentOrchestrator.ts');
    if (fs.existsSync(orchestratorPath)) {
      this.log('✅ AgentOrchestrator architecture in place', 'green');
    } else {
      issues.push('❌ Missing AgentOrchestrator - modular architecture not complete');
    }

    return issues;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async validate() {
    this.log(`${'='.repeat(60)}`, 'bold');
    this.log(`🔍 COHERENCE VALIDATOR - Document Types System`, 'bold');
    this.log(`${'='.repeat(60)}`, 'bold');

    const schema = this.loadSchema();
    if (!schema) {
      this.results.overall = 'failed';
      return this.results;
    }

    const documentTypes = Object.keys(schema.document_types || {});
    this.results.summary.total = documentTypes.length;

    this.log(`\n📋 Found ${documentTypes.length} document types: ${documentTypes.join(', ')}`, 'blue');

    // Validate each document type
    for (const docType of documentTypes) {
      const validation = this.validateDocumentType(docType, schema.document_types);
      this.results.documents[docType] = validation;
    }

    // Check architecture compliance
    const architectureIssues = this.checkArchitectureCompliance();

    // Summary
    this.log(`\n${'='.repeat(60)}`, 'bold');
    this.log(`📊 SUMMARY REPORT`, 'bold');
    this.log(`${'='.repeat(60)}`, 'bold');
    this.log(`Total documents: ${this.results.summary.total}`);
    this.log(`Coherent: ${this.results.summary.coherent}`, 'green');
    this.log(`With issues: ${this.results.summary.issues}`, 'red');
    this.log(`Architecture issues: ${architectureIssues.length}`, architectureIssues.length > 0 ? 'red' : 'green');

    if (architectureIssues.length > 0) {
      this.log(`\n🏗️  Architecture Issues:`, 'red');
      architectureIssues.forEach(issue => this.log(`  ${issue}`, 'red'));
    }

    // Overall status
    const overallIssues = this.results.summary.issues + architectureIssues.length;
    this.results.overall = overallIssues === 0 ? 'passed' : 'failed';
    
    this.log(`\n🎯 OVERALL STATUS: ${this.results.overall.toUpperCase()}`, 
      this.results.overall === 'passed' ? 'green' : 'red');

    return this.results;
  }
}

// Execute if run directly
if (require.main === module) {
  const validator = new CoherenceValidator();
  validator.validate().then(results => {
    process.exit(results.overall === 'passed' ? 0 : 1);
  });
}

module.exports = { CoherenceValidator };