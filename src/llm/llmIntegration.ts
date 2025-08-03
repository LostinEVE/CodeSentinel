/**
 * LLM Integration for Contextual Ethical Analysis
 * Supports OpenAI and ag2.ai APIs for enhanced ethical evaluation
 */

import * as vscode from 'vscode';
import axios from 'axios';
import { EthicalViolation } from '../core/ethicsEngine';

export interface LLMProvider {
  name: string;
  baseUrl: string;
  model: string;
  apiKeyHeader: string;
}

export interface LLMAnalysisRequest {
  code: string;
  violation: EthicalViolation;
  context: string;
  intent?: string;
}

export interface LLMAnalysisResponse {
  analysis: string;
  confidence: number;
  suggestions: string[];
  riskAssessment: {
    intentionality: number; // 0-1 scale
    severity: number;       // 0-1 scale
    context: string;
  };
}

export class LLMIntegration {
  private readonly providers: Map<string, LLMProvider> = new Map([
    ['openai', {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
      apiKeyHeader: 'Authorization'
    }],
    ['ag2ai', {
      name: 'AG2.AI',
      baseUrl: 'https://api.ag2.ai/v1',
      model: 'ag2-ethics-1',
      apiKeyHeader: 'X-API-Key'
    }]
  ]);

  private currentProvider: string = 'disabled';
  private apiKey: string = '';

  constructor() {
    this.loadConfiguration();
  }

  /**
   * Check if LLM integration is enabled and configured
   */
  public isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('ethicsEngine');
    this.currentProvider = config.get('llmProvider', 'disabled');
    this.apiKey = config.get('llmApiKey', '');
    
