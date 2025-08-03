/**
 * Git Pre-Commit Enforcement - Prevent Commits with Critical Ethical Violations
 * Enterprise-grade Git integration with compliance reporting and PR badges
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { EthicsEngine, EthicalViolation, AnalysisContext } from '../core/ethicsEngine';
import { PolicyLoader } from '../core/policyLoader';
import { TeamAwarenessEngine, AdjustedViolation } from './teamAwarenessEngine';

export interface PreCommitResult {
  allowed: boolean;
  violations: CommitViolation[];
  complianceReport: ComplianceReport;
  blockingReasons: string[];
  warnings: string[];
  badge: ComplianceBadge;
}

export interface CommitViolation {
  file: string;
  line: number;
  violation: AdjustedViolation;
  isBlocking: boolean;
  canBeOverridden: boolean;
  overrideReason?: string;
}

export interface ComplianceReport {
  id: string;
  timestamp: Date;
  commitHash: string;
  author: string;
  filesScanned: number;
  violationsFound: number;
  criticalViolations: number;
  complianceScore: number;
  industryCompliance: IndustryComplianceCheck[];
  recommendations: string[];
  reviewRequirements: ReviewRequirement[];
}

export interface IndustryComplianceCheck {
  standard: string; // GDPR, CCPA, SOX, HIPAA, etc.
  compliant: boolean;
  violations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface ReviewRequirement {
  type: 'security' | 'legal' | 'ethics' | 'compliance';
  reviewer: string;
  deadline: Date;
  mandatory: boolean;
  reason: string;
}

export interface ComplianceBadge {
  status: 'passing' | 'warning' | 'failing' | 'blocked';
  score: number;
  text: string;
  color: string;
  details: string[];
}

export interface HookConfiguration {
  enablePreCommit: boolean;
  enablePrePush: boolean;
  blockOnCritical: boolean;
  requireReviewForHigh: boolean;
  allowOverride: boolean;
  overrideRequiresApproval: boolean;
  complianceReporting: boolean;
  webhookUrl?: string;
  slackChannel?: string;
}

/**
 * Git Pre-Commit Enforcement Engine with Enterprise Integration
 */
export class GitPreCommitEnforcement {
  private ethicsEngine: EthicsEngine;
  private policyLoader: PolicyLoader;
  private teamAwareness: TeamAwarenessEngine;
  private configuration: HookConfiguration;

  constructor(
    ethicsEngine: EthicsEngine,
    policyLoader: PolicyLoader,
    teamAwareness: TeamAwarenessEngine
  ) {
    this.ethicsEngine = ethicsEngine;
    this.policyLoader = policyLoader;
    this.teamAwareness = teamAwareness;
    this.configuration = this.loadConfiguration();
  }

  /**
   * Main pre-commit hook entry point
   */
  public async executePreCommitHook(workspacePath: string): Promise<PreCommitResult> {
    const stagedFiles = this.getStagedFiles(workspacePath);
    const relevantFiles = this.filterRelevantFiles(stagedFiles);
    
    if (relevantFiles.length === 0) {
      return this.createPassingResult();
    }

    // Scan staged files for violations
    const allViolations: CommitViolation[] = [];
    
    for (const file of relevantFiles) {
      const fileViolations = await this.scanFileForViolations(file, workspacePath);
      allViolations.push(...fileViolations);
    }

    // Generate compliance report
    const complianceReport = await this.generateComplianceReport(
      allViolations,
      workspacePath,
      relevantFiles
    );

    // Determine if commit should be blocked
    const blockingReasons = this.determineBlockingReasons(allViolations);
    const warnings = this.generateWarnings(allViolations);
    const allowed = blockingReasons.length === 0;

    // Generate compliance badge
    const badge = this.generateComplianceBadge(complianceReport, allowed);

    // Send notifications if configured
    if (this.configuration.complianceReporting) {
      await this.sendComplianceNotification(complianceReport, allowed);
    }

    return {
      allowed,
      violations: allViolations,
      complianceReport,
      blockingReasons,
      warnings,
      badge
    };
  }

