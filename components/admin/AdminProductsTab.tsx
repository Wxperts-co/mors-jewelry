'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  RefreshCw,
  X,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { z } from 'zod';
import { AdminTable, ColumnDef } from './AdminTable';
import { TableActionsCell } from './TableActionsCell';
import { AdminForm, AdminFormField } from './AdminForm';

const productSchema = z.object({
  title: z.string().min(2, 'Product title is required'),
  category_id: z.string().min(1, 'Category is required'),
  msrp: z.string().min(1, 'Price (MSRP) is required'),
  wholesale_cost: z.string().optional(),
  sku: z.string().optional(),
  size: z.string().optional(),
  available: z.string().default('Yes'),
  featured: z.string().default('0'),
  new_arrival: z.string().default('0'),
  thumb_image: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface AdminProductsTabProps {
  products: any[];
  categories: any[];
  categoryMap: Record<string, string>;
  isLoading: boolean;
  onRefresh: () => void;
  onProductCreated?: (created: any) => void;
  onProductUpdated: (updated: any) => void;
  onProductDeleted: (productId: string) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  categoryMap,
  isLoading,
  onRefresh,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Handle Add Product via AdminForm
  const handleCreateProduct = async (data: ProductFormData) => {
    setCreateLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, large_image: data.thumb_image }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        if (onProductCreated) {
          onProductCreated(resJson.product);
        }
        onRefresh();
        setIsAddModalOpen(false);
      } else {
        alert(resJson.message || 'Failed to create product');
      }
    } catch {
      alert('Error creating product in database');
    } finally {
      setCreateLoading(false);
    }
  };

  const productFormFields = useMemo<AdminFormField<ProductFormData>[]>(
    () => [
      {
        name: 'title',
        label: 'Product Title',
        type: 'text',
        placeholder: 'e.g. 14K Yellow Gold Figaro Chain',
        required: true,
        colSpan: 2,
      },
      {
        name: 'thumb_image',
        label: 'Product Photography / Image',
        type: 'image',
        colSpan: 2,
        description: 'Upload high-resolution photography for store display',
      },
      {
        name: 'category_id',
        label: 'Category',
        type: 'select',
        required: true,
        colSpan: 1,
        options: categories.map((c: any) => ({
          label: c.name || c.category_name,
          value: String(c.category_id || c.id),
        })),
      },
      {
        name: 'msrp',
        label: 'Retail Price (MSRP $)',
        type: 'text',
        placeholder: '1299.00',
        required: true,
        colSpan: 1,
      },
      {
        name: 'wholesale_cost',
        label: 'Wholesale Cost ($)',
        type: 'text',
        placeholder: '650.00',
        colSpan: 1,
      },
      {
        name: 'sku',
        label: 'SKU / Inventory Code',
        type: 'text',
        placeholder: 'Auto-generated if blank (e.g. SKU-109)',
        colSpan: 1,
      },
      {
        name: 'size',
        label: 'Size / Dimensions',
        type: 'text',
        placeholder: 'e.g. 7, 18 inch, 8mm',
        colSpan: 1,
      },
      {
        name: 'available',
        label: 'Stock Status',
        type: 'select',
        colSpan: 1,
        options: [
          { label: 'In Stock (Yes)', value: 'Yes' },
          { label: 'Out of Stock (No)', value: 'No' },
        ],
      },
      {
        name: 'featured',
        label: 'Featured Showcase',
        type: 'select',
        colSpan: 1,
        options: [
          { label: 'Standard Catalog (No)', value: '0' },
          { label: 'Featured on Storefront (Yes)', value: '1' },
        ],
      },
      {
        name: 'new_arrival',
        label: 'New Arrival Badge',
        type: 'select',
        colSpan: 1,
        options: [
          { label: 'Standard Item (No)', value: '0' },
          { label: 'New Arrival (Yes)', value: '1' },
        ],
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        rows: 3,
        placeholder: 'Handcrafted luxury piece...',
        colSpan: 2,
      },
    ],
    [categories]
  );

  // Handle Edit Product save
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });
      const data = await res.json();
      if (data.success) {
        onProductUpdated(editingProduct);
        setEditingProduct(null);
      } else {
        alert(data.message || 'Failed to update product');
      }
    } catch {
      alert('Error updating product in database');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Product confirm
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${deletingProduct.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onProductDeleted(deletingProduct.id);
        setDeletingProduct(null);
      } else {
        alert(data.message || 'Failed to delete product');
      }
    } catch {
      alert('Error deleting product from database');
    } finally {
      setActionLoading(false);
    }
  };

  // Column Definitions for Products Table
  const productColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Product',
        cell: (info) => {
          const row = info.row.original;
          const idNum = parseInt(row.id, 10);
          const imgNum = !isNaN(idNum) ? ((idNum - 1) % 20) + 1 : 1;
          const imgSrc = row.thumb_image || row.large_image || `/products/product${imgNum}.jpg`;

          return (
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-300 shrink-0 shadow-xs">
                <Image
                  src={imgSrc}
                  alt={row.title || 'Product image'}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 max-w-sm">
                <div className="font-bold text-neutral-950 text-sm truncate" title={row.title}>
                  {row.title}
                </div>
               
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'category_id',
        header: 'Category',
        cell: (info) => {
          const catId = String(info.getValue() || '');
          const catName = categoryMap[catId] || (catId ? `Cat #${catId}` : 'Unassigned');
          return (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#F5EEDB] text-neutral-900 border border-neutral-300 whitespace-nowrap">
              {catName}
            </span>
          );
        },
      },
      {
        accessorKey: 'msrp',
        header: 'Retail MSRP',
        cell: (info) => (
          <span className="font-bold text-neutral-950 text-sm">
            ${parseFloat(String(info.getValue() || '0')).toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'wholesale_cost',
        header: 'Wholesale',
        cell: (info) => {
          const val = parseFloat(String(info.getValue() || '0'));
          return (
            <span className="text-neutral-800 font-semibold text-xs">
              ${val.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: 'available',
        header: 'Stock',
        cell: (info) => {
          const isAvailable = String(info.getValue()) === 'Yes';
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                isAvailable
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : 'bg-neutral-200 text-neutral-800 border-neutral-300'
              }`}
            >
              {isAvailable ? 'In Stock' : 'Out of Stock'}
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
            onView={(p) => setSelectedProduct(p)}
            onEdit={(p) => setEditingProduct(p)}
            onDelete={(p) => setDeletingProduct(p)}
          />
        ),
      },
    ],
    [categoryMap]
  );

  return (
    <>
      <AdminTable
        title="Fine Jewelry Product Catalog"
        subtitle={`${products.length} live products retrieved directly from MongoDB database (click any row for full specs)`}
        data={products}
        columns={productColumns}
        isLoading={isLoading}
        searchPlaceholder="Search products by SKU, name, or category..."
        pageSize={10}
        onRowClick={(row) => setSelectedProduct(row)}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-[#8F6B1E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
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

      {/* Product Details Modal (showing all 32 MongoDB database fields) */}
      <AnimatePresence>
        {selectedProduct && (
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
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-base">
                      {selectedProduct.title}
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">
                      SKU: <strong className="text-neutral-800">{selectedProduct.sku}</strong> | Database ID: {selectedProduct.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs text-neutral-700">
                {/* Image & Quick Info */}
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 shadow-xs">
                    <Image
                      src={`/products/product${((parseInt(selectedProduct.id, 10) - 1) % 20) + 1 || 1}.jpg`}
                      alt={selectedProduct.title || 'Product'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBF6E9] text-[#8F6B1E] border border-[#EADBBD]">
                        {categoryMap[String(selectedProduct.category_id)] || `Category #${selectedProduct.category_id}`}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${selectedProduct.available === 'Yes' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                        {selectedProduct.available === 'Yes' ? 'In Stock' : 'Out of Stock'}
                      </span>
                      {selectedProduct.status === '1' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active Listing
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-600 line-clamp-3">
                      {selectedProduct.description || 'No description provided.'}
                    </p>
                    {selectedProduct.keywords && (
                      <div className="text-[11px] text-neutral-500">
                        <strong className="text-neutral-700">Keywords:</strong> {selectedProduct.keywords}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing & Profit Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#FAF9F6] rounded-xl border border-neutral-200">
                  <div>
                    <div className="text-[11px] text-neutral-500 font-semibold uppercase">Retail MSRP</div>
                    <div className="text-base font-bold text-neutral-900">${parseFloat(selectedProduct.msrp || '0').toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-500 font-semibold uppercase">Wholesale Cost</div>
                    <div className="text-base font-semibold text-neutral-700">${parseFloat(selectedProduct.wholesale_cost || '0').toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-500 font-semibold uppercase">Ground Ship</div>
                    <div className="text-base font-semibold text-neutral-700">${parseFloat(selectedProduct.ground_shipping || '0').toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-neutral-500 font-semibold uppercase">Est. Gross Margin</div>
                    <div className="text-base font-bold text-emerald-700">
                      ${(parseFloat(selectedProduct.msrp || '0') - parseFloat(selectedProduct.wholesale_cost || '0')).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Shipping & Specs */}
                <div>
                  <h4 className="font-semibold text-neutral-900 mb-2.5 uppercase tracking-wider text-[11px]">
                    Shipping & Logistics Rates
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                      <span className="text-neutral-500 block">3-Day Express</span>
                      <strong className="text-neutral-900">${selectedProduct['3_day_express'] || '0.00'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                      <span className="text-neutral-500 block">2-Day Express</span>
                      <strong className="text-neutral-900">${selectedProduct['2_day_express'] || '0.00'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                      <span className="text-neutral-500 block">Next Day</span>
                      <strong className="text-neutral-900">${selectedProduct.next_day || '0.00'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-neutral-200">
                      <span className="text-neutral-500 block">Actual Weight</span>
                      <strong className="text-neutral-900">{selectedProduct.actual_weight || '0'} lbs</strong>
                    </div>
                  </div>
                </div>

                {/* Packaging & Variants */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-neutral-200">
                    <span className="text-neutral-500 block">Box Dimensions (LxWxH)</span>
                    <strong className="text-neutral-800">{selectedProduct.box_size_L_W_H || 'Standard'}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-neutral-200">
                    <span className="text-neutral-500 block">Size Variant</span>
                    <strong className="text-neutral-800">{selectedProduct.size || 'One Size'}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F6] border border-neutral-200">
                    <span className="text-neutral-500 block">Seasonal Item</span>
                    <strong className="text-neutral-800">{selectedProduct.seasonal_item || 'No'}</strong>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-neutral-100 bg-[#FAF9F6] flex justify-end">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 bg-[#FAF9F6]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBF6E9] border border-[#D4AF37]/40 text-[#8F6B1E] flex items-center justify-center font-bold">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-base">
                      Edit Product
                    </h3>
                    <p className="text-xs text-neutral-500 font-mono">
                      SKU: {editingProduct.sku}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingProduct(null)}
                  disabled={actionLoading}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    value={editingProduct.title || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, title: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Retail MSRP ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.msrp || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, msrp: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Wholesale Cost ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.wholesale_cost || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, wholesale_cost: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Category
                    </label>
                    <select
                      value={editingProduct.category_id || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, category_id: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                    >
                      {categories.map((c: any) => (
                        <option key={c.category_id || c.id} value={c.category_id || ''}>
                          {c.name || c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                      Stock Availability
                    </label>
                    <select
                      value={editingProduct.available || 'Yes'}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, available: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                    >
                      <option value="Yes">In Stock (Yes)</option>
                      <option value="No">Out of Stock (No)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase text-neutral-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingProduct && (
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
                  Delete Product
                </h3>
                <p className="text-xs text-neutral-600 mt-1">
                  Are you sure you want to delete <strong className="text-neutral-900">"{deletingProduct.title}"</strong> (SKU: {deletingProduct.sku})?
                </p>
                <p className="text-[11px] text-red-600 mt-1">
                  This action cannot be undone and will remove the record from MongoDB.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
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

      {/* Add Product Modal using AdminForm */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-4 sm:p-6 overflow-y-auto">
                <AdminForm<ProductFormData>
                  schema={productSchema}
                  fields={productFormFields}
                  defaultValues={{
                    title: '',
                    category_id: categories[0]?.category_id ? String(categories[0].category_id) : '1',
                    msrp: '',
                    wholesale_cost: '',
                    sku: '',
                    size: '',
                    available: 'Yes',
                    featured: '0',
                    new_arrival: '0',
                    thumb_image: '',
                    description: '',
                  }}
                  onSubmit={handleCreateProduct}
                  title="Add New Product"
                  subtitle="Create a new fine jewelry item in the MongoDB database"
                  submitLabel="Add Product"
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
