import { useState, useEffect } from 'react';
import { 
  FiActivity, 
  FiSearch, 
  FiFilter, 
  FiDownload,
  FiAlertTriangle,
  FiInfo,
  FiAlertCircle,
  FiClock,
  FiUser,
  FiHome,
  FiShield,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';
import { systemService, type SystemLog, type AuditLog } from '../lib/api/services/system';

interface UnifiedLog {
  _id: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  type?: string;
  action?: string;
  resource?: string;
  userEmail?: string;
  organizationId?: string;
  result?: 'success' | 'failure';
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<UnifiedLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [logType, setLogType] = useState<'system' | 'audit'>('system');

  const limit = 20;

  useEffect(() => {
    loadLogs();
  }, [currentPage, filterType, filterSeverity, logType]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const params = {
        page: currentPage,
        limit,
        type: filterType !== 'all' ? filterType : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined
      };
      
      let data;
      if (logType === 'system') {
        data = await systemService.getSystemLogs(params);
        const unifiedLogs: UnifiedLog[] = data.logs.map((log: SystemLog) => ({
          _id: log._id,
          message: log.message,
          timestamp: log.timestamp,
          severity: log.severity,
          type: log.type
        }));
        setLogs(unifiedLogs);
      } else {
        data = await systemService.getAuditLogs(params);
        const unifiedLogs: UnifiedLog[] = data.logs.map((log: AuditLog) => ({
          _id: log._id,
          message: log.action,
          timestamp: log.timestamp,
          severity: 'info', // Audit logs don't have severity, default to info
          action: log.action,
          resource: log.resource,
          userEmail: log.userEmail,
          organizationId: log.organizationId,
          result: log.result
        }));
        setLogs(unifiedLogs);
      }
      setTotalLogs(data.total);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error('Failed to load logs:', error);
      setLogs([]);
      setTotalLogs(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'error':
      case 'critical':
        return <FiAlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
      default:
        return <FiInfo className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'error':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    loadLogs();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log('Export logs');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Logs</h1>
            <p className="text-gray-600">Monitor system activities and audit trails</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Total: {totalLogs} logs
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Log Type Toggle */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setLogType('system')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              logType === 'system'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            System Logs
          </button>
          <button
            onClick={() => setLogType('audit')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              logType === 'audit'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search logs by message, action, or resource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="user_created">User Created</option>
              <option value="organization_created">Organization Created</option>
              <option value="branch_created">Branch Created</option>
              <option value="login">Login</option>
              <option value="error">Error</option>
              <option value="system">System</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="critical">Critical</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading logs...</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log, index) => {
                const timestamp = formatTimestamp(log.timestamp);
                const isAuditLog = !!log.action;
                
                return (
                  <div key={log._id || index} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(log.severity)}`}>
                            {getSeverityIcon(log.severity)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-sm font-medium text-gray-900">
                              {isAuditLog ? log.action : log.type}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(log.severity)}`}>
                              {log.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {log.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <FiClock className="w-3 h-3 mr-1" />
                              {timestamp.date} at {timestamp.time}
                            </div>
                            {isAuditLog && log.userEmail && (
                              <div className="flex items-center">
                                <FiUser className="w-3 h-3 mr-1" />
                                {log.userEmail}
                              </div>
                            )}
                            {isAuditLog && log.organizationId && (
                              <div className="flex items-center">
                                <FiHome className="w-3 h-3 mr-1" />
                                Organization: {log.organizationId}
                              </div>
                            )}
                            {isAuditLog && log.result && (
                              <div className={`flex items-center ${
                                log.result === 'success' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                <FiShield className="w-3 h-3 mr-1" />
                                {log.result.toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <button className="text-gray-400 hover:text-gray-600">
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * limit + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * limit, totalLogs)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{totalLogs}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {filteredLogs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FiActivity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' || filterSeverity !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No logs have been recorded yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