    return this.currentProvider !== 'disabled' && this.apiKey !== '';
  }

  /**
   * Analyze ethical context using LLM
   */
  public async analyzeEthicalContext(
    code: string, 
    violation: EthicalViolation,
    additionalContext?: string
  ): Promise<string> {
    if (!this.isEnabled()) {
      throw new Error('LLM integration is not enabled or configured');
    }

    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error(`Unknown LLM provider: ${this.currentProvider}`);
    }

    const request: LLMAnalysisRequest = {
      code,
      violation,
      context: additionalContext || 'General code analysis',
      intent: 'Ethical analysis and risk assessment'
    };

    try {
      const response = await this.callLLMAPI(provider, request);
      return response.analysis;
    } catch (error) {
      throw new Error(`LLM analysis failed: ${error}`);
    }
  }

  /**
   * Get detailed ethical analysis with suggestions
   */
  public async getDetailedAnalysis(
    code: string,
    violation: EthicalViolation,
    projectContext?: string
  ): Promise<LLMAnalysisResponse> {
    if (!this.isEnabled()) {
      throw new Error('LLM integration is not enabled or configured');
    }

    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error(`Unknown LLM provider: ${this.currentProvider}`);
    }

    const request: LLMAnalysisRequest = {
      code,
      violation,
      context: projectContext || 'Enterprise software development',
      intent: 'Detailed ethical analysis with actionable recommendations'
    };

    try {
      return await this.callDetailedLLMAPI(provider, request);
    } catch (error) {
      throw new Error(`Detailed LLM analysis failed: ${error}`);
    }
  }

  /**
   * Assess developer intent using LLM contextual analysis
   */
  public async assessDeveloperIntent(
    code: string,
    violation: EthicalViolation,
    fileHistory?: string[]
  ): Promise<{
    intentionality: 'accidental' | 'unclear' | 'potentially_deliberate' | 'clearly_deliberate';
    confidence: number;
    reasoning: string;
  }> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error(`Unknown LLM provider: ${this.currentProvider}`);
    }

    const prompt = this.buildIntentAnalysisPrompt(code, violation, fileHistory);
    
    try {
      const response = await this.makeAPICall(provider, prompt);
      return this.parseIntentResponse(response);
    } catch (error) {
      throw new Error(`Intent analysis failed: ${error}`);
    }
  }

  /**
   * Make API call to LLM provider
   */
  private async callLLMAPI(provider: LLMProvider, request: LLMAnalysisRequest): Promise<LLMAnalysisResponse> {
    const prompt = this.buildEthicalAnalysisPrompt(request);
    const response = await this.makeAPICall(provider, prompt);
    return this.parseAnalysisResponse(response);
  }

  /**
   * Make detailed API call to LLM provider
   */
  private async callDetailedLLMAPI(provider: LLMProvider, request: LLMAnalysisRequest): Promise<LLMAnalysisResponse> {
    const prompt = this.buildDetailedAnalysisPrompt(request);
    const response = await this.makeAPICall(provider, prompt);
    return this.parseDetailedResponse(response);
  }

  /**
   * Build ethical analysis prompt
   */
  private buildEthicalAnalysisPrompt(request: LLMAnalysisRequest): string {
    return `You are an expert in software ethics and responsible AI development. Analyze the following code for ethical implications.

**Code Context:**
${request.context}

**Detected Violation:**
Type: ${request.violation.type}
Severity: ${request.violation.severity}
Message: ${request.violation.message}
Line: ${request.violation.line}

**Code Snippet:**
\`\`\`
${request.violation.codeSnippet}
\`\`\`

**Full Code Context:**
\`\`\`
${request.code}
\`\`\`

Please provide:
1. Assessment of the ethical concern
2. Potential impact and harm
3. Developer intent analysis (accidental vs deliberate)
4. Specific recommendations for remediation
5. Alternative implementation approaches

Focus on practical, actionable guidance for enterprise software development.`;
  }

  /**
   * Build detailed analysis prompt
   */
  private buildDetailedAnalysisPrompt(request: LLMAnalysisRequest): string {
    return `You are an enterprise software ethics consultant. Provide a comprehensive analysis of the following ethical violation.

**Project Context:** ${request.context}
**Analysis Intent:** ${request.intent}

**Violation Details:**
- Type: ${request.violation.type}
- Severity: ${request.violation.severity}
- Message: ${request.violation.message}
- Recommendation: ${request.violation.recommendation}
- Confidence: ${(request.violation.confidence * 100).toFixed(1)}%

**Code:**
\`\`\`
${request.code}
\`\`\`

**Problematic Code:**
Line ${request.violation.line}: ${request.violation.codeSnippet}

Please provide a structured analysis with:

1. **Ethical Assessment** (100-150 words)
   - Nature of the ethical concern
   - Potential stakeholder impact
   - Compliance implications

2. **Intent Analysis** (50-75 words)
   - Likelihood of intentional vs accidental violation
   - Code pattern analysis
   - Context clues

3. **Risk Assessment** (scale 0-1)
   - Intentionality score
   - Severity score
   - Contextual appropriateness

4. **Actionable Recommendations** (3-5 specific suggestions)
   - Code modifications
   - Process improvements
   - Preventive measures

5. **Alternative Implementations** (2-3 examples)
   - Ethical code alternatives
   - Best practice patterns

Format your response as JSON with the following structure:
{
  "analysis": "detailed assessment text",
  "confidence": 0.85,
  "suggestions": ["suggestion1", "suggestion2", ...],
  "riskAssessment": {
    "intentionality": 0.3,
    "severity": 0.8,
    "context": "contextual notes"
  }
}`;
  }

  /**
   * Build intent analysis prompt
   */
  private buildIntentAnalysisPrompt(code: string, violation: EthicalViolation, fileHistory?: string[]): string {
    let historyContext = '';
    if (fileHistory && fileHistory.length > 0) {
      historyContext = `\n**File History:**\n${fileHistory.join('\n')}\n`;
    }

    return `Analyze the developer's intent behind this potentially unethical code pattern.

**Violation:**
Type: ${violation.type}
Message: ${violation.message}
Code: ${violation.codeSnippet}

**Full Code:**
\`\`\`
${code}
\`\`\`
${historyContext}

Assess whether this violation appears to be:
1. **Accidental** - Likely oversight or lack of awareness
2. **Unclear** - Ambiguous intent, could be either
3. **Potentially Deliberate** - Suspicious patterns but not conclusive
4. **Clearly Deliberate** - Strong evidence of intentional unethical behavior

Provide your assessment as JSON:
{
  "intentionality": "accidental|unclear|potentially_deliberate|clearly_deliberate",
  "confidence": 0.75,
  "reasoning": "explanation of your assessment"
}`;
  }

  /**
   * Make HTTP API call to LLM provider
   */
  private async makeAPICall(provider: LLMProvider, prompt: string): Promise<any> {
    const headers: any = {
      'Content-Type': 'application/json'
    };

    // Set API key header based on provider
    if (provider.apiKeyHeader === 'Authorization') {
      headers[provider.apiKeyHeader] = `Bearer ${this.apiKey}`;
    } else {
      headers[provider.apiKeyHeader] = this.apiKey;
    }

    const requestBody = this.buildRequestBody(provider, prompt);

    try {
      const response = await axios.post(
        `${provider.baseUrl}/chat/completions`,
        requestBody,
        { headers, timeout: 30000 }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`API call failed: ${error.response?.status} ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Build request body for different providers
   */
  private buildRequestBody(provider: LLMProvider, prompt: string): any {
    const baseRequest = {
      model: provider.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert software ethics consultant specializing in responsible AI and ethical software development practices.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    };

    // Provider-specific customizations
    if (provider.name === 'AG2.AI') {
      return {
        ...baseRequest,
        ethics_mode: true,
        context_aware: true
      };
    }

    return baseRequest;
  }

  /**
   * Parse basic analysis response
   */
  private parseAnalysisResponse(response: any): LLMAnalysisResponse {
    const content = response.choices?.[0]?.message?.content || '';
    
    // Try to parse as JSON first, fallback to text analysis
    try {
      const parsed = JSON.parse(content);
      return {
        analysis: parsed.analysis || content,
        confidence: parsed.confidence || 0.8,
        suggestions: parsed.suggestions || [],
        riskAssessment: parsed.riskAssessment || {
          intentionality: 0.5,
          severity: 0.7,
          context: 'Unknown'
        }
      };
    } catch {
      return {
        analysis: content,
        confidence: 0.8,
        suggestions: [],
        riskAssessment: {
          intentionality: 0.5,
          severity: 0.7,
          context: 'Text-based analysis'
        }
      };
    }
  }

  /**
   * Parse detailed analysis response
   */
  private parseDetailedResponse(response: any): LLMAnalysisResponse {
    const content = response.choices?.[0]?.message?.content || '';
    
    try {
      return JSON.parse(content);
    } catch {
      // Fallback parsing for non-JSON responses
      return {
        analysis: content,
        confidence: 0.75,
        suggestions: this.extractSuggestions(content),
        riskAssessment: {
          intentionality: 0.5,
          severity: 0.7,
          context: 'Extracted from text'
        }
      };
    }
  }

  /**
   * Parse intent analysis response
   */
  private parseIntentResponse(response: any): {
    intentionality: 'accidental' | 'unclear' | 'potentially_deliberate' | 'clearly_deliberate';
    confidence: number;
    reasoning: string;
  } {
    const content = response.choices?.[0]?.message?.content || '';
    
    try {
      return JSON.parse(content);
    } catch {
      return {
        intentionality: 'unclear',
        confidence: 0.5,
        reasoning: 'Failed to parse LLM response'
      };
    }
  }

  /**
   * Extract suggestions from text content
   */
  private extractSuggestions(content: string): string[] {
    const suggestions: string[] = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^[-*•]\s+/) || line.match(/^\d+\.\s+/)) {
        suggestions.push(line.replace(/^[-*•]\s+/, '').replace(/^\d+\.\s+/, '').trim());
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Load configuration from VS Code settings
   */
  private loadConfiguration(): void {
    const config = vscode.workspace.getConfiguration('ethicsEngine');
    this.currentProvider = config.get('llmProvider', 'disabled');
    this.apiKey = config.get('llmApiKey', '');
  }

  /**
   * Test LLM connection
   */
  public async testConnection(): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const provider = this.providers.get(this.currentProvider);
      if (!provider) {
        return false;
      }

      const testPrompt = 'Test connection. Please respond with "OK".';
      await this.makeAPICall(provider, testPrompt);
      return true;
    } catch {
      return false;
    }
  }
}
