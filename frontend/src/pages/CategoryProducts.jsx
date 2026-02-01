import { useEffect, useState } from 'react';
import api from '../services/api';
import { useCompare } from '../context/CompareContext'; // Assuming you want reuse compare button
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CategoryProducts = ({ categoryName }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('default'); // Sorting state
    const { addToCompare, compareList, removeFromCompare } = useCompare();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [wishlistItems, setWishlistItems] = useState(new Set());

    const { addToCart } = useCart();

    const handleAddToCart = async (product) => {
        // Check for visual out of stock first
        if (product.stock <= 0) {
            const email = prompt('This product is out of stock. Enter your email to get notified when it\'s back in stock:');
            if (email) {
                try {
                    await api.post('/stocknotification/request', {
                        email: email,
                        productId: product.id
                    });
                    alert('Thank you! We will notify you when this product is back in stock.');
                } catch (notifError) {
                    console.error('Failed to register notification:', notifError);
                    alert(notifError.response?.data?.message || 'Failed to register for notification');
                }
            }
            return;
        }

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
            // Check if it's an out-of-stock error from backend (fallback)
            if (error.response?.data?.outOfStock) {
                const email = prompt('This product is out of stock. Enter your email to get notified when it\'s back in stock:');
                if (email) {
                    try {
                        await api.post('/stocknotification/request', {
                            email: email,
                            productId: product.id
                        });
                        alert('Thank you! We will notify you when this product is back in stock.');
                    } catch (notifError) {
                        alert(notifError.response?.data?.message || 'Failed to register');
                    }
                }
            } else {
                alert("Failed to add to cart");
            }
        }
    };

    // Fetch wishlist items
    const fetchWishlist = async () => {
        if (!isAuthenticated) return;
        try {
            const response = await api.get('/wishlist');
            const wishlistProductIds = new Set(response.data.items.map(item => item.productId));
            setWishlistItems(wishlistProductIds);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        }
    };

    // Toggle wishlist
    const handleToggleWishlist = async (productId, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert("Please login to add to wishlist");
            navigate('/login');
            return;
        }

        const isInWishlist = wishlistItems.has(productId);

        try {
            if (isInWishlist) {
                await api.delete(`/wishlist/remove/${productId}`);
                setWishlistItems(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(productId);
                    return newSet;
                });
            } else {
                await api.post(`/wishlist/add/${productId}`);
                setWishlistItems(prev => new Set([...prev, productId]));
            }
        } catch (error) {
            console.error('Failed to update wishlist:', error);
            alert(error.response?.data || 'Failed to update wishlist');
        }
    };



    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch with category filter
                const response = await api.get(`/product?category=${categoryName}`);
                setProducts(response.data);
            } catch (error) {
                console.error(`Error fetching ${categoryName}:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
        fetchWishlist();
    }, [categoryName, isAuthenticated]);

    // Sorting Logic
    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-low-high') return a.price - b.price;
        if (sortBy === 'price-high-low') return b.price - a.price;
        if (sortBy === 'a-z') return a.name.localeCompare(b.name);
        if (sortBy === 'z-a') return b.name.localeCompare(a.name);
        return 0;
    });

    const isInCompare = (id) => compareList.some(p => p.id === id);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading {categoryName}...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ textTransform: 'capitalize', margin: 0 }}>{categoryName}</h2>

                {/* Sort Dropdown */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <label htmlFor="sort" style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Sort by:</label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--text)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="default">Featured</option>
                        <option value="price-low-high">Price: Low to High</option>
                        <option value="price-high-low">Price: High to Low</option>
                        <option value="a-z">Name: A - Z</option>
                        <option value="z-a">Name: Z - A</option>
                    </select>
                </div>
            </div>

            {sortedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>No products found in this category.</h3>
                    <p>Check back later for new arrivals.</p>
                </div>
            ) : (
                <div className="grid-products">
                    {sortedProducts.map((product, index) => (
                        <div key={product.id} className="product-card animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
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
                                    background: product.stock <= 0 ? 'rgba(239, 68, 68, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                                    backdropFilter: 'blur(4px)',
                                    color: product.stock <= 0 ? 'white' : 'var(--text)',
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
                                    {product.stock <= 0 ? 'Out of Stock' : product.brand}
                                </span>

                                {/* Wishlist Heart Button */}
                                <button
                                    onClick={(e) => handleToggleWishlist(product.id, e)}
                                    style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '56px',
                                        background: wishlistItems.has(product.id) ? '#F43F5E' : 'white',
                                        color: wishlistItems.has(product.id) ? 'white' : '#F43F5E',
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
                                    title={wishlistItems.has(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                >
                                    <Heart
                                        size={18}
                                        fill={wishlistItems.has(product.id) ? 'white' : 'none'}
                                    />
                                </button>

                                {/* Compare Button */}
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
                                        style={{
                                            padding: '0.6rem 1.2rem',
                                            fontSize: '0.9rem',
                                            background: product.stock <= 0 ? 'var(--secondary)' : 'var(--gradient-primary)',
                                            opacity: product.stock <= 0 ? 0.9 : 1
                                        }}
                                    >
                                        {product.stock <= 0 ? 'Notify Me' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryProducts;
