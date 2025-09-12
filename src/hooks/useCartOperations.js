// hooks/useCartOperations.js
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

export const useCartOperations = () => {
  const [forceUpdate, setForceUpdate] = useState(0);
  const { cartItems, removeFromCart, addToCart, updateCartItemQuantity } = useAppContext();

  const updateItemQuantity = useCallback((itemId, newQuantity) => {
    try {
      console.log('Updating item quantity:', itemId, newQuantity);
      
      // Get current cart from localStorage
      const savedCart = localStorage.getItem("cart");
      let currentCart = savedCart ? JSON.parse(savedCart) : [];
      
      if (newQuantity <= 0) {
        // Remove item from localStorage
        currentCart = currentCart.filter(item => {
          const currentItemId = item._id || item.id;
          return String(currentItemId) !== String(itemId);
        });
        
        // Also call context removeFromCart
        if (removeFromCart) {
          removeFromCart(itemId);
        }
      } else {
        // Update quantity in localStorage
        currentCart = currentCart.map(item => {
          const currentItemId = item._id || item.id;
          return String(currentItemId) === String(itemId) 
            ? { ...item, quantity: newQuantity }
            : item;
        });
        
        // Also update through context if available
        if (updateCartItemQuantity) {
          updateCartItemQuantity(itemId, newQuantity);
        }
      }
      
      // Save to localStorage
      localStorage.setItem("cart", JSON.stringify(currentCart));
      
      // Force re-render
      setForceUpdate(prev => prev + 1);
      
      // Force page refresh for immediate UI update
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      return true;
    } catch (error) {
      console.error("Failed to update cart:", error);
      return false;
    }
  }, [removeFromCart, updateCartItemQuantity]);

  const decrementItem = useCallback((item) => {
    const itemId = item._id || item.id;
    const newQuantity = item.quantity - 1;
    return updateItemQuantity(itemId, newQuantity);
  }, [updateItemQuantity]);

  const incrementItem = useCallback((item) => {
    const itemId = item._id || item.id;
    const newQuantity = item.quantity + 1;
    return updateItemQuantity(itemId, newQuantity);
  }, [updateItemQuantity]);

  // Effect to sync with context changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [cartItems]);

  return {
    decrementItem,
    incrementItem,
    updateItemQuantity,
    forceUpdate
  };
};
