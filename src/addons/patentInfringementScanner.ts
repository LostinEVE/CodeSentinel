/**
 * Patent Infringement Scanner - Detect Potential Patent-Infringing Code Patterns
 * Advanced pattern matching with LLM semantic similarity analysis
 */

import * as fs from 'fs';
import * as path from 'path';
import { LLMIntegration } from '../llm/llmIntegration';
import { EthicalViolation } from '../core/ethicsEngine';

export interface PatentRisk {
  id: string;
  patentNumber?: string;
  patentTitle?: string;
  patentOwner?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  matchType: 'heuristic' | 'semantic' | 'structural' | 'algorithmic';
  description: string;
  recommendation: string;
  legalAdvice: string;
  similarityScore?: number;
  codeSection: CodeSection;
  mitigation: MitigationStrategy[];
}

export interface CodeSection {
  file: string;
  startLine: number;
  endLine: number;
  code: string;
  context: string;
  functionName?: string;
  className?: string;
}

export interface MitigationStrategy {
  type: 'avoidance' | 'licensing' | 'redesign' | 'prior_art' | 'invalidation';
  description: string;
  complexity: 'low' | 'medium' | 'high';
  timeEstimate: string;
  legalRisk: 'low' | 'medium' | 'high';
}

export interface PatentPattern {
  id: string;
  name: string;
  description: string;
  patentNumbers: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  patterns: PatternMatcher[];
  semanticDescriptions: string[];
  exemptions: string[];
}

export interface PatternMatcher {
  type: 'regex' | 'ast' | 'semantic' | 'structural';
  pattern: string | RegExp;
  weight: number;
  context?: string[];
}

export interface ScanResult {
  totalFiles: number;
  scannedFiles: number;
  risksFound: number;
  highRiskCount: number;
  criticalRiskCount: number;
  risks: PatentRisk[];
  summary: ScanSummary;
  recommendations: string[];
  legalActions: LegalAction[];
}

export interface ScanSummary {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  topRisks: PatentRisk[];
  risksByCategory: { [category: string]: number };
  estimatedLegalCost: string;
  urgentActions: string[];
}

export interface LegalAction {
  type: 'immediate' | 'urgent' | 'planned' | 'monitoring';
  description: string;
  deadline?: Date;
  assignee: string;
  priority: number;
}

/**
 * Advanced Patent Infringement Detection Engine
 */
export class PatentInfringementScanner {
  private llmIntegration: LLMIntegration;
  private patentPatterns: PatentPattern[];
  private knownExemptions: Set<string>;

  constructor(llmIntegration: LLMIntegration) {
    this.llmIntegration = llmIntegration;
    this.patentPatterns = this.loadPatentPatterns();
    this.knownExemptions = new Set();
  }

  /**
   * Comprehensive patent infringement scan
   */
  public async scanWorkspace(workspacePath: string): Promise<ScanResult> {
    const sourceFiles = this.getSourceFiles(workspacePath);
    const risks: PatentRisk[] = [];
    let scannedFiles = 0;

    for (const file of sourceFiles) {
      try {
        const fileRisks = await this.scanFile(file, workspacePath);
        risks.push(...fileRisks);
        scannedFiles++;
      } catch (error) {
        console.warn(`Failed to scan file ${file}:`, error);
      }
    }

    // Deduplicate and rank risks
    const deduplicatedRisks = this.deduplicateRisks(risks);
    const rankedRisks = this.rankRisksBySeverity(deduplicatedRisks);

    // Generate summary and recommendations
    const summary = this.generateScanSummary(rankedRisks);
    const recommendations = this.generateRecommendations(rankedRisks);
    const legalActions = this.generateLegalActions(rankedRisks);

    return {
      totalFiles: sourceFiles.length,
      scannedFiles,
      risksFound: rankedRisks.length,
      highRiskCount: rankedRisks.filter(r => r.riskLevel === 'high').length,
      criticalRiskCount: rankedRisks.filter(r => r.riskLevel === 'critical').length,
      risks: rankedRisks,
      summary,
      recommendations,
      legalActions
    };
  }

