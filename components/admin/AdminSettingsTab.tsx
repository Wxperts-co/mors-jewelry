'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

export const AdminSettingsTab: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-serif font-bold text-neutral-900">Store Settings & Configuration</h2>
        <p className="text-xs text-neutral-600">Store locations, contact details, and security defaults</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Store Profile</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                Business Name
              </label>
              <input
                type="text"
                defaultValue="Mor's Jewelry & Repair"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800"
                readOnly
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-neutral-600 uppercase mb-1">
                Contact Email
              </label>
              <input
                type="text"
                defaultValue="contact@morsjewelry.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-800"
                readOnly
              />
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-100 pt-5">
          <h3 className="text-sm font-semibold text-neutral-900">Showroom Locations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <div className="p-3.5 rounded-xl bg-[#FAFAF9] border border-neutral-200 text-xs">
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8F6B1E]" />
                Stonecrest Mall
              </div>
              <div className="text-neutral-600 mt-1">2929 Turner Hill Rd, Stonecrest, GA 30038</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#FAFAF9] border border-neutral-200 text-xs">
              <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#8F6B1E]" />
                South Point McDonough
              </div>
              <div className="text-neutral-600 mt-1">1786 Jonesboro Rd, McDonough, GA 30253</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
