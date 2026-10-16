'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RefreshCw,
  ShoppingBag,
  X,
  Pencil,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  Truck,
  Building2,
  Calendar,
  CheckCircle2,
  Loader2,
  Clock,
  FileText,
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
    header: 'Order Number',
    cell: (info) => {
      const orderNum = info.row.original.orderNumber || info.getValue();
      return (
        <span className="font-mono font-bold text-neutral-950 text-xs px-2.5 py-1 bg-neutral-100 border border-neutral-200 rounded-md inline-block">
          {String(orderNum)}
        </span>
      );
    },
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: (info) => (
      <div>
        <div className="font-bold text-neutral-950 text-sm">
          {info.row.original.customerName || info.getValue()}
        </div>
        <div className="text-xs text-neutral-600 font-medium">
          {info.row.original.customerEmail || info.row.original.email}
        </div>
        {info.row.original.phone && (
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {info.row.original.phone}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'item',
    header: 'Jewelry Items',
    cell: (info) => {
      const items = info.row.original.items;
      if (Array.isArray(items) && items.length > 0) {
        return (
          <div className="max-w-xs">
            <span className="text-neutral-900 font-medium text-xs truncate block">
              {items.map((i: any) => `${i.title} (×${i.quantity || 1})`).join(', ')}
            </span>
            <span className="text-[11px] text-neutral-500 font-semibold">
              {items.reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0)} items total
            </span>
          </div>
        );
      }
      return (
        <span className="text-neutral-900 font-medium text-xs max-w-xs truncate block">
          {String(info.getValue() || 'Fine Jewelry Item')}
        </span>
      );
    },
  },
  {
    accessorKey: 'amount',
    header: 'Total Amount',
    cell: (info) => (
      <span className="font-bold text-neutral-950 text-sm">
        {String(info.getValue() || '$0.00')}
      </span>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Order Date',
    cell: (info) => (
      <span className="text-neutral-800 font-medium text-xs">
        {String(info.getValue() || '')}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => {
      const status = String(info.getValue() || 'Processing');
      const badgeClass =
        status === 'Processing'
          ? 'bg-amber-100 text-amber-950 border-amber-300'
          : status === 'Shipped'
          ? 'bg-blue-100 text-blue-950 border-blue-300'
          : status === 'Delivered' || status === 'Completed'
          ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
          : 'bg-red-100 text-red-950 border-red-300';

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
  onOrderUpdated?: (order: any) => void;
  onOrderDeleted?: (orderId: string) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  isLoading,
  onRefresh,
  onOrderUpdated,
  onOrderDeleted,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Handle Edit Order Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!editingOrder) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: editingOrder.orderNumber || editingOrder.id,
          id: editingOrder._id || editingOrder.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (onOrderUpdated) {
          onOrderUpdated({ ...editingOrder, status: newStatus });
        }
        onRefresh();
        setEditingOrder(null);
        if (selectedOrder && (selectedOrder.id === editingOrder.id || selectedOrder.orderNumber === editingOrder.orderNumber)) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert(data.message || 'Failed to update order status');
      }
    } catch {
      alert('Error updating order status in database');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Order
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    setActionLoading(true);
    try {
      const targetId = deletingOrder.orderNumber || deletingOrder.id;
      const res = await fetch(`/api/admin/orders?id=${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (onOrderDeleted) {
          onOrderDeleted(targetId);
        }
        onRefresh();
        setDeletingOrder(null);
      } else {
        alert(data.message || 'Failed to delete order');
      }
    } catch {
      alert('Error deleting order from database');
    } finally {
      setActionLoading(false);
    }
  };

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
        subtitle={`${orders.length} real orders retrieved from MongoDB Atlas database (click any row for full specs)`}
        data={orders}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Search orders by customer name, email, phone, or order ID..."
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

      {/* View Order Full Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-[#FAF9F6]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] border border-[#D4AF37]/40 text-[#8F6B1E] flex items-center justify-center font-bold shadow-xs">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-base">
                      Order Reference: {selectedOrder.orderNumber || selectedOrder.id}
                    </h3>
                    <p className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                      <Calendar className="w-3 h-3 text-neutral-400" />
                      <span>{selectedOrder.date || 'Recently placed'}</span>
                      <span>•</span>
                      <span className="font-semibold text-neutral-700">Status: {selectedOrder.status}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Modal Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-neutral-800">
                {/* Customer & Fulfillment Header Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Information */}
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Customer Details
                    </span>
                    <strong className="text-neutral-950 font-bold text-sm block">
                      {selectedOrder.customerName || selectedOrder.customer}
                    </strong>
                    <div className="flex items-center gap-1.5 text-neutral-600">
                      <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <a href={`mailto:${selectedOrder.customerEmail || selectedOrder.email}`} className="hover:underline">
                        {selectedOrder.customerEmail || selectedOrder.email}
                      </a>
                    </div>
                    {selectedOrder.phone && (
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <a href={`tel:${selectedOrder.phone}`} className="hover:underline">
                          {selectedOrder.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Delivery & Shipping Info */}
                  <div className="p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200 space-y-2">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                      Fulfillment Method
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-sm">
                      {selectedOrder.deliveryMethod === 'pickup' ? (
                        <>
                          <Building2 className="w-4 h-4 text-[#8C6210]" />
                          <span>Showroom Collection</span>
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 text-[#8C6210]" />
                          <span>Insured Express Delivery</span>
                        </>
                      )}
                    </div>

                    {selectedOrder.shippingAddress && (
                      <div className="pt-1 text-neutral-600 leading-relaxed text-[11px] border-t border-neutral-200/60 mt-1">
                        <div className="flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>
                            {selectedOrder.shippingAddress.address}
                            {selectedOrder.shippingAddress.apartment && `, ${selectedOrder.shippingAddress.apartment}`}
                            <br />
                            {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Purchased Jewelry Items List */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Ordered Jewelry Items
                  </span>

                  {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    <div className="space-y-2 divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden bg-white">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image && (
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                                <Image
                                  src={item.image}
                                  alt={item.title || 'Product'}
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-neutral-900 text-xs truncate">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-neutral-500">
                                Quantity: <strong className="text-neutral-800">{item.quantity || 1}</strong>
                                {item.price && ` • $${parseFloat(String(item.price)).toFixed(2)} each`}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-neutral-950 text-xs shrink-0 text-right">
                            ${(parseFloat(String(item.price || '0')) * (item.quantity || 1)).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-white">
                      <div className="font-bold text-neutral-900 text-sm">{selectedOrder.item}</div>
                    </div>
                  )}
                </div>

                {/* Order Special Notes if any */}
                {selectedOrder.notes && (
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-[#FAFAF9] space-y-1">
                    <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                      Special Instructions / Notes
                    </span>
                    <p className="text-neutral-700 italic text-xs leading-relaxed">
                      &ldquo;{selectedOrder.notes}&rdquo;
                    </p>
                  </div>
                )}

                {/* Financial Summary */}
                <div className="p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200 space-y-1.5">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">
                      ${Number(selectedOrder.subtotal || selectedOrder.rawAmount || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Insured Express Shipping</span>
                    <span className="font-semibold text-emerald-700 uppercase text-[11px]">Free</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-neutral-600">
                      <span>Sales Tax (GA 7%)</span>
                      <span className="font-semibold text-neutral-900">${Number(selectedOrder.tax).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                    <span>Total Amount</span>
                    <span className="text-base font-extrabold text-[#8F6B1E]">
                      {selectedOrder.amount || `$${Number(selectedOrder.totalAmount || 0).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-100 bg-[#FAF9F6] flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setEditingOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#8F6B1E]" />
                  <span>Update Order Status</span>
                </button>
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

      {/* Edit Order Status Modal */}
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
                    Update Order Status
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
                  <span className="text-neutral-500 block mb-1">Order Reference</span>
                  <strong className="text-neutral-900 font-mono text-sm">
                    {editingOrder.orderNumber || editingOrder.id}
                  </strong>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Order Status
                  </label>
                  <select
                    defaultValue={editingOrder.status || 'Processing'}
                    id="order-status-select"
                    className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium text-neutral-900 outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingOrder(null)}
                    disabled={actionLoading}
                    className="px-4 py-2 border border-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => {
                      const sel = document.getElementById('order-status-select') as HTMLSelectElement;
                      if (sel) handleUpdateStatus(sel.value);
                    }}
                    className="px-4 py-2 bg-[#8F6B1E] text-white rounded-xl text-xs font-semibold hover:bg-[#785915] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Order Confirmation Modal */}
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
                  Are you sure you want to delete order <strong className="text-neutral-900 font-mono">#{deletingOrder.orderNumber || deletingOrder.id}</strong> for {deletingOrder.customerName || deletingOrder.customer}?
                </p>
                <p className="text-[11px] text-red-600 mt-1">
                  This action will remove the order permanently from the database.
                </p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingOrder(null)}
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
    </>
  );
};

export default AdminOrdersTab;
