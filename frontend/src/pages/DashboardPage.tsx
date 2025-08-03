import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Pause, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { RootState } from '../store';
import { startScan, stopScan, setScanProgress } from '../store/scanSlice';

export default function dashboardPage(): React.ReactElement {
  const dispatch = useDispatch();
  const { isScanning, progress, results, lastScan } = useSelector((state: RootState) => state.scan);
  const [selectedPath, setSelectedPath] = useState<string>('');

  const handleStartScan = (): void => {
    if (!selectedPath) {
      // Show toast error
      return;
    }
    dispatch(startScan(selectedPath));
  };

  const handleStopScan = (): void => {
    dispatch(stopScan());
  };

  // Simulate progress updates during scanning
  useEffect(() => {
    if (isScanning && progress < 100) {
      const timer = setTimeout(() => {
        dispatch(setScanProgress(progress + 10));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isScanning, progress, dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Monitor and analyze your codebase for ethical compliance</p>
      </div>

      {/* Scan Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Code Analysis</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="scan-path" className="block text-sm font-medium text-gray-700 mb-2">
              Select Directory to Scan
            </label>
            <input
              id="scan-path"
              type="text"
              value={selectedPath}
              onChange={(e) => setSelectedPath(e.target.value)}
              placeholder="/path/to/your/project"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isScanning}
            />
          </div>

          <div className="flex space-x-3">
            {!isScanning ? (
              <button
                onClick={handleStartScan}
                disabled={!selectedPath}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Scan
              </button>
            ) : (
              <button
                onClick={handleStopScan}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Pause className="w-4 h-4 mr-2" />
                Stop Scan
              </button>
            )}
            
            <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Progress Bar */}
          {isScanning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Scanning in progress...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Critical Issues</p>
              <p className="text-2xl font-semibold text-gray-900">
                {results?.violations?.critical || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Warnings</p>
              <p className="text-2xl font-semibold text-gray-900">
                {results?.violations?.warning || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Files Passed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {results?.summary?.filesScanned || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        {lastScan ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">{lastScan.path}</p>
                  <p className="text-sm text-gray-500">
                    Completed {new Date(lastScan.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {lastScan.violations.critical + lastScan.violations.warning + lastScan.violations.info} issues found
                </p>
                <p className="text-xs text-gray-500">
                  {lastScan.summary.filesScanned} files scanned
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent scans available</p>
        )}
      </div>
    </div>
  );
}
