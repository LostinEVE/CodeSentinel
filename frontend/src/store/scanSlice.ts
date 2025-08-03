import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ViolationSummary {
  critical: number;
  warning: number;
  info: number;
}

export interface ScanSummary {
  filesScanned: number;
  totalLines: number;
  issuesFound: number;
}

export interface Violation {
  id: string;
  type: 'surveillance' | 'discrimination' | 'privacy' | 'misuse' | 'manipulation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  line: number;
  column?: number;
  recommendation: string;
  ruleId: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  fileName: string;
  filePath: string;
  path: string;
  violations: ViolationSummary;
  overallScore: number;
  status: 'completed' | 'failed' | 'pending' | 'running' | 'stopped';
  progress: number;
  startTime: string;
  endTime?: string;
  summary: ScanSummary;
  details?: Violation[];
}

interface ScanState {
  scans: ScanResult[];
  currentScan: ScanResult | null;
  isScanning: boolean;
  progress: number;
  results: ScanResult | null;
  lastScan: ScanResult | null;
  history: ScanResult[];
  error: string | null;
}

const initialState: ScanState = {
  scans: [],
  currentScan: null,
  isScanning: false,
  progress: 0,
  results: null,
  lastScan: null,
  history: [],
  error: null,
};

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    startScan: (state, action: PayloadAction<string>) => {
      state.isScanning = true;
      state.progress = 0;
      state.currentScan = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        fileName: action.payload.split('/').pop() || '',
        filePath: action.payload,
        path: action.payload,
        status: 'running',
        progress: 0,
        startTime: new Date().toISOString(),
        overallScore: 0,
        violations: {
          critical: 0,
          warning: 0,
          info: 0,
        },
        summary: {
          filesScanned: 0,
          totalLines: 0,
          issuesFound: 0,
        },
      };
      state.error = null;
    },
    stopScan: (state) => {
      state.isScanning = false;
      if (state.currentScan) {
        state.currentScan.status = 'stopped';
        state.currentScan.endTime = new Date().toISOString();
      }
    },
    setScanProgress: (state, action: PayloadAction<number>) => {
      state.progress = action.payload;
      if (state.currentScan) {
        state.currentScan.progress = action.payload;
      }
    },
    setScanResults: (state, action: PayloadAction<ScanResult>) => {
      state.currentScan = action.payload;
      state.results = action.payload;
      state.lastScan = action.payload;
      state.history.unshift(action.payload);
      state.scans.unshift(action.payload);
      state.isScanning = false;
      state.progress = 100;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentScan: (state, action: PayloadAction<ScanResult>) => {
      state.currentScan = action.payload;
    },
    clearCurrentScan: (state) => {
      state.currentScan = null;
    },
  },
});

export const { 
  startScan, 
  stopScan, 
  setScanProgress, 
  setScanResults,
  clearError,
  setCurrentScan,
  clearCurrentScan
} = scanSlice.actions;

export default scanSlice.reducer;
