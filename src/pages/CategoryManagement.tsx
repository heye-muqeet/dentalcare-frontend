import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { categoryService, Category } from '../lib/api/services/categories';
import { FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiTag, FiCircle, FiHash, FiUsers } from 'react-icons/fi';
import CreateCategoryModal from '../components/Modals/CreateCategoryModal';

const CategoryManagement: React.FC = () => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        console.log('Loading categories for organization');
        setIsLoading(true);
        const response = await categoryService.getCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase())) 
  );

  const handleViewCategory = async (category: Category) => {
    try {
      console.log('Viewing category:', category._id);
      const response = await categoryService.getCategoryById(category._id);
      if (response.success) {
        setSelectedCategory(response.data);
        // You can implement a view modal here
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    // You can implement an edit modal here
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      try {
        await categoryService.deleteCategory(category._id);
        setCategories(categories.filter(c => c._id !== category._id));
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleCategoryCreated = () => {
    // Reload categories after creation
    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadCategories();
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
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage service and treatment categories</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories by name or description..."
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
          
          {/* Add Category Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories List */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          <FiTag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No categories match your search criteria.' : 'Get started by adding your first category.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCategories.map((category) => (
            <div key={category._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-3">
                <div className="flex items-start justify-between">
                  {/* Category Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-16 h-16 rounded flex items-center justify-center"
                        style={{ 
                          backgroundColor: category.color ? `${category.color}20` : '#f3f4f6',
                          color: category.color || '#6b7280'
                        }}
                      >
                        {category.icon ? (
                          <span className="text-2xl">{category.icon}</span>
                        ) : (
                          <FiTag className="w-8 h-8" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Name and Status */}
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {category.name}
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          category.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      {/* Description */}
                      {category.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      {/* Category Details */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FiUsers className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{category.usageCount} services</span>
                        </div>
                        <div className="flex items-center">
                          <FiHash className="w-3 h-3 mr-1 text-gray-400" />
                          <span>ID: {category._id.slice(-6)}</span>
                        </div>
                        {category.color && (
                          <div className="flex items-center">
                            <FiCircle className="w-3 h-3 mr-1 text-gray-400" />
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{ backgroundColor: category.color }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => handleViewCategory(category)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors w-full"
                      title="View Category Details"
                    >
                      <span>View Details</span>
                      <FiEye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors w-full"
                      title="Edit Category"
                    >
                      <span>Edit Category</span>
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded transition-colors w-full"
                      title="Delete Category"
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
      <CreateCategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCategoryCreated}
      />
    </div>
  );
};

export default CategoryManagement;