  /**
   * Install Git hooks in the repository
   */
  public installGitHooks(workspacePath: string): void {
    const hooksDir = path.join(workspacePath, '.git', 'hooks');
    
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    if (this.configuration.enablePreCommit) {
      this.installPreCommitHook(hooksDir);
    }

    if (this.configuration.enablePrePush) {
      this.installPrePushHook(hooksDir);
    }

    // Install package.json hook integration for Husky compatibility
    this.installHuskyIntegration(workspacePath);
  }

  /**
   * Generate Husky-compatible hook configuration
   */
  public generateHuskyConfig(): string {
    return JSON.stringify({
      "husky": {
        "hooks": {
          "pre-commit": "npx ethics-engine pre-commit",
          "pre-push": "npx ethics-engine pre-push"
        }
      }
    }, null, 2);
  }

  /**
   * Generate compliance report for CI/CD integration
   */
  public async generateCIReport(
    workspacePath: string,
    format: 'json' | 'junit' | 'sonar' | 'markdown' = 'json'
  ): Promise<string> {
    const allFiles = this.getAllSourceFiles(workspacePath);
    const allViolations: CommitViolation[] = [];

    for (const file of allFiles) {
      const fileViolations = await this.scanFileForViolations(file, workspacePath);
      allViolations.push(...fileViolations);
    }

    const complianceReport = await this.generateComplianceReport(
      allViolations,
      workspacePath,
      allFiles
    );

    switch (format) {
      case 'junit':
        return this.generateJUnitReport(complianceReport, allViolations);
      case 'sonar':
        return this.generateSonarReport(complianceReport, allViolations);
      case 'markdown':
        return this.generateMarkdownReport(complianceReport, allViolations);
      default:
        return JSON.stringify(complianceReport, null, 2);
    }
  }

  /**
   * Get list of staged files from Git
   */
  private getStagedFiles(workspacePath: string): string[] {
    try {
      const output = execSync('git diff --cached --name-only', {
        cwd: workspacePath,
        encoding: 'utf8'
      }).toString();

      return output.split('\n')
        .map(file => file.trim())
        .filter(file => file.length > 0)
        .map(file => path.join(workspacePath, file));
    } catch (error) {
      console.warn('Failed to get staged files:', error);
      return [];
    }
  }

  /**
   * Filter files to only include relevant source code files
   */
  private filterRelevantFiles(files: string[]): string[] {
    const relevantExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.c'];
    const excludePatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /target/,
      /\.test\./,
      /\.spec\./,
      /test/,
      /tests/,
      /__tests__/
    ];

