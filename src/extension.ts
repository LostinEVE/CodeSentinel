/**
 * Main VS Code Extension Entry Point
 * Implements CodeActionProvider for JavaScript and Python ethical analysis
 */

import * as vscode from 'vscode';
import { EthicsEngine, AnalysisContext, EthicalViolation } from './core/ethicsEngine';
import { PolicyLoader, EthicsPolicy } from './core/policyLoader';
import { LLMIntegration } from './llm/llmIntegration';
import { EthicalRemediationEngine } from './addons/remediationEngine';
import { TeamAwarenessEngine } from './addons/teamAwarenessEngine';
import { GitPreCommitEnforcement } from './addons/gitPreCommitEnforcement';
import { PatentInfringementScanner } from './addons/patentInfringementScanner';
import { SaaSIntegration } from './saas/SaaSIntegration';
import * as path from 'path';

export class EthicsCodeActionProvider implements vscode.CodeActionProvider {
  private ethicsEngine: EthicsEngine;
  private policyLoader: PolicyLoader;
  private llmIntegration: LLMIntegration;
  private saasIntegration: SaaSIntegration;
  public remediationEngine: EthicalRemediationEngine;
  public teamAwareness: TeamAwarenessEngine;
  public gitEnforcement: GitPreCommitEnforcement;
  public patentScanner: PatentInfringementScanner;
  private currentPolicy: EthicsPolicy | null = null;

  constructor(context: vscode.ExtensionContext) {
    this.ethicsEngine = new EthicsEngine();
    this.policyLoader = new PolicyLoader();
    this.llmIntegration = new LLMIntegration();
    this.saasIntegration = new SaaSIntegration(context);
    
    // Initialize enterprise addon modules
    this.remediationEngine = new EthicalRemediationEngine(this.llmIntegration);
    this.teamAwareness = new TeamAwarenessEngine();
    this.gitEnforcement = new GitPreCommitEnforcement(
      this.ethicsEngine,
      this.policyLoader,
      this.teamAwareness
    );
    this.patentScanner = new PatentInfringementScanner(this.llmIntegration);
    
    this.loadDefaultPolicy();
  }

  public getSaaSIntegration(): SaaSIntegration {
    return this.saasIntegration;
  }

  public getCurrentPolicy(): EthicsPolicy | null {
    return this.currentPolicy;
  }

  public getPolicyLoader(): PolicyLoader {
    return this.policyLoader;
  }

  /**
   * Provide code actions for ethical violations
   */
  public provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    const actions: vscode.CodeAction[] = [];

    // Analyze the current document
    const analysisContext: AnalysisContext = {
      content: document.getText(),
      fileName: path.basename(document.fileName),
      language: this.getLanguageFromDocument(document),
      projectContext: vscode.workspace.name
    };

    const analysis = this.ethicsEngine.analyzeCode(analysisContext);
    
    // Filter violations in the current range
    const relevantViolations = analysis.violations.filter(violation => {
      const violationRange = new vscode.Range(
        violation.line - 1, 
        violation.column, 
        violation.line - 1, 
        violation.column + 10
      );
      return range.intersection(violationRange) !== undefined;
    });

    // Create code actions for each violation
    relevantViolations.forEach(violation => {
      const fixAction = this.createFixAction(document, violation);
      if (fixAction) {
        actions.push(fixAction);
      }

      const explainAction = this.createExplainAction(violation);
      actions.push(explainAction);

      if (this.llmIntegration.isEnabled()) {
        const llmAction = this.createLLMAnalysisAction(document, violation);
        actions.push(llmAction);
      }
    });

    // Add general scan action
    const scanAction = new vscode.CodeAction('Scan entire file for ethical violations', vscode.CodeActionKind.QuickFix);
    scanAction.command = {
      command: 'ethicsEngine.scanFile',
      title: 'Scan for Ethics Violations',
      arguments: [document.uri]
    };
    actions.push(scanAction);

