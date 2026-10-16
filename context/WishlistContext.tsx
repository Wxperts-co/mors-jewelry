'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export interface WishlistItem {
  id: string;
  title: string;
  price: number | string;
  image: string;
  category?: string;
  slug?: string;
  description?: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  totalCount: number;
  isInWishlist: (id: string | number) => boolean;
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string | number) => void;
  toggleWishlist: (item: WishlistItem) => boolean; // returns true if added, false if removed
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'mors_jewelry_wishlist_v1';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load wishlist from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Safely ignore storage or quota errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when items update
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mors-wishlist-update', { detail: items }));
      }
    } catch {
      // Safely ignore storage errors
    }
  }, [items, isLoaded]);

  // Sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WISHLIST_STORAGE_KEY && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setItems(updated);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const isInWishlist = useCallback(
    (id: string | number): boolean => {
      const targetId = String(id);
      return items.some((it) => String(it.id) === targetId);
    },
    [items]
  );

  const addToWishlist = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((it) => String(it.id) === String(item.id))) {
        return prev;
      }
      return [...prev, item];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string | number) => {
    const targetId = String(id);
    setItems((prev) => prev.filter((it) => String(it.id) !== targetId));
  }, []);

  const toggleWishlist = useCallback(
    (item: WishlistItem): boolean => {
      const targetId = String(item.id);
      const exists = items.some((it) => String(it.id) === targetId);

      if (exists) {
        setItems((prev) => prev.filter((it) => String(it.id) !== targetId));
        return false;
      } else {
        setItems((prev) => [...prev, item]);
        return true;
      }
    },
    [items]
  );

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{
        items,
        totalCount,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
