'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu,
  Bell,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  KeyRound,
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminTopbarProps {
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  activeTab: AdminTab;
  onLogout: () => void;
  loggingOut: boolean;
  onMenuClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onSelectTab?: (tab: AdminTab) => void;
}

const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
  overview: { title: 'Dashboard Overview', subtitle: 'Performance metrics & quick operations' },
  products: { title: 'Product Catalog', subtitle: 'Fine jewelry collection & stock management' },
  categories: { title: 'Collections & Categories', subtitle: 'Jewelry classifications & taxonomy' },
  orders: { title: 'Orders & Requests', subtitle: 'Customer purchases & repair inquiries' },
  users: { title: 'Team & Accounts', subtitle: 'Admin privileges & customer records' },
  settings: { title: 'Store Settings', subtitle: 'System preferences & security configuration' },
  'reset-password': { title: 'Reset Password', subtitle: 'Verify email & security captcha to update credentials' },
};

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  admin,
  activeTab,
  onLogout,
  loggingOut,
  onMenuClick,
  isCollapsed,
  onToggleCollapse,
  onSelectTab,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = admin.name
    ? admin.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : admin.email.slice(0, 2).toUpperCase();

  const currentTabInfo = tabTitles[activeTab] || {
    title: 'Dashboard',
    subtitle: 'Admin portal',
  };

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-[#F7EED2]/95 via-[#F4E6C3]/95 to-[#F7EED2]/95 backdrop-blur-md border-b border-[#D4AF37]/35 shadow-xs">
      <div className="w-full   px-2 h-18 flex items-center justify-between gap-4">
        {/* Left: Desktop Collapse Button, Mobile Menu Button & Breadcrumb Title */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Desktop Collapse / Expand Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-xl text-[#6B5218] hover:text-neutral-900 hover:bg-white/60 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-[#6B5218] hover:text-neutral-900 hover:bg-white/60 transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-serif font-bold text-neutral-900 tracking-tight">
                {currentTabInfo.title}
              </h1>
            </div>
            <p className="text-[11px] text-[#6E561F] font-medium hidden sm:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Notifications & User Profile Area */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Quick Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4E3A10] hover:text-black hover:bg-white bg-white/80 border border-[#D4AF37]/40 shadow-xs transition-colors"
            title="Open customer storefront"
          >
            <Store className="w-3.5 h-3.5 text-[#7D6124]" />
            <span>Storefront</span>
          </Link>

          <div className="h-6 w-px bg-[#D4AF37]/35 mx-0.5 hidden sm:block" />

          {/* User Icon & Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-white/60 transition-colors group focus:outline-hidden"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {/* User Avatar Circle */}
              <div className="w-9 h-9 rounded-xl bg-white border border-[#D4AF37] text-[#6B5110] flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:border-[#997722] transition-colors">
                {initials}
              </div>

              {/* User Info labels (hidden on very small screens) */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-neutral-900 leading-tight">
                  {admin.name || 'Administrator'}
                </span>
                <span className="text-[10px] font-bold text-[#6B5110] uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  {admin.role}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-[#7D6124] group-hover:text-black transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-50 rounded-2xl bg-white border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-xs font-semibold text-neutral-900 truncate">
                    {admin.name || 'Admin User'}
                  </p>
                  <p className="text-[11px] text-neutral-600 truncate mt-0.5">
                    {admin.email}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FBF6E9] border border-[#D4AF37]/30 text-[#8F6B1E] text-[10px] font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3 h-3" />
                    Role: {admin.role}
                  </div>
                </div>

               

              

                {/* Reset Password Button */}
                <div className="px-1 py-1 border-b border-neutral-100">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onSelectTab?.('reset-password');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#8F6B1E]" />
                    <span>Reset Password</span>
                  </button>
                </div>

                {/* Log Out Button */}
                <div className="px-1 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