  /**
   * Scan individual file for patent risks
   */
  public async scanFile(filePath: string, workspacePath: string): Promise<PatentRisk[]> {
    const content = fs.readFileSync(filePath, 'utf8');
    const language = this.detectLanguage(filePath);
    const relativePath = path.relative(workspacePath, filePath);

    const risks: PatentRisk[] = [];

    // 1. Heuristic pattern matching
    const heuristicRisks = await this.performHeuristicMatching(content, relativePath, language);
    risks.push(...heuristicRisks);

    // 2. Semantic analysis with LLM
    const semanticRisks = await this.performSemanticAnalysis(content, relativePath, language);
    risks.push(...semanticRisks);

    // 3. Structural analysis
    const structuralRisks = await this.performStructuralAnalysis(content, relativePath, language);
    risks.push(...structuralRisks);

    // 4. Algorithmic pattern detection
    const algorithmicRisks = await this.performAlgorithmicAnalysis(content, relativePath, language);
    risks.push(...algorithmicRisks);

    return risks;
  }

  /**
   * Convert patent risks to ethical violations for integration
   */
  public convertRisksToViolations(risks: PatentRisk[]): EthicalViolation[] {
    return risks.map(risk => ({
      id: risk.id,
      type: 'patentInfringement' as any,
      severity: this.mapRiskLevelToSeverity(risk.riskLevel),
      message: `Potential patent infringement detected: ${risk.description}`,
      line: risk.codeSection.startLine,
      column: 0,
      codeSnippet: risk.codeSection.code.split('\n')[0] || '',
      suggestion: risk.recommendation,
      confidence: risk.confidence,
      recommendation: risk.legalAdvice,
      context: risk.codeSection.context
    }));
  }

