/**
 * Enterprise Addons Basic Tests
 */

import * as assert from 'assert';

suite('Enterprise Addons Basic Tests', () => {
  
  test('Should import enterprise modules successfully', async () => {
    try {
      const { EthicalRemediationEngine } = await import('../../addons/remediationEngine');
      const { TeamAwarenessEngine } = await import('../../addons/teamAwarenessEngine');
      const { PatentInfringementScanner } = await import('../../addons/patentInfringementScanner');
      const { LLMIntegration } = await import('../../llm/llmIntegration');

      assert.strictEqual(typeof EthicalRemediationEngine, 'function', 'Should import RemediationEngine');
      assert.strictEqual(typeof TeamAwarenessEngine, 'function', 'Should import TeamAwarenessEngine');
      assert.strictEqual(typeof PatentInfringementScanner, 'function', 'Should import PatentInfringementScanner');
      assert.strictEqual(typeof LLMIntegration, 'function', 'Should import LLMIntegration');
    } catch (error) {
      assert.fail(`Failed to import enterprise modules: ${error}`);
    }
  });

  test('Should create enterprise module instances', async () => {
    try {
      const { EthicalRemediationEngine } = await import('../../addons/remediationEngine');
      const { TeamAwarenessEngine } = await import('../../addons/teamAwarenessEngine');
      const { PatentInfringementScanner } = await import('../../addons/patentInfringementScanner');
      const { LLMIntegration } = await import('../../llm/llmIntegration');

      const llmIntegration = new LLMIntegration();
      const remediationEngine = new EthicalRemediationEngine(llmIntegration);
      const teamAwarenessEngine = new TeamAwarenessEngine();
      const patentScanner = new PatentInfringementScanner(llmIntegration);

      assert.strictEqual(remediationEngine instanceof EthicalRemediationEngine, true, 'Should create RemediationEngine instance');
      assert.strictEqual(teamAwarenessEngine instanceof TeamAwarenessEngine, true, 'Should create TeamAwarenessEngine instance');
      assert.strictEqual(patentScanner instanceof PatentInfringementScanner, true, 'Should create PatentScanner instance');
      assert.strictEqual(llmIntegration instanceof LLMIntegration, true, 'Should create LLMIntegration instance');
    } catch (error) {
      assert.fail(`Failed to create enterprise module instances: ${error}`);
    }
  });

  test('Should have public methods available', async () => {
    try {
      const { EthicalRemediationEngine } = await import('../../addons/remediationEngine');
      const { TeamAwarenessEngine } = await import('../../addons/teamAwarenessEngine');
      const { PatentInfringementScanner } = await import('../../addons/patentInfringementScanner');
      const { LLMIntegration } = await import('../../llm/llmIntegration');

      const llmIntegration = new LLMIntegration();
      const remediationEngine = new EthicalRemediationEngine(llmIntegration);
      const teamAwarenessEngine = new TeamAwarenessEngine();
      const patentScanner = new PatentInfringementScanner(llmIntegration);

      // Check that key methods exist
      assert.strictEqual(typeof remediationEngine.generateRemediation, 'function', 'RemediationEngine should have generateRemediation method');
      assert.strictEqual(typeof teamAwarenessEngine.adjustViolationsForDeveloper, 'function', 'TeamAwarenessEngine should have adjustViolationsForDeveloper method');
      assert.strictEqual(typeof patentScanner.scanFile, 'function', 'PatentScanner should have scanFile method');
      assert.strictEqual(typeof patentScanner.convertRisksToViolations, 'function', 'PatentScanner should have convertRisksToViolations method');
    } catch (error) {
      assert.fail(`Failed to verify public methods: ${error}`);
    }
  });

  test('Should validate extension integration', async () => {
    try {
      // Test that the extension module can be imported
      const extension = await import('../../extension');
      
      assert.strictEqual(typeof extension.activate, 'function', 'Extension should have activate function');
      assert.strictEqual(typeof extension.deactivate, 'function', 'Extension should have deactivate function');
    } catch (error) {
      assert.fail(`Failed to validate extension integration: ${error}`);
    }
  });

  test('Should validate policy loader functionality', async () => {
    try {
      const { PolicyLoader } = await import('../../core/policyLoader');
      
      const policyLoader = new PolicyLoader();
      assert.strictEqual(policyLoader instanceof PolicyLoader, true, 'Should create PolicyLoader instance');
      assert.strictEqual(typeof policyLoader.loadPolicy, 'function', 'PolicyLoader should have loadPolicy method');
    } catch (error) {
      assert.fail(`Failed to validate PolicyLoader: ${error}`);
    }
  });
});
