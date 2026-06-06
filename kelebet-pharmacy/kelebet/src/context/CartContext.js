// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) fetchCart();
    else setItems([]);
  }, [token]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartAPI.get();
      setItems(res.data.items || []);
    } catch (e) {
      console.log('Cart fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product, quantity = 1) => {
    // Optimistic update
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product._id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { productId: product._id, product, quantity }];
    });
    try {
      await cartAPI.addItem(product._id, quantity);
    } catch {
      fetchCart(); // Revert on failure
    }
  };

  const updateItem = async (itemId, quantity) => {
    if (quantity <= 0) return removeItem(itemId);
    setItems((prev) =>
      prev.map((i) => (i._id === itemId ? { ...i, quantity } : i))
    );
    try {
      await cartAPI.updateItem(itemId, quantity);
    } catch {
      fetchCart();
    }
  };

  const removeItem = async (itemId) => {
    setItems((prev) => prev.filter((i) => i._id !== itemId));
    try {
      await cartAPI.removeItem(itemId);
    } catch {
      fetchCart();
    }
  };

  const clearCart = async () => {
    setItems([]);
    try { await cartAPI.clear(); } catch {}
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + (i.product?.price || 0) * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, loading, totalItems, totalPrice, addItem, updateItem, removeItem, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
