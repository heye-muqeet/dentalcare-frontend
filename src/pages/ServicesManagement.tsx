import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { serviceService, Service } from '../lib/api/services/services';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiClock, FiDollarSign, FiTag, FiFileText } from 'react-icons/fi';
import CreateServiceModal from '../components/Modals/CreateServiceModal';

const ServicesManagement: React.FC = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  useEffect(() => {
    const loadServices = async () => {
      if (!branchId) return;
      
      try {
        console.log('Loading services for branch:', branchId);
        setIsLoading(true);
        const response = await serviceService.getBranchServices(branchId);
        if (response.success) {
          setServices(response.data);
        }
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadServices();
  }, [branchId]);

  // Filter services based on search term
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewService = async (service: Service) => {
    try {
      console.log('Viewing service:', service._id);
      const response = await serviceService.getServiceById(service._id);
      if (response.success) {
        setSelectedService(response.data);
        // You can implement a view modal here
      }
    } catch (error) {
      console.error('Error fetching service details:', error);
    }
  };

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    // You can implement an edit modal here
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
      try {
        await serviceService.deleteService(service._id);
        setServices(services.filter(s => s._id !== service._id));
      } catch (error) {
        console.error('Error deleting service:', error);
      }
    }
  };

  const handleServiceCreated = () => {
    // Reload services after creation
    const loadServices = async () => {
      if (!branchId) return;
      
      try {
        const response = await serviceService.getBranchServices(branchId);
        if (response.success) {
          setServices(response.data);
        }
      } catch (error) {
        console.error('Error loading services:', error);
      }
    };

    loadServices();
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-80"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="flex items-center space-x-4">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    <div className="h-7 bg-gray-200 rounded w-32"></div>
                    <div className="h-7 bg-gray-200 rounded w-36"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600 mt-1">Manage services offered in your branch</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search services by name, description, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          {/* Filter Button */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          {/* Add Service Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12">
          <FiFileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No services match your search criteria.' : 'Get started by adding your first service.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Service
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredServices.map((service) => (
            <div key={service._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-3">
                <div className="flex items-start justify-between">
                  {/* Service Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded flex items-center justify-center">
                        <FiFileText className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Name and Status */}
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {service.name}
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          service.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {service.description}
                      </p>
                      
                      {/* Service Details */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FiTag className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-20">{service.category}</span>
                        </div>
                        <div className="flex items-center">
                          <FiClock className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{service.duration} min</span>
                        </div>
                        <div className="flex items-center">
                          <FiDollarSign className="w-3 h-3 mr-1 text-gray-400" />
                          <span>
                            {service.isPriceRange && service.maxPrice 
                              ? `$${service.price} - $${service.maxPrice}`
                              : `$${service.price}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => handleViewService(service)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors w-full"
                      title="View Service Details"
                    >
                      <span>View Details</span>
                      <FiEye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditService(service)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors w-full"
                      title="Edit Service"
                    >
                      <span>Edit Service</span>
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded transition-colors w-full"
                      title="Delete Service"
                    >
                      <span>Delete</span>
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateServiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleServiceCreated}
      />
    </div>
  );
};

export default ServicesManagement;
