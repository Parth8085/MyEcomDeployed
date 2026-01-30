import { useEffect, useState } from 'react';
import api from '../services/api';
import { useCompare } from '../context/CompareContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WelcomeAnimation from '../components/WelcomeAnimation';
import { useCart } from '../context/CartContext';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCompare, compareList, removeFromCompare } = useCompare();
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        if (location.state?.showWelcome) {
            setShowWelcome(true);
            // Clear state so it doesn't show on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location, navigate]);

    const { addToCart } = useCart();

    const handleAddToCart = async (product) => {
        if (!isAuthenticated) {
            alert("Please login to add to cart");
            navigate('/login');
            return;
        }
        try {
            await addToCart(product.id, 1);
            alert("Added " + product.name + " to cart!");
        } catch (error) {
            console.error(error);
            alert("Failed to add to cart");
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/product');
                setProducts(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
                alert("Failed to load products. Check console for details: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const isInCompare = (id) => compareList.some(p => p.id === id);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading products...</div>;

    return (
        <div className="animate-fade-in">
            {showWelcome && user && (
                <WelcomeAnimation name={user.Name} onComplete={() => setShowWelcome(false)} />
            )}

            <div style={{
                background: 'linear-gradient(135deg, var(--primary), #818CF8)',
                color: 'white',
                padding: '4rem 2rem',
                borderRadius: '24px',
                marginBottom: '3rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 800 }}>Welcome to SmartKartStore</h1>
                    <p style={{ fontSize: '1.25rem', opacity: 0.9 }}>Discover premium gadgets at unbeatable prices.</p>
                </div>
                {/* Decorative circle */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                }}></div>
            </div>

            {/* Categories Section */}
            <div className="animate-slide-in" style={{ marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Browse by Category</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {[
                        { name: 'Mobiles', path: '/mobiles', color: '#4F46E5', icon: '📱' },
                        { name: 'Laptops', path: '/laptops', color: '#0EA5E9', icon: '💻' },
                        { name: 'Accessories', path: '/accessories', color: '#EC4899', icon: '🎧' }
                    ].map((cat) => (
                        <Link to={cat.path} key={cat.name} className="product-card" style={{
                            padding: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            textDecoration: 'none',
                            borderLeft: `5px solid ${cat.color}`
                        }}>
                            <div style={{
                                fontSize: '2.5rem',
                                background: `${cat.color}20`,
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%'
                            }}>
                                {cat.icon}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text)' }}>{cat.name}</h3>
                                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>View Collection</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Products</h2>
            </div>

            <div className="grid-products">
                {products.map((product, index) => (
                    <div key={product.id} className="product-card" style={{ animationDelay: `${index * 50}ms` }}>
                        <div className="product-image-container" style={{ height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                            {product.images && product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} />
                            ) : (
                                <span style={{ color: '#aaa' }}>{product.category}</span>
                            )}

                            <span style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(4px)',
                                color: 'var(--text)',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                boxShadow: 'var(--shadow-sm)'
                            }}>{product.brand}</span>

                            <button
                                onClick={(e) => { e.preventDefault(); isInCompare(product.id) ? removeFromCompare(product.id) : addToCompare(product); }}
                                style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: isInCompare(product.id) ? 'var(--primary)' : 'white',
                                    color: isInCompare(product.id) ? 'white' : 'var(--text-light)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow)',
                                    transition: 'all 0.2s'
                                }}
                                title="Compare"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10h10" /><path d="M7 14h10" /><path d="M12 4L12 20M12 4l-4 4m4-4l4 4m0 16l-4-4m4 4l-4-4" /></svg>
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>{product.name}</h3>
                            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {product.description}
                            </p>

                            {/* Minimal Spec Tags */}
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                {product.specifications && Object.entries(product.specifications).slice(0, 2).map(([key, value], idx) => (
                                    <span key={idx} style={{
                                        fontSize: '0.75rem',
                                        background: 'var(--background)',
                                        color: 'var(--text-light)',
                                        padding: '4px 8px',
                                        borderRadius: '6px'
                                    }}>
                                        {value}
                                    </span>
                                ))}
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>₹{product.price.toLocaleString()}</span>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleAddToCart(product)}
                                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
