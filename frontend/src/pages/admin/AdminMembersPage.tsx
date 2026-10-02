import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Member, MembershipCategory, MemberStatus } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Search,
  ExternalLink,
  Edit,
  AlertTriangle,
  CheckCircle,
  Filter,
  Plus,
  Trash2,
} from 'lucide-react';

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Manage / Edit Modal State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    membership_category_id: '' as string | number,
    status: 'active' as MemberStatus,
    occupation: '',
    workplace: '',
    current_location: '',
    valid_until: '',
    bio: '',
    new_password: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    membership_category_id: '' as string | number,
    status: 'active',
    occupation: '',
    workplace: '',
    current_location: '',
    initial_password: '',
    valid_until: '',
    bio: '',
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Delete Confirmation State
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    adminService
      .getMembers({
        category_id: selectedCategory,
        status: selectedStatus || undefined,
        search: search || undefined,
      })
      .then((res) => {
        setMembers(res.members.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    adminService.getCategories().then((res) => {
      setCategories(res.categories);
      if (res.categories.length > 0 && !createForm.membership_category_id) {
        setCreateForm((prev) => ({ ...prev, membership_category_id: res.categories[0].id }));
      }
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenManageModal = (member: Member) => {
    setSelectedMember(member);
    setActionSuccess(null);
    setActionError(null);

    // Split name or use profile names
    const parts = (member.user?.name || member.profile?.full_name || '').split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    setEditForm({
      first_name: firstName,
      last_name: lastName,
      email: member.user?.email || '',
      phone: member.profile?.phone || '',
      membership_category_id: member.membership_category_id,
      status: member.status,
      occupation: member.profile?.occupation || '',
      workplace: member.profile?.workplace || '',
      current_location: member.profile?.current_location || '',
      valid_until: member.valid_until ? member.valid_until.slice(0, 10) : '',
      bio: member.profile?.bio || '',
      new_password: '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    setIsUpdating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await adminService.updateMember(selectedMember.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        membership_category_id: Number(editForm.membership_category_id),
        status: editForm.status,
        occupation: editForm.occupation,
        workplace: editForm.workplace,
        current_location: editForm.current_location,
        valid_until: editForm.valid_until || undefined,
        bio: editForm.bio,
        new_password: editForm.new_password || undefined,
      });

      setActionSuccess('Member profile updated successfully.');
      loadData();
      setTimeout(() => {
        setSelectedMember(null);
      }, 1000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update member.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      await adminService.createMember({
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        email: createForm.email,
        phone: createForm.phone,
        membership_category_id: Number(createForm.membership_category_id),
        status: createForm.status,
        occupation: createForm.occupation,
        workplace: createForm.workplace,
        current_location: createForm.current_location,
        initial_password: createForm.initial_password || undefined,
        valid_until: createForm.valid_until || undefined,
        bio: createForm.bio,
      });

      setIsCreateOpen(false);
      setCreateForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        membership_category_id: categories[0]?.id || '',
        status: 'active',
        occupation: '',
        workplace: '',
        current_location: '',
        initial_password: '',
        valid_until: '',
        bio: '',
      });
      loadData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to register member.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingMember) return;
    setIsDeleting(true);
    try {
      await adminService.deleteMember(deletingMember.id);
      setDeletingMember(null);
      if (selectedMember?.id === deletingMember.id) {
        setSelectedMember(null);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete member.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Directory & Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Member Registry
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage active Watered members, category assignments, and account credentials
          </p>
        </div>
        <div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCreateError(null);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register Member
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, member ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter:</span>
          </div>

          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deactivated">Deactivated</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Loading member directory...
          </p>
        </div>
      ) : members.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-sm">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-900">No members match criteria</p>
          <p className="text-xs text-slate-500">Try modifying your category or status filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200/90 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Category Tier</th>
                <th className="py-3.5 px-4">Member Number</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 font-semibold overflow-hidden shrink-0">
                        {member.profile?.photograph_url ? (
                          <img src={member.profile.photograph_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          member.user?.name?.slice(0, 2).toUpperCase() || 'M'
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm">
                          {member.user?.name || member.profile?.full_name || 'Member'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {member.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${member.category?.badge_color || '#3b82f6'}15`,
                        color: member.category?.badge_color || '#3b82f6',
                        border: `1px solid ${member.category?.badge_color || '#3b82f6'}30`,
                      }}
                    >
                      {member.category?.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {member.member_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        member.status === 'active'
                          ? 'success'
                          : member.status === 'suspended'
                          ? 'danger'
                          : 'neutral'
                      }
                    >
                      {member.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenManageModal(member)}
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600 mr-1" />
                        <span>Manage</span>
                      </Button>
                      <a
                        href={`/verify/${member.secure_qr_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-xs transition-colors"
                        title="View public verification record"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeletingMember(member)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Management Modal */}
      {selectedMember && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedMember(null)}
          title={`Member Profile: ${selectedMember.member_number}`}
          maxWidth="lg"
        >
          <form onSubmit={handleEditSubmit} className="space-y-5 font-sans text-xs sm:text-sm">
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Profile Header */}
            <div className="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-800 text-lg overflow-hidden shrink-0 shadow-xs">
                {selectedMember.profile?.photograph_url ? (
                  <img src={selectedMember.profile.photograph_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  selectedMember.user?.name?.slice(0, 2).toUpperCase() || 'M'
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedMember.user?.name || selectedMember.profile?.full_name}
                  </h3>
                  <Badge
                    variant={
                      selectedMember.status === 'active'
                        ? 'success'
                        : selectedMember.status === 'suspended'
                        ? 'danger'
                        : 'neutral'
                    }
                  >
                    {selectedMember.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                  ID: {selectedMember.member_number}
                </div>
                <div className="text-xs text-blue-700 font-semibold mt-1">
                  Category: {selectedMember.category?.name}
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category Tier</label>
                <select
                  value={editForm.membership_category_id}
                  onChange={(e) => setEditForm({ ...editForm, membership_category_id: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as MemberStatus })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deactivated">Deactivated</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={editForm.occupation}
                  onChange={(e) => setEditForm({ ...editForm, occupation: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace / Organization</label>
                <input
                  type="text"
                  value={editForm.workplace}
                  onChange={(e) => setEditForm({ ...editForm, workplace: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editForm.current_location}
                  onChange={(e) => setEditForm({ ...editForm, current_location: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Valid Until (Expiry)</label>
                <input
                  type="date"
                  value={editForm.valid_until}
                  onChange={(e) => setEditForm({ ...editForm, valid_until: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reset Password (leave empty to keep current password)
              </label>
              <input
                type="password"
                placeholder="Enter new member password..."
                value={editForm.new_password}
                onChange={(e) => setEditForm({ ...editForm, new_password: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <a
                href={`/verify/${selectedMember.secure_qr_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Public Verification Record
              </a>

              <div className="flex space-x-2">
                <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedMember(null)}>
                  Close
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Register Member Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Direct Member Registration"
        description="Issue member number, credentials, and activate directory record directly."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{createError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={createForm.first_name}
                onChange={(e) => setCreateForm({ ...createForm, first_name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={createForm.last_name}
                onChange={(e) => setCreateForm({ ...createForm, last_name: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category Tier *</label>
              <select
                required
                value={createForm.membership_category_id}
                onChange={(e) => setCreateForm({ ...createForm, membership_category_id: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <input
                type="text"
                value={createForm.occupation}
                onChange={(e) => setCreateForm({ ...createForm, occupation: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Workplace / Organization</label>
              <input
                type="text"
                value={createForm.workplace}
                onChange={(e) => setCreateForm({ ...createForm, workplace: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location</label>
              <input
                type="text"
                placeholder="e.g. Lagos, Nigeria"
                value={createForm.current_location}
                onChange={(e) => setCreateForm({ ...createForm, current_location: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valid Until (Expiry)</label>
              <input
                type="date"
                value={createForm.valid_until}
                onChange={(e) => setCreateForm({ ...createForm, valid_until: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Password (leave empty to autogenerate)
            </label>
            <input
              type="password"
              placeholder="Auto-generated if empty"
              value={createForm.initial_password}
              onChange={(e) => setCreateForm({ ...createForm, initial_password: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
              Register Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Member Confirmation Modal */}
      <Modal
        isOpen={!!deletingMember}
        onClose={() => setDeletingMember(null)}
        title="Delete Member"
        description="Permanently remove member from directory"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            Are you sure you want to permanently delete member{' '}
            <strong className="text-slate-900 font-mono">{deletingMember?.member_number}</strong> (
            <strong className="text-slate-900">
              {deletingMember?.user?.name || deletingMember?.profile?.full_name}
            </strong>
            )?
          </p>
          <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
            This will permanently remove their member record, profile, verification record, and login account. This cannot be undone.
          </p>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setDeletingMember(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
