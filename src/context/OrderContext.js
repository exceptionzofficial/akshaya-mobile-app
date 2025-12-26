import React, { createContext, useState, useCallback } from 'react';

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  // Add item to cart (handles duplicates by incrementing quantity)
  const addToCart = useCallback((item) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        cartItem => cartItem.id === item.id && cartItem.type === item.type
      );

      if (existingIndex >= 0) {
        // Item exists, increment quantity
        const updated = [...prevCart];
        const quantityToAdd = item.quantity || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantityToAdd
        };
        return updated;
      } else {
        // New item, add with quantity
        return [...prevCart, { ...item, quantity: item.quantity || 1 }];
      }
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((id, type) => {
    setCart(prevCart => prevCart.filter(
      item => !(item.id === id && item.type === type)
    ));
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((id, type, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id, type);
      return;
    }
    setCart(prevCart => prevCart.map(item =>
      item.id === id && item.type === type
        ? { ...item, quantity: newQuantity }
        : item
    ));
  }, [removeFromCart]);

  // Increment quantity
  const incrementQuantity = useCallback((id, type) => {
    setCart(prevCart => prevCart.map(item =>
      item.id === id && item.type === type
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
  }, []);

  // Decrement quantity
  const decrementQuantity = useCallback((id, type) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === id && i.type === type);
      if (item && item.quantity <= 1) {
        // Remove item if quantity would be 0
        return prevCart.filter(i => !(i.id === id && i.type === type));
      }
      return prevCart.map(i =>
        i.id === id && i.type === type
          ? { ...i, quantity: i.quantity - 1 }
          : i
      );
    });
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Get total item count in cart
  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Get cart subtotal
  const getCartSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  // Calculate delivery fee (can be customized)
  const getDeliveryFee = useCallback(() => {
    return 20; // Fixed delivery fee
  }, []);

  // Calculate discount
  const getDiscount = useCallback(() => {
    const subtotal = getCartSubtotal();
    return subtotal > 200 ? 30 : 0; // ₹30 off on orders above ₹200
  }, [getCartSubtotal]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    return getCartSubtotal() + getDeliveryFee() - getDiscount();
  }, [getCartSubtotal, getDeliveryFee, getDiscount]);

  // Add order to history
  const addOrder = useCallback((order) => {
    setOrders(prevOrders => [...prevOrders, order]);
  }, []);

  return (
    <OrderContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        getCartItemCount,
        getCartSubtotal,
        getDeliveryFee,
        getDiscount,
        getCartTotal,
        orders,
        addOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
