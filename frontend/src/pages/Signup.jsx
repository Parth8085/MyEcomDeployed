import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // OTP States
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [serverOtpMsg, setServerOtpMsg] = useState(''); // For demo display

    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Name is required";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) newErrors.email = "Invalid email format";

        if (!/^\d{10}$/.test(phoneNumber)) newErrors.phoneNumber = "Phone must be 10 digits";

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            newErrors.password = "Password must be 8+ chars, with Upper, Lower, Number & Special char";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;

        try {
            const data = await register(name, email, phoneNumber, password);
            setIsOtpSent(true);
            // In real app, we wouldn't show this. This is for the demo.
            setServerOtpMsg(`(Demo) OTP: ${data.otp}`);
            alert(`OTP sent to ${phoneNumber}!`);
        } catch (err) {
            setError(err.response?.data || 'Failed to register');
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            // We use direct API call or context here. Better to keep auth logic in context but direct is fine for verifying.
            // Actually, let's keep it simple and direct call for verify since it's one-off
            await import('../services/api').then(module => module.default.post('/auth/verify-phone', { phoneNumber, otp }));
            alert("Phone verified! You can now login.");
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Invalid OTP');
        }
    };

    if (isOtpSent) {
        return (
            <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Verify OTP</h2>
                <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Enter the OTP sent to <b>{phoneNumber}</b></p>
                {serverOtpMsg && <div style={{ background: '#e6fffa', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #b2f5ea', fontSize: '0.9rem', color: '#2c7a7b' }}>{serverOtpMsg}</div>}

                {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        style={{ width: '100%', padding: '0.75rem', fontSize: '1.2rem', textAlign: 'center', letterSpacing: '4px' }}
                    />
                    <button type="submit" style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Verify & Register
                    </button>
                    <button type="button" onClick={() => setIsOtpSent(false)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                        Back
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Create Account</h2>
            {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: errors.name ? '1px solid red' : '1px solid #ccc' }}
                    />
                    {errors.name && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</span>}
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: errors.email ? '1px solid red' : '1px solid #ccc' }}
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
                </div>

                <div>
                    <label>Phone Number</label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="10 digit mobile number"
                        maxLength={10}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: errors.phoneNumber ? '1px solid red' : '1px solid #ccc' }}
                    />
                    {errors.phoneNumber && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.phoneNumber}</span>}
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: errors.password ? '1px solid red' : '1px solid #ccc' }}
                    />
                    {errors.password && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.password}</span>}
                </div>

                <div>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', border: errors.confirmPassword ? '1px solid red' : '1px solid #ccc' }}
                    />
                    {errors.confirmPassword && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.confirmPassword}</span>}
                </div>

                <button type="submit" style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
                    Sign Up
                </button>
            </form>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login</Link>
            </p>
        </div>
    );
};

export default Signup;
