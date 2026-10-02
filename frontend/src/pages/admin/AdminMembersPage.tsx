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
  UserCheck,
  UserX,
} from 'lucide-react';

export const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Manage Modal State
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [newCategoryId, setNewCategoryId] = useState<number | undefined>(undefined);
  const [newStatus, setNewStatus] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
    adminService.getCategories().then((res) => setCategories(res.categories));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenManageModal = (member: Member) => {
    setSelectedMember(member);
    setNewCategoryId(member.membership_category_id);
    setNewStatus(member.status);
    setReason('');
    setActionSuccess(null);
    setActionError(null);
  };

  const handleUpdateCategory = async () => {
    if (!selectedMember || !newCategoryId) return;
    setIsUpdating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await adminService.updateMemberCategory(selectedMember.id, newCategoryId);
      setActionSuccess('Membership category updated successfully.');
      loadData();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update category.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async (status: MemberStatus) => {
    if (!selectedMember) return;
    if (!reason) {
      setActionError('Please provide a reason for changing the membership status.');
      return;
    }
    setIsUpdating(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await adminService.updateMemberStatus(selectedMember.id, status, reason);
      setActionSuccess(`Membership status updated to ${status}.`);
      loadData();
      setSelectedMember((prev) => (prev ? { ...prev, status } : null));
    } catch (err: any) {
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
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
                  <td className="py-3.5 px-4 text-right space-x-2">
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
                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 text-xs transition-colors"
                      title="View public verification record"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
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
          <div className="space-y-6 font-sans">
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

            {/* Member Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <div className="text-slate-400 uppercase font-semibold text-[10px]">Email Address</div>
                <div className="text-slate-900 font-mono">{selectedMember.user?.email || 'N/A'}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <div className="text-slate-400 uppercase font-semibold text-[10px]">Occupation / Discipline</div>
                <div className="text-slate-900 font-medium">{selectedMember.profile?.occupation || 'Not registered'}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <div className="text-slate-400 uppercase font-semibold text-[10px]">Current Location</div>
                <div className="text-slate-900">{selectedMember.profile?.current_location || 'Not specified'}</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-0.5">
                <div className="text-slate-400 uppercase font-semibold text-[10px]">Registration Date</div>
                <div className="text-slate-900 font-mono">
                  {selectedMember.joined_at ? new Date(selectedMember.joined_at).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>

            {/* Public Record Link */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <a
                href={`/verify/${selectedMember.secure_qr_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-1.5 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Open Public Verification Record
              </a>
            </div>

            {/* Category Reassignment */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  Update Membership Category
                </h4>
                <span className="text-[10px] text-slate-400">Recorded in audit trail</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={newCategoryId || ''}
                  onChange={(e) => setNewCategoryId(Number(e.target.value))}
                  className="flex-1 bg-white border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Rank #{c.rank})
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateCategory}
                  isLoading={isUpdating}
                  disabled={newCategoryId === selectedMember.membership_category_id}
                >
                  Save Category
                </Button>
              </div>
            </div>

            {/* Status Transition */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  Update Membership Status
                </h4>
                <span className="text-[10px] text-slate-400">Controls member portal login access</span>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Reason for status change / administrative note (required for audit)..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-xs text-slate-900 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpdateStatus('active')}
                    disabled={selectedMember.status === 'active' || isUpdating}
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Activate Member
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleUpdateStatus('suspended')}
                    disabled={selectedMember.status === 'suspended' || isUpdating}
                  >
                    <UserX className="w-3.5 h-3.5 mr-1" />
                    Suspend Member
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUpdateStatus('deactivated')}
                    disabled={selectedMember.status === 'deactivated' || isUpdating}
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button variant="secondary" size="sm" onClick={() => setSelectedMember(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
