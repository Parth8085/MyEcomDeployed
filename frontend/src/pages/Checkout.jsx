import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

    // Shipping Info
    const [shippingAddress, setShippingAddress] = useState('');
    const [shippingCity, setShippingCity] = useState('');
    const [shippingState, setShippingState] = useState('');
    const [shippingZipCode, setShippingZipCode] = useState('');
    const [shippingPhone, setShippingPhone] = useState('');

    // Payment Info
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    const [upiId, setUpiId] = useState('');

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        if (!cart || !cart.items || cart.items.length === 0) {
            navigate('/cart');
        }
    }, [isAuthenticated, authLoading, cart, navigate]);

    const totalAmount = cart?.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

    const validateShipping = () => {
        const newErrors = {};
        if (!shippingAddress.trim()) newErrors.shippingAddress = 'Address is required';
        if (!shippingCity.trim()) newErrors.shippingCity = 'City is required';
        if (!shippingState.trim()) newErrors.shippingState = 'State is required';
        if (!shippingZipCode.trim()) newErrors.shippingZipCode = 'ZIP code is required';
        if (!/^\d{6}$/.test(shippingZipCode)) newErrors.shippingZipCode = 'Invalid ZIP code';
        if (!shippingPhone.trim()) newErrors.shippingPhone = 'Phone is required';
        if (!/^\d{10}$/.test(shippingPhone)) newErrors.shippingPhone = 'Invalid phone number';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validatePayment = () => {
        const newErrors = {};

        if (paymentMethod === 'COD') {
            setErrors(newErrors);
            return true;
        }

        if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
            if (!cardNumber.trim()) newErrors.cardNumber = 'Card number is required';
            if (!/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) newErrors.cardNumber = 'Invalid card number';
            if (!cardExpiry.trim()) newErrors.cardExpiry = 'Expiry is required';
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) newErrors.cardExpiry = 'Format: MM/YY';
            if (!cardCVV.trim()) newErrors.cardCVV = 'CVV is required';
            if (!/^\d{3}$/.test(cardCVV)) newErrors.cardCVV = 'Invalid CVV';
        }

        if (paymentMethod === 'UPI') {
            if (!upiId.trim()) newErrors.upiId = 'UPI ID is required';
            if (!/@/.test(upiId)) newErrors.upiId = 'Invalid UPI ID';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = async () => {
        if (step === 1) {
            if (validateShipping()) {
                setLoading(true);
                try {
                    await api.post('/user/address', {
                        street: shippingAddress,
                        city: shippingCity,
                        state: shippingState,
                        zipCode: shippingZipCode,
                        phone: shippingPhone,
                        country: 'India'
                    });
                    setStep(2);
                } catch (error) {
                    console.error('Failed to save address:', error);
                    alert('Failed to save address. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        } else if (step === 2) {
            if (validatePayment()) {
                setStep(3);
            }
        }
    };

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const response = await api.post('/order/checkout', {
                shippingAddress,
                shippingCity,
                shippingState,
                shippingZipCode,
                shippingPhone,
                paymentMethod,
                cardNumber: cardNumber.replace(/\s/g, ''),
                cardExpiry,
                cardCVV,
                upiId
            });

            if (response.data.paymentStatus === 'Success' || response.data.paymentStatus === 'Pending') {
                clearCart();
                navigate(`/order-success/${response.data.orderId}`, {
                    state: { orderData: response.data }
                });
            } else {
                alert('Payment failed. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            const msg = error.response?.data || error.message || 'Failed to place order. Please try again.';
            alert(`Order Failed: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
        } finally {
            setLoading(false);
        }
    };

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.substring(0, 19);
    };

    return (
        <div className="animate-fade-in">
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Checkout</h2>

            {/* Progress Steps */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', gap: '2rem' }}>
                {['Shipping', 'Payment', 'Review'].map((label, idx) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: step > idx ? 'var(--primary)' : step === idx + 1 ? 'var(--primary)' : 'var(--border)',
                            color: step >= idx + 1 ? 'white' : 'var(--text-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            transition: 'all 0.3s'
                        }}>
                            {idx + 1}
                        </div>
                        <span style={{ fontWeight: step === idx + 1 ? 600 : 400, color: step === idx + 1 ? 'var(--text)' : 'var(--text-light)' }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <div className="checkout-grid">
                {/* Main Form */}
                <div>
                    {/* Step 1: Shipping */}
                    {step === 1 && (
                        <div className="product-card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Shipping Address</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Street Address *</label>
                                    <input
                                        type="text"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        placeholder="123 Main Street"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${errors.shippingAddress ? 'red' : 'var(--border)'}` }}
                                    />
                                    {errors.shippingAddress && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.shippingAddress}</span>}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>City *</label>
                                        <input
                                            type="text"
                                            value={shippingCity}
                                            onChange={(e) => setShippingCity(e.target.value)}
                                            placeholder="Mumbai"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${errors.shippingCity ? 'red' : 'var(--border)'}` }}
                                        />
                                        {errors.shippingCity && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.shippingCity}</span>}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>State *</label>
                                        <select
                                            value={shippingState}
                                            onChange={(e) => setShippingState(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: `1px solid ${errors.shippingState ? 'red' : 'var(--border)'}`,
                                                background: 'var(--surface)',
                                                color: 'var(--text)',
                                                fontSize: '1rem',
                                                appearance: 'none'
                                            }}
                                        >
                                            <option value="">Select State</option>
                                            {[
                                                "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
                                                "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
                                                "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
                                                "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
                                                "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
                                                "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
                                            ].map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        {errors.shippingState && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.shippingState}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>ZIP Code *</label>
                                        <input
                                            type="text"
                                            value={shippingZipCode}
                                            onChange={(e) => setShippingZipCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                            placeholder="400001"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${errors.shippingZipCode ? 'red' : 'var(--border)'}` }}
                                        />
                                        {errors.shippingZipCode && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.shippingZipCode}</span>}
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone *</label>
                                        <input
                                            type="text"
                                            value={shippingPhone}
                                            onChange={(e) => setShippingPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                                            placeholder="9876543210"
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${errors.shippingPhone ? 'red' : 'var(--border)'}` }}
                                        />
                                        {errors.shippingPhone && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.shippingPhone}</span>}
                                    </div>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={handleNextStep}
                                    disabled={loading}
                                    style={{ marginTop: '1rem', padding: '0.75rem', opacity: loading ? 0.7 : 1 }}
                                >
                                    {loading ? 'Saving...' : 'Continue to Payment'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {step === 2 && (
                        <div className="product-card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Payment Method</h3>

                            {/* Payment Method Selection */}
                            <div className="payment-methods-grid">
                                {[
                                    { value: 'Credit Card', icon: CreditCard, label: 'Credit Card' },
                                    { value: 'Debit Card', icon: CreditCard, label: 'Debit Card' },
                                    { value: 'UPI', icon: Smartphone, label: 'UPI' },
                                    { value: 'COD', icon: Banknote, label: 'Cash on Delivery' }
                                ].map(method => (
                                    <button
                                        key={method.value}
                                        onClick={() => setPaymentMethod(method.value)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: `2px solid ${paymentMethod === method.value ? 'var(--primary)' : 'var(--border)'}`,
                                            background: paymentMethod === method.value ? 'rgba(79, 70, 229, 0.1)' : 'white',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        <method.icon size={24} color={paymentMethod === method.value ? 'var(--primary)' : 'var(--text-light)'} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{method.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Card Payment Form */}
                            {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Card Number *</label>
                                        <input
                                            type="text"
                                            value={cardNumber}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            placeholder="1234 5678 9012 3456"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: `1px solid ${errors.cardNumber ? 'red' : 'var(--border)'}`,
                                                background: 'var(--surface)',
                                                color: 'var(--text)',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        {errors.cardNumber && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.cardNumber}</span>}
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Expiry (MM/YY) *</label>
                                            <input
                                                type="text"
                                                value={cardExpiry}
                                                onChange={(e) => {
                                                    let val = e.target.value.replace(/\D/g, '');
                                                    if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                                    setCardExpiry(val);
                                                }}
                                                placeholder="12/26"
                                                maxLength={5}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${errors.cardExpiry ? 'red' : 'var(--border)'}`,
                                                    background: 'var(--surface)',
                                                    color: 'var(--text)',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                            {errors.cardExpiry && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.cardExpiry}</span>}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>CVV *</label>
                                            <input
                                                type="password"
                                                value={cardCVV}
                                                onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                                placeholder="123"
                                                maxLength={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${errors.cardCVV ? 'red' : 'var(--border)'}`,
                                                    background: 'var(--surface)',
                                                    color: 'var(--text)',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                            {errors.cardCVV && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.cardCVV}</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* UPI Payment Form */}
                            {paymentMethod === 'UPI' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>UPI ID *</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        placeholder="yourname@upi"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${errors.upiId ? 'red' : 'var(--border)'}` }}
                                    />
                                    {errors.upiId && <span style={{ color: 'red', fontSize: '0.85rem' }}>{errors.upiId}</span>}
                                </div>
                            )}

                            {/* COD Message */}
                            {paymentMethod === 'COD' && (
                                <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                                    <p style={{ color: 'var(--accent)', fontWeight: 500 }}>
                                        <Banknote size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                                        Pay ₹{totalAmount.toLocaleString()} when your order is delivered.
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                                    Back
                                </button>
                                <button className="btn-primary" onClick={handleNextStep} style={{ flex: 1, padding: '0.75rem' }}>
                                    Review Order
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <div className="product-card" style={{ padding: '2rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Review Your Order</h3>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Shipping Address</h4>
                                <p style={{ color: 'var(--text-light)' }}>
                                    {shippingAddress}<br />
                                    {shippingCity}, {shippingState} {shippingZipCode}<br />
                                    Phone: {shippingPhone}
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Payment Method</h4>
                                <p style={{ color: 'var(--text-light)' }}>
                                    {paymentMethod}
                                    {paymentMethod === 'UPI' && ` (${upiId})`}
                                    {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && ` ending in ${cardNumber.slice(-4)}`}
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>
                                    Back
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    style={{ flex: 1, padding: '0.75rem' }}
                                >
                                    {loading ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Order Summary Sidebar */}
                <div>
                    <div className="product-card" style={{ padding: '1.5rem', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Order Summary</h3>

                        <div style={{ marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                            {cart?.items?.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.productName}</p>
                                        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <p style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Subtotal</span>
                                <span>₹{totalAmount.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-light)' }}>
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginTop: '1rem' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--primary)' }}>₹{totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
