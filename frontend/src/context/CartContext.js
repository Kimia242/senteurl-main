import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getSessionId } from '../lib/utils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const sessionId = getSessionId();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/cart/${sessionId}`);
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      await axios.post(`${API}/cart/${sessionId}/add`, {
        product_id: productId,
        quantity
      });
      await fetchCart();
      setCartOpen(true);
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.response?.data?.detail || 'Erreur lors de l\'ajout au panier' };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      await axios.put(`${API}/cart/${sessionId}/update`, {
        product_id: productId,
        quantity
      });
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, error: error.response?.data?.detail || 'Erreur lors de la mise à jour' };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      await axios.delete(`${API}/cart/${sessionId}/remove/${productId}`);
      await fetchCart();
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.response?.data?.detail || 'Erreur lors de la suppression' };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API}/cart/${sessionId}/clear`);
      setCart({ items: [], total: 0 });
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const cartItemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const value = {
    cart,
    loading,
    cartOpen,
    setCartOpen,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    fetchCart,
    cartItemCount,
    sessionId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
