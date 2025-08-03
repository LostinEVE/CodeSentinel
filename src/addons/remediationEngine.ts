/**
 * Ethical Remediation Engine - Auto-suggest Policy-Compliant Fixes
 * Enterprise-grade automated remediation with YAML policy compliance
 */

import { EthicalViolation, AnalysisContext } from '../core/ethicsEngine';
import { EthicsPolicy, EthicsRule } from '../core/policyLoader';
import { LLMIntegration } from '../llm/llmIntegration';

export interface RemediationSuggestion {
  id: string;
  violationId: string;
  type: 'automated' | 'llm_assisted' | 'manual_guidance';
  confidence: number;
  originalCode: string;
  suggestedCode: string;
  explanation: string;
  policyCompliance: PolicyComplianceCheck;
  riskReduction: number; // Expected risk reduction (0-1)
  effort: 'low' | 'medium' | 'high' | 'critical_review';
}

export interface PolicyComplianceCheck {
  compliantWithPolicy: boolean;
  applicableRules: string[];
  potentialNewViolations: string[];
  complianceScore: number;
}

export interface RemediationContext {
  violation: EthicalViolation;
  codeContext: AnalysisContext;
  policy: EthicsPolicy;
  surroundingCode: string;
  projectMetadata: ProjectMetadata;
}

export interface ProjectMetadata {
  type: 'financial' | 'healthcare' | 'education' | 'social' | 'enterprise' | 'other';
  compliance: string[];
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  industry: string;
}

/**
 * Core Remediation Engine with Original Heuristic-Based Fix Generation
 */
export class EthicalRemediationEngine {
  private llmIntegration: LLMIntegration;
  private remediationPatterns: RemediationPattern[] = [];

  constructor(llmIntegration: LLMIntegration) {
    this.llmIntegration = llmIntegration;
    this.initializeRemediationPatterns();
  }

  /**
   * Generate comprehensive remediation suggestions for a violation
   */
  public async generateRemediation(context: RemediationContext): Promise<RemediationSuggestion[]> {
    const suggestions: RemediationSuggestion[] = [];

    // 1. Try automated pattern-based remediation
    const automatedSuggestions = this.generateAutomatedRemediation(context);
    suggestions.push(...automatedSuggestions);

    // 2. Generate LLM-assisted suggestions if enabled
    if (this.llmIntegration.isEnabled()) {
      try {
        const llmSuggestions = await this.generateLLMAssistedRemediation(context);
        suggestions.push(...llmSuggestions);
      } catch (error) {
        console.warn('LLM-assisted remediation failed:', error);
      }
    }

    // 3. Add manual guidance for complex violations
    const manualGuidance = this.generateManualGuidance(context);
    suggestions.push(...manualGuidance);

    // 4. Validate all suggestions against policy
    return this.validateAndRankSuggestions(suggestions, context);
  }

