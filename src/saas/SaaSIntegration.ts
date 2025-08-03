/**
 * CodeSentinel VS Code Extension - SaaS Integration
 * 
 * This file handles authentication and API communication with the enterprise backend
 */

import * as vscode from 'vscode';
import axios, { AxiosInstance } from 'axios';

export interface SaaSUser {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'STARTER' | 'TEAM' | 'ENTERPRISE';
  scansUsed: number;
  quotaResetDate: string;
  teamId?: string;
}

export interface ScanQuota {
  scansPerMonth: number;
  scansUsed: number;
  resetDate: string;
  remaining: number;
}

export interface CloudScanResult {
  scanId: string;
  results: any[];
  usage: {
    filesScanned: number;
    executionTime: number;
    creditsUsed: number;
  };
  metadata: {
    timestamp: string;
    version: string;
  };
}

export class SaaSIntegration {
  private api: AxiosInstance;
  private context: vscode.ExtensionContext;
  private readonly API_BASE_URL: string;
  private currentUser: SaaSUser | null = null;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.API_BASE_URL = this.getApiBaseUrl();
    
    this.api = axios.create({
      baseURL: this.API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': `CodeSentinel-VSCode/${this.getExtensionVersion()}`,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Initialize SaaS integration
   */
  async initialize(): Promise<void> {
    const token = await this.getStoredToken();
    if (token) {
      try {
        await this.verifyToken(token);
        vscode.window.showInformationMessage('CodeSentinel: Connected to cloud service');
      } catch (error) {
        await this.clearAuth();
        vscode.window.showWarningMessage('CodeSentinel: Please sign in to use cloud features');
      }
    }
  }

  /**
   * Authenticate user with email/password
   */
  async login(): Promise<boolean> {
    try {
      const email = await vscode.window.showInputBox({
        prompt: 'Enter your CodeSentinel email',
        validateInput: (value) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Please enter a valid email';
        }
      });

      if (!email) return false;

      const password = await vscode.window.showInputBox({
        prompt: 'Enter your password',
        password: true,
      });

      if (!password) return false;

      const response = await this.api.post('/auth/login', { email, password });
      const { user, token, refreshToken } = response.data.data;

      await this.storeTokens(token, refreshToken);
      this.currentUser = user;

      vscode.window.showInformationMessage(`Welcome back, ${user.name}! Plan: ${user.plan}`);
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  /**
   * Register new user
   */
  async register(): Promise<boolean> {
    try {
      const name = await vscode.window.showInputBox({
        prompt: 'Enter your full name',
        validateInput: (value) => value.length >= 2 ? null : 'Name must be at least 2 characters'
      });

      if (!name) return false;

      const email = await vscode.window.showInputBox({
        prompt: 'Enter your email address',
        validateInput: (value) => {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Please enter a valid email';
        }
      });

      if (!email) return false;

      const password = await vscode.window.showInputBox({
        prompt: 'Create a password (min 8 chars, include uppercase, lowercase, number, and symbol)',
        password: true,
        validateInput: (value) => {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return regex.test(value) ? null : 'Password must meet security requirements';
        }
      });

      if (!password) return false;

      const response = await this.api.post('/auth/register', { name, email, password });
      const { user, token, refreshToken } = response.data.data;

      await this.storeTokens(token, refreshToken);
      this.currentUser = user;

      vscode.window.showInformationMessage(`Welcome to CodeSentinel, ${user.name}! You're on the ${user.plan} plan.`);
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const token = await this.getStoredToken();
      if (token) {
        await this.api.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      // Silent fail for logout
    } finally {
      await this.clearAuth();
      this.currentUser = null;
      vscode.window.showInformationMessage('CodeSentinel: Logged out successfully');
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): SaaSUser | null {
    return this.currentUser;
  }

  /**
   * Check scan quota
   */
  async checkQuota(): Promise<ScanQuota | null> {
    if (!this.isAuthenticated()) return null;

    try {
      const response = await this.api.get('/users/quota');
      return response.data.data;
    } catch (error) {
      console.error('Failed to check quota:', error);
      return null;
    }
  }

  /**
   * Submit scan to cloud
   */
  async submitScan(files: { path: string; content: string }[], options: any = {}): Promise<CloudScanResult | null> {
    if (!this.isAuthenticated()) {
      vscode.window.showErrorMessage('Please sign in to use cloud scanning');
      return null;
    }

    try {
      // Check quota first
      const quota = await this.checkQuota();
      if (quota && quota.remaining <= 0) {
        vscode.window.showErrorMessage('Scan quota exceeded. Please upgrade your plan or wait for quota reset.');
        return null;
      }

      vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'CodeSentinel: Scanning files...',
        cancellable: false
      }, async (progress) => {
        progress.report({ increment: 0 });
        
        const response = await this.api.post('/scans/submit', {
          files,
          options,
          projectId: vscode.workspace.name || 'untitled'
        });

        progress.report({ increment: 100 });
        return response.data.data;
      });

      const response = await this.api.post('/scans/submit', {
        files,
        options,
        projectId: vscode.workspace.name || 'untitled'
      });

      return response.data.data;
    } catch (error) {
      this.handleScanError(error);
      return null;
    }
  }

  /**
   * Get scan history
   */
  async getScanHistory(limit: number = 10): Promise<CloudScanResult[]> {
    if (!this.isAuthenticated()) return [];

    try {
      const response = await this.api.get(`/scans/history?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get scan history:', error);
      return [];
    }
  }

  /**
   * Show account info
   */
  async showAccountInfo(): Promise<void> {
    if (!this.isAuthenticated()) {
      vscode.window.showErrorMessage('Please sign in first');
      return;
    }

    const quota = await this.checkQuota();
    const user = this.currentUser!;

    const message = `
**CodeSentinel Account**
Name: ${user.name}
Email: ${user.email}
Plan: ${user.plan}
${quota ? `Scans used: ${quota.scansUsed}/${quota.scansPerMonth}` : ''}
${quota ? `Quota resets: ${new Date(quota.resetDate).toLocaleDateString()}` : ''}
    `.trim();

    vscode.window.showInformationMessage(message, 'Upgrade Plan', 'View Dashboard')
      .then(selection => {
        if (selection === 'Upgrade Plan') {
          vscode.env.openExternal(vscode.Uri.parse(`${this.API_BASE_URL}/billing/upgrade`));
        } else if (selection === 'View Dashboard') {
          vscode.env.openExternal(vscode.Uri.parse(`${this.API_BASE_URL}/dashboard`));
        }
      });
  }

  /**
   * Private helper methods
   */
  private getApiBaseUrl(): string {
    const config = vscode.workspace.getConfiguration('codesentinel');
    return config.get('apiUrl', 'https://api.codesentinel.com');
  }

  private getExtensionVersion(): string {
    return this.context.extension?.packageJSON?.version || '1.0.0';
  }

  private async getStoredToken(): Promise<string | undefined> {
    return await this.context.secrets.get('codesentinel.token');
  }

  private async storeTokens(token: string, refreshToken: string): Promise<void> {
    await this.context.secrets.store('codesentinel.token', token);
    await this.context.secrets.store('codesentinel.refreshToken', refreshToken);
  }

  private async clearAuth(): Promise<void> {
    await this.context.secrets.delete('codesentinel.token');
    await this.context.secrets.delete('codesentinel.refreshToken');
  }

  private async verifyToken(token: string): Promise<void> {
    const response = await this.api.post('/auth/verify', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    this.currentUser = response.data.data.user;
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await this.getStoredToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = await this.context.secrets.get('codesentinel.refreshToken');
          if (refreshToken) {
            try {
              const response = await axios.post(`${this.API_BASE_URL}/auth/refresh`, {
                refreshToken
              });
              const { token: newToken, refreshToken: newRefreshToken } = response.data.data;
              await this.storeTokens(newToken, newRefreshToken);
              
              // Retry original request
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return axios.request(error.config);
            } catch (refreshError) {
              await this.clearAuth();
              this.currentUser = null;
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private handleAuthError(error: any): void {
    const message = error.response?.data?.error?.message || 'Authentication failed';
    vscode.window.showErrorMessage(`CodeSentinel: ${message}`);
  }

  private handleScanError(error: any): void {
    const message = error.response?.data?.error?.message || 'Scan failed';
    vscode.window.showErrorMessage(`CodeSentinel: ${message}`);
  }
}
