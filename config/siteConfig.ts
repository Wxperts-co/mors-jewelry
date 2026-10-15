export interface StoreContactInfo {
  storeName: string;
  badge?: string;
  address: string;
  mapUrl: string;
  embedMapUrl: string;
  phone: string;
  phoneDisplay: string;
  mobile: string;
  mobileDisplay: string;
  email: string;
  hours: {
    weekdays: string;
    sunday: string;
  };
}

export const DEFAULT_DOMAIN = 'morsjewelryandrepair.com';

export const STORE_CONFIGS: Record<string, StoreContactInfo> = {
  'morsjewelryandrepair.com': {
    storeName: "Mor's Jewelry & Repair",
    badge: 'Main Showroom & Workshop',
    address: '2929 Turner Hill Rd, Stonecrest, GA 30038',
    mapUrl: 'https://maps.app.goo.gl/h2U25e4cWbKsxhxP7',
    embedMapUrl:
      "https://maps.google.com/maps?q=Mor's+Jewelry+And+Repair,+2929+Turner+Hill+Rd,+Stonecrest,+GA+30038&t=&z=15&ie=UTF8&iwloc=&output=embed",
    phone: '4702781018',
    phoneDisplay: '(470) 278-1018',
    mobile: '6783891831',
    mobileDisplay: '(678) 389-1831',
    email: 'morsjewelry@gmail.com',
    hours: {
      weekdays: '11:00 AM – 8:00 PM',
      sunday: '12:00 PM – 6:00 PM',
    },
  },
  'morsjewelrys.com': {
    storeName: "Mor's Jewelry",
    badge: 'Boutique Showroom',
    address: '99 Hwy 81 #108, McDonough, GA 30253',
    mapUrl: 'https://share.google/LcmZEazqBRBxiUppz',
    embedMapUrl:
      'https://maps.google.com/maps?q=99+GA-81+%23108,+McDonough,+GA+30253&t=&z=15&ie=UTF8&iwloc=&output=embed',
    phone: '4702781018',
    phoneDisplay: '(470) 278-1018',
    mobile: '6783891831',
    mobileDisplay: '(678) 389-1831',
    email: 'morsjewelry@gmail.com',
    hours: {
      weekdays: '11:00 AM – 8:00 PM',
      sunday: '12:00 PM – 6:00 PM',
    },
  },
};

/**
 * Helper to get store configuration based on hostname.
 * Handles www. subdomains and defaults safely to DEFAULT_DOMAIN.
 */
export function getStoreConfigByHostname(hostname?: string): StoreContactInfo {
  if (!hostname) return STORE_CONFIGS[DEFAULT_DOMAIN];
  
  const hostWithoutPort = hostname.split(':')[0];
  const cleanHostname = hostWithoutPort.toLowerCase().replace(/^www\./, '');
  return STORE_CONFIGS[cleanHostname] || STORE_CONFIGS[DEFAULT_DOMAIN];
}
