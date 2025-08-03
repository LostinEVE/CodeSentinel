/**
 * YAML Policy Loader with Dynamic Configuration and Schema Validation
 * Supports enterprise-grade ethical rule management
 */

import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';

export interface EthicsPolicy {
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  rules: EthicsRule[];
  thresholds: RiskThresholds;
  enforcement: EnforcementConfig;
  metadata: PolicyMetadata;
}

export interface EthicsRule {
  id: string;
  name: string;
  description: string;
  category: 'surveillance' | 'discrimination' | 'privacy' | 'misuse' | 'manipulation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  pattern: string;
  flags: string;
  weight: number;
  contexts: string[];
  exceptions: string[];
  customMessage?: string;
  recommendation?: string;
}

export interface RiskThresholds {
  surveillance: number;
  discrimination: number;
  privacy: number;
  misuse: number;
  manipulation: number;
  overall: number;
}

export interface EnforcementConfig {
  mode: 'warn' | 'error' | 'block';
  autoFix: boolean;
  notifications: boolean;
  auditLog: boolean;
}

export interface PolicyMetadata {
  author: string;
  created: string;
  lastModified: string;
  compliance: string[];
  tags: string[];
}

/**
 * JSON Schema for Ethics Policy Validation
 */
const ETHICS_POLICY_SCHEMA = {
  type: 'object',
  required: ['name', 'version', 'rules', 'thresholds', 'enforcement'],
  properties: {
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    description: { type: 'string' },
    enabled: { type: 'boolean', default: true },
    rules: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'category', 'severity', 'pattern'],
        properties: {
          id: { type: 'string', minLength: 1 },
          name: { type: 'string', minLength: 1 },
          description: { type: 'string' },
          category: { 
            type: 'string', 
            enum: ['surveillance', 'discrimination', 'privacy', 'misuse', 'manipulation'] 
          },
          severity: { 
            type: 'string', 
            enum: ['low', 'medium', 'high', 'critical'] 
          },
          enabled: { type: 'boolean', default: true },
          pattern: { type: 'string', minLength: 1 },
          flags: { type: 'string', default: 'gi' },
          weight: { type: 'number', minimum: 0, maximum: 1, default: 0.5 },
          contexts: { type: 'array', items: { type: 'string' } },
          exceptions: { type: 'array', items: { type: 'string' } },
          customMessage: { type: 'string' },
          recommendation: { type: 'string' }
        }
      }
    },
    thresholds: {
      type: 'object',
      required: ['surveillance', 'discrimination', 'privacy', 'misuse', 'manipulation', 'overall'],
      properties: {
        surveillance: { type: 'number', minimum: 0, maximum: 1 },
        discrimination: { type: 'number', minimum: 0, maximum: 1 },
        privacy: { type: 'number', minimum: 0, maximum: 1 },
        misuse: { type: 'number', minimum: 0, maximum: 1 },
        manipulation: { type: 'number', minimum: 0, maximum: 1 },
        overall: { type: 'number', minimum: 0, maximum: 1 }
      }
    },
    enforcement: {
      type: 'object',
      required: ['mode'],
      properties: {
        mode: { type: 'string', enum: ['warn', 'error', 'block'] },
        autoFix: { type: 'boolean', default: false },
        notifications: { type: 'boolean', default: true },
        auditLog: { type: 'boolean', default: true }
      }
    },
    metadata: {
      type: 'object',
      properties: {
        author: { type: 'string' },
        created: { type: 'string', format: 'date-time' },
        lastModified: { type: 'string', format: 'date-time' },
        compliance: { type: 'array', items: { type: 'string' } },
        tags: { type: 'array', items: { type: 'string' } }
      }
    }
  }
};