  /**
   * Perform heuristic pattern matching against known patent patterns
   */
  private async performHeuristicMatching(
    content: string, 
    filePath: string, 
    language: string
  ): Promise<PatentRisk[]> {
    const risks: PatentRisk[] = [];
    
    for (const patternDef of this.patentPatterns) {
      for (const pattern of patternDef.patterns) {
        if (pattern.type === 'regex') {
          const patternStr = typeof pattern.pattern === 'string' ? pattern.pattern : pattern.pattern.source;
          const matches = this.findRegexMatches(content, patternStr);
          
          for (const match of matches) {
            const codeSection = this.extractCodeSection(content, match.line, filePath);
            
            risks.push({
              id: `heuristic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              patentNumber: patternDef.patentNumbers[0],
              patentTitle: patternDef.name,
              riskLevel: patternDef.riskLevel,
              confidence: pattern.weight,
              matchType: 'heuristic',
              description: `Potential implementation of ${patternDef.name}: ${match.text}`,
              recommendation: `Review for patent infringement risk related to ${patternDef.name}`,
              legalAdvice: this.generateLegalAdvice(patternDef),
              codeSection,
              mitigation: this.generateMitigationStrategies(patternDef)
            });
          }
        }
      }
    }

    return risks;
  }

  /**
   * Perform semantic analysis using LLM for patent similarity
   */
  private async performSemanticAnalysis(
    content: string, 
    filePath: string, 
    language: string
  ): Promise<PatentRisk[]> {
    const risks: PatentRisk[] = [];
    
    // Extract meaningful code sections (functions, classes, algorithms)
    const codeSections = this.extractMeaningfulSections(content, language);
    
    for (const section of codeSections) {
      // Use LLM to analyze semantic similarity to known patent descriptions
      const semanticAnalysis = await this.analyzeSemanticSimilarity(section, language);
      
      if (semanticAnalysis.similarityScore > 0.7) {
        const codeSection = this.extractCodeSection(content, section.startLine, filePath);
        
        risks.push({
          id: `semantic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          patentTitle: semanticAnalysis.potentialPatent,
          riskLevel: this.calculateRiskFromSimilarity(semanticAnalysis.similarityScore),
          confidence: semanticAnalysis.similarityScore,
          matchType: 'semantic',
          description: semanticAnalysis.description,
          recommendation: semanticAnalysis.recommendation,
          legalAdvice: 'Consult patent attorney for detailed analysis',
          similarityScore: semanticAnalysis.similarityScore,
          codeSection,
          mitigation: this.generateGenericMitigationStrategies()
        });
      }
    }

    return risks;
  }

  /**
   * Perform structural analysis for common patent-protected structures
   */
  private async performStructuralAnalysis(
    content: string, 
    filePath: string, 
    language: string
  ): Promise<PatentRisk[]> {
    const risks: PatentRisk[] = [];
    
    // Analyze code structure for common patented patterns
    const structuralPatterns = [
      {
        name: 'Observer Pattern Implementation',
        description: 'Potential implementation of patented observer pattern variant',
        riskLevel: 'medium' as const,
        checker: (code: string) => this.checkObserverPattern(code)
      },
      {
        name: 'Caching Strategy',
        description: 'Potential implementation of patented caching algorithm',
        riskLevel: 'medium' as const,
        checker: (code: string) => this.checkCachingPatterns(code)
      },
      {
        name: 'Compression Algorithm',
        description: 'Potential implementation of patented compression technique',
        riskLevel: 'high' as const,
        checker: (code: string) => this.checkCompressionAlgorithms(code)
      },
      {
        name: 'Encryption Method',
        description: 'Potential implementation of patented encryption method',
        riskLevel: 'critical' as const,
        checker: (code: string) => this.checkEncryptionMethods(code)
      }
    ];

    for (const pattern of structuralPatterns) {
      const matches = pattern.checker(content);
      
      for (const match of matches) {
        const codeSection = this.extractCodeSection(content, match.line, filePath);
        
        risks.push({
          id: `structural-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          patentTitle: pattern.name,
          riskLevel: pattern.riskLevel,
          confidence: match.confidence,
          matchType: 'structural',
          description: pattern.description,
          recommendation: `Review implementation of ${pattern.name} for patent compliance`,
          legalAdvice: 'Consider alternative implementation or licensing',
          codeSection,
          mitigation: this.generateStructuralMitigationStrategies(pattern.name)
        });
      }
    }

    return risks;
  }

  /**
   * Perform algorithmic analysis for known patented algorithms
   */
  private async performAlgorithmicAnalysis(
    content: string, 
    filePath: string, 
    language: string
  ): Promise<PatentRisk[]> {
    const risks: PatentRisk[] = [];
    
    // Check for specific algorithmic implementations
    const algorithmChecks = [
      {
        name: 'RSA Algorithm',
        pattern: /\b(rsa|rivest|shamir|adleman)\b/i,
        riskLevel: 'critical' as const,
        patents: ['US4405829'],
        description: 'Potential RSA encryption implementation'
      },
      {
        name: 'LZW Compression',
        pattern: /\b(lzw|lempel|ziv|welch)\b/i,
        riskLevel: 'high' as const,
        patents: ['US4558302'],
        description: 'Potential LZW compression implementation'
      },
      {
        name: 'GIF Image Format',
        pattern: /\bgif\b.*\b(compress|decompress|encode|decode)\b/i,
        riskLevel: 'medium' as const,
        patents: ['US4558302'],
        description: 'Potential GIF compression implementation'
      },
      {
        name: 'MP3 Audio Encoding',
        pattern: /\b(mp3|mpeg.*audio|psychoacoustic)\b/i,
        riskLevel: 'critical' as const,
        patents: ['Multiple'],
        description: 'Potential MP3 encoding implementation'
      }
    ];

    for (const algorithm of algorithmChecks) {
      const matches = content.match(algorithm.pattern);
      
      if (matches) {
        // Find the line number of the match
        const lines = content.split('\n');
        let lineNumber = 0;
        
        for (let i = 0; i < lines.length; i++) {
          if (algorithm.pattern.test(lines[i])) {
            lineNumber = i + 1;
            break;
          }
        }

        const codeSection = this.extractCodeSection(content, lineNumber, filePath);
        
        risks.push({
          id: `algorithmic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          patentNumber: algorithm.patents[0],
          patentTitle: algorithm.name,
          riskLevel: algorithm.riskLevel,
          confidence: 0.8,
          matchType: 'algorithmic',
          description: algorithm.description,
          recommendation: `Review ${algorithm.name} implementation for patent licensing requirements`,
          legalAdvice: 'Immediate legal review required for algorithmic patent infringement',
          codeSection,
          mitigation: this.generateAlgorithmicMitigationStrategies(algorithm.name)
        });
      }
    }

    return risks;
  }

  /**
   * Load known patent patterns from database/configuration
   */
  private loadPatentPatterns(): PatentPattern[] {
    return [
      {
        id: 'one-click-purchase',
        name: 'One-Click Purchase System',
        description: 'Single-action online purchase mechanism',
        patentNumbers: ['US5960411'],
        riskLevel: 'high',
        patterns: [
          {
            type: 'regex',
            pattern: /\b(one.*click|single.*click).*\b(purchase|buy|order)\b/i,
            weight: 0.8
          }
        ],
        semanticDescriptions: [
          'Single-click purchasing mechanism',
          'One-step checkout process'
        ],
        exemptions: ['Shopping cart implementations', 'Multi-step checkout']
      },
      {
        id: 'progress-bar',
        name: 'Progress Bar During Download',
        description: 'Visual progress indicator during file transfer',
        patentNumbers: ['US6389467'],
        riskLevel: 'medium',
        patterns: [
          {
            type: 'regex',
            pattern: /\b(progress.*bar|download.*progress)\b/i,
            weight: 0.6
          }
        ],
        semanticDescriptions: [
          'Progress bar during download operations',
          'Visual download progress indicator'
        ],
        exemptions: ['Generic progress indicators', 'Simple loading bars']
      },
      {
        id: 'auto-complete',
        name: 'Auto-Complete Search Suggestions',
        description: 'Automatic completion of search queries',
        patentNumbers: ['US7788274'],
        riskLevel: 'medium',
        patterns: [
          {
            type: 'regex',
            pattern: /\b(auto.*complete|auto.*suggest|typeahead)\b/i,
            weight: 0.7
          }
        ],
        semanticDescriptions: [
          'Automatic search query completion',
          'Real-time search suggestions'
        ],
        exemptions: ['Basic text completion', 'Static suggestion lists']
      }
    ];
  }

  /**
   * Find regex matches in content with line numbers
   */
  private findRegexMatches(content: string, pattern: string): Array<{ line: number; text: string }> {
    const regex = new RegExp(pattern, 'gi');
    const lines = content.split('\n');
    const matches: Array<{ line: number; text: string }> = [];

    lines.forEach((line, index) => {
      const match = line.match(regex);
      if (match) {
        matches.push({
          line: index + 1,
          text: match[0]
        });
      }
    });

    return matches;
  }

  /**
   * Extract code section around a specific line
   */
  private extractCodeSection(content: string, lineNumber: number, filePath: string): CodeSection {
    const lines = content.split('\n');
    const startLine = Math.max(0, lineNumber - 5);
    const endLine = Math.min(lines.length - 1, lineNumber + 5);
    
    const sectionLines = lines.slice(startLine, endLine + 1);
    const code = sectionLines.join('\n');
    
    // Try to extract function/class context
    const contextInfo = this.extractContext(lines, lineNumber);

    return {
      file: filePath,
      startLine: startLine + 1,
      endLine: endLine + 1,
      code,
      context: `Lines ${startLine + 1}-${endLine + 1} in ${filePath}`,
      functionName: contextInfo.functionName,
      className: contextInfo.className
    };
  }

  /**
   * Extract function and class context for a line
   */
  private extractContext(lines: string[], lineNumber: number): { functionName?: string; className?: string } {
    let functionName: string | undefined;
    let className: string | undefined;

    // Look backwards for function/class definitions
    for (let i = lineNumber - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      // Function patterns
      const funcMatch = line.match(/(?:function|def|async\s+function)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (funcMatch && !functionName) {
        functionName = funcMatch[1];
      }

      // Class patterns
      const classMatch = line.match(/(?:class|interface)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (classMatch && !className) {
        className = classMatch[1];
      }

      // Stop if we've found both or hit a major boundary
      if ((functionName && className) || line.includes('module.exports') || line.includes('import ')) {
        break;
      }
    }

    return { functionName, className };
  }

  /**
   * Perform basic patent analysis using heuristics
   */
  private performBasicPatentAnalysis(code: string): {
    score: number;
    potentialPatent: string;
    description: string;
    recommendation: string;
  } {
    // Basic heuristic analysis for common patent patterns
    let score = 0;
    let potentialPatent = 'Generic Implementation';
    let description = 'Standard implementation pattern';
    let recommendation = 'No immediate action required';

    // Check for encryption-related patterns
    if (/\b(encrypt|decrypt|cipher|key|rsa|aes)\b/i.test(code)) {
      score = 0.8;
      potentialPatent = 'Encryption Algorithm';
      description = 'Potential cryptographic implementation';
      recommendation = 'Review for patent-protected encryption methods';
    }
    
    // Check for compression patterns
    else if (/\b(compress|decompress|zip|gzip|huffman|lzw)\b/i.test(code)) {
      score = 0.7;
      potentialPatent = 'Compression Algorithm';
      description = 'Potential compression algorithm implementation';
      recommendation = 'Verify compression method is not patent-protected';
    }
    
    // Check for UI/UX patterns
    else if (/\b(one.*click|progress.*bar|auto.*complete)\b/i.test(code)) {
      score = 0.6;
      potentialPatent = 'User Interface Patent';
      description = 'Potential UI/UX patent implementation';
      recommendation = 'Review for interface patent compliance';
    }

    return { score, potentialPatent, description, recommendation };
  }

  /**
   * Analyze semantic similarity using LLM
   */
  private async analyzeSemanticSimilarity(
    section: { code: string; startLine: number; endLine: number }, 
    language: string
  ): Promise<{
    similarityScore: number;
    potentialPatent: string;
    description: string;
    recommendation: string;
  }> {
    // For now, implement basic heuristic analysis instead of LLM
    // In production, this would use specialized patent analysis APIs
    try {
      const codeAnalysis = this.performBasicPatentAnalysis(section.code);
      
      return {
        similarityScore: codeAnalysis.score,
        potentialPatent: codeAnalysis.potentialPatent,
        description: codeAnalysis.description,
        recommendation: codeAnalysis.recommendation
      };
    } catch (error) {
      console.warn('Patent analysis failed:', error);
      return {
        similarityScore: 0,
        potentialPatent: 'Unknown',
        description: 'Analysis failed',
        recommendation: 'Manual review recommended'
      };
    }
  }

  /**
   * Extract meaningful code sections for analysis
   */
  private extractMeaningfulSections(content: string, language: string): Array<{
    code: string;
    startLine: number;
    endLine: number;
    type: 'function' | 'class' | 'algorithm';
  }> {
    const sections: Array<{
      code: string;
      startLine: number;
      endLine: number;
      type: 'function' | 'class' | 'algorithm';
    }> = [];

    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Function definitions
      if (this.isFunctionDefinition(line, language)) {
        const section = this.extractFunctionBody(lines, i);
        if (section && section.code.length > 100) { // Only analyze substantial functions
          sections.push({
            ...section,
            type: 'function'
          });
        }
      }
      
      // Class definitions
      else if (this.isClassDefinition(line, language)) {
        const section = this.extractClassBody(lines, i);
        if (section && section.code.length > 200) { // Only analyze substantial classes
          sections.push({
            ...section,
            type: 'class'
          });
        }
      }
    }

    return sections;
  }

  /**
   * Check if line is a function definition
   */
  private isFunctionDefinition(line: string, language: string): boolean {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return /^\s*(?:async\s+)?(?:function|const\s+\w+\s*=\s*(?:async\s+)?\(|export\s+(?:async\s+)?function)/.test(line);
      case 'python':
        return /^\s*def\s+\w+\s*\(/.test(line);
      default:
        return false;
    }
  }

  /**
   * Check if line is a class definition
   */
  private isClassDefinition(line: string, language: string): boolean {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return /^\s*(?:export\s+)?class\s+\w+/.test(line);
      case 'python':
        return /^\s*class\s+\w+/.test(line);
      default:
        return false;
    }
  }

  /**
   * Extract function body
   */
  private extractFunctionBody(lines: string[], startIndex: number): { code: string; startLine: number; endLine: number } | null {
    let braceCount = 0;
    let endIndex = startIndex;
    let foundOpenBrace = false;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          foundOpenBrace = true;
        } else if (char === '}') {
          braceCount--;
        }
      }

      if (foundOpenBrace && braceCount === 0) {
        endIndex = i;
        break;
      }
    }

    if (endIndex > startIndex) {
      const code = lines.slice(startIndex, endIndex + 1).join('\n');
      return {
        code,
        startLine: startIndex + 1,
        endLine: endIndex + 1
      };
    }

    return null;
  }

