import { ScanResult } from '../store/scanSlice';

export interface ScanRequest {
  filePath: string;
  options?: {
    depth?: 'light' | 'medium' | 'deep';
    includePatterns?: string[];
    excludePatterns?: string[];
  };
}

export interface ScanProgress {
  percentage: number;
  currentFile: string;
  filesProcessed: number;
  totalFiles: number;
  message: string;
}

class ScanService {
  private baseUrl = '/api/scan';

  async startScan(request: ScanRequest): Promise<{ scanId: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/start`, {
        method: 'POST',
        headers: {
          'contentType': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Scan failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to start scan:', error);
      throw error;
    }
  }

  async stopScan(scanId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${scanId}/stop`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to stop scan: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to stop scan:', error);
      throw error;
    }
  }

  async getScanProgress(scanId: string): Promise<ScanProgress> {
    try {
      const response = await fetch(`${this.baseUrl}/${scanId}/progress`);

      if (!response.ok) {
        throw new Error(`Failed to get scan progress: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get scan progress:', error);
      throw error;
    }
  }

  async getScanResult(scanId: string): Promise<ScanResult> {
    try {
      const response = await fetch(`${this.baseUrl}/${scanId}/result`);

      if (!response.ok) {
        throw new Error(`Failed to get scan result: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get scan result:', error);
      throw error;
    }
  }

  async getScanHistory(page = 1, limit = 20): Promise<{ scans: ScanResult[]; total: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/history?page=${page}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`Failed to get scan history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get scan history:', error);
      throw error;
    }
  }

  async markViolationAsResolved(scanId: string, violationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${scanId}/violations/${violationId}/resolve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark violation as resolved: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to mark violation as resolved:', error);
      throw error;
    }
  }

  async markViolationAsFalsePositive(scanId: string, violationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${scanId}/violations/${violationId}/false-positive`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to mark violation as false positive: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to mark violation as false positive:', error);
      throw error;
    }
  }

  async exportScanReport(scanId: string, format: 'pdf' | 'csv' | 'json'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/${scanId}/export?format=${format}`);

      if (!response.ok) {
        throw new Error(`Failed to export scan report: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Failed to export scan report:', error);
      throw error;
    }
  }

  // For demo purposes - simulate scan progress
  simulateScanProgress(
    onProgress: (progress: ScanProgress) => void,
    onComplete: (result: ScanResult) => void
  ): { stop: () => void } {
    let currentProgress = 0;
    let stopped = false;
    
    const files = [
      'src/components/UserProfile.js',
      'src/utils/dataProcessor.js',
      'src/services/analytics.js',
      'src/auth/permissions.js',
      'src/api/userTracking.js'
    ];

    const interval = setInterval(() => {
      if (stopped) {
        clearInterval(interval);
        return;
      }

      currentProgress += 20;
      const currentFileIndex = Math.floor(currentProgress / 20) - 1;
      
      onProgress({
        percentage: Math.min(currentProgress, 100),
        currentFile: files[currentFileIndex] || 'Completing scan...',
        filesProcessed: Math.min(Math.floor(currentProgress / 20), files.length),
        totalFiles: files.length,
        message: currentProgress < 100 ? 'Analyzing code for ethical violations...' : 'Finalizing results...'
      });

      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Simulate scan result
        const result: ScanResult = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          fileName: 'Project Scan',
          filePath: '/path/to/project',
          path: '/path/to/project',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 30000).toISOString(),
          endTime: new Date().toISOString(),
          overallScore: 75,
          violations: {
            critical: 2,
            warning: 5,
            info: 3
          },
          summary: {
            filesScanned: files.length,
            totalLines: 1250,
            issuesFound: 10
          },
          details: [
            {
              id: '1',
              type: 'privacy',
              severity: 'critical',
              message: 'Potential data leakage detected in user tracking function',
              line: 42,
              column: 15,
              recommendation: 'Implement proper data anonymization before tracking',
              ruleId: 'privacy-001'
            },
            {
              id: '2',
              type: 'discrimination',
              severity: 'high',
              message: 'Algorithm may exhibit bias in user scoring',
              line: 128,
              column: 8,
              recommendation: 'Review scoring algorithm for fairness across demographics',
              ruleId: 'fairness-002'
            }
          ]
        };

        onComplete(result);
      }
    }, 1000);

    return {
      stop: () => {
        stopped = true;
        clearInterval(interval);
      }
    };
  }
}

export const scanService = new ScanService();
