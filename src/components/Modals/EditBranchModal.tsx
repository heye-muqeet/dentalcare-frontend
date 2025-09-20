import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../ui/dialog';
import { branchService } from '../../lib/api/services/branches';
import { toast } from 'sonner';
import type { Branch } from '../../lib/api/services/branches';

interface AdminFormData {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

interface EditBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  onSuccess: () => void;
}

export const EditBranchModal: React.FC<EditBranchModalProps> = ({
  isOpen, 
  onClose, 
  branch, 
  onSuccess
}) => {
  // If no branch, return null or a placeholder
  if (!branch) return null;

  // Branch form state
  const [branchFormData, setBranchFormData] = useState({
    name: branch.name || '',
    description: branch.description || '',
    address: branch.address || '',
    city: branch.city || '',
    state: branch.state || '',
    country: branch.country || '',
    postalCode: branch.postalCode || '',
    phone: branch.phone || '',
    email: branch.email || '',
    website: branch.website || '',
    isActive: branch.isActive || false
  });

  // Existing admins state
  const [existingAdmins, setExistingAdmins] = useState<AdminFormData[]>(
    branch.branchAdmins || []
  );

  // New admin form state
  const [newAdminForm, setNewAdminForm] = useState<AdminFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true
  });

  // Edit admin state
  const [editingAdmin, setEditingAdmin] = useState<AdminFormData | null>(null);

  // Handle branch form changes
  const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setBranchFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle new admin form changes
  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAdminForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Add new admin
  const handleAddAdmin = () => {
    // Validate new admin form
    if (!newAdminForm.firstName || !newAdminForm.lastName || !newAdminForm.email) {
      toast.error('Please fill in all required fields for the new admin');
      return;
    }

    // Check for duplicate email
    if (existingAdmins.some(admin => admin.email === newAdminForm.email)) {
      toast.error('An admin with this email already exists');
      return;
    }

    // Add new admin
    setExistingAdmins(prev => [...prev, { ...newAdminForm }]);
    
    // Reset new admin form
    setNewAdminForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      isActive: true
    });
  };

  // Remove admin
  const handleRemoveAdmin = (adminToRemove: AdminFormData) => {
    setExistingAdmins(prev => 
      prev.filter(admin => admin.email !== adminToRemove.email)
    );
  };

  // Edit admin
  const handleEditAdmin = (admin: AdminFormData) => {
    setEditingAdmin(admin);
  };

  // Save edited admin
  const handleSaveEditedAdmin = () => {
    if (!editingAdmin) return;

    setExistingAdmins(prev => 
      prev.map(admin => 
        admin.email === editingAdmin.email ? editingAdmin : admin
      )
    );
    setEditingAdmin(null);
  };

  // Submit entire form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare branch data with admins
      const updateData = {
        ...branchFormData,
        branchAdmins: existingAdmins
      };

      // Call update branch service
      await branchService.updateBranch(branch._id, updateData);
      
      toast.success('Branch updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to update branch:', error);
      toast.error(error.response?.data?.message || 'Failed to update branch');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Edit2 className="w-5 h-5 text-blue-600" />
            <span>Edit Branch: {branch.name}</span>
          </DialogTitle>
          <DialogDescription>
            Update branch details and manage branch administrators
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {/* Branch Details Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Branch Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Branch Name</Label>
                <Input
                  name="name"
                  value={branchFormData.name}
                  onChange={handleBranchChange}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  type="email"
                  value={branchFormData.email}
                  onChange={handleBranchChange}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  name="phone"
                  value={branchFormData.phone}
                  onChange={handleBranchChange}
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  name="website"
                  value={branchFormData.website}
                  onChange={handleBranchChange}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                name="description"
                value={branchFormData.description}
                onChange={handleBranchChange}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>City</Label>
                <Input
                  name="city"
                  value={branchFormData.city}
                  onChange={handleBranchChange}
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  name="state"
                  value={branchFormData.state}
                  onChange={handleBranchChange}
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  name="postalCode"
                  value={branchFormData.postalCode}
                  onChange={handleBranchChange}
                />
              </div>
            </div>
          </div>

          {/* Branch Admins Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
              <span>Branch Administrators</span>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="flex items-center space-x-1"
                onClick={() => setNewAdminForm({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  isActive: true
                })}
              >
                <Plus className="w-4 h-4" />
                <span>Add Admin</span>
              </Button>
            </h3>

            {/* Existing Admins List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {existingAdmins.map((admin, index) => (
                <div 
                  key={admin.email || index} 
                  className="bg-gray-50 p-3 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                    <p className="text-xs text-gray-500">{admin.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAdmin(admin)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleRemoveAdmin(admin)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* New/Edit Admin Form */}
            {(newAdminForm.firstName || editingAdmin) && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">
                  {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input
                      name="firstName"
                      value={editingAdmin?.firstName || newAdminForm.firstName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        editingAdmin 
                          ? setEditingAdmin(prev => ({ ...prev!, firstName: e.target.value }))
                          : handleNewAdminChange(e)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      name="lastName"
                      value={editingAdmin?.lastName || newAdminForm.lastName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        editingAdmin 
                          ? setEditingAdmin(prev => ({ ...prev!, lastName: e.target.value }))
                          : handleNewAdminChange(e)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={editingAdmin?.email || newAdminForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        editingAdmin 
                          ? setEditingAdmin(prev => ({ ...prev!, email: e.target.value }))
                          : handleNewAdminChange(e)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      value={editingAdmin?.phone || newAdminForm.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                        editingAdmin 
                          ? setEditingAdmin(prev => ({ ...prev!, phone: e.target.value }))
                          : handleNewAdminChange(e)
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingAdmin ? (
                    <>
                      <Button 
                        type="button" 
                        variant="default"
                        onClick={handleSaveEditedAdmin}
                      >
                        Save Changes
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setEditingAdmin(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      type="button" 
                      variant="default"
                      onClick={handleAddAdmin}
                    >
                      Add Admin
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="col-span-2 flex justify-end space-x-4 mt-6">
            <Button 
              type="button" 
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              variant="default"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBranchModal;
