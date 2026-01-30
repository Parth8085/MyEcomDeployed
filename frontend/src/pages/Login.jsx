import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(email)) newErrors.email = "Invalid email format";

        if (!password) newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;

        try {
            await login(email, password);
            navigate('/', { state: { showWelcome: true } });
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
            {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label>Email</label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: errors.email ? '1px solid red' : '1px solid #ccc' }}
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                        required
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Forgot Password?</Link>
                </div>

                <button type="submit" style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)' }}>Sign up</Link>
            </p>
        </div>
    );
};

export default Login;