  /**
   * Generate automated remediation using pattern matching
   */
  private generateAutomatedRemediation(context: RemediationContext): RemediationSuggestion[] {
    const suggestions: RemediationSuggestion[] = [];
    const violation = context.violation;

    // Find applicable remediation patterns
    const applicablePatterns = this.remediationPatterns.filter(pattern => 
      pattern.violationType === violation.type &&
      pattern.severity === violation.severity
    );

    for (const pattern of applicablePatterns) {
      const suggestion = this.applyRemediationPattern(pattern, context);
      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  /**
   * Apply a specific remediation pattern to generate a fix
   */
  private applyRemediationPattern(
    pattern: RemediationPattern, 
    context: RemediationContext
  ): RemediationSuggestion | null {
    const violation = context.violation;
    let suggestedCode = violation.codeSnippet;
    let explanation = pattern.explanation;

    // Apply pattern-specific transformations
    switch (pattern.id) {
      case 'remove-nationality-filter':
        suggestedCode = this.removeNationalityFilter(violation.codeSnippet);
        break;
      
      case 'add-consent-request':
        suggestedCode = this.addConsentRequest(violation.codeSnippet, context);
        break;
      
      case 'encrypt-sensitive-data':
        suggestedCode = this.addEncryption(violation.codeSnippet, context);
        break;
      
      case 'remove-auth-bypass':
        suggestedCode = this.removeAuthBypass(violation.codeSnippet);
        break;
      
      case 'make-fees-transparent':
        suggestedCode = this.makeFeesTransparent(violation.codeSnippet);
        break;
      
      default:
        return null;
    }

    if (suggestedCode === violation.codeSnippet) {
      return null; // No change made
    }

    // Calculate policy compliance
    const policyCompliance = this.checkPolicyCompliance(suggestedCode, context);
    
    return {
      id: `auto-${pattern.id}-${Date.now()}`,
      violationId: violation.id,
      type: 'automated',
      confidence: pattern.confidence,
      originalCode: violation.codeSnippet,
      suggestedCode,
      explanation,
      policyCompliance,
      riskReduction: pattern.expectedRiskReduction,
      effort: pattern.effort
    };
  }

  /**
   * Remove nationality-based filtering discrimination
   */
  private removeNationalityFilter(code: string): string {
    // Pattern 1: Direct nationality comparison
    let fixed = code.replace(
      /if\s*\(\s*(?:user|person|applicant)\.(?:nationality|country|citizenship)\s*[!=<>]+\s*["'][^"']*["']\s*\)/gi,
      '// Removed discriminatory nationality filter - implement legitimate criteria instead'
    );

    // Pattern 2: Nationality-based filtering in arrays
    fixed = fixed.replace(
      /\.filter\s*\(\s*\w+\s*=>\s*\w+\.(?:nationality|country|citizenship)\s*[!=<>]+\s*["'][^"']*["']\s*\)/gi,
      '.filter(item => /* Add legitimate filtering criteria here */)'
    );

    // Pattern 3: Switch statements on nationality
    fixed = fixed.replace(
      /switch\s*\(\s*(?:user|person|applicant)\.(?:nationality|country|citizenship)\s*\)/gi,
      '// Removed discriminatory nationality switch - implement business logic based on legitimate criteria'
    );

    return fixed;
  }

  /**
   * Add consent request for surveillance capabilities
   */
  private addConsentRequest(code: string, context: RemediationContext): string {
    const language = context.codeContext.language;
    
    if (code.includes('navigator.geolocation')) {
      if (language === 'javascript' || language === 'typescript') {
        return `// Request explicit user consent before location access
const userConsent = await requestLocationConsent();
if (userConsent.granted) {
  ${code}
} else {
  console.log('Location access denied by user');
}`;
      }
    }

    if (code.includes('getUserMedia') || code.includes('mediaDevices')) {
      if (language === 'javascript' || language === 'typescript') {
        return `// Request explicit camera/microphone consent
const mediaConsent = await requestMediaConsent();
if (mediaConsent.granted) {
  ${code}
} else {
  console.log('Media access denied by user');
}`;
      }
    }

    return code;
  }

  /**
   * Add encryption for sensitive data
   */
  private addEncryption(code: string, context: RemediationContext): string {
    const language = context.codeContext.language;

    // Handle password storage
    if (code.includes('password') && code.includes('=')) {
      if (language === 'javascript' || language === 'typescript') {
        return code.replace(
          /(\w+\.password\s*=\s*)([^;]+)(;?)/g,
          '$1await encryptPassword($2)$3 // Encrypted sensitive data'
        );
      } else if (language === 'python') {
        return code.replace(
          /(\w+\.password\s*=\s*)([^;\n]+)/g,
          '$1encrypt_password($2)  # Encrypted sensitive data'
        );
      }
    }

    // Handle SSN storage
    if (code.includes('ssn') || code.includes('socialSecurityNumber')) {
      if (language === 'javascript' || language === 'typescript') {
        return code.replace(
          /(\w+\.ssn\s*=\s*)([^;]+)(;?)/g,
          '$1await encryptPII($2)$3 // Encrypted PII data'
        );
      }
    }

    return code;
  }

  /**
   * Remove authentication bypass vulnerabilities
   */
  private removeAuthBypass(code: string): string {
    // Remove hardcoded admin credentials
    let fixed = code.replace(
      /if\s*\(\s*(?:user|username|email)\s*===?\s*["'](?:admin|root|backdoor|debug)["']\s*(?:&&[^)]*)*\s*\)\s*{[^}]*(?:bypass|skip|allow)[^}]*}/gi,
      '// Removed hardcoded authentication bypass - implement proper authentication'
    );

    // Remove eval with user input
    fixed = fixed.replace(
      /eval\s*\(\s*(?:user\s*input|request\.|params\.|input)[^)]*\)/gi,
      '// Removed dangerous eval - use safe input validation instead'
    );

    return fixed;
  }

  /**
   * Make hidden fees transparent
   */
  private makeFeesTransparent(code: string): string {
    // Remove hidden styling from fee elements
    let fixed = code.replace(
      /(?:hidden|invisible|opacity:\s*0|display:\s*none)([^}]*(?:fee|charge|cost|price)[^}]*)/gi,
      'visible$1 // Made fee transparent to user'
    );

    // Add transparency comments to hidden fee calculations
    fixed = fixed.replace(
      /(const\s+\w*(?:hidden|secret)\w*(?:fee|charge|cost)\s*=\s*[^;]+;?)/gi,
      '$1 // TODO: Display this fee transparently to users'
    );

    return fixed;
  }

  /**
   * Generate LLM-assisted remediation suggestions
   */
  private async generateLLMAssistedRemediation(context: RemediationContext): Promise<RemediationSuggestion[]> {
    const prompt = this.buildLLMRemediationPrompt(context);
    
    try {
      const analysis = await this.llmIntegration.analyzeEthicalContext(
        context.codeContext.content,
        context.violation,
        prompt
      );

      return this.parseLLMRemediationResponse(analysis, context);
    } catch (error) {
      console.error('LLM remediation failed:', error);
      return [];
    }
  }

  /**
   * Map violation type to policy category
   */
  private mapViolationTypeToCategory(violationType: string): string {
    switch (violationType) {
      case 'surveillanceRisk': return 'surveillance';
      case 'discriminationRisk': return 'discrimination';
      case 'privacyViolationRisk': return 'privacy';
      case 'misuseRisk': return 'misuse';
      case 'manipulationRisk': return 'manipulation';
      default: return violationType;
    }
  }

  /**
   * Build LLM prompt for remediation assistance
   */
  private buildLLMRemediationPrompt(context: RemediationContext): string {
    const category = this.mapViolationTypeToCategory(context.violation.type);
    
    return `You are an expert in ethical software development and code remediation. 

**Context:**
- Project Type: ${context.projectMetadata.type}
- Industry: ${context.projectMetadata.industry}
- Compliance Requirements: ${context.projectMetadata.compliance.join(', ')}
- Sensitivity Level: ${context.projectMetadata.sensitivityLevel}

**Violation:**
Type: ${context.violation.type}
Severity: ${context.violation.severity}
Message: ${context.violation.message}
Code: ${context.violation.codeSnippet}

**Policy Rules:**
${context.policy.rules.filter(rule => rule.category === category).map(rule => 
  `- ${rule.name}: ${rule.recommendation}`
).join('\n')}

Please provide 2-3 specific code remediation suggestions that:
1. Fix the ethical violation completely
2. Maintain functionality where appropriate
3. Follow enterprise best practices
4. Comply with the specified industry regulations

Format your response as JSON:
{
  "suggestions": [
    {
      "code": "fixed code here",
      "explanation": "why this fixes the issue",
      "confidence": 0.9,
      "riskReduction": 0.8,
      "effort": "low|medium|high"
    }
  ]
}`;
  }

  /**
   * Parse LLM response into remediation suggestions
   */
  private parseLLMRemediationResponse(response: string, context: RemediationContext): RemediationSuggestion[] {
    try {
      const parsed = JSON.parse(response);
      return parsed.suggestions.map((suggestion: any, index: number) => ({
        id: `llm-${context.violation.id}-${index}`,
        violationId: context.violation.id,
        type: 'llm_assisted' as const,
        confidence: suggestion.confidence || 0.7,
        originalCode: context.violation.codeSnippet,
        suggestedCode: suggestion.code,
        explanation: suggestion.explanation,
        policyCompliance: this.checkPolicyCompliance(suggestion.code, context),
        riskReduction: suggestion.riskReduction || 0.6,
        effort: suggestion.effort || 'medium'
      }));
    } catch (error) {
      console.error('Failed to parse LLM remediation response:', error);
      return [];
    }
  }

  /**
   * Generate manual guidance for complex violations
   */
  private generateManualGuidance(context: RemediationContext): RemediationSuggestion[] {
    const guidance = this.getManualGuidanceForViolation(context.violation);
    
    if (!guidance) {
      return [];
    }

    return [{
      id: `manual-${context.violation.id}`,
      violationId: context.violation.id,
      type: 'manual_guidance',
      confidence: 0.8,
      originalCode: context.violation.codeSnippet,
      suggestedCode: '// Manual review required - see explanation',
      explanation: guidance,
      policyCompliance: {
        compliantWithPolicy: false,
        applicableRules: [],
        potentialNewViolations: [],
        complianceScore: 0
      },
      riskReduction: 0.9,
      effort: 'critical_review'
    }];
  }

  /**
   * Get manual guidance for specific violation types
   */
  private getManualGuidanceForViolation(violation: EthicalViolation): string | null {
    switch (violation.type) {
      case 'discriminationRisk':
        return `CRITICAL MANUAL REVIEW REQUIRED:
        
1. Review business logic for legitimate, non-discriminatory criteria
2. Consult legal team on protected characteristics compliance
3. Implement alternative logic based on business requirements
4. Document decision rationale for audit purposes
5. Test with diverse user scenarios to prevent bias

Example alternatives:
- Geographic restrictions based on service availability
- Risk assessment based on verifiable criteria
- Feature availability based on user preferences`;

      case 'surveillanceRisk':
        return `PRIVACY COMPLIANCE REVIEW:
        
1. Implement explicit user consent mechanisms
2. Provide clear data usage disclosure
3. Allow users to opt-out of tracking
4. Implement data minimization principles
5. Add user control dashboard for privacy settings

Compliance considerations:
- GDPR Article 6 (lawful basis) and Article 7 (consent)
- CCPA consumer rights and transparency requirements`;

      case 'misuseRisk':
        return `SECURITY REVIEW REQUIRED:
        
1. Remove all hardcoded credentials and bypasses
2. Implement proper authentication flows
3. Add security logging and monitoring
4. Conduct security audit of affected components
5. Review access control mechanisms

Critical actions:
- Change all related credentials immediately
- Audit access logs for potential misuse
- Implement least-privilege access principles`;

      default:
        return null;
    }
  }

  /**
   * Check policy compliance of suggested code
   */
  private checkPolicyCompliance(code: string, context: RemediationContext): PolicyComplianceCheck {
    const policy = context.policy;
    const applicableRules: string[] = [];
    const potentialNewViolations: string[] = [];
    let complianceScore = 1.0;
    const category = this.mapViolationTypeToCategory(context.violation.type);

    // Check each policy rule against the suggested code
    for (const rule of policy.rules) {
      if (rule.enabled) {
        const regex = new RegExp(rule.pattern, rule.flags);
        if (regex.test(code)) {
          potentialNewViolations.push(rule.id);
          complianceScore -= rule.weight * 0.1;
        } else if (rule.category === category) {
          applicableRules.push(rule.id);
        }
      }
    }

    return {
      compliantWithPolicy: potentialNewViolations.length === 0,
      applicableRules,
      potentialNewViolations,
      complianceScore: Math.max(0, complianceScore)
    };
  }

  /**
   * Validate and rank suggestions by effectiveness and compliance
   */
  private validateAndRankSuggestions(
    suggestions: RemediationSuggestion[], 
    context: RemediationContext
  ): RemediationSuggestion[] {
    // Filter out non-compliant suggestions
    const compliantSuggestions = suggestions.filter(s => s.policyCompliance.compliantWithPolicy);

    // Rank by composite score: risk reduction * confidence * compliance score
    return compliantSuggestions.sort((a, b) => {
      const scoreA = a.riskReduction * a.confidence * a.policyCompliance.complianceScore;
      const scoreB = b.riskReduction * b.confidence * b.policyCompliance.complianceScore;
      return scoreB - scoreA;
    });
  }

  /**
   * Initialize predefined remediation patterns
   */
  private initializeRemediationPatterns(): void {
    this.remediationPatterns = [
      {
        id: 'remove-nationality-filter',
        violationType: 'discriminationRisk',
        severity: 'critical',
        confidence: 0.9,
        expectedRiskReduction: 0.95,
        effort: 'medium',
        explanation: 'Remove discriminatory nationality-based filtering and replace with legitimate business criteria'
      },
      {
        id: 'add-consent-request',
        violationType: 'surveillanceRisk',
        severity: 'high',
        confidence: 0.85,
        expectedRiskReduction: 0.8,
        effort: 'medium',
        explanation: 'Add explicit user consent mechanism before accessing sensitive capabilities'
      },
      {
        id: 'encrypt-sensitive-data',
        violationType: 'privacyViolationRisk',
        severity: 'high',
        confidence: 0.9,
        expectedRiskReduction: 0.9,
        effort: 'low',
        explanation: 'Encrypt sensitive data using industry-standard encryption methods'
      },
      {
        id: 'remove-auth-bypass',
        violationType: 'misuseRisk',
        severity: 'critical',
        confidence: 0.95,
        expectedRiskReduction: 0.95,
        effort: 'low',
        explanation: 'Remove hardcoded authentication bypasses and implement proper security controls'
      },
      {
        id: 'make-fees-transparent',
        violationType: 'manipulationRisk',
        severity: 'high',
        confidence: 0.8,
        expectedRiskReduction: 0.7,
        effort: 'low',
        explanation: 'Make all fees and charges transparent and clearly disclosed to users'
      }
    ];
  }
}

/**
 * Remediation pattern definition interface
 */
interface RemediationPattern {
  id: string;
  violationType: string;
  severity: string;
  confidence: number;
  expectedRiskReduction: number;
  effort: 'low' | 'medium' | 'high' | 'critical_review';
  explanation: string;
}
