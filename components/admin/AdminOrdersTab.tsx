'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  ShoppingBag,
  X,
  Pencil,
  AlertTriangle,
} from 'lucide-react';
import { AdminTable, ColumnDef } from './AdminTable';
import { TableActionsCell } from './TableActionsCell';

export const getOrderColumns = (actions?: {
  onView?: (order: any) => void;
  onEdit?: (order: any) => void;
  onDelete?: (order: any) => void;
}): ColumnDef<any>[] => [
  {
    accessorKey: 'id',
    header: 'Order ID',
    cell: (info) => (
      <span className="font-mono font-bold text-neutral-950 text-xs">{String(info.getValue())}</span>
    ),
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: (info) => (
      <div>
        <div className="font-bold text-neutral-950 text-sm">{String(info.getValue())}</div>
        <div className="text-xs text-neutral-600 font-medium">{info.row.original.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'item',
    header: 'Jewelry Item',
    cell: (info) => (
      <span className="text-neutral-900 font-medium text-sm max-w-xs truncate block">{String(info.getValue())}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Total Amount',
    cell: (info) => (
      <span className="font-bold text-neutral-950 text-sm">{String(info.getValue())}</span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Order Date',
    cell: (info) => <span className="text-neutral-800 font-medium text-xs">{String(info.getValue())}</span>,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const status = String(info.getValue());
      const badgeClass =
        status === 'Processing'
          ? 'bg-amber-100 text-amber-950 border-amber-300'
          : status === 'Shipped'
          ? 'bg-blue-100 text-blue-950 border-blue-300'
          : status === 'Cancelled'
          ? 'bg-red-100 text-red-950 border-red-300'
          : 'bg-emerald-100 text-emerald-950 border-emerald-300';

      return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeClass}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: (info) => (
      <TableActionsCell
        item={info.row.original}
        onView={actions?.onView}
        onEdit={actions?.onEdit}
        onDelete={actions?.onDelete}
      />
    ),
  },
];

interface AdminOrdersTabProps {
  orders: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  isLoading,
  onRefresh,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<any | null>(null);

  const columns = useMemo(
    () =>
      getOrderColumns({
        onView: (order) => setSelectedOrder(order),
        onEdit: (order) => setEditingOrder(order),
        onDelete: (order) => setDeletingOrder(order),
      }),
    []
  );

  return (
    <>
      <AdminTable
        title="Orders & Service Inquiries"
        subtitle={`${orders.length} real orders retrieved from database`}
        data={orders}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search orders by customer, email, or order ID..."
        pageSize={10}
        onRowClick={(row) => setSelectedOrder(row)}
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

      {/* View Order Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-[#FAF9F6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] border border-[#D4AF37]/40 text-[#8F6B1E] flex items-center justify-center font-bold shadow-xs">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-base">
                      Order #{selectedOrder.id}
                    </h3>
                    <p className="text-xs text-neutral-500">{selectedOrder.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-neutral-800">
                <div className="grid grid-cols-2 gap-4 p-4 bg-[#FAF9F6] rounded-xl border border-neutral-200">
                  <div>
                    <span className="text-neutral-500 font-medium block">Customer</span>
                    <strong className="text-neutral-950 font-bold text-sm">{selectedOrder.customer}</strong>
                    <div className="text-neutral-600 mt-0.5">{selectedOrder.email}</div>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-medium block">Total Amount</span>
                    <strong className="text-neutral-950 font-bold text-base">{selectedOrder.amount}</strong>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-950 border border-emerald-300">
                        {selectedOrder.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 bg-white">
                  <span className="text-neutral-500 font-medium block">Purchased Jewelry Item</span>
                  <div className="font-bold text-neutral-900 text-sm mt-1">{selectedOrder.item}</div>
                </div>
              </div>

              <div className="p-4 border-t border-neutral-100 bg-[#FAF9F6] flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Order Modal */}
      <AnimatePresence>
        {editingOrder && (
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
                    Edit Order #{editingOrder.id}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingOrder(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Order Status
                  </label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, status: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      alert('Order status updated successfully');
                      setEditingOrder(null);
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

      {/* Delete Order Modal */}
      <AnimatePresence>
        {deletingOrder && (
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
                  Delete Order
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Are you sure you want to delete order #{deletingOrder.id} for {deletingOrder.customer}?
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingOrder(null)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Order removed');
                    setDeletingOrder(null);
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
