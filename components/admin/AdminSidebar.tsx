'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingBag,
  Users,
  Settings,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export type AdminTab = 'overview' | 'products' | 'categories' | 'orders' | 'users' | 'settings' | 'reset-password';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
}

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'users', label: 'Users & Admins', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'reset-password', label: 'Reset Password', icon: KeyRound },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  isCollapsed,
}) => {
  const content = (
    <div
      className={`flex flex-col h-full bg-gradient-to-b from-[#F7EED2] via-[#F4E6C3] to-[#EFE0B8] border-r border-[#D4AF37]/35 shadow-xs transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`flex items-center justify-between border-b border-[#D4AF37]/30 min-h-[76px] transition-all ${
          isCollapsed ? 'px-2 py-3' : 'px-2 py-2'
        }`}
      >
        {!isCollapsed ? (
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo/logo.png"
              alt="Mor's Jewelry & Repair"
              width={240}
              height={80}
              priority
              className="h-20 w-auto object-contain"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <Image
              src="/logo/favicon.webp"
              alt="Mor's Jewelry"
              width={36}
              height={36}
              priority
              className="w-9 h-9 object-contain drop-shadow-xs"
            />
          </div>
        )}

        {/* Close Button on Mobile */}
        <button
          onClick={() => setIsOpen(false)}
          className="lg:hidden ml-2 p-1.5 rounded-lg text-[#6B5218] hover:text-neutral-900 hover:bg-white/60 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className={`flex-1 py-5 space-y-1.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3.5'}`}>
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#8F722E]">
            Main Navigation
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsOpen(false);
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full group flex items-center ${
                isCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2.5'
              } rounded-xl text-[13px] md:text-[16px] tracking-tight transition-all duration-150 ${
                isActive
                  ? 'bg-white/95 text-[#6B5110] font-bold border border-[#D4AF37]/60 shadow-xs relative before:absolute before:left-0 before:top-2.5 before:bottom-2.5 before:w-1 before:bg-[#D4AF37] before:rounded-r-full'
                  : 'text-[#5C4515] hover:text-[#2E2006] hover:bg-white/50 font-medium'
              }`}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <Icon
                  className={`${
                    isCollapsed
                      ? 'w-[26px] h-[26px]'
                      : 'w-[22px] h-[22px] md:w-[18px] md:h-[18px]'
                  } transition-colors shrink-0 ${
                    isActive ? 'text-[#6B5110]' : 'text-[#7D6124] group-hover:text-[#2E2006]'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>
            </button>
          );
        })}
      </nav>

     
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Sticky with Dynamic Width) */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {content}
      </aside>
    </>
  );
};