    return actions;
  }

  public getLanguageFromDocument(document: vscode.TextDocument): 'javascript' | 'typescript' | 'python' {
    switch (document.languageId) {
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'python':
        return 'python';
      default:
        return 'javascript'; // Default fallback
    }
  }

  private createFixAction(document: vscode.TextDocument, violation: EthicalViolation): vscode.CodeAction | null {
    // Only create fix actions for certain types of violations
    if (violation.type !== 'discriminationRisk' && violation.type !== 'misuseRisk') {
      return null;
    }

    const action = new vscode.CodeAction(
      `Fix: ${violation.message}`,
      vscode.CodeActionKind.QuickFix
    );

    const edit = new vscode.WorkspaceEdit();
    const line = document.lineAt(violation.line - 1);
    
    let fixedCode = '';
    
    // Apply specific fixes based on violation type
    if (violation.type === 'discriminationRisk') {
      // Remove discriminatory filters
      if (line.text.includes('nationality') || line.text.includes('country')) {
        fixedCode = line.text.replace(
          /(?:if|filter|where)\s*\(\s*(?:user|person|applicant)\.(?:nationality|country|citizenship)\s*[!=<>]+[^)]*\)/gi,
          '// Removed discriminatory filter - use legitimate criteria instead'
        );
      }
    } else if (violation.type === 'misuseRisk') {
      // Comment out potential backdoors
      if (line.text.includes('bypass') || line.text.includes('backdoor')) {
        fixedCode = `// ${line.text.trim()} // REMOVED: Potential security backdoor`;
      }
    }

    if (fixedCode && fixedCode !== line.text) {
      edit.replace(document.uri, line.range, fixedCode);
      action.edit = edit;
      action.isPreferred = true;
    } else {
      return null;
    }

    return action;
  }

  private createExplainAction(violation: EthicalViolation): vscode.CodeAction {
    const action = new vscode.CodeAction(
      `Explain: ${violation.message}`,
      vscode.CodeActionKind.QuickFix
    );

    action.command = {
      command: 'ethicsEngine.explainViolation',
      title: 'Explain Violation',
      arguments: [violation]
    };

    return action;
  }

  private createLLMAnalysisAction(document: vscode.TextDocument, violation: EthicalViolation): vscode.CodeAction {
    const action = new vscode.CodeAction(
      'Analyze with LLM',
      vscode.CodeActionKind.RefactorRewrite
    );

    action.command = {
      command: 'ethicsEngine.analyzeWithLLM',
      title: 'Analyze with LLM',
      arguments: [document.uri, violation]
    };

    return action;
  }

  private async loadDefaultPolicy(): Promise<void> {
    try {
      // Try to load from workspace config folder first
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (workspaceFolder) {
        const configPath = path.join(workspaceFolder.uri.fsPath, '.ethics', 'policies');
        const policies = await this.policyLoader.loadPoliciesFromDirectory(configPath);
        if (policies.length > 0) {
          this.currentPolicy = this.policyLoader.mergePolicies(policies);
          return;
        }
      }

      // Fall back to default policy
      this.currentPolicy = this.policyLoader.createDefaultPolicy();
    } catch (error) {
      console.error('Failed to load ethics policy:', error);
      this.currentPolicy = this.policyLoader.createDefaultPolicy();
    }
  }
}

