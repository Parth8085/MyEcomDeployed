import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const { isAuthenticated } = useAuth();

    const fetchCart = async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
            console.error("Error fetching cart:", error);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    const updateQuantity = async (productId, quantity) => {
        // Optimistic update
        setCart(prevCart => {
            if (!prevCart) return null;
            const newItems = prevCart.items.map(item => {
                if (item.productId === productId) {
                    return { ...item, quantity };
                }
                return item;
            }).filter(item => item.quantity > 0);

            // Recalculate total roughly (assuming price is static)
            // Ideally backend returns correct total, but for instant UI we can approximate
            const newTotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

            return { ...prevCart, items: newItems, totalAmount: newTotal };
        });

        try {
            await api.put('/cart/update', { productId, quantity });
            // Ensure data consistency with server source of truth
            await fetchCart();
        } catch (error) {
            console.error("Error updating quantity:", error);
            // Revert state if needed (fetchCart usually fixes this on next render)
            await fetchCart();
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            await api.post('/cart/add', { productId, quantity });
            // Re-fetch to ensure we have consistent state (including product details if needed later)
            await fetchCart();
            return true;
        } catch (error) {
            console.error("Error adding to cart:", error);
            throw error;
        }
    };

    const removeFromCart = async (productId) => {
        try {
            await api.delete(`/cart/remove/${productId}`);
            await fetchCart();
        } catch (error) {
            console.error("Error removing from cart:", error);
            throw error;
        }
    };

    const itemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, itemsCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
