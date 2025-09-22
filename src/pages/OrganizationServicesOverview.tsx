import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import { useTheme } from '../lib/hooks/useTheme';
import type { RootState } from '../lib/store/store';
import { serviceService, Service } from '../lib/api/services/services';
import { categoryService, Category } from '../lib/api/services/categories';
import { FiSearch, FiFilter, FiEye, FiClock, FiDollarSign, FiTag, FiFileText, FiMapPin, FiHome, FiTrendingUp, FiUsers, FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

interface ServiceWithBranch extends Service {
  branchId: {
    _id: string;
    name: string;
    address?: string;
  };
}

const OrganizationServicesOverview: React.FC = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const { theme, classes } = useTheme();
  const [services, setServices] = useState<ServiceWithBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<ServiceWithBranch | null>(null);
  const [editingService, setEditingService] = useState<ServiceWithBranch | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [branches, setBranches] = useState<Array<{_id: string, name: string}>>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Debug user information
  console.log('OrganizationServicesOverview - User:', user);
  console.log('OrganizationServicesOverview - User role:', user?.role);
  console.log('OrganizationServicesOverview - User organizationId:', user?.organizationId);

  useEffect(() => {
    const loadServices = async () => {
      try {
        console.log('Loading organization services...');
        setIsLoading(true);
        const response = await serviceService.getOrganizationServices();
        if (response.success) {
          setServices(response.data);
        }
      } catch (error) {
        console.error('Error loading organization services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadBranches = async () => {
      try {
        // For now, we'll extract branches from the services data
        // In a real app, you might want a separate API call to get branches
        const response = await serviceService.getOrganizationServices();
        if (response.success) {
          const uniqueBranches = Array.from(
            new Map(
              response.data.map(service => [
                service.branchId._id, 
                { _id: service.branchId._id, name: service.branchId.name }
              ])
            ).values()
          );
          setBranches(uniqueBranches);
        }
      } catch (error) {
        console.error('Error loading branches:', error);
      }
    };

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoryService.getCategories();
        if (response.success) {
          const activeCategories = response.data.filter(cat => cat.isActive !== false);
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadServices();
    loadBranches();
    loadCategories();
  }, []);

  // Get unique branches and categories for filtering
  const branchNames = Array.from(new Set(services.map(service => service.branchId.name))).sort();
  const serviceCategories = Array.from(new Set(services.map(service => service.category))).sort();

  // Filter services based on search term, branch, and category
  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || service.branchId.name === selectedBranch;
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    
    return matchesSearch && matchesBranch && matchesCategory;
  });

  // Group services by branch for analytics
  const servicesByBranch = services.reduce((acc, service) => {
    const branchName = service.branchId.name;
    if (!acc[branchName]) {
      acc[branchName] = [];
    }
    acc[branchName].push(service);
    return acc;
  }, {} as Record<string, ServiceWithBranch[]>);

  const handleViewService = (service: ServiceWithBranch) => {
    setSelectedService(service);
  };

  const handleEditService = (service: ServiceWithBranch) => {
    setEditingService(service);
    setShowEditModal(true);
  };

  const handleDeleteService = async (service: ServiceWithBranch) => {
    if (!confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsDeleting(service._id);
      await serviceService.deleteOrganizationService(service._id);
      toast.success('Service deleted successfully');
      
      // Reload services
      const response = await serviceService.getOrganizationServices();
      if (response.success) {
        setServices(response.data);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdateService = async (updatedData: any) => {
    try {
      if (editingService) {
        // Update existing service
        await serviceService.updateOrganizationService(editingService._id, updatedData);
        toast.success('Service updated successfully');
      } else {
        // Create new service
        await serviceService.createService(updatedData.branchId, updatedData);
        toast.success('Service created successfully');
      }
      
      // Reload services
      const response = await serviceService.getOrganizationServices();
      if (response.success) {
        setServices(response.data);
      }
      
      setShowEditModal(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error(editingService ? 'Failed to update service' : 'Failed to create service');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="h-8 bg-gray-200 rounded w-64 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-80"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Service Overview</h1>
          <p className="text-sm text-gray-600">Manage services across your organization</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-48 pl-3 pr-8 py-1.5 text-sm ${classes.input}`}
            />
            <FiSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          
          {/* Add Service Button */}
          <button
            onClick={() => setShowEditModal(true)}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm ${classes.primaryButton}`}
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className={`${classes.card} p-3`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Total Services</p>
              <p className="text-lg font-bold text-gray-900">{services.length}</p>
            </div>
            <FiFileText className={`w-5 h-5 ${theme.status.info.split(' ')[0]}`} />
          </div>
        </div>

        <div className={`${classes.card} p-3`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Branches</p>
              <p className="text-lg font-bold text-gray-900">{branchNames.length}</p>
            </div>
            <FiHome className={`w-5 h-5 ${theme.status.success.split(' ')[0]}`} />
          </div>
        </div>

        <div className={`${classes.card} p-3`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Categories</p>
              <p className="text-lg font-bold text-gray-900">{categories.length}</p>
            </div>
            <FiTag className={`w-5 h-5 ${theme.status.info.split(' ')[0]}`} />
          </div>
        </div>

        <div className={`${classes.card} p-3`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600">Avg. Price</p>
              <p className="text-lg font-bold text-gray-900">
                ${services.length > 0 ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(0) : '0'}
              </p>
            </div>
            <FiTrendingUp className={`w-5 h-5 ${theme.status.warning.split(' ')[0]}`} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${classes.card} p-3 mb-4`}>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className={`px-2 py-1.5 text-sm ${classes.input}`}
          >
            <option value="all">All Branches</option>
            {branchNames.map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-2 py-1.5 text-sm ${classes.input}`}
          >
            <option value="all">All Categories</option>
            {serviceCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Services List */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-8">
          <FiFileText className="mx-auto h-8 w-8 text-gray-400 mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">No services found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm || selectedBranch !== 'all' || selectedCategory !== 'all'
              ? 'No services match your current filters.'
              : 'No services have been created in your organization yet.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredServices.map((service) => (
            <div key={service._id} className={`${classes.card} rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 group`}>
              {/* Header with Branch Info */}
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <FiMapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs font-medium text-gray-600">{service.branchId.name}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    service.isActive 
                      ? classes.statusSuccess
                      : classes.statusError
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                
                {/* Service Name */}
                <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                  {service.name}
                </h3>
                
                {/* Description */}
                <p className="text-xs text-gray-600 mb-2 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
                
                {/* Service Details */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <FiTag className="w-3 h-3 mr-1" />
                      <span>{service.category}</span>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="w-3 h-3 mr-1" />
                      <span>{service.duration}min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-medium text-gray-900">
                      <FiDollarSign className="w-3 h-3 mr-1" />
                      {service.isPriceRange ? (
                        <span>${service.price} - ${service.maxPrice}</span>
                      ) : (
                        <span>${service.price}</span>
                      )}
                    </div>
                    {service.isPriceRange && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        Range
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="px-3 pb-3 pt-2 border-t border-gray-100">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewService(service)}
                    className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 text-xs ${theme.status.info} hover:opacity-80 rounded transition-colors font-medium`}
                    title="View Service Details"
                  >
                    <FiEye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditService(service)}
                    className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 text-xs ${theme.status.info} hover:opacity-80 rounded transition-colors font-medium`}
                    title="Edit Service"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteService(service)}
                    disabled={isDeleting === service._id}
                    className={`flex-1 flex items-center justify-center space-x-1 px-2 py-1.5 text-xs ${theme.status.error} hover:opacity-80 rounded transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Delete Service"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    <span>{isDeleting === service._id ? 'Deleting...' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Detail Modal */}
      {selectedService && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
            <div className={`bg-gradient-to-r from-${theme.primary.from} to-${theme.primary.to} text-white p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{selectedService.name}</h2>
                  <p className="text-white/80 text-sm">{selectedService.branchId.name}</p>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[calc(90vh-100px)] overflow-y-auto">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-900">{selectedService.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Category</h3>
                    <p className="text-gray-900">{selectedService.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Duration</h3>
                    <p className="text-gray-900">{selectedService.duration} minutes</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Price</h3>
                    <p className="text-gray-900">
                      {selectedService.isPriceRange ? (
                        <>${selectedService.price} - ${selectedService.maxPrice}</>
                      ) : (
                        <>${selectedService.price}</>
                      )}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedService.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedService.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Branch Information</h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-900 font-medium">{selectedService.branchId.name}</p>
                    {selectedService.branchId.address && (
                      <p className="text-gray-600 text-sm">{selectedService.branchId.address}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
            <div className={`bg-gradient-to-r from-${theme.primary.from} to-${theme.primary.to} text-white p-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-white/20 rounded-md">
                    <FiFileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">
                      {editingService ? 'Edit Service' : 'Add New Service'}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingService(null);
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-md transition-colors"
                  title="Close modal"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 max-h-[calc(85vh-80px)] overflow-y-auto modal-scrollbar">
              <ServiceEditForm
                service={editingService}
                onSave={handleUpdateService}
                onCancel={() => {
                  setShowEditModal(false);
                  setEditingService(null);
                }}
                branches={branches}
                categories={categories}
                loadingCategories={loadingCategories}
                theme={theme}
                classes={classes}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Service Edit Form Component
const ServiceEditForm: React.FC<{
  service: ServiceWithBranch | null;
  onSave: (data: any) => void;
  onCancel: () => void;
  branches: Array<{_id: string, name: string}>;
  categories: Category[];
  loadingCategories: boolean;
  theme: any;
  classes: any;
}> = ({ service, onSave, onCancel, branches, categories, loadingCategories, theme, classes }) => {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    duration: service?.duration || 30,
    price: service?.price || 0,
    maxPrice: service?.maxPrice || 0,
    isPriceRange: service?.isPriceRange || false,
    isActive: service?.isActive ?? true,
    branchId: service?.branchId?._id || (branches.length > 0 ? branches[0]._id : '')
  });

  // Update form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        maxPrice: service.maxPrice || 0,
        isPriceRange: service.isPriceRange || false,
        isActive: service.isActive ?? true,
        branchId: service.branchId._id
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        duration: 30,
        price: 0,
        maxPrice: 0,
        isPriceRange: false,
        isActive: true,
        branchId: branches.length > 0 ? branches[0]._id : ''
      });
    }
  }, [service, branches]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate price range
    if (formData.isPriceRange && formData.maxPrice <= formData.price) {
      alert('Maximum price must be greater than minimum price');
      return;
    }
    
    // Prepare data for submission
    const submitData = {
      ...formData,
      // If not price range, remove maxPrice
      maxPrice: formData.isPriceRange ? formData.maxPrice : undefined
    };
    
    onSave(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Service Name and Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3 py-1.5 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
            placeholder="Enter service name"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className={`w-full px-3 py-1.5 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
            required
            disabled={loadingCategories}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {loadingCategories && (
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
              Loading categories...
            </p>
          )}
        </div>
      </div>

      {/* Branch Selection - Only for new services */}
      {!service && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.branchId}
            onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
            className={`w-full px-3 py-1.5 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
            required
          >
            <option value="">Select a branch</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>{branch.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className={`w-full px-3 py-1.5 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
          placeholder="Enter service description"
          required
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Duration (minutes) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
          className={`w-full px-3 py-2 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
          min="1"
          placeholder="e.g., 30"
          required
        />
      </div>

      {/* Price Section */}
      <div className="space-y-3">

        {formData.isPriceRange ? (
          // Price Range Layout
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Price Range <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPriceRange}
                  onChange={(e) => {
                    const isPriceRange = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      isPriceRange,
                      // Reset maxPrice when disabling price range
                      maxPrice: isPriceRange ? formData.maxPrice : 0
                    });
                  }}
                  className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-${theme.primary.from.split('-')[1]}-500 focus:ring-2`}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable Range</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, price });
                  }}
                  className={`w-full px-3 py-1.5 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Enter minimum price"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.maxPrice}
                  onChange={(e) => {
                    const maxPrice = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, maxPrice });
                  }}
                  className={`w-full px-3 py-1.5 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
                  min={formData.price + 0.01}
                  step="0.01"
                  required
                  placeholder={`Enter maximum price (min: $${formData.price})`}
                />
              </div>
            </div>
          </div>
        ) : (
          // Single Price Layout
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPriceRange}
                  onChange={(e) => {
                    const isPriceRange = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      isPriceRange,
                      // Reset maxPrice when disabling price range
                      maxPrice: isPriceRange ? formData.maxPrice : 0
                    });
                  }}
                  className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-${theme.primary.from.split('-')[1]}-500 focus:ring-2`}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Enable Range</span>
              </label>
            </div>
            
            <input
              type="number"
              value={formData.price}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                setFormData({ ...formData, price });
              }}
              className={`w-full px-3 py-1.5 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`}
              min="0"
              step="0.01"
              required
              placeholder="Enter price"
            />
          </div>
        )}

        {/* Price Range Validation */}
        {formData.isPriceRange && formData.maxPrice > 0 && formData.maxPrice <= formData.price && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Maximum price must be greater than minimum price (${formData.price})
            </p>
          </div>
        )}
      </div>

      {/* Service Status */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Service Status
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-${theme.primary.from.split('-')[1]}-500 focus:ring-2`}
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Active Service</span>
        </label>
      </div>


      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-1.5 text-sm font-medium text-white ${theme.button.primary} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
        >
          {service ? 'Update Service' : 'Create Service'}
        </button>
      </div>
    </form>
  );
};

export default OrganizationServicesOverview;
