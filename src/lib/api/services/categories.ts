import api from '../axios';

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  organizationId: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    name: string;
  };
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
  message?: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export const categoryService = {
  // Get all categories for organization
  getCategories: async (): Promise<CategoriesResponse> => {
    console.log('🔍 Fetching categories for organization');
    
    try {
      const response = await api.get('/categories');
      console.log('✅ Categories fetched successfully:', response.data);
      
      // Handle different response structures
      let categoriesData = response.data;
      
      // If response has a data property, use that
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        categoriesData = response.data.data;
      }
      
      // If categoriesData is not an array, default to empty array
      if (!Array.isArray(categoriesData)) {
        console.log('⚠️ Categories data is not an array, defaulting to empty array:', categoriesData);
        categoriesData = [];
      }
      
      return {
        success: true,
        data: categoriesData
      };
    } catch (error: any) {
      console.error('❌ Error fetching categories:', error);
      throw error;
    }
  },

  // Get single category
  getCategoryById: async (categoryId: string): Promise<CategoryResponse> => {
    console.log('🔍 Fetching category:', categoryId);
    
    try {
      const response = await api.get(`/categories/${categoryId}`);
      console.log('✅ Category fetched successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error fetching category:', error);
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData: CreateCategoryData): Promise<CategoryResponse> => {
    console.log('📝 Creating category:', categoryData);
    
    try {
      console.log('📝 Sending to backend:', categoryData);
      
      const response = await api.post('/categories', categoryData);
      console.log('✅ Category created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (categoryId: string, categoryData: UpdateCategoryData): Promise<CategoryResponse> => {
    console.log('📝 Updating category:', categoryId, categoryData);
    
    try {
      const response = await api.patch(`/categories/${categoryId}`, categoryData);
      console.log('✅ Category updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (categoryId: string): Promise<DeleteResponse> => {
    console.log('🗑️ Deleting category:', categoryId);
    
    try {
      const response = await api.delete(`/categories/${categoryId}`);
      console.log('✅ Category deleted successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error deleting category:', error);
      throw error;
    }
  },

  // Restore category
  restoreCategory: async (categoryId: string): Promise<CategoryResponse> => {
    console.log('🔄 Restoring category:', categoryId);
    
    try {
      const response = await api.patch(`/categories/${categoryId}/restore`);
      console.log('✅ Category restored successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error restoring category:', error);
      throw error;
    }
  }
};
