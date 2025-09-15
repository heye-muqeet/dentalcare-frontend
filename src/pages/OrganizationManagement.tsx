import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { organizationService, type Organization, type CreateOrganizationData, type OrganizationStats } from '../lib/api/services/organizations';
import { CreateOrganizationModal } from '../components/Modals';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiUsers, 
  FiHome, 
  FiMail, 
  FiPhone, 
  FiGlobe, 
  FiMapPin, 
  FiCalendar,
  FiShield,
  FiUserPlus,
  FiSearch,
  FiX,
  FiActivity
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface OrganizationAdmin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [admins, setAdmins] = useState<OrganizationAdmin[]>([]);
  const [orgStats, setOrgStats] = useState<OrganizationStats | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    tags: [],
    isActive: true
  });

  const [adminFormData, setAdminFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

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
      const [adminsData, statsData] = await Promise.all([
        organizationService.getOrganizationAdmins(orgId),
        organizationService.getOrganizationStats(orgId)
      ]);
      setAdmins(adminsData);
      setOrgStats(statsData);
    } catch (error) {
      console.error('Failed to load organization details:', error);
      toast.error('Failed to load organization details');
    }
  };

  const handleCreateOrganization = async (data: CreateOrganizationData) => {
    try {
      setIsCreating(true);
      await organizationService.createOrganization(data);
      toast.success('Organization created successfully');
      setShowCreateModal(false);
      resetForm();
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
      throw error; // Re-throw to let the modal handle it
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    
    try {
      await organizationService.updateOrganization(editingOrg._id, formData);
      toast.success('Organization updated successfully');
      setShowEditModal(false);
      setEditingOrg(null);
      resetForm();
      loadOrganizations();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update organization');
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

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      await organizationService.createOrganizationAdmin(selectedOrg._id, adminFormData);
      toast.success('Organization admin created successfully');
      setShowAdminModal(false);
      resetAdminForm();
      loadOrganizationDetails(selectedOrg._id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create organization admin');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      phone: '',
      email: '',
      website: '',
      tags: [],
      isActive: true
    });
  };

  const resetAdminForm = () => {
    setAdminFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: ''
    });
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      description: org.description,
      address: org.address,
      city: org.city,
      state: org.state,
      country: org.country,
      postalCode: org.postalCode,
      phone: org.phone,
      email: org.email,
      website: org.website,
      tags: org.tags,
      isActive: org.isActive
    });
    setShowEditModal(true);
  };

  const openDetailsModal = async (org: Organization) => {
    setSelectedOrg(org);
    setShowDetailsModal(true);
    await loadOrganizationDetails(org._id);
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
                  onClick={() => openDetailsModal(org)}
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
        loading={isCreating}
      />

      {/* Edit Organization Modal */}
      {showEditModal && editingOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Organization</h2>
            </div>
            <form onSubmit={handleUpdateOrganization} className="p-6 space-y-4">
              {/* Same form fields as create modal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Organization</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Update Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization Details Modal */}
      {showDetailsModal && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{selectedOrg.name}</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Organization Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{selectedOrg.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiPhone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{selectedOrg.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiMapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">{selectedOrg.address}, {selectedOrg.city}, {selectedOrg.state} {selectedOrg.postalCode}</span>
                    </div>
                    {selectedOrg.website && (
                      <div className="flex items-center gap-3">
                        <FiGlobe className="w-5 h-5 text-gray-400" />
                        <a href={selectedOrg.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedOrg.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">Created: {new Date(selectedOrg.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrg.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedOrg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                  {orgStats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FiHome className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-gray-600">Branches</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">{orgStats.totalBranches}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FiUsers className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">Users</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{orgStats.totalUsers}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FiShield className="w-5 h-5 text-purple-600" />
                          <span className="text-sm font-medium text-gray-600">Doctors</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">{orgStats.totalDoctors}</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <FiActivity className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium text-gray-600">Active Users</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">{orgStats.activeUsers}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Organization Admins */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Organization Admins</h3>
                  <button
                    onClick={() => setShowAdminModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    Add Admin
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  {admins.length > 0 ? (
                    <div className="space-y-3">
                      {admins.map((admin) => (
                        <div key={admin._id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <FiShield className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{admin.firstName} {admin.lastName}</p>
                              <p className="text-sm text-gray-500">{admin.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              admin.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {admin.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiShield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No organization admins found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showAdminModal && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Create Organization Admin</h2>
              <p className="text-sm text-gray-600 mt-1">Add a new admin for {selectedOrg.name}</p>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={adminFormData.firstName}
                  onChange={(e) => setAdminFormData({...adminFormData, firstName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={adminFormData.lastName}
                  onChange={(e) => setAdminFormData({...adminFormData, lastName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={adminFormData.email}
                  onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={adminFormData.password}
                  onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={adminFormData.phone}
                  onChange={(e) => setAdminFormData({...adminFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
