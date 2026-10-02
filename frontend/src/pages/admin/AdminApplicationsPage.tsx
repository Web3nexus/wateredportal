import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { MembershipApplication, MembershipCategory } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  FileCheck2,
  Search,
  CheckCircle,
  XCircle,
  PhoneCall,
  AlertCircle,
  Eye,
  Filter,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';

export const AdminApplicationsPage: React.FC = () => {
  const [applications, setApplications] = useState<MembershipApplication[]>([]);
  const [categories, setCategories] = useState<MembershipCategory[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedApp, setSelectedApp] = useState<MembershipApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    membership_category_id: '' as string | number,
    occupation: '',
    workplace: '',
    current_location: '',
    personal_statement: '',
    status: 'pending',
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Modal State
  const [editingApp, setEditingApp] = useState<MembershipApplication | null>(null);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    membership_category_id: '' as string | number,
    occupation: '',
    workplace: '',
    current_location: '',
    personal_statement: '',
    status: 'pending',
    review_notes: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Delete Confirmation State
  const [deletingApp, setDeletingApp] = useState<MembershipApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    adminService
      .getApplications({
        status: statusFilter || undefined,
        category_id: categoryFilter,
        search: search || undefined,
      })
      .then((res) => setApplications(res.applications.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

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

  const handleApprove = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await adminService.approveApplication(selectedApp.id, { review_notes: reviewNotes });
      setActionSuccess('Application successfully approved. Member account and credentials have been issued.');
      setTimeout(() => {
        setSelectedApp(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp) return;
    if (!reviewNotes) {
      setActionError('Please provide a reason or review note for rejection.');
      return;
    }
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await adminService.rejectApplication(selectedApp.id, reviewNotes);
      setActionSuccess('Application has been rejected.');
      setTimeout(() => {
        setSelectedApp(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedApp) return;
    setIsProcessing(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await adminService.requestInfoApplication(selectedApp.id, reviewNotes || 'Additional verification required.');
      setActionSuccess('Information request notification sent to applicant.');
      setTimeout(() => {
        setSelectedApp(null);
        loadData();
      }, 1200);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update application status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      await adminService.createApplication({
        first_name: createForm.first_name,
        last_name: createForm.last_name,
        email: createForm.email,
        phone: createForm.phone,
        membership_category_id: Number(createForm.membership_category_id),
        occupation: createForm.occupation,
        workplace: createForm.workplace,
        current_location: createForm.current_location,
        personal_statement: createForm.personal_statement,
        status: createForm.status as any,
      });

      setIsCreateOpen(false);
      setCreateForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        membership_category_id: categories[0]?.id || '',
        occupation: '',
        workplace: '',
        current_location: '',
        personal_statement: '',
        status: 'pending',
      });
      loadData();
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create application.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEdit = (app: MembershipApplication) => {
    setEditingApp(app);
    setEditForm({
      first_name: app.first_name,
      last_name: app.last_name,
      email: app.email,
      phone: app.phone,
      membership_category_id: app.membership_category_id,
      occupation: app.occupation || '',
      workplace: app.workplace || '',
      current_location: app.current_location || '',
      personal_statement: app.personal_statement || '',
      status: app.status,
      review_notes: app.review_notes || '',
    });
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    setEditError(null);
    setIsEditing(true);

    try {
      await adminService.updateApplication(editingApp.id, {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        phone: editForm.phone,
        membership_category_id: Number(editForm.membership_category_id),
        occupation: editForm.occupation,
        workplace: editForm.workplace,
        current_location: editForm.current_location,
        personal_statement: editForm.personal_statement,
        status: editForm.status as any,
        review_notes: editForm.review_notes,
      });

      setEditingApp(null);
      loadData();
    } catch (err: any) {
      setEditError(err.message || 'Failed to update application.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingApp) return;
    setIsDeleting(true);
    try {
      await adminService.deleteApplication(deletingApp.id);
      setDeletingApp(null);
      if (selectedApp?.id === deletingApp.id) {
        setSelectedApp(null);
      }
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete application.');
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
            Applicant Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Membership Applications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review, verify, approve, edit, and manage all Watered membership applications
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
            New Application
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
              placeholder="Search applicant name, email, or application number..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
          >
            <option value="">Active (Pending / Review)</option>
            <option value="all">All Applications (Incl. Archive)</option>
            <option value="pending">Pending Only</option>
            <option value="under_review">Under Review</option>
            <option value="contact_required">Contact Required</option>
            <option value="approved">Approved Archive</option>
            <option value="rejected">Rejected Archive</option>
          </select>

          <select
            value={categoryFilter || ''}
            onChange={(e) => setCategoryFilter(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-white border border-slate-200 text-xs text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-600"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Loading membership applications...
          </p>
        </div>
      ) : applications.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-sm">
          <FileCheck2 className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-900">No applications match criteria</p>
          <p className="text-xs text-slate-500">
            {statusFilter === '' 
              ? 'All active candidate submissions have been processed and moved to Member Directory.' 
              : 'Try changing your search or filter options.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200/90 rounded-2xl shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Occupation & Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-blue-600">
                    {app.application_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900 block text-sm">
                      {app.first_name} {app.last_name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">{app.email}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block text-[11px] font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      {app.category?.name}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-slate-900 block font-medium">{app.occupation || '—'}</span>
                    <span className="text-[11px] text-slate-500">{app.current_location || '—'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        app.status === 'approved'
                          ? 'success'
                          : app.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {app.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedApp(app);
                          setReviewNotes(app.review_notes || '');
                          setActionError(null);
                          setActionSuccess(null);
                        }}
                        title="Review / Approve"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600 mr-1" />
                        <span>Review</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(app)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                        title="Edit application"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingApp(app)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete application"
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

      {/* Review Application Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Application Review"
        description={`Application ID: ${selectedApp?.application_number}`}
        maxWidth="xl"
      >
        {selectedApp && (
          <div className="space-y-5 text-xs sm:text-sm font-sans">
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
              <div className="w-24 h-28 rounded-lg border border-slate-200 overflow-hidden bg-white shrink-0 shadow-xs p-0.5">
                {selectedApp.photograph_url ? (
                  <img
                    src={selectedApp.photograph_url}
                    alt={selectedApp.full_name}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    No Photo
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedApp.first_name} {selectedApp.last_name}
                  </h3>
                  <Badge
                    variant={
                      selectedApp.status === 'approved'
                        ? 'success'
                        : selectedApp.status === 'rejected'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {selectedApp.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 space-y-0.5">
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <span className="font-mono text-slate-800">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone: </span>
                    <span className="font-mono text-slate-800">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Location: </span>
                    <span>{selectedApp.current_location || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] uppercase font-semibold text-slate-400 block">Applied Category</span>
                <span className="font-semibold text-blue-700 text-sm">
                  {selectedApp.category?.name || 'Standard Member'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] uppercase font-semibold text-slate-400 block">Occupation & Employer</span>
                <span className="font-medium text-slate-900 text-sm">
                  {selectedApp.occupation || 'N/A'} {selectedApp.workplace ? `at ${selectedApp.workplace}` : ''}
                </span>
              </div>
            </div>

            {selectedApp.personal_statement && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[11px] font-semibold uppercase text-slate-400 block">Applicant Statement</span>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{selectedApp.personal_statement}&rdquo;
                </p>
              </div>
            )}

            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700">
                Administrative Review Notes
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Internal verification notes, comments, or reason for decision..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleReject}
                  isLoading={isProcessing}
                  disabled={selectedApp.status === 'rejected'}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Reject Application
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRequestInfo}
                  isLoading={isProcessing}
                >
                  <PhoneCall className="w-3.5 h-3.5 mr-1" />
                  Request Details
                </Button>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedApp(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  isLoading={isProcessing}
                  disabled={selectedApp.status === 'approved'}
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Approve & Move to Registry
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Application Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Application"
        description="Add a membership application manually to the register."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs sm:text-sm">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="contact_required">Contact Required</option>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location (City, Country)</label>
            <input
              type="text"
              value={createForm.current_location}
              onChange={(e) => setCreateForm({ ...createForm, current_location: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Statement / Background</label>
            <textarea
              rows={3}
              value={createForm.personal_statement}
              onChange={(e) => setCreateForm({ ...createForm, personal_statement: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
              Create Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Application Modal */}
      <Modal
        isOpen={!!editingApp}
        onClose={() => setEditingApp(null)}
        title="Edit Application"
        description={`Modify applicant information for ${editingApp?.application_number}`}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs sm:text-sm">
          {editError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{editError}</span>
            </div>
          )}

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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                required
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
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="contact_required">Contact Required</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Current Location</label>
            <input
              type="text"
              value={editForm.current_location}
              onChange={(e) => setEditForm({ ...editForm, current_location: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Statement</label>
            <textarea
              rows={2}
              value={editForm.personal_statement}
              onChange={(e) => setEditForm({ ...editForm, personal_statement: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Review Notes</label>
            <textarea
              rows={2}
              value={editForm.review_notes}
              onChange={(e) => setEditForm({ ...editForm, review_notes: e.target.value })}
              placeholder="Internal reviewer comments..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditingApp(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isEditing}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingApp}
        onClose={() => setDeletingApp(null)}
        title="Delete Application"
        description="Permanently remove application record"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600">
            Are you sure you want to permanently delete application{' '}
            <strong className="text-slate-900 font-mono">{deletingApp?.application_number}</strong> for{' '}
            <strong className="text-slate-900">
              {deletingApp?.first_name} {deletingApp?.last_name}
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setDeletingApp(null)}>
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