export class EthicsDiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private ethicsEngine: EthicsEngine;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('ethics');
    this.ethicsEngine = new EthicsEngine();
  }

  public async analyzeDiagnostics(document: vscode.TextDocument): Promise<void> {
    const analysisContext: AnalysisContext = {
      content: document.getText(),
      fileName: path.basename(document.fileName),
      language: this.getLanguageFromDocument(document),
      projectContext: vscode.workspace.name
    };

    const analysis = this.ethicsEngine.analyzeCode(analysisContext);
    const diagnostics: vscode.Diagnostic[] = [];

    analysis.violations.forEach(violation => {
      const range = new vscode.Range(
        violation.line - 1,
        violation.column,
        violation.line - 1,
        violation.column + violation.codeSnippet.length
      );

      const severity = this.getSeverityFromViolation(violation);
      const diagnostic = new vscode.Diagnostic(range, violation.message, severity);
      diagnostic.code = violation.id;
      diagnostic.source = 'Ethics Engine';
      
      diagnostics.push(diagnostic);
    });

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  public getLanguageFromDocument(document: vscode.TextDocument): 'javascript' | 'typescript' | 'python' {
    switch (document.languageId) {
      case 'javascript':
        return 'javascript';
      case 'typescript':
        return 'typescript';
      case 'python':
        return 'python';
      default:
        return 'javascript';
    }
  }

  private getSeverityFromViolation(violation: EthicalViolation): vscode.DiagnosticSeverity {
    switch (violation.severity) {
      case 'critical':
        return vscode.DiagnosticSeverity.Error;
      case 'high':
        return vscode.DiagnosticSeverity.Error;
      case 'medium':
        return vscode.DiagnosticSeverity.Warning;
      case 'low':
        return vscode.DiagnosticSeverity.Information;
      default:
        return vscode.DiagnosticSeverity.Warning;
    }
  }

  public clear(): void {
    this.diagnosticCollection.clear();
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('CodeSentinel Ethics Engine extension is now active');

  const ethicsEngine = new EthicsEngine();
  const policyLoader = new PolicyLoader();
  const llmIntegration = new LLMIntegration();
  const codeActionProvider = new EthicsCodeActionProvider(context);
  const diagnosticProvider = new EthicsDiagnosticProvider();

  // Initialize SaaS integration
  codeActionProvider.getSaaSIntegration().initialize();

  // Register CodeActionProvider for supported languages
  const languages = ['javascript', 'typescript', 'python'];
  languages.forEach(language => {
    context.subscriptions.push(
      vscode.languages.registerCodeActionsProvider(language, codeActionProvider)
    );
  });

  // Register SaaS commands
  context.subscriptions.push(
    vscode.commands.registerCommand('codesentinel.login', async () => {
      await codeActionProvider.getSaaSIntegration().login();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codesentinel.register', async () => {
      await codeActionProvider.getSaaSIntegration().register();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codesentinel.logout', async () => {
      await codeActionProvider.getSaaSIntegration().logout();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codesentinel.accountInfo', async () => {
      await codeActionProvider.getSaaSIntegration().showAccountInfo();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('codesentinel.cloudScan', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const saas = codeActionProvider.getSaaSIntegration();
      if (!saas.isAuthenticated()) {
        const action = await vscode.window.showErrorMessage(
          'Please sign in to use cloud scanning',
          'Sign In',
          'Register'
        );
        if (action === 'Sign In') {
          await saas.login();
        } else if (action === 'Register') {
          await saas.register();
        }
        return;
      }

      const files = [{
        path: editor.document.fileName,
        content: editor.document.getText()
      }];

      const result = await saas.submitScan(files);
      if (result) {
        vscode.window.showInformationMessage(
          `Cloud scan completed: ${result.results.length} issues found`
        );
      }
    })
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.scanFile', async (uri?: vscode.Uri) => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const document = uri ? await vscode.workspace.openTextDocument(uri) : editor.document;
      
      const analysisContext: AnalysisContext = {
        content: document.getText(),
        fileName: path.basename(document.fileName),
        language: codeActionProvider.getLanguageFromDocument(document),
        projectContext: vscode.workspace.name
      };

      const analysis = ethicsEngine.analyzeCode(analysisContext);
      const report = ethicsEngine.generateReport(analysisContext, analysis.metrics, analysis.violations);

      // Show results in output channel
      const outputChannel = vscode.window.createOutputChannel('Ethics Engine');
      outputChannel.clear();
      outputChannel.appendLine(report);
      outputChannel.show();

      // Update diagnostics
      await diagnosticProvider.analyzeDiagnostics(document);

      // Show summary
      const score = Math.round(analysis.metrics.overallEthicsScore * 100);
      const violationCount = analysis.violations.length;
      
      if (violationCount === 0) {
        vscode.window.showInformationMessage(`Ethics scan complete. Score: ${score}% - No violations found.`);
      } else {
        const criticalCount = analysis.violations.filter(v => v.severity === 'critical').length;
        if (criticalCount > 0) {
          vscode.window.showErrorMessage(`Ethics scan found ${violationCount} violations (${criticalCount} critical). Score: ${score}%`);
        } else {
          vscode.window.showWarningMessage(`Ethics scan found ${violationCount} violations. Score: ${score}%`);
        }
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.explainViolation', (violation: EthicalViolation) => {
      const message = `Ethical Violation Explanation:\n\n` +
        `Type: ${violation.type}\n` +
        `Severity: ${violation.severity}\n` +
        `Line: ${violation.line}\n` +
        `Message: ${violation.message}\n\n` +
        `Code: ${violation.codeSnippet}\n\n` +
        `Recommendation: ${violation.recommendation}\n` +
        `Confidence: ${Math.round(violation.confidence * 100)}%`;

      vscode.window.showInformationMessage(message, { modal: true });
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.analyzeWithLLM', async (uri: vscode.Uri, violation: EthicalViolation) => {
      try {
        const document = await vscode.workspace.openTextDocument(uri);
        const context = document.getText();
        const analysis = await llmIntegration.analyzeEthicalContext(context, violation);
        
        vscode.window.showInformationMessage(`LLM Analysis: ${analysis}`, { modal: true });
      } catch (error) {
        vscode.window.showErrorMessage(`LLM analysis failed: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.openDashboard', () => {
      // This will be implemented with the dashboard component
      vscode.window.showInformationMessage('Ethics Dashboard (Coming in next step)');
    })
  );

  // Enterprise addon commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.generateRemediation', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
      }

      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      try {
        const analysis = ethicsEngine.analyzeCode({
          content: editor.document.getText(),
          fileName: path.basename(editor.document.fileName),
          language: codeActionProvider.getLanguageFromDocument(editor.document),
          projectContext: vscode.workspace.name
        });

        if (analysis.violations.length === 0) {
          vscode.window.showInformationMessage('No violations found to remediate');
          return;
        }

        const adjustedViolations = await codeActionProvider.teamAwareness.adjustViolationsForDeveloper(
          analysis.violations,
          workspaceFolder.uri.fsPath
        );

        const outputChannel = vscode.window.createOutputChannel('Ethics Remediation');
        outputChannel.clear();
        outputChannel.appendLine('=== ETHICS REMEDIATION SUGGESTIONS ===\n');

        // Process each violation individually
        for (let i = 0; i < adjustedViolations.length; i++) {
          const violation = adjustedViolations[i];
          
          try {
            const remediations = await codeActionProvider.remediationEngine.generateRemediation({
              violation: violation,
              codeContext: {
                content: editor.document.getText(),
                fileName: path.basename(editor.document.fileName),
                language: codeActionProvider.getLanguageFromDocument(editor.document),
                projectContext: vscode.workspace.name || 'default'
              },
              policy: codeActionProvider.getCurrentPolicy() || await codeActionProvider.getPolicyLoader().createDefaultPolicy(),
              surroundingCode: editor.document.getText(),
              projectMetadata: {
                type: 'enterprise',
                compliance: ['SOX', 'GDPR'],
                sensitivityLevel: 'internal',
                industry: 'software'
              }
            });

            outputChannel.appendLine(`${i + 1}. ${violation.type} (${violation.adjustedSeverity})`);
            outputChannel.appendLine(`   Line ${violation.line}: ${violation.message}`);
            
            if (remediations.length > 0) {
              const remediation = remediations[0]; // Use first suggestion
              outputChannel.appendLine(`   Type: ${remediation.type}`);
              outputChannel.appendLine(`   Confidence: ${Math.round(remediation.confidence * 100)}%`);
              outputChannel.appendLine(`   Explanation: ${remediation.explanation}`);
              outputChannel.appendLine(`   Policy Compliant: ${remediation.policyCompliance.compliantWithPolicy ? 'Yes' : 'No'}`);
              outputChannel.appendLine(`   Effort: ${remediation.effort}\n`);
            } else {
              outputChannel.appendLine(`   No automatic remediation available\n`);
            }
          } catch (error) {
            outputChannel.appendLine(`   Error generating remediation: ${error}\n`);
          }
        }

        outputChannel.show();
        vscode.window.showInformationMessage(`Generated remediation suggestions for ${adjustedViolations.length} violations`);
      } catch (error) {
        vscode.window.showErrorMessage(`Remediation generation failed: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.scanPatentRisks', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      try {
        vscode.window.showInformationMessage('Scanning for patent infringement risks...');
        
        const scanResult = await codeActionProvider.patentScanner.scanWorkspace(workspaceFolder.uri.fsPath);
        
        const outputChannel = vscode.window.createOutputChannel('Patent Risk Scanner');
        outputChannel.clear();
        outputChannel.appendLine('=== PATENT INFRINGEMENT RISK SCAN ===\n');
        outputChannel.appendLine(`Files Scanned: ${scanResult.scannedFiles}`);
        outputChannel.appendLine(`Risks Found: ${scanResult.risksFound}`);
        outputChannel.appendLine(`High Risk: ${scanResult.highRiskCount}`);
        outputChannel.appendLine(`Critical Risk: ${scanResult.criticalRiskCount}`);
        outputChannel.appendLine(`Overall Risk: ${scanResult.summary.overallRisk}`);
        outputChannel.appendLine(`Estimated Legal Cost: ${scanResult.summary.estimatedLegalCost}\n`);

        if (scanResult.risks.length > 0) {
          outputChannel.appendLine('DETECTED RISKS:\n');
          scanResult.risks.forEach((risk, index) => {
            outputChannel.appendLine(`${index + 1}. ${risk.patentTitle || 'Unknown Patent'} (${risk.riskLevel})`);
            outputChannel.appendLine(`   File: ${risk.codeSection.file}:${risk.codeSection.startLine}`);
            outputChannel.appendLine(`   Description: ${risk.description}`);
            outputChannel.appendLine(`   Confidence: ${Math.round(risk.confidence * 100)}%`);
            outputChannel.appendLine(`   Recommendation: ${risk.recommendation}\n`);
          });
        }

        if (scanResult.recommendations.length > 0) {
          outputChannel.appendLine('\nRECOMMENDATIONS:\n');
          scanResult.recommendations.forEach((rec, index) => {
            outputChannel.appendLine(`${index + 1}. ${rec}`);
          });
        }

        outputChannel.show();

        if (scanResult.criticalRiskCount > 0) {
          vscode.window.showErrorMessage(`Critical patent risks found! Review ${scanResult.criticalRiskCount} critical issues immediately.`);
        } else if (scanResult.highRiskCount > 0) {
          vscode.window.showWarningMessage(`High patent risks detected. Found ${scanResult.highRiskCount} issues requiring review.`);
        } else if (scanResult.risksFound > 0) {
          vscode.window.showInformationMessage(`Patent scan complete. Found ${scanResult.risksFound} potential risks.`);
        } else {
          vscode.window.showInformationMessage('Patent scan complete. No patent infringement risks detected.');
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Patent scanning failed: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.installGitHooks', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      try {
        codeActionProvider.gitEnforcement.installGitHooks(workspaceFolder.uri.fsPath);
        vscode.window.showInformationMessage('Git pre-commit hooks installed successfully');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to install Git hooks: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.testPreCommit', async () => {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }

      try {
        vscode.window.showInformationMessage('Testing pre-commit enforcement...');
        
        const result = await codeActionProvider.gitEnforcement.executePreCommitHook(workspaceFolder.uri.fsPath);
        
        const outputChannel = vscode.window.createOutputChannel('Git Pre-Commit Test');
        outputChannel.clear();
        outputChannel.appendLine('=== PRE-COMMIT ENFORCEMENT TEST ===\n');
        outputChannel.appendLine(`Commit Allowed: ${result.allowed ? 'YES' : 'NO'}`);
        outputChannel.appendLine(`Violations Found: ${result.violations.length}`);
        outputChannel.appendLine(`Compliance Score: ${result.complianceReport.complianceScore}%`);
        outputChannel.appendLine(`Files Scanned: ${result.complianceReport.filesScanned}\n`);

        if (result.blockingReasons.length > 0) {
          outputChannel.appendLine('BLOCKING REASONS:\n');
          result.blockingReasons.forEach((reason, index) => {
            outputChannel.appendLine(`${index + 1}. ${reason}`);
          });
          outputChannel.appendLine('');
        }

        if (result.warnings.length > 0) {
          outputChannel.appendLine('WARNINGS:\n');
          result.warnings.forEach((warning, index) => {
            outputChannel.appendLine(`${index + 1}. ${warning}`);
          });
          outputChannel.appendLine('');
        }

        if (result.violations.length > 0) {
          outputChannel.appendLine('VIOLATIONS:\n');
          result.violations.forEach((violation, index) => {
            outputChannel.appendLine(`${index + 1}. ${violation.file}:${violation.line} - ${violation.violation.type}`);
            outputChannel.appendLine(`   Severity: ${violation.violation.adjustedSeverity}`);
            outputChannel.appendLine(`   Blocking: ${violation.isBlocking ? 'Yes' : 'No'}`);
            outputChannel.appendLine(`   Message: ${violation.violation.message}\n`);
          });
        }

        outputChannel.show();

        if (!result.allowed) {
          vscode.window.showErrorMessage('Pre-commit would be blocked due to critical violations');
        } else if (result.warnings.length > 0) {
          vscode.window.showWarningMessage(`Pre-commit would succeed with ${result.warnings.length} warnings`);
        } else {
          vscode.window.showInformationMessage('Pre-commit test passed successfully');
        }
      } catch (error) {
        vscode.window.showErrorMessage(`Pre-commit test failed: ${error}`);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('ethicsEngine.reloadPolicies', async () => {
      try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
          vscode.window.showErrorMessage('No workspace folder found');
          return;
        }

        const configPath = path.join(workspaceFolder.uri.fsPath, '.ethics', 'policies');
        const policies = await policyLoader.loadPoliciesFromDirectory(configPath);
        
        vscode.window.showInformationMessage(`Reloaded ${policies.length} ethics policies`);
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to reload policies: ${error}`);
      }
    })
  );

  // Auto-scan on save if enabled
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const config = vscode.workspace.getConfiguration('ethicsEngine');
      if (config.get('enableAutoScan', true)) {
        const supportedLanguages = ['javascript', 'typescript', 'python'];
        if (supportedLanguages.includes(document.languageId)) {
          await diagnosticProvider.analyzeDiagnostics(document);
        }
      }
    })
  );

  // Clean up diagnostics when files are closed
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnosticProvider.clear();
    })
  );

  context.subscriptions.push(diagnosticProvider);
}

export function deactivate() {
  console.log('Ethics Engine extension deactivated');
}
