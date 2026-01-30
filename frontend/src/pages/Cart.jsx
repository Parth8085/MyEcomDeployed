import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    if (!cart) return <div className="text-center mt-5" style={{ padding: '2rem' }}>Loading cart...</div>;

    if (!cart.items || cart.items.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
                <ShoppingBag size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
                <h2>Your cart is empty</h2>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.8rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    textDecoration: 'none',
                    fontWeight: 'bold'
                }}>
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag /> Shopping Cart
            </h1>

            <div style={{ background: 'white', borderRadius: 'var(--radius)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {cart.items.map(item => (
                    <div key={item.productId} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--border)',
                        gap: '1.5rem',
                        flexWrap: 'wrap' // handle mobile
                    }}>
                        {/* Image */}
                        <div style={{ width: '80px', height: '80px', flexShrink: 0, background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.product.images && item.product.images.length > 0 ? (
                                <img src={item.product.images[0]} alt={item.product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '0.7rem', color: '#999' }}>No Img</span>
                            )}
                        </div>

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{item.product.name}</h3>
                            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{item.product.brand}</div>
                        </div>

                        {/* Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px' }}>
                            <button
                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                style={{
                                    border: 'none', background: 'transparent', padding: '0.5rem 0.8rem', cursor: 'pointer',
                                    color: item.quantity === 1 ? '#ff4d4f' : 'var(--text)',
                                    display: 'flex', alignItems: 'center'
                                }}
                            >
                                {item.quantity === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                            </button>
                            <span style={{ padding: '0 0.5rem', fontWeight: '500', minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                style={{ border: 'none', background: 'transparent', padding: '0.5rem 0.8rem', cursor: 'pointer', color: 'var(--text)' }}
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Price */}
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                            ₹{item.price * item.quantity}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: 'var(--radius)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', minWidth: '300px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                        <span>Total:</span>
                        <span>₹{cart.totalAmount}</span>
                    </div>
                    <button style={{
                        width: '100%',
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '1rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}>
                        Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
