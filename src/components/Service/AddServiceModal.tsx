import { useState, useEffect } from 'react';
import type { Service } from '../../lib/api/services/services';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (serviceData: ServiceFormData) => void;
  isSubmitting: boolean;
  mode: 'create' | 'update';
  service?: Service;
}

export interface ServiceFormData {
  name: string;
  price: string;
  description: string;
  features: string[];
}

export function AddServiceModal({ isOpen, onClose, onSubmit, isSubmitting, mode, service }: AddServiceModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    price: '',
    description: '',
    features: [''],
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'update' && service) {
        setFormData({
          name: service.name,
          price: service.price.toString(),
          description: service.description,
          features: service.features.length > 0 ? service.features : [''],
        });
      } else {
        setFormData({
          name: '',
          price: '',
          description: '',
          features: [''],
        });
      }
    }
  }, [mode, service, isOpen]);

  const handleFeatureChange = (idx: number, value: string) => {
    const updated = [...formData.features];
    updated[idx] = value;
    setFormData({ ...formData, features: updated });
  };

  const addFeature = () => setFormData({ ...formData, features: [...formData.features, ''] });
  const removeFeature = (idx: number) => setFormData({ ...formData, features: formData.features.filter((_, i) => i !== idx) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{mode === 'create' ? 'Add Service' : 'Update Service'}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div>
            <label className="block text-sm mb-2">Service Name</label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g., General Dentistry, Orthodontics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm mb-2">Price</label>
            <input
              type="number"
              required
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="e.g., 75, 100-300"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-2">Description</label>
            <textarea
              required
              disabled={isSubmitting}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm h-24 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Briefly describe the service and its benefits"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm mb-2">Features</label>
            <div className="bg-[#F8F7FF] p-4 rounded-lg space-y-3">
              {formData.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder={`Feature ${idx + 1} (e.g., Check-ups, Cleaning)`}
                    className="flex-1 bg-white border border-gray-200 rounded-lg p-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    value={feature}
                    onChange={e => handleFeatureChange(idx, e.target.value)}
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Remove feature"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                disabled={isSubmitting}
                className="text-[#0A0F56] text-sm hover:underline flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="mr-1">+</span> Add Feature
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0A0F56] text-white px-6 py-3 rounded-lg text-sm hover:bg-[#090D45] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {mode === 'create' ? 'Adding Service...' : 'Updating Service...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? 'Add Service' : 'Update Service'}
                  <span className="ml-2">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 