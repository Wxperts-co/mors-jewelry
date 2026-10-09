'use client';

import { useState, useEffect } from 'react';
import { STORE_CONFIGS, DEFAULT_DOMAIN, StoreContactInfo, getStoreConfigByHostname } from '@/config/siteConfig';

export function useSiteConfig(): StoreContactInfo {
  const [config, setConfig] = useState<StoreContactInfo>(() => STORE_CONFIGS[DEFAULT_DOMAIN]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const testDomain = urlParams.get('domain');

      if (testDomain) {
        setConfig(getStoreConfigByHostname(testDomain));
      } else {
        const activeConfig = getStoreConfigByHostname(window.location.hostname);
        setConfig(activeConfig);
      }
    }
  }, []);

  return config;
}
