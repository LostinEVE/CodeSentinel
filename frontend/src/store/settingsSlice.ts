import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  // General Settings
  organizationName: string;
  language: string;
  timezone: string;
  dateFormat: string;
  
  // Notifications
  emailNotifications: boolean;
  criticalAlerts: boolean;
  weeklyReports: boolean;
  
  // Security
  sessionTimeout: number;
  twoFactorAuth: boolean;
  
  // Scanning
  scanDepth: 'light' | 'medium' | 'deep';
  autoScanInterval: number;
  autoScanOnSave: boolean;
  
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  density: 'compact' | 'comfortable' | 'spacious';
  
  // Ethics Settings (from original)
  thresholds: {
    surveillance: number;
    discrimination: number;
    privacy: number;
    misuse: number;
    manipulation: number;
    overall: number;
  };
  enforcement: {
    mode: 'warn' | 'error' | 'block';
    autoFix: boolean;
    notifications: boolean;
    auditLog: boolean;
  };
  scanning: {
    fileTypes: string[];
    excludePaths: string[];
    maxFileSize: number;
    scanOnSave: boolean;
  };
  
  // State management
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

const initialState: SettingsState = {
  // General Settings
  organizationName: '',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  
  // Notifications
  emailNotifications: false,
  criticalAlerts: true,
  weeklyReports: false,
  
  // Security
  sessionTimeout: 30,
  twoFactorAuth: false,
  
  // Scanning
  scanDepth: 'medium',
  autoScanInterval: 24,
  autoScanOnSave: false,
  
  // Appearance
  theme: 'light',
  density: 'comfortable',
  
  // Ethics Settings
  thresholds: {
    surveillance: 0.7,
    discrimination: 0.8,
    privacy: 0.6,
    misuse: 0.75,
    manipulation: 0.8,
    overall: 0.7,
  },
  enforcement: {
    mode: 'warn',
    autoFix: false,
    notifications: true,
    auditLog: true,
  },
  scanning: {
    fileTypes: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cs', '.go'],
    excludePaths: ['node_modules', '.git', 'dist', 'build'],
    maxFileSize: 1048576, // 1MB
    scanOnSave: false,
  },
  
  // State management
  isLoading: false,
  error: null,
  hasUnsavedChanges: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
      state.hasUnsavedChanges = true;
    },
    
    updateThresholds: (state, action: PayloadAction<Partial<SettingsState['thresholds']>>) => {
      state.thresholds = { ...state.thresholds, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    updateEnforcement: (state, action: PayloadAction<Partial<SettingsState['enforcement']>>) => {
      state.enforcement = { ...state.enforcement, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    updateScanning: (state, action: PayloadAction<Partial<SettingsState['scanning']>>) => {
      state.scanning = { ...state.scanning, ...action.payload };
      state.hasUnsavedChanges = true;
    },
    
    saveSettings: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    saveSettingsSuccess: (state) => {
      state.isLoading = false;
      state.hasUnsavedChanges = false;
      state.error = null;
    },
    
    saveSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    loadSettings: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    loadSettingsSuccess: (state, action: PayloadAction<SettingsState>) => {
      Object.assign(state, action.payload);
      state.isLoading = false;
      state.hasUnsavedChanges = false;
      state.error = null;
    },
    
    loadSettingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    resetSettings: () => initialState,
    
    clearError: (state) => {
      state.error = null;
    },
    
    markAsUnsaved: (state) => {
      state.hasUnsavedChanges = true;
    },
  },
});

export const {
  updateSettings,
  updateThresholds,
  updateEnforcement,
  updateScanning,
  saveSettings,
  saveSettingsSuccess,
  saveSettingsFailure,
  loadSettings,
  loadSettingsSuccess,
  loadSettingsFailure,
  resetSettings,
  clearError,
  markAsUnsaved,
} = settingsSlice.actions;

export default settingsSlice.reducer;
