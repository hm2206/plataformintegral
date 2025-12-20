import React from 'react';
import AppIconCube from './appIconCube';

const LoadingGlobal = ({ display, id, message = "Cargando..." }) => {

    const styles = {
        overlay: {
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 5000,
            display: display || 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '24px',
        },
        message: {
            fontSize: '16px',
            fontWeight: '500',
            color: '#4a5568',
            marginTop: '16px',
            animation: 'fadeInOut 1.5s ease-in-out infinite',
        },
        dots: {
            display: 'flex',
            gap: '8px',
            marginTop: '8px',
        },
        dot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#346cb0',
        },
    };

    const keyframes = `
        @keyframes fadeInOut {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        @keyframes bounce {
            0%, 80%, 100% {
                transform: translateY(0);
            }
            40% {
                transform: translateY(-10px);
            }
        }
    `;

    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.overlay} id={id || 'id-loading-brand'}>
                <AppIconCube size={80} animated={true} />
                <div style={{ textAlign: 'center' }}>
                    <p style={styles.message}>{message}</p>
                    <div style={styles.dots}>
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles.dot,
                                    animation: `bounce 1.4s ease-in-out ${i * 0.16}s infinite`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoadingGlobal;
