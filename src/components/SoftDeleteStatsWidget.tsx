import { useState, useEffect } from 'react';
import { FiArchive, FiRotateCcw, FiTrash2, FiTrendingUp } from 'react-icons/fi';
import { organizationService, type SoftDeleteStats } from '../lib/api/services/organizations';

interface SoftDeleteStatsWidgetProps {
  organizationId?: string;
  className?: string;
}

export default function SoftDeleteStatsWidget({ 
  organizationId, 
  className = '' 
}: SoftDeleteStatsWidgetProps) {
  const [stats, setStats] = useState<SoftDeleteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [organizationId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getSoftDeleteStats(organizationId);
      setStats(data);
    } catch (error) {
      console.error('Failed to load soft delete stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const deletionRate = stats.total > 0 ? (stats.deleted / stats.total) * 100 : 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FiArchive className="w-5 h-5 text-gray-600" />
          Data Management
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          deletionRate > 10 
            ? 'bg-red-100 text-red-800' 
            : deletionRate > 5 
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {deletionRate.toFixed(1)}% deleted
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.deleted}</div>
          <div className="text-sm text-gray-500">Deleted</div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <FiTrash2 className="w-3 h-3" />
            Today
          </span>
          <span className="font-medium">{stats.deletedToday}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <FiTrendingUp className="w-3 h-3" />
            This Week
          </span>
          <span className="font-medium">{stats.deletedThisWeek}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600 flex items-center gap-1">
            <FiTrendingUp className="w-3 h-3" />
            This Month
          </span>
          <span className="font-medium">{stats.deletedThisMonth}</span>
        </div>
      </div>

      {stats.deleted > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/organizations?filter=deleted'}
            className="w-full text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
          >
            <FiRotateCcw className="w-3 h-3" />
            View & Restore Deleted Items
          </button>
        </div>
      )}
    </div>
  );
}
