'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Users, X, Pencil, AlertTriangle } from 'lucide-react';
import { AdminTable, ColumnDef } from './AdminTable';
import { TableActionsCell } from './TableActionsCell';

interface AdminUsersTabProps {
  admins: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  admins,
  isLoading,
  onRefresh,
}) => {
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<any | null>(null);

  const adminColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Administrator Name',
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F5EEDB] border border-neutral-300 text-neutral-900 flex items-center justify-center font-bold text-xs">
              {String(info.getValue())[0]?.toUpperCase() || 'A'}
            </div>
            <span className="font-bold text-neutral-950 text-sm">{String(info.getValue())}</span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        cell: (info) => <span className="text-neutral-800 font-medium text-xs">{String(info.getValue())}</span>,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: (info) => (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F5EEDB] border border-neutral-300 text-neutral-900">
            {String(info.getValue())}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Member Since',
        cell: (info) => <span className="text-neutral-700 font-medium text-xs">{String(info.getValue())}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <TableActionsCell
            item={info.row.original}
            onView={(u) => setSelectedAdmin(u)}
            onEdit={(u) => setEditingAdmin(u)}
            onDelete={(u) => setDeletingAdmin(u)}
          />
        ),
      },
    ],
    []
  );

  return (
    <>
      <AdminTable
        title="Team & Administrator Accounts"
        subtitle={`${admins.length} authorized administrator accounts retrieved from MongoDB Atlas`}
        data={admins}
        columns={adminColumns}
        isLoading={isLoading}
        searchPlaceholder="Search administrator by name or email..."
        pageSize={10}
        onRowClick={(row) => setSelectedAdmin(row)}
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

      {/* View Admin Modal */}
      <AnimatePresence>
        {selectedAdmin && (
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
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-base">
                      {selectedAdmin.name}
                    </h3>
                    <p className="text-xs text-neutral-500">{selectedAdmin.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-neutral-800">
                <div className="p-4 bg-[#FAF9F6] rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Account Role</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F5EEDB] border border-neutral-300 text-neutral-900">
                      {selectedAdmin.role}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Member Since</span>
                    <span className="font-medium text-neutral-800">{selectedAdmin.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-100 bg-[#FAF9F6] flex justify-end">
                <button
                  onClick={() => setSelectedAdmin(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Admin Modal */}
      <AnimatePresence>
        {editingAdmin && (
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
                    Edit Administrator
                  </h3>
                </div>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingAdmin.name || ''}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Role
                  </label>
                  <select
                    value={editingAdmin.role || 'Super Admin'}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Admin updated successfully');
                      setEditingAdmin(null);
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

      {/* Delete Admin Modal */}
      <AnimatePresence>
        {deletingAdmin && (
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
                  Delete Administrator
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Are you sure you want to remove administrator <strong className="text-neutral-900">"{deletingAdmin.name}"</strong> ({deletingAdmin.email})?
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingAdmin(null)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Admin account removed');
                    setDeletingAdmin(null);
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
