import React, { useState } from 'react';
import { 
  Loader, 
  LoadingButton, 
  CardLoadingWrapper
} from './index';
import { useLoading } from '../../lib/hooks/useLoading';
import { useGlobalLoading } from '../../lib/contexts/LoadingContext';

export const LoadingDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);

  // Using the loading hook
  const { isLoading, setError } = useLoading({
    onError: (err: any) => console.error('Loading error:', err),
    onSuccess: () => console.log('Loading completed successfully'),
  });

  // Simulate async loading
  const [asyncData, setAsyncData] = useState<any>(null);
  const [, setAsyncLoading] = useState(false);

  const handleAsyncLoad = async () => {
    setAsyncLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAsyncData({ message: 'Data loaded successfully!' });
    } catch (err) {
      console.error('Async loading error:', err);
    } finally {
      setAsyncLoading(false);
    }
  };

  // Using global loading
  const { startGlobalLoading, stopGlobalLoading } = useGlobalLoading();

  const handleSimulateLoading = () => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      setLoading(false);
      setData([{ id: 1, name: 'Sample Data' }]);
    }, 2000);
  };

  const handleSimulateError = () => {
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      setLoading(false);
      setError('Failed to load data. Please try again.');
    }, 2000);
  };

  const handleAsyncLoading = async () => {
    await handleAsyncLoad();
    if (asyncData) {
      console.log('Async loading result:', asyncData);
    }
  };

  const handleGlobalLoading = () => {
    startGlobalLoading('Processing your request...');
    
    setTimeout(() => {
      stopGlobalLoading();
    }, 3000);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Loading Components Demo</h1>
      
      {/* Basic Loaders */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Basic Loaders</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Spinner</h3>
            <Loader variant="spinner" size="md" color="primary" />
          </div>
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Dots</h3>
            <Loader variant="dots" size="md" color="success" />
          </div>
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Pulse</h3>
            <Loader variant="pulse" size="md" color="warning" />
          </div>
          <div className="p-4 border rounded-lg text-center">
            <h3 className="font-medium mb-2">Bars</h3>
            <Loader variant="bars" size="md" color="error" />
          </div>
        </div>
      </section>

      {/* Loading Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Loading Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <LoadingButton
            loading={loading}
            loadingText="Loading..."
            variant="primary"
            onClick={handleSimulateLoading}
          >
            Primary Button
          </LoadingButton>
          
          <LoadingButton
            loading={isLoading}
            loadingText="Processing..."
            variant="success"
            onClick={handleAsyncLoading}
          >
            Async Loading
          </LoadingButton>
          
          <LoadingButton
            loading={false}
            variant="warning"
            onClick={handleGlobalLoading}
          >
            Global Loading
          </LoadingButton>
        </div>
      </section>

      {/* Loading Wrappers */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Loading Wrappers</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Loading */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Card Loading</h3>
            <CardLoadingWrapper
              loading={loading}
              error={loading ? 'Loading...' : ''}
              text="Loading card data..."
            >
              <div className="p-4 bg-gray-50 rounded">
                <h4 className="font-medium">Card Content</h4>
                <p className="text-sm text-gray-600">This is the loaded content.</p>
              </div>
            </CardLoadingWrapper>
          </div>

          {/* Table Loading */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Table Loading</h3>
            <CardLoadingWrapper
              loading={loading}
              error={loading ? 'Loading...' : ''}
              text="Loading table data..."
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">{item.id}</td>
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">Active</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardLoadingWrapper>
          </div>
        </div>
      </section>

      {/* Skeleton Loaders */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Skeleton Loaders</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Card Skeleton</h3>
            <Loader variant="skeleton" size="md" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Table Skeleton</h3>
            <Loader variant="skeleton" size="lg" />
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">List Skeleton</h3>
            <Loader variant="skeleton" size="sm" />
          </div>
        </div>
      </section>

      {/* Control Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Test Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSimulateLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Simulate Loading
          </button>
          <button
            onClick={handleSimulateError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Simulate Error
          </button>
          <button
            onClick={() => {
              setLoading(false);
              setError('');
              setData([]);
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset
          </button>
        </div>
      </section>
    </div>
  );
};

export default LoadingDemo;