    return files.filter(file => {
      // Check file extension
      const hasRelevantExtension = relevantExtensions.some(ext => file.endsWith(ext));
      if (!hasRelevantExtension) return false;

      // Check exclude patterns
      const isExcluded = excludePatterns.some(pattern => pattern.test(file));
      return !isExcluded;
    });
  }

  /**
   * Scan individual file for ethical violations
   */
  private async scanFileForViolations(
    filePath: string,
    workspacePath: string
  ): Promise<CommitViolation[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const language = this.detectLanguage(filePath);
      
      const analysisContext: AnalysisContext = {
        content,
        fileName: path.basename(filePath),
        language,
        projectContext: path.basename(workspacePath)
      };

      const analysis = this.ethicsEngine.analyzeCode(analysisContext);
      
      // Apply team awareness adjustments
      const adjustedViolations = await this.teamAwareness.adjustViolationsForDeveloper(
        analysis.violations,
        workspacePath
      );

      return adjustedViolations.map(violation => ({
        file: path.relative(workspacePath, filePath),
        line: violation.line,
        violation,
        isBlocking: this.isViolationBlocking(violation),
        canBeOverridden: this.canViolationBeOverridden(violation),
        overrideReason: undefined
      }));
    } catch (error) {
      console.error(`Failed to scan file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(filePath: string): 'javascript' | 'typescript' | 'python' {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.py':
        return 'python';
      default:
        return 'javascript';
    }
  }

  /**
   * Determine if violation should block the commit
   */
  private isViolationBlocking(violation: AdjustedViolation): boolean {
    if (!this.configuration.blockOnCritical) {
      return false;
    }

    // Block critical violations
    if (violation.adjustedSeverity === 'critical') {
      return true;
    }

    // Block high violations that require review in certain roles
    if (violation.adjustedSeverity === 'high' && violation.requiresReview) {
      return this.configuration.requireReviewForHigh;
    }

    return false;
  }

  /**
   * Determine if violation can be overridden by developer
   */
  private canViolationBeOverridden(violation: AdjustedViolation): boolean {
    if (!this.configuration.allowOverride) {
      return false;
    }

    // Critical violations cannot be overridden
    if (violation.adjustedSeverity === 'critical') {
      return false;
    }

    // Discrimination violations generally cannot be overridden
    if (violation.type === 'discriminationRisk') {
      return false;
    }

    return true;
  }

  /**
   * Generate comprehensive compliance report
   */
  private async generateComplianceReport(
    violations: CommitViolation[],
    workspacePath: string,
    filesScanned: string[]
  ): Promise<ComplianceReport> {
    const commitInfo = this.getLatestCommitInfo(workspacePath);
    const criticalViolations = violations.filter(v => v.violation.adjustedSeverity === 'critical').length;
    
    // Calculate compliance score (0-100)
    const totalViolations = violations.length;
    const baseScore = Math.max(0, 100 - (totalViolations * 5) - (criticalViolations * 20));
    const complianceScore = Math.min(100, baseScore);

    // Check industry compliance
    const industryCompliance = this.checkIndustryCompliance(violations);

    // Generate recommendations
    const recommendations = this.generateRecommendations(violations);

    // Determine review requirements
    const reviewRequirements = this.determineReviewRequirements(violations);

    return {
      id: `ethics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      commitHash: commitInfo.hash,
      author: commitInfo.author,
      filesScanned: filesScanned.length,
      violationsFound: totalViolations,
      criticalViolations,
      complianceScore,
      industryCompliance,
      recommendations,
      reviewRequirements
    };
  }

  /**
   * Check compliance with industry standards
   */
  private checkIndustryCompliance(violations: CommitViolation[]): IndustryComplianceCheck[] {
    const standards = ['GDPR', 'CCPA', 'SOX', 'HIPAA', 'PCI-DSS'];
    
    return standards.map(standard => {
      const relevantViolations = this.getViolationsForStandard(violations, standard);
      const riskLevel = this.calculateRiskLevelForStandard(relevantViolations);
      
      return {
        standard,
        compliant: relevantViolations.length === 0,
        violations: relevantViolations.map(v => v.violation.message),
        riskLevel
      };
    });
  }

  /**
   * Get violations relevant to specific compliance standard
   */
  private getViolationsForStandard(violations: CommitViolation[], standard: string): CommitViolation[] {
    switch (standard) {
      case 'GDPR':
      case 'CCPA':
        return violations.filter(v => 
          v.violation.type === 'privacyViolationRisk' || 
          v.violation.type === 'surveillanceRisk' ||
          v.violation.type === 'discriminationRisk'
        );
      case 'SOX':
        return violations.filter(v => 
          v.violation.type === 'misuseRisk' ||
          v.violation.type === 'manipulationRisk'
        );
      case 'HIPAA':
        return violations.filter(v => 
          v.violation.type === 'privacyViolationRisk'
        );
      case 'PCI-DSS':
        return violations.filter(v => 
          v.violation.type === 'misuseRisk' ||
          v.violation.type === 'privacyViolationRisk'
        );
      default:
        return [];
    }
  }

  /**
   * Calculate risk level for compliance standard
   */
  private calculateRiskLevelForStandard(violations: CommitViolation[]): 'low' | 'medium' | 'high' | 'critical' {
    if (violations.length === 0) return 'low';
    
    const hasCritical = violations.some(v => v.violation.adjustedSeverity === 'critical');
    const hasHigh = violations.some(v => v.violation.adjustedSeverity === 'high');
    
    if (hasCritical) return 'critical';
    if (hasHigh) return 'high';
    if (violations.length > 5) return 'high';
    if (violations.length > 2) return 'medium';
    return 'low';
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(violations: CommitViolation[]): string[] {
    const recommendations: string[] = [];
    
    const violationsByType = this.groupViolationsByType(violations);
    
    Object.entries(violationsByType).forEach(([type, typeViolations]) => {
      if (typeViolations.length > 0) {
        recommendations.push(...this.getRecommendationsForType(type, typeViolations.length));
      }
    });

    // Add general recommendations
    if (violations.length > 10) {
      recommendations.push('Consider comprehensive ethics training for the development team');
    }

    if (violations.filter(v => v.violation.adjustedSeverity === 'critical').length > 0) {
      recommendations.push('Immediate review and remediation of critical violations required');
    }

    return recommendations;
  }

  /**
   * Group violations by type for analysis
   */
  private groupViolationsByType(violations: CommitViolation[]): { [key: string]: CommitViolation[] } {
    return violations.reduce((groups, violation) => {
      const type = violation.violation.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(violation);
      return groups;
    }, {} as { [key: string]: CommitViolation[] });
  }

  /**
   * Get recommendations for specific violation type
   */
  private getRecommendationsForType(type: string, count: number): string[] {
    switch (type) {
      case 'discriminationRisk':
        return [
          'Implement bias testing in your development process',
          'Review all conditional logic for potential discrimination',
          'Consult with legal team on discrimination compliance'
        ];
      case 'surveillanceRisk':
        return [
          'Implement explicit user consent mechanisms',
          'Review data collection practices for necessity',
          'Add privacy controls and user opt-out options'
        ];
      case 'privacyViolationRisk':
        return [
          'Implement data encryption for sensitive information',
          'Review data handling and storage practices',
          'Ensure compliance with privacy regulations'
        ];
      case 'misuseRisk':
        return [
          'Conduct security audit of authentication mechanisms',
          'Remove all hardcoded credentials and bypasses',
          'Implement proper access controls'
        ];
      case 'manipulationRisk':
        return [
          'Review user interface for transparency',
          'Ensure all fees and charges are clearly disclosed',
          'Implement honest user experience patterns'
        ];
      default:
        return [`Address ${count} ${type} violations`];
    }
  }

  /**
   * Determine review requirements for violations
   */
  private determineReviewRequirements(violations: CommitViolation[]): ReviewRequirement[] {
    const requirements: ReviewRequirement[] = [];
    
    const criticalViolations = violations.filter(v => v.violation.adjustedSeverity === 'critical');
    if (criticalViolations.length > 0) {
      requirements.push({
        type: 'ethics',
        reviewer: 'ethics-team@company.com',
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        mandatory: true,
        reason: `${criticalViolations.length} critical ethical violations detected`
      });
    }

    const discriminationViolations = violations.filter(v => v.violation.type === 'discriminationRisk');
    if (discriminationViolations.length > 0) {
      requirements.push({
        type: 'legal',
        reviewer: 'legal-team@company.com',
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
        mandatory: true,
        reason: 'Potential discrimination violations require legal review'
      });
    }

    return requirements;
  }

  /**
   * Determine reasons why commit should be blocked
   */
  private determineBlockingReasons(violations: CommitViolation[]): string[] {
    const reasons: string[] = [];
    
    const blockingViolations = violations.filter(v => v.isBlocking);
    
    if (blockingViolations.length > 0) {
      const criticalCount = blockingViolations.filter(v => v.violation.adjustedSeverity === 'critical').length;
      const highCount = blockingViolations.filter(v => v.violation.adjustedSeverity === 'high').length;
      
      if (criticalCount > 0) {
        reasons.push(`${criticalCount} critical ethical violation(s) must be resolved before commit`);
      }
      
      if (highCount > 0) {
        reasons.push(`${highCount} high-severity violation(s) require review before commit`);
      }
    }

    return reasons;
  }

  /**
   * Generate warnings for non-blocking violations
   */
  private generateWarnings(violations: CommitViolation[]): string[] {
    const warnings: string[] = [];
    
    const nonBlockingViolations = violations.filter(v => !v.isBlocking);
    const warningCount = nonBlockingViolations.filter(v => 
      v.violation.adjustedSeverity === 'medium' || v.violation.adjustedSeverity === 'high'
    ).length;
    
    if (warningCount > 0) {
      warnings.push(`${warningCount} ethical violations detected that should be addressed`);
    }

    const reviewRequiredCount = nonBlockingViolations.filter(v => v.violation.requiresReview).length;
    if (reviewRequiredCount > 0) {
      warnings.push(`${reviewRequiredCount} violations require team review`);
    }

    return warnings;
  }

  /**
   * Generate compliance badge for PR/commit status
   */
  private generateComplianceBadge(report: ComplianceReport, allowed: boolean): ComplianceBadge {
    let status: 'passing' | 'warning' | 'failing' | 'blocked';
    let color: string;
    
    if (!allowed) {
      status = 'blocked';
      color = '#e74c3c';
    } else if (report.criticalViolations > 0) {
      status = 'failing';
      color = '#e67e22';
    } else if (report.violationsFound > 0) {
      status = 'warning';
      color = '#f39c12';
    } else {
      status = 'passing';
      color = '#27ae60';
    }

    const text = `Ethics: ${report.complianceScore}%`;
    const details = [
      `Violations: ${report.violationsFound}`,
      `Critical: ${report.criticalViolations}`,
      `Files Scanned: ${report.filesScanned}`
    ];

    return {
      status,
      score: report.complianceScore,
      text,
      color,
      details
    };
  }

  /**
   * Get latest commit information
   */
  private getLatestCommitInfo(workspacePath: string): { hash: string; author: string } {
    try {
      const hash = execSync('git rev-parse HEAD', { cwd: workspacePath, encoding: 'utf8' }).trim();
      const author = execSync('git log -1 --format="%an <%ae>"', { cwd: workspacePath, encoding: 'utf8' }).trim();
      return { hash, author };
    } catch (error) {
      return { hash: 'unknown', author: 'unknown' };
    }
  }

  /**
   * Install pre-commit hook
   */
  private installPreCommitHook(hooksDir: string): void {
    const hookContent = `#!/bin/sh
# Ethics Engine Pre-Commit Hook
# Auto-generated - Do not modify

npx ethics-engine pre-commit
exit $?
`;

    const hookPath = path.join(hooksDir, 'pre-commit');
    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
  }

  /**
   * Install pre-push hook
   */
  private installPrePushHook(hooksDir: string): void {
    const hookContent = `#!/bin/sh
# Ethics Engine Pre-Push Hook
# Auto-generated - Do not modify

npx ethics-engine pre-push
exit $?
`;

    const hookPath = path.join(hooksDir, 'pre-push');
    fs.writeFileSync(hookPath, hookContent);
    fs.chmodSync(hookPath, '755');
  }

  /**
   * Install Husky integration
   */
  private installHuskyIntegration(workspacePath: string): void {
    const packageJsonPath = path.join(workspacePath, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        if (!packageJson.husky) {
          packageJson.husky = {};
        }
        
        if (!packageJson.husky.hooks) {
          packageJson.husky.hooks = {};
        }
        
        packageJson.husky.hooks['pre-commit'] = 'npx ethics-engine pre-commit';
        packageJson.husky.hooks['pre-push'] = 'npx ethics-engine pre-push';
        
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      } catch (error) {
        console.warn('Failed to update package.json for Husky integration:', error);
      }
    }
  }

  /**
   * Create passing result for clean commits
   */
  private createPassingResult(): PreCommitResult {
    return {
      allowed: true,
      violations: [],
      complianceReport: {
        id: `clean-${Date.now()}`,
        timestamp: new Date(),
        commitHash: 'unknown',
        author: 'unknown',
        filesScanned: 0,
        violationsFound: 0,
        criticalViolations: 0,
        complianceScore: 100,
        industryCompliance: [],
        recommendations: [],
        reviewRequirements: []
      },
      blockingReasons: [],
      warnings: [],
      badge: {
        status: 'passing',
        score: 100,
        text: 'Ethics: 100%',
        color: '#27ae60',
        details: ['No violations found']
      }
    };
  }

  /**
   * Get all source files in workspace
   */
  private getAllSourceFiles(workspacePath: string): string[] {
    const files: string[] = [];
    
    const scanDirectory = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          scanDirectory(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    };

    scanDirectory(workspacePath);
    return this.filterRelevantFiles(files);
  }

  /**
   * Check if directory should be skipped during scan
   */
  private shouldSkipDirectory(dirname: string): boolean {
    const skipDirectories = [
      'node_modules', '.git', 'dist', 'build', 'target', 
      '.vscode', '.idea', 'coverage', '.nyc_output'
    ];
    return skipDirectories.includes(dirname);
  }

  /**
   * Generate JUnit XML report format
   */
  private generateJUnitReport(report: ComplianceReport, violations: CommitViolation[]): string {
    const testSuites = violations.reduce((suites, violation) => {
      const suiteName = violation.file;
      if (!suites[suiteName]) {
        suites[suiteName] = [];
      }
      suites[suiteName].push(violation);
      return suites;
    }, {} as { [key: string]: CommitViolation[] });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites name="Ethics Engine" tests="${violations.length}" failures="${report.criticalViolations}" errors="0">\n`;

    Object.entries(testSuites).forEach(([file, fileViolations]) => {
      xml += `  <testsuite name="${file}" tests="${fileViolations.length}" failures="${fileViolations.filter(v => v.isBlocking).length}">\n`;
      
      fileViolations.forEach(violation => {
        xml += `    <testcase name="Line ${violation.line}: ${violation.violation.type}" classname="${file}">\n`;
        if (violation.isBlocking) {
          xml += `      <failure message="${violation.violation.message}">${violation.violation.recommendation}</failure>\n`;
        }
        xml += '    </testcase>\n';
      });
      
      xml += '  </testsuite>\n';
    });

    xml += '</testsuites>\n';
    return xml;
  }

  /**
   * Generate SonarQube-compatible report
   */
  private generateSonarReport(report: ComplianceReport, violations: CommitViolation[]): string {
    const issues = violations.map(violation => ({
      engineId: 'ethics-engine',
      ruleId: violation.violation.type,
      severity: violation.violation.adjustedSeverity.toUpperCase(),
      type: 'CODE_SMELL',
      primaryLocation: {
        message: violation.violation.message,
        filePath: violation.file,
        textRange: {
          startLine: violation.line,
          endLine: violation.line
        }
      }
    }));

    return JSON.stringify({ issues }, null, 2);
  }

  /**
   * Generate markdown report
   */
  private generateMarkdownReport(report: ComplianceReport, violations: CommitViolation[]): string {
    let markdown = `# Ethics Compliance Report\n\n`;
    markdown += `**Report ID:** ${report.id}\n`;
    markdown += `**Timestamp:** ${report.timestamp.toISOString()}\n`;
    markdown += `**Author:** ${report.author}\n`;
    markdown += `**Compliance Score:** ${report.complianceScore}%\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- Files Scanned: ${report.filesScanned}\n`;
    markdown += `- Violations Found: ${report.violationsFound}\n`;
    markdown += `- Critical Violations: ${report.criticalViolations}\n\n`;

    if (violations.length > 0) {
      markdown += `## Violations\n\n`;
      violations.forEach((violation, index) => {
        markdown += `### ${index + 1}. ${violation.file}:${violation.line}\n\n`;
        markdown += `**Type:** ${violation.violation.type}\n`;
        markdown += `**Severity:** ${violation.violation.adjustedSeverity}\n`;
        markdown += `**Message:** ${violation.violation.message}\n`;
        markdown += `**Recommendation:** ${violation.violation.recommendation}\n\n`;
      });
    }

    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    return markdown;
  }

  /**
   * Send compliance notification via webhook or Slack
   */
  private async sendComplianceNotification(report: ComplianceReport, allowed: boolean): Promise<void> {
    // Implementation would send notifications to configured endpoints
    // This is a placeholder for enterprise integration
    console.log(`Compliance notification: Score ${report.complianceScore}%, Allowed: ${allowed}`);
  }

  /**
   * Load hook configuration from workspace settings
   */
  private loadConfiguration(): HookConfiguration {
    // In production, this would load from VS Code settings or config file
    return {
      enablePreCommit: true,
      enablePrePush: true,
      blockOnCritical: true,
      requireReviewForHigh: true,
      allowOverride: false,
      overrideRequiresApproval: true,
      complianceReporting: true
    };
  }
}
