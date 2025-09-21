import api from '../axios';

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string;
  duration: number; // in minutes
  price: number;
  maxPrice?: number; // Optional maximum price for price range
  isPriceRange: boolean; // Indicates if this is a price range or fixed price
  isActive: boolean;
  branchId: {
    _id: string;
    name: string;
  };
  organizationId: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  maxPrice?: number; // Optional maximum price for price range
  isPriceRange?: boolean; // Indicates if this is a price range or fixed price
  isActive?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  category?: string;
  duration?: number;
  price?: number;
  maxPrice?: number; // Optional maximum price for price range
  isPriceRange?: boolean; // Indicates if this is a price range or fixed price
  isActive?: boolean;
}

export interface ServicesResponse {
  success: boolean;
  data: Service[];
}

export interface ServiceResponse {
  success: boolean;
  data: Service;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const serviceService = {
  // Get all services for a branch
  getBranchServices: async (branchId: string): Promise<ServicesResponse> => {
    console.log('🔍 Fetching services for branch:', branchId);
    
    try {
      const response = await api.get(`/branches/${branchId}/services`);
      console.log('✅ Services fetched successfully:', response.data);
      
      // Handle different response structures
      let servicesData = response.data;
      
      // If response has a data property, use that
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        servicesData = response.data.data;
      }
      
      // If servicesData is not an array, default to empty array
      if (!Array.isArray(servicesData)) {
        console.log('⚠️ Services data is not an array, defaulting to empty array:', servicesData);
        servicesData = [];
      }
      
      return {
        success: true,
        data: servicesData
      };
    } catch (error: any) {
      console.error('❌ Error fetching services:', error);
      throw error;
    }
  },

  // Get single service
  getServiceById: async (serviceId: string): Promise<ServiceResponse> => {
    console.log('🔍 Fetching service:', serviceId);
    
    try {
      const response = await api.get(`/services/${serviceId}`);
      console.log('✅ Service fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching service:', error);
      throw error;
    }
  },

  // Create new service
  createService: async (branchId: string, serviceData: CreateServiceData): Promise<ServiceResponse> => {
    console.log('📝 Creating service for branch:', branchId, serviceData);
    
    try {
      console.log('📝 Sending to backend:', serviceData);
      
      const response = await api.post(`/branches/${branchId}/services`, serviceData);
      console.log('✅ Service created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating service:', error);
      throw error;
    }
  },

  // Update service
  updateService: async (serviceId: string, serviceData: UpdateServiceData): Promise<ServiceResponse> => {
    console.log('📝 Updating service:', serviceId, serviceData);
    
    try {
      const response = await api.patch(`/services/${serviceId}`, serviceData);
      console.log('✅ Service updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating service:', error);
      throw error;
    }
  },

  // Delete service
  deleteService: async (serviceId: string): Promise<DeleteResponse> => {
    console.log('🗑️ Deleting service:', serviceId);
    
    try {
      const response = await api.delete(`/services/${serviceId}`);
      console.log('✅ Service deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting service:', error);
      throw error;
    }
  },

  // Restore service
  restoreService: async (serviceId: string): Promise<ServiceResponse> => {
    console.log('🔄 Restoring service:', serviceId);
    
    try {
      const response = await api.patch(`/services/${serviceId}/restore`);
      console.log('✅ Service restored successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error restoring service:', error);
      throw error;
    }
  }
};
