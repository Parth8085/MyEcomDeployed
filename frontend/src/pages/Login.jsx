import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Login = () => {
    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    // Forgot Password Modal State
    const [isForgotOpen, setIsForgotOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Pass
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const newErrors = {};
        // Strict email validation: must contain '@' and '.com'
        // Regex: something + @ + something + .com
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;

        if (!email.trim()) newErrors.email = "Email is required";
        else if (!emailRegex.test(email)) newErrors.email = "Invalid email format. Must contain '@' and end with '.com'";

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

    // Forgot Password Handlers
    const openForgotModal = () => {
        setIsForgotOpen(true);
        setForgotStep(1);
        setForgotMessage('');
        setForgotError('');
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
    };

    const closeForgotModal = () => {
        setIsForgotOpen(false);
    };

    const validateForgot = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.com$/;
        if (!forgotEmail.trim()) {
            setForgotError("Email is required");
            return false;
        }
        if (!emailRegex.test(forgotEmail)) {
            setForgotError("Invalid email format. Must contain '@' and end with '.com'");
            return false;
        }
        return true;
    };

    const handleForgotSendOtp = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');

        if (!validateForgot()) return;

        setIsLoading(true);
        try {
            // Using the existing endpoint
            const response = await api.post('/auth/forgot-password', { email: forgotEmail });
            setForgotMessage(response.data.message || 'OTP sent successfully!');
            setForgotStep(2);
        } catch (err) {
            setForgotError(err.response?.data || 'Failed to send OTP. Please check the email.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotReset = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');
        setIsLoading(true);
        try {
            const response = await api.post('/auth/reset-password', {
                email: forgotEmail,
                otp: forgotOtp,
                newPassword: newPassword
            });
            setForgotMessage('Password reset successfully! You can now login.');
            setTimeout(() => {
                closeForgotModal();
                setForgotMessage('');
            }, 2000);
        } catch (err) {
            setForgotError(err.response?.data || 'Failed to reset password. Invalid OTP or expired.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '400px', margin: '2rem auto', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', position: 'relative' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
            {error && <p style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: errors.email ? '1px solid red' : '1px solid var(--border)', borderRadius: '8px' }}
                    />
                    {errors.email && <span style={{ color: 'red', fontSize: '0.8rem' }}>{errors.email}</span>}
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', border: '1px solid var(--border)', borderRadius: '8px' }}
                        required
                    />
                </div>

                <div style={{ textAlign: 'right' }}>
                    <button
                        type="button"
                        onClick={openForgotModal}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                    >
                        Forgot Password?
                    </button>
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: '500' }}>Sign up</Link>
            </p>

            {/* Forgot Password Modal */}
            {isForgotOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="animate-scale-in" style={{
                        background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius)',
                        width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)',
                        position: 'relative'
                    }}>
                        <button
                            onClick={closeForgotModal}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-light)' }}
                        >
                            &times;
                        </button>

                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                            {forgotStep === 1 ? 'Reset Password' : 'New Password'}
                        </h3>

                        {forgotMessage && <div style={{ background: '#dcfce7', color: '#166534', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{forgotMessage}</div>}
                        {forgotError && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{forgotError}</div>}

                        {forgotStep === 1 ? (
                            <form onSubmit={handleForgotSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ color: 'var(--text-light)', fontSize: '0.95rem', textAlign: 'center' }}>
                                    Enter your email address and we'll send you an OTP to reset your password.
                                </p>
                                <div>
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={forgotEmail}
                                        onChange={e => setForgotEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        style={{ marginTop: '0.5rem' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleForgotReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label>Enter OTP</label>
                                    <input
                                        type="text"
                                        required
                                        value={forgotOtp}
                                        onChange={e => setForgotOtp(e.target.value)}
                                        placeholder="6-digit OTP"
                                        style={{ marginTop: '0.5rem', letterSpacing: '2px', textAlign: 'center', fontSize: '1.2rem' }}
                                    />
                                </div>
                                <div>
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        style={{ marginTop: '0.5rem' }}
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={isLoading}>
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForgotStep(1)}
                                    style={{ background: 'none', border: 'none', color: 'var(--text-light)', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Back to Email
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
