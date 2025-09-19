import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { organizationService, type Organization, type CreateOrganizationData } from '../lib/api/services/organizations';
import { 
  CreateOrganizationModal, 
  EditOrganizationModal, 
  ViewOrganizationModal, 
  UpdateOrganizationModal 
} from '../components/Modals';
import CascadeDeleteConfirmModal from '../components/CascadeDeleteConfirmModal';
import CascadeRestoreModal from '../components/CascadeRestoreModal';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiHome, 
  FiMail, 
  FiPhone, 
  FiGlobe, 
  FiMapPin, 
  FiSearch,
  FiRotateCcw,
  FiArchive
} from 'react-icons/fi';
import toast from 'react-hot-toast';


export default function OrganizationManagement() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'deleted'>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCascadeDeleteModal, setShowCascadeDeleteModal] = useState(false);
  const [showCascadeRestoreModal, setShowCascadeRestoreModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [deletingOrg, setDeletingOrg] = useState<Organization | null>(null);
  const [restoringOrg, setRestoringOrg] = useState<Organization | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    loadOrganizations();
  }, [user, navigate, statusFilter]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const includeDeleted = statusFilter === 'deleted' || statusFilter === 'all';
      const data = await organizationService.getOrganizationsWithDeleted(includeDeleted);
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteClick = (org: Organization) => {
    setDeletingOrg(org);
    setShowCascadeDeleteModal(true);
  };

  const handleRestoreClick = (org: Organization) => {
    setRestoringOrg(org);
    setShowCascadeRestoreModal(true);
  };

  const handleCascadeDelete = async (reason: string) => {
    if (!deletingOrg) return;

    try {
      setDeleteLoading(true);
      const result = await organizationService.deleteOrganization(deletingOrg._id, reason);
      
      toast.success(`Organization deleted successfully! ${result.data.cascadeResults.reduce((sum, item) => sum + item.deletedCount, 0)} related entities were also deleted.`);
      
      setShowCascadeDeleteModal(false);
      setDeletingOrg(null);
      loadOrganizations();
    } catch (error) {
      console.error('Failed to delete organization:', error);
      toast.error('Failed to delete organization');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCascadeRestore = async (reason: string) => {
    if (!restoringOrg) return;

    try {
      setRestoreLoading(true);
      const result = await organizationService.restoreOrganization(restoringOrg._id, reason);
      
      toast.success(`Organization restored successfully! ${result.data.cascadeResults.reduce((sum, item) => sum + item.restoredCount, 0)} related entities were also restored.`);
      
      setShowCascadeRestoreModal(false);
      setRestoringOrg(null);
      loadOrganizations();
    } catch (error) {
      console.error('Failed to restore organization:', error);
      toast.error('Failed to restore organization');
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleCreateOrganization = async (data: CreateOrganizationData) => {
    try {
      await organizationService.createOrganization(data);
      toast.success('Organization created successfully');
      setShowCreateModal(false);
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
      throw error; // Re-throw to let the modal handle it
    }
  };

  const handleUpdateOrganization = async (id: string, data: any) => {
    try {
      await organizationService.updateOrganization(id, data);
      toast.success('Organization updated successfully');
      setShowEditModal(false);
      setShowUpdateModal(false);
      setEditingOrg(null);
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update organization');
      throw error;
    }
  };



  const openEditModal = async (org: Organization) => {
    try {
      // Fetch organization with admin details
      const orgWithAdmin = await organizationService.getOrganizationWithAdmin(org._id);
      setEditingOrg(orgWithAdmin);
    } catch (error) {
      console.error('Failed to fetch organization details:', error);
      // Fallback to the organization data passed as prop
      setEditingOrg(org);
    }
    setShowEditModal(true);
  };

  const openViewModal = async (org: Organization) => {
    try {
      // Fetch organization with admin details
      const orgWithAdmin = await organizationService.getOrganizationWithAdmin(org._id);
      setSelectedOrg(orgWithAdmin);
    } catch (error) {
      console.error('Failed to fetch organization details:', error);
      // Fallback to the organization data passed as prop
      setSelectedOrg(org);
    }
    setShowViewModal(true);
  };


  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         org.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'active') {
      matchesStatus = org.isActive && !org.isDeleted;
    } else if (statusFilter === 'inactive') {
      matchesStatus = !org.isActive && !org.isDeleted;
    } else if (statusFilter === 'deleted') {
      matchesStatus = !!org.isDeleted;
    }
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organization Management</h1>
            <p className="text-gray-600 mt-2">Manage all organizations in the system</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            Create Organization
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'deleted')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <div key={org._id} className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${org.isDeleted ? 'opacity-60 border-red-200 bg-red-50' : ''}`}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiHome className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{org.name}</h3>
                    <p className="text-sm text-gray-500">{org.city}, {org.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {org.isDeleted ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 flex items-center gap-1">
                      <FiArchive className="w-3 h-3" />
                      Deleted
                    </span>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      org.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {org.isActive ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMail className="w-4 h-4" />
                  <span className="truncate">{org.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiPhone className="w-4 h-4" />
                  <span>{org.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FiMapPin className="w-4 h-4" />
                  <span className="truncate">{org.address}</span>
                </div>
                {org.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiGlobe className="w-4 h-4" />
                    <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {org.website}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{org.branchCount} branches</span>
                <span>{org.userCount} users</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openViewModal(org)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <FiEye className="w-4 h-4" />
                  View
                </button>
                
                {!org.isDeleted ? (
                  <>
                    <button
                      onClick={() => openEditModal(org)}
                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                    >
                      <FiEdit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(org)}
                      className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center"
                      title="Delete organization and all related entities"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleRestoreClick(org)}
                    className="flex-1 bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 flex items-center justify-center gap-2"
                    title="Restore organization and all related entities"
                  >
                    <FiRotateCcw className="w-4 h-4" />
                    Restore
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrganizations.length === 0 && (
        <div className="text-center py-12">
          <FiHome className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
          <p className="text-gray-500">Get started by creating your first organization.</p>
        </div>
      )}

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOrganization}
      />

      {/* Edit Organization Modal */}
      <EditOrganizationModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateOrganization}
        organization={editingOrg}
      />

      {/* View Organization Modal */}
      <ViewOrganizationModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        organization={selectedOrg}
        onEdit={(org) => {
          setEditingOrg(org as Organization);
          setShowViewModal(false);
          setShowEditModal(true);
        }}
        onDelete={(org) => handleDeleteClick(org)}
      />

      {/* Update Organization Modal */}
      <UpdateOrganizationModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleUpdateOrganization}
        organization={editingOrg}
        fields={['name', 'email', 'phone', 'website', 'isActive']}
        title="Quick Update"
        description="Update organization contact information and status"
      />

      {/* Cascade Delete Confirmation Modal */}
      <CascadeDeleteConfirmModal
        isOpen={showCascadeDeleteModal}
        onClose={() => {
          setShowCascadeDeleteModal(false);
          setDeletingOrg(null);
        }}
        onConfirm={handleCascadeDelete}
        organization={deletingOrg}
        isLoading={deleteLoading}
        estimatedImpact={{
          branches: deletingOrg?.branchCount || 0,
          doctors: 0, // Would need to fetch from API
          patients: 0, // Would need to fetch from API
          admins: 0, // Would need to fetch from API
          receptionists: 0, // Would need to fetch from API
        }}
      />

      {/* Cascade Restore Modal */}
      <CascadeRestoreModal
        isOpen={showCascadeRestoreModal}
        onClose={() => {
          setShowCascadeRestoreModal(false);
          setRestoringOrg(null);
        }}
        onConfirm={handleCascadeRestore}
        organization={restoringOrg}
        isLoading={restoreLoading}
        estimatedRestoreImpact={{
          branches: restoringOrg?.branchCount || 0,
          doctors: 0, // Would need to fetch from API
          patients: 0, // Would need to fetch from API
          admins: 0, // Would need to fetch from API
          receptionists: 0, // Would need to fetch from API
        }}
      />
    </div>
  );
}