export class PolicyLoader {
  private ajv: Ajv;
  private loadedPolicies: Map<string, EthicsPolicy> = new Map();
  private watchedFiles: Map<string, fs.FSWatcher> = new Map();
  private onPolicyChanged?: (policyName: string, policy: EthicsPolicy) => void;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
  }

  /**
   * Load policy from YAML file with validation
   */
  public async loadPolicy(filePath: string): Promise<EthicsPolicy> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const policyData = yaml.parse(fileContent);

      // Validate against schema
      const isValid = this.ajv.validate(ETHICS_POLICY_SCHEMA, policyData);
      if (!isValid) {
        throw new Error(`Policy validation failed: ${this.ajv.errorsText()}`);
      }

      // Apply defaults and normalize
      const policy = this.normalizePolicy(policyData);

      // Store in cache
      this.loadedPolicies.set(policy.name, policy);

      return policy;
    } catch (error) {
      throw new Error(`Failed to load policy from ${filePath}: ${error}`);
    }
  }

  /**
   * Load all policies from a directory
   */
  public async loadPoliciesFromDirectory(dirPath: string): Promise<EthicsPolicy[]> {
    const policies: EthicsPolicy[] = [];
    
    if (!fs.existsSync(dirPath)) {
      console.warn(`Policy directory does not exist: ${dirPath}`);
      return policies;
    }

    const files = fs.readdirSync(dirPath);
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    for (const file of yamlFiles) {
      try {
        const filePath = path.join(dirPath, file);
        const policy = await this.loadPolicy(filePath);
        policies.push(policy);
      } catch (error) {
        console.error(`Failed to load policy ${file}:`, error);
      }
    }

    return policies;
  }

  /**
   * Watch policy files for changes and auto-reload
   */
  public watchPolicies(dirPath: string, onChange?: (policyName: string, policy: EthicsPolicy) => void): void {
    this.onPolicyChanged = onChange;

    if (!fs.existsSync(dirPath)) {
      console.warn(`Cannot watch non-existent directory: ${dirPath}`);
      return;
    }

    const watcher = fs.watch(dirPath, { recursive: true }, async (eventType, filename) => {
      if (filename && (filename.endsWith('.yaml') || filename.endsWith('.yml'))) {
        const filePath = path.join(dirPath, filename);
        
        if (eventType === 'change' && fs.existsSync(filePath)) {
          try {
            const policy = await this.loadPolicy(filePath);
            console.log(`Reloaded policy: ${policy.name}`);
            
            if (this.onPolicyChanged) {
              this.onPolicyChanged(policy.name, policy);
            }
          } catch (error) {
            console.error(`Failed to reload policy ${filename}:`, error);
          }
        }
      }
    });

    this.watchedFiles.set(dirPath, watcher);
  }

  /**
   * Stop watching policy files
   */
  public stopWatching(): void {
    this.watchedFiles.forEach(watcher => watcher.close());
    this.watchedFiles.clear();
  }

  /**
   * Get loaded policy by name
   */
  public getPolicy(name: string): EthicsPolicy | undefined {
    return this.loadedPolicies.get(name);
  }

  /**
   * Get all loaded policies
   */
  public getAllPolicies(): EthicsPolicy[] {
    return Array.from(this.loadedPolicies.values());
  }

  /**
   * Merge multiple policies into a single composite policy
   */
  public mergePolicies(policies: EthicsPolicy[]): EthicsPolicy {
    if (policies.length === 0) {
      throw new Error('Cannot merge empty policy list');
    }

    if (policies.length === 1) {
      return policies[0];
    }

    const merged: EthicsPolicy = {
      name: 'merged-policy',
      version: '1.0.0',
      description: `Merged policy from ${policies.length} sources`,
      enabled: true,
      rules: [],
      thresholds: {
        surveillance: 0.7,
        discrimination: 0.5,
        privacy: 0.6,
        misuse: 0.5,
        manipulation: 0.7,
        overall: 0.6
      },
      enforcement: {
        mode: 'warn',
        autoFix: false,
        notifications: true,
        auditLog: true
      },
      metadata: {
        author: 'Policy Merger',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        compliance: [],
        tags: ['merged']
      }
    };

    // Merge rules (avoiding duplicates by ID)
    const ruleIds = new Set<string>();
    policies.forEach(policy => {
      policy.rules.forEach(rule => {
        if (!ruleIds.has(rule.id)) {
          merged.rules.push(rule);
          ruleIds.add(rule.id);
        }
      });
    });

    // Use most restrictive thresholds
    policies.forEach(policy => {
      merged.thresholds.surveillance = Math.min(merged.thresholds.surveillance, policy.thresholds.surveillance);
      merged.thresholds.discrimination = Math.min(merged.thresholds.discrimination, policy.thresholds.discrimination);
      merged.thresholds.privacy = Math.min(merged.thresholds.privacy, policy.thresholds.privacy);
      merged.thresholds.misuse = Math.min(merged.thresholds.misuse, policy.thresholds.misuse);
      merged.thresholds.manipulation = Math.min(merged.thresholds.manipulation, policy.thresholds.manipulation);
      merged.thresholds.overall = Math.min(merged.thresholds.overall, policy.thresholds.overall);
    });

    // Use most restrictive enforcement
    const enforcementLevels = ['warn', 'error', 'block'];
    let maxEnforcementLevel = 0;
    policies.forEach(policy => {
      const level = enforcementLevels.indexOf(policy.enforcement.mode);
      if (level > maxEnforcementLevel) {
        maxEnforcementLevel = level;
        merged.enforcement.mode = policy.enforcement.mode;
      }
    });

    return merged;
  }

  /**
   * Normalize policy data by applying defaults and validating rules
   */
  private normalizePolicy(policyData: any): EthicsPolicy {
    // Apply defaults
    const policy: EthicsPolicy = {
      ...policyData,
      enabled: policyData.enabled !== undefined ? policyData.enabled : true,
      metadata: policyData.metadata || {
        author: 'Unknown',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        compliance: [],
        tags: []
      }
    };

    // Normalize rules
    policy.rules = policy.rules.map(rule => ({
      ...rule,
      enabled: rule.enabled !== undefined ? rule.enabled : true,
      flags: rule.flags || 'gi',
      weight: rule.weight !== undefined ? rule.weight : 0.5,
      contexts: rule.contexts || [],
      exceptions: rule.exceptions || []
    }));

    // Validate regex patterns
    policy.rules.forEach(rule => {
      try {
        new RegExp(rule.pattern, rule.flags);
      } catch (error) {
        throw new Error(`Invalid regex pattern in rule ${rule.id}: ${rule.pattern}`);
      }
    });

    return policy;
  }

  /**
   * Export policy to YAML format
   */
  public exportPolicy(policy: EthicsPolicy): string {
    return yaml.stringify(policy, {
      indent: 2,
      lineWidth: 120,
      minContentWidth: 40
    });
  }

  /**
   * Create a default enterprise policy
   */
  public createDefaultPolicy(): EthicsPolicy {
    return {
      name: 'enterprise-default',
      version: '1.0.0',
      description: 'Default enterprise ethics policy',
      enabled: true,
      rules: [
        {
          id: 'no-nationality-discrimination',
          name: 'No Nationality Discrimination',
          description: 'Prevents discrimination based on nationality or country of origin',
          category: 'discrimination',
          severity: 'critical',
          enabled: true,
          pattern: '(?:if|filter|where)\\s*\\(\\s*(?:user|person|applicant)\\.(?:nationality|country|citizenship)\\s*[!=<>]+',
          flags: 'gi',
          weight: 0.95,
          contexts: ['production', 'staging'],
          exceptions: ['test', 'demo'],
          recommendation: 'Remove discriminatory filters based on nationality or country of origin'
        },
        {
          id: 'no-surveillance-without-consent',
          name: 'No Surveillance Without Consent',
          description: 'Requires explicit consent for surveillance capabilities',
          category: 'surveillance',
          severity: 'high',
          enabled: true,
          pattern: '(?:navigator\\.geolocation|getUserMedia|camera|video)',
          flags: 'gi',
          weight: 0.8,
          contexts: ['production'],
          exceptions: ['test'],
          recommendation: 'Implement explicit user consent for surveillance features'
        }
      ],
      thresholds: {
        surveillance: 0.7,
        discrimination: 0.3,
        privacy: 0.6,
        misuse: 0.5,
        manipulation: 0.7,
        overall: 0.6
      },
      enforcement: {
        mode: 'error',
        autoFix: false,
        notifications: true,
        auditLog: true
      },
      metadata: {
        author: 'Ethics Engine',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        compliance: ['GDPR', 'CCPA', 'SOX'],
        tags: ['default', 'enterprise']
      }
    };
  }
}
