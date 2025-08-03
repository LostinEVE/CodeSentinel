/**
 * Core Ethics Engine - Original TrustLedger-Derived Risk Assessment
 * Implements enterprise-grade ethical code analysis algorithms
 */

export interface EthicalRiskMetrics {
  surveillanceRisk: number;
  discriminationRisk: number;
  privacyViolationRisk: number;
  misuseRisk: number;
  manipulationRisk: number;
  overallEthicsScore: number;
}

export interface EthicalViolation {
  id: string;
  type: keyof Omit<EthicalRiskMetrics, 'overallEthicsScore'>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  line: number;
  column: number;
  message: string;
  codeSnippet: string;
  recommendation: string;
  confidence: number;
}

export interface AnalysisContext {
  content: string;
  fileName: string;
  language: 'javascript' | 'typescript' | 'python';
  projectContext?: string;
}

/**
 * Original Ethical Pattern Detection Rules
 * Based on TrustLedger methodology with enterprise-specific adaptations
 */
interface EthicalPattern {
  id: string;
  pattern: RegExp;
  riskType: keyof Omit<EthicalRiskMetrics, 'overallEthicsScore'>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  description: string;
  recommendation: string;
  contextDependent: boolean;
}

export class EthicsEngine {
  private readonly patterns: EthicalPattern[] = [
    // Surveillance and Tracking Patterns
    {
      id: 'surveillance-location',
      pattern: /(?:navigator\.geolocation|getCurrentPosition|watchPosition)/gi,
      riskType: 'surveillanceRisk',
      severity: 'medium',
      weight: 0.6,
      description: 'Location tracking capability detected',
      recommendation: 'Ensure explicit user consent and legitimate purpose for location access',
      contextDependent: true
    },
    {
      id: 'surveillance-camera',
      pattern: /(?:getUserMedia|camera|video|mediaDevices)/gi,
      riskType: 'surveillanceRisk',
      severity: 'high',
      weight: 0.8,
      description: 'Camera/media access detected',
      recommendation: 'Implement clear permission requests and usage notifications',
      contextDependent: true
    },
    {
      id: 'surveillance-tracking',
      pattern: /(?:track|monitor|log)(?:User|Activity|Behavior|Action)/gi,
      riskType: 'surveillanceRisk',
      severity: 'medium',
      weight: 0.7,
      description: 'User activity tracking detected',
      recommendation: 'Ensure tracking is transparent and consensual',
      contextDependent: false
    },

    // Discrimination Patterns (Critical - This is our sample violation)
    {
      id: 'discrimination-nationality',
      pattern: /(?:if|filter|where)\s*\(\s*(?:user|person|applicant)\.(?:nationality|country|citizenship)\s*[!=<>]+\s*["'](?:china|russia|iran|syria|sudan|cuba|north\s*korea)["']/gi,
      riskType: 'discriminationRisk',
      severity: 'critical',
      weight: 0.95,
      description: 'Nationality-based discrimination filter detected',
      recommendation: 'Remove discriminatory filters based on nationality or country of origin',
      contextDependent: false
    },
    {
      id: 'discrimination-demographics',
      pattern: /(?:if|filter|where)\s*\(\s*(?:user|person|applicant)\.(?:race|gender|age|religion|ethnicity)\s*[!=<>]+/gi,
      riskType: 'discriminationRisk',
      severity: 'critical',
      weight: 0.9,
      description: 'Demographic-based discrimination detected',
      recommendation: 'Eliminate discriminatory logic based on protected characteristics',
      contextDependent: false
    },
    {
      id: 'discrimination-exclusion',
      pattern: /(?:exclude|reject|deny|block)\s*(?:if|when)\s*(?:user|person)\.(?:nationality|race|gender|religion)/gi,
      riskType: 'discriminationRisk',
      severity: 'critical',
      weight: 0.92,
      description: 'Explicit exclusion based on protected characteristics',
      recommendation: 'Remove exclusionary logic based on protected attributes',
      contextDependent: false
    },

    // Privacy Violation Patterns
    {
      id: 'privacy-sensitive-data',
      pattern: /(?:ssn|social\s*security|credit\s*card|passport|driver\s*license)\s*[:=]/gi,
      riskType: 'privacyViolationRisk',
      severity: 'high',
      weight: 0.85,
      description: 'Sensitive personal data handling detected',
      recommendation: 'Implement proper encryption and data protection measures',
      contextDependent: true
    },
    {
      id: 'privacy-unencrypted',
      pattern: /(?:password|secret|key|token)\s*[:=]\s*["'][^"']*["']\s*;?\s*\/\/\s*(?:plain|unencrypted|clear)/gi,
      riskType: 'privacyViolationRisk',
      severity: 'critical',
      weight: 0.9,
      description: 'Unencrypted sensitive data storage',
      recommendation: 'Use proper encryption for sensitive data storage',
      contextDependent: false
    },

    // Misuse Patterns
    {
      id: 'misuse-backdoor',
      pattern: /(?:if|when)\s*\(\s*(?:user|username|email)\s*===?\s*["'](?:admin|root|backdoor|debug)["']\s*\)\s*{[^}]*(?:bypass|skip|allow)/gi,
      riskType: 'misuseRisk',
      severity: 'critical',
      weight: 0.95,
      description: 'Potential backdoor or bypass mechanism',
      recommendation: 'Remove hardcoded authentication bypasses',
      contextDependent: false
    },
    {
      id: 'misuse-injection',
      pattern: /(?:eval|exec|system|shell_exec)\s*\(\s*(?:\$_|request\.|params\.|input)/gi,
      riskType: 'misuseRisk',
      severity: 'critical',
      weight: 0.9,
      description: 'Code injection vulnerability',
      recommendation: 'Sanitize input and use parameterized queries',
      contextDependent: false
    },

    // Manipulation Patterns
    {
      id: 'manipulation-dark-pattern',
      pattern: /(?:hidden|invisible|opacity:\s*0|display:\s*none).*(?:fee|charge|cost|price)/gi,
      riskType: 'manipulationRisk',
      severity: 'high',
      weight: 0.8,
      description: 'Potential dark pattern - hidden costs',
      recommendation: 'Ensure transparent disclosure of all costs and fees',
      contextDependent: true
    },
    {
      id: 'manipulation-deceptive',
      pattern: /(?:misleading|fake|deceptive|trick|fool)\s*(?:user|customer)/gi,
      riskType: 'manipulationRisk',
      severity: 'high',
      weight: 0.85,
      description: 'Deceptive user interaction detected',
      recommendation: 'Ensure honest and transparent user interactions',
      contextDependent: true
    }
  ];

  /**
   * Analyze code for ethical violations using original TrustLedger algorithm
   */
  public analyzeCode(context: AnalysisContext): {
    metrics: EthicalRiskMetrics;
    violations: EthicalViolation[];
  } {
    const violations: EthicalViolation[] = [];
    const metrics: EthicalRiskMetrics = {
      surveillanceRisk: 0,
      discriminationRisk: 0,
      privacyViolationRisk: 0,
      misuseRisk: 0,
      manipulationRisk: 0,
      overallEthicsScore: 1.0
    };

    // Apply pattern matching with contextual analysis
    for (const pattern of this.patterns) {
      const patternViolations = this.detectPatternViolations(context, pattern);
      violations.push(...patternViolations);

      // Update risk metrics using weighted accumulation
      if (patternViolations.length > 0) {
        const riskIncrease = this.calculateRiskIncrease(patternViolations, pattern);
        metrics[pattern.riskType] = Math.min(1.0, metrics[pattern.riskType] + riskIncrease);
      }
    }

    // Apply contextual risk adjustments
    this.applyContextualAdjustments(metrics, context);

    // Calculate overall ethics score using TrustLedger harmonic mean
    metrics.overallEthicsScore = this.calculateOverallEthicsScore(metrics);

    return { metrics, violations };
  }

  /**
   * Detect violations for a specific pattern
   */
  private detectPatternViolations(
    context: AnalysisContext,
    pattern: EthicalPattern
  ): EthicalViolation[] {
    const violations: EthicalViolation[] = [];
    const lines = context.content.split('\n');

    lines.forEach((line, lineIndex) => {
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      
      while ((match = regex.exec(line)) !== null) {
        // Apply contextual filtering if pattern is context-dependent
        if (pattern.contextDependent && !this.isViolationInValidContext(line, pattern, context)) {
          continue;
        }

        const confidence = this.calculateConfidence(match[0], pattern, context);
        
        violations.push({
          id: `${pattern.id}-${lineIndex}-${match.index}`,
          type: pattern.riskType,
          severity: pattern.severity,
          line: lineIndex + 1,
          column: match.index,
          message: pattern.description,
          codeSnippet: line.trim(),
          recommendation: pattern.recommendation,
          confidence
        });
      }
    });

    return violations;
  }

  /**
   * Calculate risk increase from detected violations
   */
  private calculateRiskIncrease(violations: EthicalViolation[], pattern: EthicalPattern): number {
    // Base risk from pattern weight
    let riskIncrease = pattern.weight * violations.length;

    // Apply severity multipliers
    const severityMultipliers = {
      'low': 0.3,
      'medium': 0.6,
      'high': 0.85,
      'critical': 1.0
    };

    riskIncrease *= severityMultipliers[pattern.severity];

    // Apply confidence weighting
    const avgConfidence = violations.reduce((sum, v) => sum + v.confidence, 0) / violations.length;
    riskIncrease *= avgConfidence;

    // Apply frequency dampening to prevent excessive penalties
    const frequencyDampening = Math.log(violations.length + 1) / Math.log(2);
    riskIncrease *= frequencyDampening;

    return Math.min(1.0, riskIncrease);
  }

  /**
   * Check if violation is in a valid context (e.g., not in tests or comments)
   */
  private isViolationInValidContext(
    line: string,
    pattern: EthicalPattern,
    context: AnalysisContext
  ): boolean {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('#')) {
      return false;
    }

    // Skip test files for certain patterns
    if (context.fileName.includes('test') || context.fileName.includes('spec')) {
      if (['surveillance-location', 'surveillance-camera'].includes(pattern.id)) {
        return false;
      }
    }

    // Skip documentation or example code
    if (line.includes('example') || line.includes('demo')) {
      return false;
    }

    return true;
  }

  /**
   * Calculate confidence score for a detected violation
   */
  private calculateConfidence(
    match: string,
    pattern: EthicalPattern,
    context: AnalysisContext
  ): number {
    let confidence = 0.8; // Base confidence

    // Increase confidence for exact matches
    if (match.length > 10) {
      confidence += 0.1;
    }

    // Adjust based on context
    if (context.fileName.includes('prod') || context.fileName.includes('main')) {
      confidence += 0.1;
    }

    // Language-specific adjustments
    if (context.language === 'python' && pattern.pattern.source.includes('\\(')) {
      confidence += 0.05;
    }

    return Math.min(1.0, confidence);
  }

  /**
   * Apply contextual adjustments to risk metrics
   */
  private applyContextualAdjustments(metrics: EthicalRiskMetrics, context: AnalysisContext): void {
    // File type adjustments
    if (context.fileName.includes('test') || context.fileName.includes('spec')) {
      // Reduce all risks for test files
      Object.keys(metrics).forEach(key => {
        if (key !== 'overallEthicsScore') {
          (metrics as any)[key] *= 0.5;
        }
      });
    }

    // Language-specific adjustments
    if (context.language === 'python') {
      metrics.privacyViolationRisk *= 1.1; // Python often handles sensitive data
    } else if (context.language === 'javascript' || context.language === 'typescript') {
      metrics.surveillanceRisk *= 1.1; // JS often has browser APIs
    }

    // Project context adjustments
    if (context.projectContext?.includes('financial') || context.projectContext?.includes('healthcare')) {
      metrics.privacyViolationRisk *= 1.2;
      metrics.discriminationRisk *= 1.3;
    }
  }

  /**
   * Calculate overall ethics score using TrustLedger harmonic mean methodology
   */
  private calculateOverallEthicsScore(metrics: EthicalRiskMetrics): number {
    const riskComponents = [
      metrics.surveillanceRisk,
      metrics.discriminationRisk,
      metrics.privacyViolationRisk,
      metrics.misuseRisk,
      metrics.manipulationRisk
    ];

    // Weights emphasize discrimination and misuse as most critical
    const weights = [0.15, 0.35, 0.25, 0.2, 0.05];
    
    // Calculate weighted harmonic mean (penalizes high individual risks)
    const weightedSum = riskComponents.reduce((sum, risk, index) => {
      return sum + weights[index] / (1 - risk + 0.001); // Small epsilon to prevent division by zero
    }, 0);
    
    const harmonicMean = weights.reduce((sum, weight) => sum + weight, 0) / weightedSum;
    
    return Math.max(0, Math.min(1, harmonicMean));
  }

  /**
   * Generate detailed analysis report
   */
  public generateReport(
    context: AnalysisContext,
    metrics: EthicalRiskMetrics,
    violations: EthicalViolation[]
  ): string {
    let report = `Ethical Analysis Report for ${context.fileName}\n`;
    report += `${'='.repeat(50)}\n\n`;
    
    report += `Overall Ethics Score: ${(metrics.overallEthicsScore * 100).toFixed(1)}%\n\n`;
    
    report += `Risk Breakdown:\n`;
    report += `• Surveillance Risk: ${(metrics.surveillanceRisk * 100).toFixed(1)}%\n`;
    report += `• Discrimination Risk: ${(metrics.discriminationRisk * 100).toFixed(1)}%\n`;
    report += `• Privacy Violation Risk: ${(metrics.privacyViolationRisk * 100).toFixed(1)}%\n`;
    report += `• Misuse Risk: ${(metrics.misuseRisk * 100).toFixed(1)}%\n`;
    report += `• Manipulation Risk: ${(metrics.manipulationRisk * 100).toFixed(1)}%\n\n`;
    
    if (violations.length > 0) {
      report += `Violations Found (${violations.length}):\n`;
      report += `${'-'.repeat(30)}\n`;
      
      violations.forEach((violation, index) => {
        report += `${index + 1}. [${violation.severity.toUpperCase()}] Line ${violation.line}\n`;
        report += `   ${violation.message}\n`;
        report += `   Code: ${violation.codeSnippet}\n`;
        report += `   Recommendation: ${violation.recommendation}\n`;
        report += `   Confidence: ${(violation.confidence * 100).toFixed(1)}%\n\n`;
      });
    } else {
      report += `No ethical violations detected.\n`;
    }
    
    return report;
  }
}
