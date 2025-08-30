import { Service } from '../components/Service/ServiceCard';
import { useState, useEffect } from 'react';
import { FaPlus } from "react-icons/fa";
import { AddServiceModal } from '../components/Service/AddServiceModal';
import type { ServiceFormData } from '../components/Service/AddServiceModal';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { fetchServices, createService, updateService, deleteService } from '../lib/store/slices/servicesSlice';
import { toast } from 'react-hot-toast';
import type { RootState } from '../lib/store/store';
import type { Service as ServiceType } from '../lib/api/services/services';

export default function Services() {
  const dispatch = useAppDispatch();
  const { services, isLoading, error, isCreating, createError, isUpdating, updateError, isDeleting, deleteError } = useAppSelector((state: RootState) => state.services);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    if (createError) {
      toast.error(createError);
    }
    if (updateError) {
      toast.error(updateError);
    }
    if (deleteError) {
      toast.error(deleteError);
    }
  }, [error, createError, updateError, deleteError]);

  const handleAddButtonClick = () => {
    setEditingService(null);
    setIsAddModalOpen(true);
  };

  const handleEditService = (service: ServiceType) => {
    setEditingService(service);
    setIsAddModalOpen(true);
  };

  const handleServiceSubmit = async (serviceData: ServiceFormData) => {
    try {
      if (editingService) {
        await dispatch(updateService({
          id: editingService.id,
          serviceData: {
            name: serviceData.name,
            price: parseFloat(serviceData.price.replace(/[^0-9.]/g, '')),
            description: serviceData.description,
            features: serviceData.features.filter(f => f.trim() !== '')
          }
        })).unwrap();
        toast.success('Service updated successfully');
      } else {
        await dispatch(createService({
          name: serviceData.name,
          price: parseFloat(serviceData.price.replace(/[^0-9.]/g, '')),
          description: serviceData.description,
          features: serviceData.features.filter(f => f.trim() !== '')
        })).unwrap();
        toast.success('Service created successfully');
      }
      setIsAddModalOpen(false);
      setEditingService(null);
    } catch (error) {
      // Error is handled by the Redux slice
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await dispatch(deleteService(id)).unwrap();
        toast.success('Service deleted successfully');
      } catch (error) {
        // Error is handled by the Redux slice
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A0F56]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-[#0A0F56]">Services</h2>
          <p className="text-gray-500 text-md">
            Manage all dental services and treatments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddButtonClick}
            disabled={isCreating || isUpdating}
            className="bg-gradient-to-r from-[#0A0F56] to-[#232a7c] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center hover:from-[#232a7c] hover:to-[#0A0F56] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPlus className="mr-2 text-base" />
            Add Service
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Service
              key={service.id}
              id={service.id}
              title={service.name}
              description={service.description}
              price={`$${service.price}`}
              features={service.features}
              onDelete={() => handleDeleteService(service.id)}
              onEdit={handleEditService}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      </div>

      {/* Add/Edit Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingService(null);
        }}
        onSubmit={handleServiceSubmit}
        isSubmitting={isCreating || isUpdating}
        mode={editingService ? 'update' : 'create'}
        service={editingService || undefined}
      />
    </div>
  );
} 