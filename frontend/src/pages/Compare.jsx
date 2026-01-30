import { useEffect, useState } from 'react';
import { useCompare } from '../context/CompareContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

const Compare = () => {
    const { compareList, removeFromCompare } = useCompare();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (compareList.length === 0) {
                setProducts([]);
                return;
            }
            setLoading(true);
            try {
                // Fetch fresh details including specs
                const ids = compareList.map(p => p.id);
                const response = await api.post('/product/compare', ids);
                setProducts(response.data);
            } catch (error) {
                console.error("Failed to fetch comparison data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [compareList]);

    if (compareList.length === 0) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h2>No products to compare</h2>
                <p>Add products from the home page.</p>
                <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Go to Home</Link>
            </div>
        );
    }

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading comparison...</div>;

    // Extract all unique spec keys
    const allSpecKeys = new Set();
    products.forEach(p => {
        if (p.specifications) {
            Object.keys(p.specifications).forEach(key => allSpecKeys.add(key));
        }
    });
    const specKeys = Array.from(allSpecKeys);

    return (
        <div>
            <h2 style={{ marginBottom: '2rem' }}>Product Comparison</h2>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '1rem', borderBottom: '2px solid var(--border)' }}>Feature</th>
                            {products.map(p => (
                                <th key={p.id} style={{ padding: '1rem', borderBottom: '2px solid var(--border)', minWidth: '200px', verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                                        <button onClick={() => removeFromCompare(p.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999' }}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', marginBottom: '1rem', borderRadius: 'var(--radius)' }}>
                                        {p.images && p.images.length > 0 ? (
                                            <img src={p.images[0]} alt={p.name} style={{ maxHeight: '100px', maxWidth: '100%' }} />
                                        ) : (
                                            <span style={{ color: '#ccc' }}>No Image</span>
                                        )}
                                    </div>
                                    <div>{p.name}</div>
                                    <div style={{ color: 'var(--primary)', fontSize: '1.2rem', marginTop: '0.5rem' }}>₹{p.price}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Brand</td>
                            {products.map(p => (
                                <td key={p.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>{p.brand || '-'}</td>
                            ))}
                        </tr>
                        <tr>
                            <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Category</td>
                            {products.map(p => (
                                <td key={p.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>{p.category || '-'}</td>
                            ))}
                        </tr>
                        {/* Dynamic Specs */}
                        {specKeys.map(key => (
                            <tr key={key}>
                                <td style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>{key}</td>
                                {products.map(p => {
                                    const val = p.specifications ? p.specifications[key] : null;
                                    return (
                                        <td key={p.id} style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                                            {val || '-'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Compare;
