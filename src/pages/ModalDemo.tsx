import { useState } from 'react';
import { CreateOrganizationModal } from '../components/Modals';
import { LoadingButton } from '../components/Loader';

export default function ModalDemo() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateOrganization = async (data: any) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Organization data:', data);
    setLoading(false);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Modal Components Demo</h1>
          <p className="text-gray-600 mb-8">
            This page demonstrates the improved modal components with better UX and design.
          </p>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Create Organization Modal</h2>
              <p className="text-blue-700 mb-4">
                A modern, user-friendly modal for creating organizations with:
              </p>
              <ul className="list-disc list-inside text-blue-700 space-y-1 mb-4">
                <li>Beautiful gradient header with icons</li>
                <li>Organized sections (Basic Info, Address, Tags, Status)</li>
                <li>Real-time form validation with error messages</li>
                <li>Interactive tag management</li>
                <li>Loading states and proper UX feedback</li>
                <li>Responsive design for all screen sizes</li>
                <li>Accessibility features</li>
              </ul>
              
              <LoadingButton
                onClick={() => setShowModal(true)}
                variant="primary"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Open Create Organization Modal
              </LoadingButton>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-2">Key Improvements</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-green-800 mb-2">Visual Design</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Modern gradient header</li>
                    <li>• Better spacing and typography</li>
                    <li>• Consistent icon usage</li>
                    <li>• Improved color scheme</li>
                    <li>• Better visual hierarchy</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-green-800 mb-2">User Experience</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Real-time validation</li>
                    <li>• Clear error messages</li>
                    <li>• Loading states</li>
                    <li>• Better form organization</li>
                    <li>• Intuitive interactions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-2">Technical Features</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Form Handling</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• TypeScript interfaces</li>
                    <li>• Controlled components</li>
                    <li>• Form validation</li>
                    <li>• Error state management</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Accessibility</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Proper ARIA labels</li>
                    <li>• Keyboard navigation</li>
                    <li>• Focus management</li>
                    <li>• Screen reader support</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-800 mb-2">Performance</h3>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    <li>• Optimized re-renders</li>
                    <li>• Efficient state updates</li>
                    <li>• Lazy loading support</li>
                    <li>• Memory cleanup</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateOrganizationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateOrganization}
        loading={loading}
      />
    </div>
  );
}
