import type { Metadata } from 'next';
import { CheckoutPage } from '@/components/pages/CheckoutPage';

export const metadata: Metadata = {
  title: "Secure Checkout | Mor's Jewelry & Master Repair",
  description:
    'Complete your fine jewelry order with 256-bit SSL encryption, complimentary insured delivery, and master jeweler verification.',
};

export default function Page() {
  return <CheckoutPage />;
}
