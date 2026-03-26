import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  toggleSelection: (productId: string, size?: string, color?: string) => void;
  toggleAllSelection: (selected: boolean) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  selectedItems: CartItem[];
  selectedSubtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    const parsed = saved ? JSON.parse(saved) : [];
    // Ensure all items have selected property
    return parsed.map((item: any) => ({ ...item, selected: item.selected ?? true }));
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity = 1, size?: string, color?: string) => {
    setItems(prev => {
      const existing = prev.find(item => 
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
      );

      if (existing) {
        return prev.map(item => 
          item.id === product.id && 
          item.selectedSize === size && 
          item.selectedColor === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, { ...product, quantity, selectedSize: size, selectedColor: color, selected: true }];
    });
  };

  const removeItem = (productId: string, size?: string, color?: string) => {
    setItems(prev => prev.filter(item => 
      !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string, color?: string) => {
    if (quantity <= 0) {
      removeItem(productId, size, color);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === productId && item.selectedSize === size && item.selectedColor === color
        ? { ...item, quantity }
        : item
    ));
  };

  const toggleSelection = (productId: string, size?: string, color?: string) => {
    setItems(prev => prev.map(item => 
      item.id === productId && item.selectedSize === size && item.selectedColor === color
        ? { ...item, selected: !item.selected }
        : item
    ));
  };

  const toggleAllSelection = (selected: boolean) => {
    setItems(prev => prev.map(item => ({ ...item, selected })));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);
  
  const selectedItems = items.filter(item => item.selected);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, toggleSelection, toggleAllSelection, 
      clearCart, totalItems, subtotal, selectedItems, selectedSubtotal 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
