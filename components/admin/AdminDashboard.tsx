'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminResetPasswordTab } from './AdminResetPasswordTab';

interface AdminDashboardProps {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Real Database Records State
  const [dashboardData, setDashboardData] = useState<{
    products: any[];
    categories: any[];
    orders: any[];
    admins: any[];
    users: any[];
    stats: {
      totalProducts: number;
      totalCategories: number;
      totalOrders: number;
      totalAdmins: number;
      totalUsers?: number;
      totalRevenue: string;
    };
  }>({
    products: [],
    categories: [],
    orders: [],
    admins: [],
    users: [],
    stats: {
      totalProducts: 0,
      totalCategories: 0,
      totalOrders: 0,
      totalAdmins: 0,
      totalUsers: 0,
      totalRevenue: '$0',
    },
  });

  const [loadingData, setLoadingData] = useState(true);

  // Fetch real records from MongoDB Atlas
  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/dashboard-data', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && json.data) {
        setDashboardData(json.data);
      }
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      onLogout();
    }
  };

  // Mapping category_id -> category_name from real DB records
  const categoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    dashboardData.categories.forEach((c: any) => {
      if (c.category_id) {
        map[String(c.category_id)] = c.name || c.category_name;
      }
    });
    return map;
  }, [dashboardData.categories]);

  const handleProductUpdated = (updatedProduct: any) => {
    setDashboardData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
      ),
    }));
  };

  const handleProductCreated = (newProduct: any) => {
    setDashboardData((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
      stats: {
        ...prev.stats,
        totalProducts: prev.stats.totalProducts + 1,
      },
    }));
  };

  const handleCategoryCreated = (newCategory: any) => {
    setDashboardData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
      stats: {
        ...prev.stats,
        totalCategories: prev.stats.totalCategories + 1,
      },
    }));
  };

  const handleAdminCreated = (newAdmin: any) => {
    setDashboardData((prev) => ({
      ...prev,
      admins: [...prev.admins, newAdmin],
      stats: {
        ...prev.stats,
        totalAdmins: prev.stats.totalAdmins + 1,
      },
    }));
  };

  const handleOrderUpdated = (updatedOrder: any) => {
    setDashboardData((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.id === updatedOrder.id || o.orderNumber === updatedOrder.orderNumber
          ? { ...o, ...updatedOrder }
          : o
      ),
    }));
  };

  const handleOrderDeleted = (orderId: string) => {
    setDashboardData((prev) => ({
      ...prev,
      orders: prev.orders.filter((o) => o.id !== orderId && o.orderNumber !== orderId),
      stats: {
        ...prev.stats,
        totalOrders: Math.max(0, prev.stats.totalOrders - 1),
      },
    }));
  };

  const handleProductDeleted = (deletedProductId: string) => {
    setDashboardData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== deletedProductId),
      stats: {
        ...prev.stats,
        totalProducts: Math.max(0, prev.stats.totalProducts - 1),
      },
    }));
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] text-neutral-900">
      {/* 1. Left Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={isSidebarCollapsed}
      />

      {/* 2. Right Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <AdminTopbar
          admin={admin}
          activeTab={activeTab}
          onLogout={handleLogout}
          loggingOut={loggingOut}
          onMenuClick={() => setSidebarOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          onSelectTab={setActiveTab}
        />

        {/* Main Tab Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              stats={dashboardData.stats}
              orders={dashboardData.orders}
              products={dashboardData.products}
              categories={dashboardData.categories}
              isLoading={loadingData}
              onRefresh={loadDashboardData}
              setActiveTab={setActiveTab}
              adminEmail={admin.email}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              products={dashboardData.products}
              categories={dashboardData.categories}
              categoryMap={categoryMap}
              isLoading={loadingData}
              onRefresh={loadDashboardData}
              onProductCreated={handleProductCreated}
              onProductUpdated={handleProductUpdated}
              onProductDeleted={handleProductDeleted}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categories={dashboardData.categories}
              isLoading={loadingData}
              onRefresh={loadDashboardData}
              onCategoryCreated={handleCategoryCreated}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={dashboardData.orders}
              isLoading={loadingData}
              onRefresh={loadDashboardData}
              onOrderUpdated={handleOrderUpdated}
              onOrderDeleted={handleOrderDeleted}
            />
          )}

          {(activeTab === 'users' || activeTab === 'admins') && (
            <AdminUsersTab
              users={dashboardData.users || []}
              admins={dashboardData.admins}
              activeTab={activeTab === 'admins' ? 'admins' : 'users'}
              onTabChange={(tab) => setActiveTab(tab)}
              isLoading={loadingData}
              onRefresh={loadDashboardData}
              onAdminCreated={handleAdminCreated}
            />
          )}

          {activeTab === 'settings' && <AdminSettingsTab />}

          {activeTab === 'reset-password' && <AdminResetPasswordTab admin={admin} />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
