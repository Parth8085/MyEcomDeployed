import { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1 = Email, 2 = Verify & Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [serverOtpMsg, setServerOtpMsg] = useState(''); // Demo only

    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await api.post('/auth/forgot-password', { email });
            setMessage(response.data.message);
            if (response.data.otp) {
                setServerOtpMsg(`(Demo) OTP: ${response.data.otp}`);
            } else {
                setServerOtpMsg('');
            }
            setStep(2);
        } catch (err) {
            setError(err.response?.data || 'Failed to send OTP');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/reset-password', { email, otp, newPassword });
            alert(response.data);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data || 'Failed to reset password');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '3rem auto', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h2>

            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}
            {message && <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>}
            {serverOtpMsg && <div style={{ background: '#e6fffa', padding: '0.5rem', marginBottom: '1rem', border: '1px solid #b2f5ea', fontSize: '0.9rem', color: '#2c7a7b' }}>{serverOtpMsg}</div>}

            {step === 1 ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Enter your email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Send OTP
                    </button>
                    <Link to="/login" style={{ textAlign: 'center', color: '#666' }}>Back to Login</Link>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label>Enter OTP</label>
                        <input
                            type="text"
                            required
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="6-digit OTP"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', letterSpacing: '2px' }}
                        />
                    </div>
                    <div>
                        <label>New Password</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="New secure password"
                            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
                        />
                    </div>
                    <button type="submit" style={{ padding: '0.75rem', background: 'var(--primary)', color: 'white', border: 'none', cursor: 'pointer' }}>
                        Reset Password
                    </button>
                    <button type="button" onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}>
                        Back
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
