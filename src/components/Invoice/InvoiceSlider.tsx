import  { useState } from 'react';
import { FiX, FiUser, FiCalendar } from 'react-icons/fi';

interface Invoice {
  id: string;
  inspectionId: string;
  client: string;
  address: string;
  serviceName: string;
  serviceProvider: string;
  created: string;
  amount: number;
  status: 'Unsent' | 'Due' | 'Past Due' | 'Paid';
}

interface InvoiceSliderProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function InvoiceSlider({ isOpen, onClose, invoice }: InvoiceSliderProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'services'>('details');

  if (!isOpen || !invoice) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Past Due':
        return 'bg-red-500 text-white';
      case 'Due':
        return 'bg-orange-500 text-white';
      case 'Paid':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const services = [
    { name: 'Dental Consultation', amount: 150.00 },
    { name: 'Teeth Cleaning', amount: 120.00 },
    { name: 'X-Ray Examination', amount: 150.00 },
    { name: 'Fluoride Treatment', amount: 80.00 },
    { name: 'Dental Crown', amount: 368.00 }
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-white/10 backdrop-blur-md z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Slider Panel */}
      <div className={`fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Invoice Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Client Details
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Services
          </button>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Invoice Number & Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Invoice date</div>
                  <div className="font-medium text-gray-900">{invoice.created}</div>
                </div>
              </div>

              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                {invoice.status}
              </div>

              {/* Client Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiUser className="w-5 h-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-500">Full Name</div>
                    <div className="font-semibold text-gray-900">{invoice.client}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="text-sm text-gray-500">Inspection Date</div>
                      <div className="font-medium text-gray-900">{invoice.created}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="w-5 h-5 text-red-500" />
                    <div>
                      <div className="text-sm text-gray-500">Payment Due Date</div>
                      <div className="font-medium text-red-600">06/15/2025</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-2">Description</label>
                  <textarea
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
                    rows={4}
                    placeholder="Enter description..."
                    defaultValue={`Invoice for ${invoice.serviceName} services provided by ${invoice.serviceProvider}. Total amount: $${invoice.amount.toFixed(2)}`}
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Provider:</span>
                  <span className="font-medium text-gray-900">{invoice.serviceProvider}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-lg text-[#0A0F56]">${invoice.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Services Provided</h3>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">Professional service</div>
                    </div>
                    <div className="font-semibold text-[#0A0F56]">
                      ${service.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">$868.00</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Tax (8%):</span>
                  <span className="font-medium">$69.44</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-[#0A0F56] pt-2 border-t">
                  <span>Total:</span>
                  <span>${invoice.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 