import React from 'react';
import { useGlobalLoading } from '../../lib/contexts/LoadingContext';
import { Loader } from './Loader';

export const GlobalLoadingOverlay: React.FC = () => {
  const { globalLoading } = useGlobalLoading();

  if (!globalLoading.isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader
            variant="spinner"
            size="lg"
            color="primary"
          />
          
          {globalLoading.loadingText && (
            <p className="text-lg font-medium text-gray-900 text-center">
              {globalLoading.loadingText}
            </p>
          )}
          
          {globalLoading.progress !== null && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{globalLoading.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${globalLoading.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;
