'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Tags, X, Pencil, AlertTriangle, Plus, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { AdminTable, ColumnDef } from './AdminTable';
import { TableActionsCell } from './TableActionsCell';
import { AdminForm, AdminFormField } from './AdminForm';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().optional(),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface AdminCategoriesTabProps {
  categories: any[];
  isLoading: boolean;
  onRefresh: () => void;
  onCategoryCreated?: (created: any) => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  isLoading,
  onRefresh,
  onCategoryCreated,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields for Add Category using AdminForm
  const categoryFormFields = useMemo<AdminFormField<CategoryFormData>[]>(
    () => [
      {
        name: 'name',
        label: 'Collection / Category Name',
        type: 'text',
        placeholder: 'e.g. Platinum, Rings, or Gemstones',
        required: true,
        colSpan: 2,
      },
      {
        name: 'slug',
        label: 'Slug (URL Identifier)',
        type: 'text',
        placeholder: 'e.g. platinum or gemstones (optional)',
        description: 'Identifier used in category URLs. Leave blank to auto-generate from the name.',
        colSpan: 2,
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Brief description of this jewelry collection...',
        rows: 3,
        colSpan: 2,
      },
    ],
    []
  );

  // Handle Add Category via AdminForm
  const handleCreateCategory = async (data: CategoryFormData) => {
    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onCategoryCreated) {
          onCategoryCreated(resJson.category);
        }
        onRefresh();
        setIsAddModalOpen(false);
      } else {
        alert(resJson.message || 'Failed to create category');
      }
    } catch {
      alert('Error creating category in database');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Edit Category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategory.id,
          category_id: editingCategory.category_id,
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.desc,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
        setEditingCategory(null);
      } else {
        alert(data.message || 'Failed to update category');
      }
    } catch {
      alert('Error updating category in database');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Category
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setActionLoading(true);
    try {
      const queryParam = deletingCategory.id ? `id=${deletingCategory.id}` : `category_id=${deletingCategory.category_id}`;
      const res = await fetch(`/api/admin/categories?${queryParam}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
        setDeletingCategory(null);
      } else {
        alert(data.message || 'Failed to delete category');
      }
    } catch {
      alert('Error deleting category from database');
    } finally {
      setActionLoading(false);
    }
  };

  const categoryColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Collection Name',
        cell: (info) => <span className="font-bold text-neutral-950 text-sm">{String(info.getValue())}</span>,
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: (info) => (
          <span className="font-mono text-neutral-700 font-medium text-xs">/{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'desc',
        header: 'Description',
        cell: (info) => (
          <span className="text-neutral-800 font-medium text-xs max-w-md block truncate">{String(info.getValue())}</span>
        ),
      },
      {
        accessorKey: 'count',
        header: 'Assigned Products',
        cell: (info) => (
          <span className="px-2.5 py-0.5 bg-[#F5EEDB] text-neutral-900 border border-neutral-300 rounded-md text-xs font-bold">
            {Number(info.getValue())} Items
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <TableActionsCell
            item={info.row.original}
            onView={(cat) => setSelectedCategory(cat)}
            onEdit={(cat) => setEditingCategory(cat)}
            onDelete={(cat) => setDeletingCategory(cat)}
          />
        ),
      },
    ],
    []
  );

  return (
    <>
      <AdminTable
        title="Collections & Categories"
        subtitle={`${categories.length} catalog collections configured in database`}
        data={categories}
        columns={categoryColumns}
        isLoading={isLoading}
        searchPlaceholder="Search categories by name or slug..."
        pageSize={10}
        onRowClick={(row) => setSelectedCategory(row)}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-[#8F6B1E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-white shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* View Category Modal */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-[#FAF9F6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] border border-[#D4AF37]/40 text-[#8F6B1E] flex items-center justify-center font-bold shadow-xs">
                    <Tags className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-base">
                      {selectedCategory.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">/{selectedCategory.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-neutral-800">
                <div className="p-4 bg-[#FAF9F6] rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Assigned Products</span>
                    <span className="px-2.5 py-0.5 bg-[#F5EEDB] text-neutral-900 border border-neutral-300 rounded-md text-xs font-bold">
                      {Number(selectedCategory.count || 0)} Items
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-500 font-medium block mb-1">Description</span>
                  <p className="text-neutral-700 leading-relaxed bg-[#FAFAF9] p-3 rounded-xl border border-neutral-200">
                    {selectedCategory.desc || 'No description provided.'}
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-100 bg-[#FAF9F6] flex justify-end">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-[#FAF9F6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBF6E9] border border-[#D4AF37]/40 text-[#8F6B1E] flex items-center justify-center font-bold">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-neutral-900 text-base">
                    Edit Category
                  </h3>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={editingCategory.name || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Slug (URL Identifier)
                  </label>
                  <input
                    type="text"
                    value={editingCategory.slug || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, slug: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingCategory.desc || ''}
                    onChange={(e) =>
                      setEditingCategory({ ...editingCategory, desc: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#8F6B1E] text-white rounded-xl text-xs font-semibold hover:bg-[#785915] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Category Modal */}
      <AnimatePresence>
        {deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden p-6 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-neutral-900 text-base">
                  Delete Category
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Are you sure you want to delete category <strong className="text-neutral-900">"{deletingCategory.name}"</strong>?
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Category Modal using AdminForm */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 sm:p-6 overflow-y-auto">
                <AdminForm<CategoryFormData>
                  schema={categorySchema}
                  fields={categoryFormFields}
                  defaultValues={{
                    name: '',
                    slug: '',
                    description: '',
                  }}
                  onSubmit={handleCreateCategory}
                  title="Add New Category"
                  subtitle="Create a new fine jewelry collection in MongoDB database"
                  submitLabel="Add Category"
                  cancelLabel="Cancel"
                  onCancel={() => setIsAddModalOpen(false)}
                  isLoading={createLoading}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminCategoriesTab;
