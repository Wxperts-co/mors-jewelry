'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category?: string;
  quantity: number;
  sku?: string;
}

export interface AddItemInput {
  id: string;
  title: string;
  price: number | string;
  image?: string;
  category?: string;
  quantity?: number;
  sku?: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: AddItemInput, openDrawer?: boolean) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mors_jewelry_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
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
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Safely ignore storage errors
    }
  }, [items, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  const toggleCart = () => setIsOpen((prev) => !prev);

  const addItem = (product: AddItemInput, openDrawer = true) => {
    const rawPrice = product.price;
    const parsedPrice =
      typeof rawPrice === 'number'
        ? rawPrice
        : parseFloat(String(rawPrice || '0').replace(/[^0-9.]/g, '')) || 0;

    const idNum = parseInt(product.id, 10);
    const fallbackImgNum = !isNaN(idNum) ? ((idNum - 1) % 20) + 1 : 1;
    const resolvedImage = product.image || `/products/product${fallbackImgNum}.jpg`;

    const addQty = product.quantity && product.quantity > 0 ? product.quantity : 1;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((it) => String(it.id) === String(product.id));
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + addQty,
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          id: String(product.id),
          title: product.title,
          price: parsedPrice,
          image: resolvedImage,
          category: product.category,
          sku: product.sku,
          quantity: addQty,
        },
      ];
    });

    if (openDrawer) {
      setIsOpen(true);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (String(item.id) === String(id)) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const setQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        setQuantity,
        clearCart,
        totalCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
