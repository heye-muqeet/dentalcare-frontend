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
  FiSearch
} from 'react-icons/fi';
import toast from 'react-hot-toast';


export default function OrganizationManagement() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (user?.role !== 'super_admin') {
      navigate('/dashboard');
      return;
    }
    loadOrganizations();
  }, [user, navigate]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizationDetails = async (orgId: string) => {
    try {
      // Load organization details if needed
      console.log('Loading details for organization:', orgId);
    } catch (error) {
      console.error('Failed to load organization details:', error);
      toast.error('Failed to load organization details');
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

  const handleDeleteOrganization = async (orgId: string) => {
    if (!window.confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      await organizationService.deleteOrganization(orgId);
      toast.success('Organization deleted successfully');
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
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
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && org.isActive) ||
                         (statusFilter === 'inactive' && !org.isActive);
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
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrganizations.map((org) => (
          <div key={org._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    org.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
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
                <button
                  onClick={() => openEditModal(org)}
                  className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                >
                  <FiEdit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteOrganization(org._id)}
                  className="bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 flex items-center justify-center"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
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
        onDelete={(org) => handleDeleteOrganization(org._id)}
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
    </div>
  );
}