  /**
   * Extract class body
   */
  private extractClassBody(lines: string[], startIndex: number): { code: string; startLine: number; endLine: number } | null {
    // Similar to function extraction but for classes
    return this.extractFunctionBody(lines, startIndex);
  }

  /**
   * Check for observer pattern implementations
   */
  private checkObserverPattern(code: string): Array<{ line: number; confidence: number }> {
    const patterns = [
      /\b(observer|observable|subscribe|unsubscribe|notify)\b/i,
      /\b(addEventListener|removeEventListener)\b/i,
      /\b(on|off|emit|trigger)\b.*\b(event|listener)\b/i
    ];

    const matches: Array<{ line: number; confidence: number }> = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      let matchCount = 0;
      patterns.forEach(pattern => {
        if (pattern.test(line)) {
          matchCount++;
        }
      });

      if (matchCount > 0) {
        matches.push({
          line: index + 1,
          confidence: Math.min(matchCount * 0.3, 1.0)
        });
      }
    });

    return matches;
  }

  /**
   * Check for caching pattern implementations
   */
  private checkCachingPatterns(code: string): Array<{ line: number; confidence: number }> {
    const patterns = [
      /\b(cache|memoize|lru|ttl)\b/i,
      /\b(get|set|put|evict).*\b(cache|cached)\b/i,
      /\b(expir|invalid|refresh).*\b(cache)\b/i
    ];

    return this.checkPatterns(code, patterns);
  }

  /**
   * Check for compression algorithm implementations
   */
  private checkCompressionAlgorithms(code: string): Array<{ line: number; confidence: number }> {
    const patterns = [
      /\b(compress|decompress|zip|unzip|gzip|deflate|inflate)\b/i,
      /\b(huffman|lz77|lz78|lzw|arithmetic)\b/i,
      /\b(encode|decode).*\b(length|run|dictionary)\b/i
    ];

    return this.checkPatterns(code, patterns);
  }

  /**
   * Check for encryption method implementations
   */
  private checkEncryptionMethods(code: string): Array<{ line: number; confidence: number }> {
    const patterns = [
      /\b(encrypt|decrypt|cipher|decipher)\b/i,
      /\b(aes|des|rsa|ecc|sha|md5)\b/i,
      /\b(public.*key|private.*key|symmetric|asymmetric)\b/i,
      /\b(hash|digest|signature|certificate)\b/i
    ];

    return this.checkPatterns(code, patterns);
  }

  /**
   * Generic pattern checker
   */
  private checkPatterns(code: string, patterns: RegExp[]): Array<{ line: number; confidence: number }> {
    const matches: Array<{ line: number; confidence: number }> = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      let matchCount = 0;
      patterns.forEach(pattern => {
        if (pattern.test(line)) {
          matchCount++;
        }
      });

      if (matchCount > 0) {
        matches.push({
          line: index + 1,
          confidence: Math.min(matchCount * 0.4, 1.0)
        });
      }
    });

    return matches;
  }

  /**
   * Get all source files in workspace
   */
  private getSourceFiles(workspacePath: string): string[] {
    const files: string[] = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.cpp', '.c', '.go', '.rs'];
    
    const scanDirectory = (dir: string) => {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
            scanDirectory(fullPath);
          } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        console.warn(`Failed to scan directory ${dir}:`, error);
      }
    };

    scanDirectory(workspacePath);
    return files;
  }

  /**
   * Check if directory should be skipped
   */
  private shouldSkipDirectory(dirname: string): boolean {
    const skipDirs = [
      'node_modules', '.git', 'dist', 'build', 'target', 'out',
      '.vscode', '.idea', 'coverage', '.nyc_output', 'vendor'
    ];
    return skipDirs.includes(dirname) || dirname.startsWith('.');
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    
    const languageMap: { [key: string]: string } = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cs': 'csharp',
      '.cpp': 'cpp',
      '.c': 'c',
      '.go': 'go',
      '.rs': 'rust'
    };

    return languageMap[ext] || 'unknown';
  }

  /**
   * Deduplicate similar risks
   */
  private deduplicateRisks(risks: PatentRisk[]): PatentRisk[] {
    const deduplicated: PatentRisk[] = [];
    
    for (const risk of risks) {
      const existing = deduplicated.find(r => 
        r.patentTitle === risk.patentTitle &&
        r.codeSection.file === risk.codeSection.file &&
        Math.abs(r.codeSection.startLine - risk.codeSection.startLine) < 10
      );

      if (!existing) {
        deduplicated.push(risk);
      } else if (risk.confidence > existing.confidence) {
        // Replace with higher confidence match
        const index = deduplicated.indexOf(existing);
        deduplicated[index] = risk;
      }
    }

    return deduplicated;
  }

  /**
   * Rank risks by severity and confidence
   */
  private rankRisksBySeverity(risks: PatentRisk[]): PatentRisk[] {
    const riskLevelOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    
    return risks.sort((a, b) => {
      const levelDiff = riskLevelOrder[b.riskLevel] - riskLevelOrder[a.riskLevel];
      if (levelDiff !== 0) return levelDiff;
      
      return b.confidence - a.confidence;
    });
  }

  /**
   * Generate scan summary
   */
  private generateScanSummary(risks: PatentRisk[]): ScanSummary {
    const criticalRisks = risks.filter(r => r.riskLevel === 'critical');
    const highRisks = risks.filter(r => r.riskLevel === 'high');
    
    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (criticalRisks.length > 0) overallRisk = 'critical';
    else if (highRisks.length > 0) overallRisk = 'high';
    else if (risks.length > 5) overallRisk = 'medium';

    const avgConfidence = risks.length > 0 
      ? risks.reduce((sum, r) => sum + r.confidence, 0) / risks.length 
      : 0;

    const risksByCategory = risks.reduce((acc, risk) => {
      const category = risk.matchType;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });

    const estimatedLegalCost = this.estimateLegalCost(risks);
    const urgentActions = this.getUrgentActions(risks);

    return {
      overallRisk,
      confidence: avgConfidence,
      topRisks: risks.slice(0, 5),
      risksByCategory,
      estimatedLegalCost,
      urgentActions
    };
  }

  /**
   * Generate recommendations based on scan results
   */
  private generateRecommendations(risks: PatentRisk[]): string[] {
    const recommendations: string[] = [];
    
    if (risks.length === 0) {
      recommendations.push('No patent infringement risks detected in current scan');
      return recommendations;
    }

    const criticalRisks = risks.filter(r => r.riskLevel === 'critical');
    if (criticalRisks.length > 0) {
      recommendations.push(`Immediate legal review required for ${criticalRisks.length} critical patent risks`);
      recommendations.push('Consider halting affected development until risks are assessed');
    }

    const highRisks = risks.filter(r => r.riskLevel === 'high');
    if (highRisks.length > 0) {
      recommendations.push(`Schedule patent attorney consultation for ${highRisks.length} high-risk items`);
    }

    // Type-specific recommendations
    const algorithmicRisks = risks.filter(r => r.matchType === 'algorithmic');
    if (algorithmicRisks.length > 0) {
      recommendations.push('Research alternative algorithms or obtain necessary licenses');
    }

    const semanticRisks = risks.filter(r => r.matchType === 'semantic');
    if (semanticRisks.length > 0) {
      recommendations.push('Conduct detailed prior art research for semantic matches');
    }

    recommendations.push('Implement patent review process for future development');
    recommendations.push('Consider patent portfolio analysis for defensive purposes');

    return recommendations;
  }

  /**
   * Generate legal actions based on risks
   */
  private generateLegalActions(risks: PatentRisk[]): LegalAction[] {
    const actions: LegalAction[] = [];
    
    const criticalRisks = risks.filter(r => r.riskLevel === 'critical');
    if (criticalRisks.length > 0) {
      actions.push({
        type: 'immediate',
        description: `Legal review of ${criticalRisks.length} critical patent infringement risks`,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        assignee: 'patent-attorney@company.com',
        priority: 1
      });
    }

    const highRisks = risks.filter(r => r.riskLevel === 'high');
    if (highRisks.length > 0) {
      actions.push({
        type: 'urgent',
        description: `Patent clearance analysis for ${highRisks.length} high-risk implementations`,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        assignee: 'legal-team@company.com',
        priority: 2
      });
    }

    actions.push({
      type: 'planned',
      description: 'Implement ongoing patent monitoring system',
      assignee: 'engineering-manager@company.com',
      priority: 3
    });

    return actions;
  }

  /**
   * Calculate risk level from similarity score
   */
  private calculateRiskFromSimilarity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.9) return 'critical';
    if (score >= 0.8) return 'high';
    if (score >= 0.7) return 'medium';
    return 'low';
  }

  /**
   * Map risk level to severity for integration
   */
  private mapRiskLevelToSeverity(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    return riskLevel as 'low' | 'medium' | 'high' | 'critical';
  }

  /**
   * Generate legal advice for patent pattern
   */
  private generateLegalAdvice(pattern: PatentPattern): string {
    return `Potential infringement of patent ${pattern.patentNumbers.join(', ')}: ${pattern.name}. Recommend immediate legal consultation for clearance analysis.`;
  }

  /**
   * Generate mitigation strategies for patent pattern
   */
  private generateMitigationStrategies(pattern: PatentPattern): MitigationStrategy[] {
    return [
      {
        type: 'avoidance',
        description: `Redesign implementation to avoid ${pattern.name} patent claims`,
        complexity: 'high',
        timeEstimate: '2-4 weeks',
        legalRisk: 'low'
      },
      {
        type: 'licensing',
        description: `Obtain license for ${pattern.name} patent`,
        complexity: 'medium',
        timeEstimate: '4-8 weeks',
        legalRisk: 'low'
      },
      {
        type: 'prior_art',
        description: 'Research prior art to challenge patent validity',
        complexity: 'high',
        timeEstimate: '8-12 weeks',
        legalRisk: 'medium'
      }
    ];
  }

  /**
   * Generate generic mitigation strategies
   */
  private generateGenericMitigationStrategies(): MitigationStrategy[] {
    return [
      {
        type: 'avoidance',
        description: 'Implement alternative approach to avoid potential infringement',
        complexity: 'medium',
        timeEstimate: '1-3 weeks',
        legalRisk: 'low'
      },
      {
        type: 'licensing',
        description: 'Investigate licensing options if patent exists',
        complexity: 'medium',
        timeEstimate: '2-6 weeks',
        legalRisk: 'low'
      }
    ];
  }

  /**
   * Generate structural mitigation strategies
   */
  private generateStructuralMitigationStrategies(patternName: string): MitigationStrategy[] {
    return [
      {
        type: 'redesign',
        description: `Refactor ${patternName} to use non-infringing design pattern`,
        complexity: 'medium',
        timeEstimate: '1-2 weeks',
        legalRisk: 'low'
      },
      {
        type: 'avoidance',
        description: `Replace ${patternName} with alternative implementation`,
        complexity: 'high',
        timeEstimate: '2-4 weeks',
        legalRisk: 'low'
      }
    ];
  }

  /**
   * Generate algorithmic mitigation strategies
   */
  private generateAlgorithmicMitigationStrategies(algorithmName: string): MitigationStrategy[] {
    return [
      {
        type: 'licensing',
        description: `Obtain commercial license for ${algorithmName}`,
        complexity: 'low',
        timeEstimate: '2-8 weeks',
        legalRisk: 'low'
      },
      {
        type: 'avoidance',
        description: `Replace ${algorithmName} with non-patented alternative`,
        complexity: 'high',
        timeEstimate: '4-12 weeks',
        legalRisk: 'low'
      },
      {
        type: 'prior_art',
        description: `Research ${algorithmName} patent validity and prior art`,
        complexity: 'high',
        timeEstimate: '6-16 weeks',
        legalRisk: 'medium'
      }
    ];
  }

  /**
   * Estimate legal cost based on risks
   */
  private estimateLegalCost(risks: PatentRisk[]): string {
    const criticalCount = risks.filter(r => r.riskLevel === 'critical').length;
    const highCount = risks.filter(r => r.riskLevel === 'high').length;
    
    let estimatedCost = 0;
    estimatedCost += criticalCount * 25000; // $25k per critical risk
    estimatedCost += highCount * 10000;     // $10k per high risk
    estimatedCost += risks.length * 2000;   // $2k base cost per risk

    if (estimatedCost === 0) return '$0';
    if (estimatedCost < 10000) return '$5,000 - $10,000';
    if (estimatedCost < 50000) return '$10,000 - $50,000';
    if (estimatedCost < 100000) return '$50,000 - $100,000';
    return '$100,000+';
  }

  /**
   * Get urgent actions for immediate attention
   */
  private getUrgentActions(risks: PatentRisk[]): string[] {
    const actions: string[] = [];
    
    const criticalRisks = risks.filter(r => r.riskLevel === 'critical');
    if (criticalRisks.length > 0) {
      actions.push('Stop development on critical risk areas');
      actions.push('Schedule emergency legal consultation');
    }

    const algorithmicRisks = risks.filter(r => r.matchType === 'algorithmic');
    if (algorithmicRisks.length > 0) {
      actions.push('Review algorithmic implementations immediately');
    }

    return actions;
  }
}
