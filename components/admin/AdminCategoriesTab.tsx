'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Tags, X, Pencil, AlertTriangle } from 'lucide-react';
import { AdminTable, ColumnDef } from './AdminTable';
import { TableActionsCell } from './TableActionsCell';

interface AdminCategoriesTabProps {
  categories: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  isLoading,
  onRefresh,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);

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
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-white shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
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

              <div className="p-6 space-y-4 text-xs">
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
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Category updated');
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 bg-[#8F6B1E] text-white rounded-xl text-xs font-semibold hover:bg-[#785915] transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
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
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Category removed');
                    setDeletingCategory(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
