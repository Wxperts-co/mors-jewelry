'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  Users,
  ShieldCheck,
  X,
  Pencil,
  AlertTriangle,
  Plus,
  Loader2,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  DollarSign,
  UserCheck,
} from 'lucide-react';
import { z } from 'zod';
import { AdminTable, ColumnDef } from './AdminTable';
import { TableActionsCell } from './TableActionsCell';
import { AdminForm, AdminFormField } from './AdminForm';

const adminSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'superadmin']).default('admin'),
});

type AdminFormData = z.infer<typeof adminSchema>;

interface AdminUsersTabProps {
  users?: any[];
  admins: any[];
  activeTab?: 'users' | 'admins';
  onTabChange?: (tab: 'users' | 'admins') => void;
  isLoading: boolean;
  onRefresh: () => void;
  onAdminCreated?: (created: any) => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users = [],
  admins = [],
  activeTab = 'users',
  onTabChange,
  isLoading,
  onRefresh,
  onAdminCreated,
}) => {
  const [currentTab, setCurrentTab] = useState<'users' | 'admins'>(activeTab);

  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab);
    }
  }, [activeTab]);

  const handleTabSwitch = (tab: 'users' | 'admins') => {
    setCurrentTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Admin Modals State
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // User Modals State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [deletingUser, setDeletingUser] = useState<any | null>(null);

  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form fields for Add Admin using AdminForm
  const adminFormFields = useMemo<AdminFormField<AdminFormData>[]>(
    () => [
      {
        name: 'email',
        label: 'Admin Email (Login ID)',
        type: 'email',
        placeholder: 'e.g. admin@morsjewelry.com',
        required: true,
        colSpan: 2,
        description: 'Used by the administrator to log into the admin dashboard',
      },
      {
        name: 'password',
        label: 'Login Password',
        type: 'password',
        placeholder: 'Minimum 6 characters',
        required: true,
        colSpan: 2,
        description: 'Must be at least 6 characters long',
      },
      {
        name: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'e.g. Sarah Jenkins',
        colSpan: 1,
      },
      {
        name: 'role',
        label: 'Account Role',
        type: 'select',
        options: [
          { label: 'Admin (Standard)', value: 'admin' },
          { label: 'Super Admin (Full Access)', value: 'superadmin' },
        ],
        colSpan: 1,
      },
    ],
    []
  );

  // Handle Add Admin via AdminForm
  const handleCreateAdmin = async (data: AdminFormData) => {
    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onAdminCreated) {
          onAdminCreated(resJson.admin);
        }
        onRefresh();
        setIsAddModalOpen(false);
      } else {
        alert(resJson.message || 'Failed to create administrator account');
      }
    } catch {
      alert('Error creating administrator account in database');
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Edit Admin
  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin.id,
          name: editingAdmin.name,
          role: editingAdmin.role?.toLowerCase().includes('super') ? 'superadmin' : 'admin',
        }),
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
        setEditingAdmin(null);
      } else {
        alert(data.message || 'Failed to update administrator');
      }
    } catch {
      alert('Error updating administrator in database');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Admin
  const handleConfirmDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deletingAdmin.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
        setDeletingAdmin(null);
      } else {
        alert(data.message || 'Failed to delete administrator');
      }
    } catch {
      alert('Error deleting administrator from database');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Customer User
  const handleConfirmDeleteUser = async () => {
    if (!deletingUser) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users?id=${deletingUser.id}&type=customer`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onRefresh();
        setDeletingUser(null);
      } else {
        alert(data.message || 'Failed to delete customer account');
      }
    } catch {
      alert('Error deleting customer account from database');
    } finally {
      setActionLoading(false);
    }
  };

  // Customer User Columns
  const userColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Customer Name',
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#FAF3E0] border border-[#D4AF37]/50 text-[#8C6210] flex items-center justify-center font-bold text-xs shrink-0">
              {String(info.getValue())[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <span className="font-bold text-neutral-950 text-sm block">{String(info.getValue())}</span>
              <span className="text-[10px] text-neutral-400 font-mono">ID: {String(info.row.original.id).slice(-6)}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email Address',
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-xs text-neutral-800 font-medium">
            <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>{String(info.getValue())}</span>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone Number',
        cell: (info) => {
          const val = String(info.getValue() || '');
          const hasPhone = val && val !== '-';
          return (
            <div className="flex items-center gap-1.5 text-xs text-neutral-700">
              <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className={hasPhone ? 'font-medium' : 'text-neutral-400 italic'}>
                {hasPhone ? val : 'Not provided'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'address',
        header: 'Saved Address',
        cell: (info) => {
          const val = String(info.getValue() || '');
          const hasAddress = val && val !== '-';
          return (
            <div className="flex items-center gap-1.5 text-xs text-neutral-700 max-w-[200px] truncate" title={val}>
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className={`truncate ${hasAddress ? 'font-medium' : 'text-neutral-400 italic'}`}>
                {hasAddress ? val : 'No address saved'}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'ordersCount',
        header: 'Orders',
        cell: (info) => {
          const count = Number(info.getValue() || 0);
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                count > 0
                  ? 'bg-[#FAF3E0] text-[#8C6210] border border-[#D4AF37]/40'
                  : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
              }`}
            >
              {count} {count === 1 ? 'Order' : 'Orders'}
            </span>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined Date',
        cell: (info) => <span className="text-neutral-700 font-medium text-xs">{String(info.getValue())}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (info) => (
          <TableActionsCell
            item={info.row.original}
            onView={(u) => setSelectedUser(u)}
            onDelete={(u) => setDeletingUser(u)}
          />
        ),
      },
    ],
    []
  );

  // Admin Columns
  const adminColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Administrator Name',
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#F5EEDB] border border-neutral-300 text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
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
    <div className="space-y-6">
      {/* Top Segmented Subtab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-2.5 rounded-2xl border border-neutral-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100/90 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => handleTabSwitch('users')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'users'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#8F6B1E]" />
            <span>Customers & Users</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                currentTab === 'users' ? 'bg-[#FAF3E0] text-[#8C6210]' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabSwitch('admins')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentTab === 'admins'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#8F6B1E]" />
            <span>Administrators</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                currentTab === 'admins' ? 'bg-[#FAF3E0] text-[#8C6210]' : 'bg-neutral-200 text-neutral-700'
              }`}
            >
              {admins.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {currentTab === 'admins' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-[#8F6B1E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Admin</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF9F6] border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-white shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {currentTab === 'users' ? (
        <AdminTable
          title="Registered Customer Accounts"
          subtitle={`${users.length} registered customer accounts retrieved from MongoDB Atlas`}
          data={users}
          columns={userColumns}
          isLoading={isLoading}
          searchPlaceholder="Search customers by name, email, phone or address..."
          pageSize={10}
          onRowClick={(row) => setSelectedUser(row)}
        />
      ) : (
        <AdminTable
          title="Team & Administrator Accounts"
          subtitle={`${admins.length} authorized administrator accounts retrieved from MongoDB Atlas`}
          data={admins}
          columns={adminColumns}
          isLoading={isLoading}
          searchPlaceholder="Search administrator by name or email..."
          pageSize={10}
          onRowClick={(row) => setSelectedAdmin(row)}
        />
      )}

      {/* View Customer User Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-[#FAF9F6]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF3E0] border border-[#D4AF37]/50 text-[#8C6210] flex items-center justify-center font-black text-lg shadow-xs">
                    {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-lg">
                      {selectedUser.name}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-neutral-800">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-neutral-200">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold block mb-1">
                      Total Orders
                    </span>
                    <span className="font-bold text-neutral-900 text-base">
                      {selectedUser.ordersCount || 0}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-neutral-200">
                    <span className="text-[11px] text-neutral-500 uppercase font-semibold block mb-1">
                      Total Lifetime Spend
                    </span>
                    <span className="font-bold text-[#8C6210] text-base">
                      {selectedUser.totalSpentFormatted || '$0.00'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF9F6] rounded-xl border border-neutral-200 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-neutral-500 font-medium shrink-0 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </span>
                    <span className="font-semibold text-neutral-900 text-right">
                      {selectedUser.phone && selectedUser.phone !== '-' ? selectedUser.phone : 'Not provided'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-4 pt-2 border-t border-neutral-200/60">
                    <span className="text-neutral-500 font-medium shrink-0 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Saved Address
                    </span>
                    <span className="font-semibold text-neutral-900 text-right max-w-xs">
                      {selectedUser.address && selectedUser.address !== '-' ? selectedUser.address : 'No address on file'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-neutral-200/60">
                    <span className="text-neutral-500 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Account Created
                    </span>
                    <span className="font-medium text-neutral-800">{selectedUser.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-100 bg-[#FAF9F6] flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Customer User Modal */}
      <AnimatePresence>
        {deletingUser && (
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
                  Delete Customer Account
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Are you sure you want to remove customer account <strong className="text-neutral-900">"{deletingUser.name}"</strong> ({deletingUser.email})?
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
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
                    <ShieldCheck className="w-5 h-5" />
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

              <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4 text-xs">
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
                    value={editingAdmin.role?.toLowerCase().includes('super') ? 'superadmin' : 'admin'}
                    onChange={(e) =>
                      setEditingAdmin({ ...editingAdmin, role: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
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
                  disabled={actionLoading}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteAdmin}
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

      {/* Add Admin Modal using AdminForm */}
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
                <AdminForm<AdminFormData>
                  schema={adminSchema}
                  fields={adminFormFields}
                  defaultValues={{
                    email: '',
                    password: '',
                    name: '',
                    role: 'admin',
                  }}
                  onSubmit={handleCreateAdmin}
                  title="Add New Administrator"
                  subtitle="Add login email and password for an administrator account"
                  submitLabel="Add Admin"
                  cancelLabel="Cancel"
                  onCancel={() => setIsAddModalOpen(false)}
                  isLoading={createLoading}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersTab;
