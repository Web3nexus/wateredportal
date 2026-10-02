import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { MembershipCategory } from '../../types';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Layers,
  Plus,
  Edit,
  CheckCircle,
  AlertTriangle,
  Users,
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<(MembershipCategory & { members_count?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MembershipCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    rank: 1,
    description: '',
    badge_color: '#2563eb',
    is_active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    adminService
      .getCategories()
      .then((res) => setCategories(res.categories))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      code: '',
      rank: categories.length + 1,
      description: '',
      badge_color: '#2563eb',
      is_active: true,
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: MembershipCategory) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      code: cat.code,
      rank: cat.rank,
      description: cat.description || '',
      badge_color: cat.badge_color || '#2563eb',
      is_active: cat.is_active,
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    if (!editingCategory) {
      const generatedCode = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setFormData((prev) => ({ ...prev, name, code: generatedCode }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      setFormError('Category name and unique code are required.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
        setFormSuccess('Category updated successfully.');
      } else {
        await adminService.createCategory(formData);
        setFormSuccess('New category created successfully.');
      }
      setTimeout(() => {
        setIsModalOpen(false);
        loadData();
      }, 1200);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200/80 gap-4">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            Membership Structure
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Membership Categories & Tiers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure membership tiers, descriptions, badge styling, and display order
          </p>
        </div>

        <div>
          <Button variant="primary" size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Category
          </Button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-slate-500">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading membership categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-2xl">
            No membership categories defined.
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    Tier Rank #{cat.rank}
                  </span>
                  <Badge variant={cat.is_active ? 'success' : 'neutral'}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2.5 mb-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.badge_color || '#2563eb' }}
                  />
                  <h3 className="text-base font-bold text-slate-900">
                    {cat.name}
                  </h3>
                </div>

                <div className="text-[11px] font-mono text-slate-400 mb-3">
                  Code: {cat.code}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {cat.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center text-xs text-slate-500">
                  <Users className="w-4 h-4 mr-1.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">{cat.members_count ?? 0}</span>
                  <span className="ml-1">Members</span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => openEditModal(cat)}
                >
                  <Edit className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  Edit Tier
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Membership Category'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 font-sans">
            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-800 text-xs">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{formSuccess}</span>
              </div>
            )}
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Standard Member, Senior Fellow"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unique Code
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. standard_member"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hierarchy Rank
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Badge Color Hex
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.badge_color}
                  onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={formData.badge_color}
                  onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Criteria
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Overview of privileges, roles, and prerequisites for this category..."
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="text-xs text-slate-700 font-medium">
                Active Category (available in application registration)
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSaving}
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
