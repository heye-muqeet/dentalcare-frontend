import type { Service } from '../../lib/api/services/services';

interface ServiceProps {
  id: string;
  title: string;
  description: string;
  price: string;
  features: string[];
  onDelete: () => void;
  onEdit: (service: Service) => void;
  isDeleting: boolean;
}

export function Service({
  id,
  title,
  description,
  price,
  features,
  onDelete,
  onEdit,
  isDeleting
}: ServiceProps) {
  const handleEdit = () => {
    onEdit({
      id,
      name: title,
      price: parseFloat(price.replace(/[^0-9.]/g, '')),
      description,
      features,
      location: '',
      organization: '',
      createdAt: '',
      updatedAt: ''
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      {/* Card Header with Gradient Background */}
      <div className="bg-gradient-to-r from-[#0A0F56] to-[#232a7c] p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-white truncate">{title}</h3>
            <div className="text-sm font-medium text-white/80 mt-1">
              {price}
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleEdit}
              className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors duration-200"
              aria-label="Edit service"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={onDelete}
              disabled={isDeleting}
              className="text-white/90 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Delete service"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
              <svg className="w-4 h-4 text-[#0A0F56] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="truncate font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 