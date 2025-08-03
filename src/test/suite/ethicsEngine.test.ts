/**
 * Ethics Engine Core Tests
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { EthicsEngine } from '../../core/ethicsEngine';

suite('Ethics Engine Core Tests', () => {
  let ethicsEngine: EthicsEngine;

  setup(async () => {
    ethicsEngine = new EthicsEngine();
  });

  test('Should detect nationality-based discrimination', async () => {
    const code = `
      if (user.nationality === "china" || user.nationality === "iran") {
        return false;
      }
    `;
    
    const result = ethicsEngine.analyzeCode({
      content: code,
      fileName: 'test.js',
      language: 'javascript'
    });

    assert.strictEqual(result.violations.length > 0, true, 'Should detect discrimination violation');
    assert.strictEqual(result.violations[0].type, 'discriminationRisk', 'Should classify as discrimination risk');
    assert.strictEqual(result.violations[0].severity, 'critical', 'Should be critical severity');
  });

  test('Should detect surveillance patterns', async () => {
    const code = `
      navigator.geolocation.getCurrentPosition((position) => {
        trackUser(position);
      });
    `;
    
    const result = ethicsEngine.analyzeCode({
      content: code,
      fileName: 'test.js',
      language: 'javascript'
    });

    assert.strictEqual(result.violations.length > 0, true, 'Should detect surveillance violation');
    assert.strictEqual(result.violations[0].type, 'surveillanceRisk', 'Should classify as surveillance risk');
  });

  test('Should detect authentication bypass', async () => {
    const code = `
      if (username === "admin" && password === "debug") {
        return { authenticated: true, bypass: true };
      }
    `;
    
    const result = ethicsEngine.analyzeCode({
      content: code,
      fileName: 'test.js',
      language: 'javascript'
    });

    assert.strictEqual(result.violations.length > 0, true, 'Should detect misuse violation');
    assert.strictEqual(result.violations[0].type, 'misuseRisk', 'Should classify as misuse risk');
    assert.strictEqual(result.violations[0].severity, 'critical', 'Should be critical severity');
  });

  test('Should calculate proper risk scores', async () => {
    const code = `
      if (user.gender === "female") {
        user.salary *= 0.8;
      }
    `;
    
    const result = ethicsEngine.analyzeCode({
      content: code,
      fileName: 'test.js',
      language: 'javascript'
    });

    assert.strictEqual(result.violations.length > 0, true, 'Should detect violation');
    assert.strictEqual(result.violations[0].confidence > 0.8, true, 'Should have high confidence score');
  });

  test('Should handle empty code', async () => {
    const result = ethicsEngine.analyzeCode({
      content: '',
      fileName: 'test.js',
      language: 'javascript'
    });

    assert.strictEqual(result.violations.length, 0, 'Empty code should have no violations');
  });

  test('Should handle legitimate code', async () => {
    const code = `
      function calculateDiscount(user) {
        if (user.membershipLevel === 'premium') {
          return 0.2;
        }
        return 0.1;
      }
    `;
    
    const result = ethicsEngine.analyzeCode({
      content: code,
      fileName: 'test.js',
      language: 'javascript'
    });

    assert.strictEqual(result.violations.length, 0, 'Legitimate code should have no violations');
  });

  test('Should have proper risk metrics structure', async () => {
    const code = `
      if (user.nationality === "china") {
        return false;
      }
    `;
    
    const result = ethicsEngine.analyzeCode({
      content: code,
      fileName: 'test.js',
      language: 'javascript'
    });

    assert.strictEqual(typeof result.metrics.discriminationRisk, 'number', 'Should have discrimination risk metric');
    assert.strictEqual(typeof result.metrics.surveillanceRisk, 'number', 'Should have surveillance risk metric');
    assert.strictEqual(typeof result.metrics.overallEthicsScore, 'number', 'Should have overall ethics score');
    assert.strictEqual(result.metrics.discriminationRisk > 0, true, 'Should detect discrimination risk');
  });
});
