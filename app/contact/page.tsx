import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { ContactPage } from '@/components/pages/ContactPage';

export const metadata: Metadata = {
  title: "Contact Mor's Jewelry & Master Repair | Luxury Diamond & Gold Consultations",
  description:
    "Visit our fine jewelry showrooms in Stonecrest & McDonough, GA. Book a bespoke jewelry consultation, inquire about master watch repair, or explore certified diamonds.",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FCFBF8]" />}>
      <ContactPage />
    </Suspense>
  );
}
