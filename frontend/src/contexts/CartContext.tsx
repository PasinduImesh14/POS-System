import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartContextType, CartItem, Product } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const TAX_RATE = 0.0825; // 8.25% tax rate

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, quantity: number = 1): void => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * product.price
              }
            : item
        );
      } else {
        return [
          ...prevItems,
          {
            product,
            quantity,
            total: quantity * product.price
          }
        ];
      }
    });
  };

  const removeItem = (productId: number): void => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number): void => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              total: quantity * item.product.price
            }
          : item
      )
    );
  };

  const clearCart = (): void => {
    setItems([]);
  };

  const getSubtotal = (): number => {
    return items.reduce((total, item) => total + item.total, 0);
  };

  const getTax = (): number => {
    return getSubtotal() * TAX_RATE;
  };

  const getTotal = (): number => {
    return getSubtotal() + getTax();
  };

  const getItemCount = (): number => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getSubtotal,
    getTax,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};