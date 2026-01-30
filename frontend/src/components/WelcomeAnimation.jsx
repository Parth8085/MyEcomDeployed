import { useEffect, useState } from 'react';

const WelcomeAnimation = ({ name, onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onComplete) onComplete();
        }, 3000); // Animation duration 3s

        return () => clearTimeout(timer);
    }, [onComplete]);

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.85)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            animation: 'fadeOut 0.5s ease-in-out 2.5s forwards'
        }}>
            <style>
                {`
                    @keyframes scaleUp {
                        0% { transform: scale(0.5); opacity: 0; }
                        50% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; }
                    }
                    @keyframes glow {
                        from { text-shadow: 0 0 10px #007bff, 0 0 20px #007bff; }
                        to { text-shadow: 0 0 20px #00d2ff, 0 0 30px #00d2ff; }
                    }
                `}
            </style>
            <h1 style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                animation: 'scaleUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                textAlign: 'center'
            }}>
                Welcome Back!
            </h1>
            <h2 style={{
                fontSize: '3rem',
                color: '#00d2ff',
                animation: 'scaleUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s forwards, glow 1.5s ease-in-out infinite alternate',
                opacity: 0,
                textAlign: 'center'
            }}>
                {name}
            </h2>
        </div>
    );
};

export default WelcomeAnimation;
