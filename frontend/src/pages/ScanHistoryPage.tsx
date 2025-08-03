import React from 'react';
import { useSelector } from 'react-redux';
import { Clock, FileText, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import { RootState } from '../store';

export default function scanHistoryPage(): React.ReactElement {
  const { history } = useSelector((state: RootState) => state.scan);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
        <p className="text-gray-600">Review past ethical code analysis results</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="running">Running</option>
          </select>
          
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <input
            type="text"
            placeholder="Search by file path..."
            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Scan List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {history.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {history.map((scan) => (
              <div key={scan.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(scan.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {scan.fileName}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {scan.filePath}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">
                          {new Date(scan.timestamp).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          Score: {scan.overallScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* Violation Summary */}
                    <div className="flex space-x-2">
                      {scan.violations.critical > 0 && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor('critical')}`}>
                          {scan.violations.critical} Critical
                        </span>
                      )}
                      {scan.violations.warning > 0 && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor('warning')}`}>
                          {scan.violations.warning} Warning
                        </span>
                      )}
                      {scan.violations.info > 0 && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor('info')}`}>
                          {scan.violations.info} Info
                        </span>
                      )}
                    </div>
                    
                    <button className="flex items-center px-3 py-1 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar for Running Scans */}
                {scan.status === 'running' && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Scanning in progress...</span>
                      <span>{scan.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${scan.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No scans found</h3>
            <p className="mt-2 text-gray-500">
              Start your first ethical code analysis from the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
