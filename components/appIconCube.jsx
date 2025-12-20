import React, { useContext } from 'react';
import { AppContext } from '../contexts';

const AppIconCube = ({ className = null, size = 75, animated = true }) => {

    const { app } = useContext(AppContext);

    const styles = {
        container: {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        image: {
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '18px',
            border: '3px solid rgba(255, 255, 255, 0.9)',
            boxShadow: '0 10px 40px rgba(52, 108, 176, 0.3), 0 0 0 1px rgba(255,255,255,0.1)',
            objectFit: 'contain',
            background: 'linear-gradient(135deg, #346cb0 0%, #1a3658 100%)',
            padding: '12px',
            animation: animated ? 'pulse 2s ease-in-out infinite' : 'none',
        },
        ring: {
            position: 'absolute',
            width: `${size + 20}px`,
            height: `${size + 20}px`,
            borderRadius: '22px',
            border: '3px solid transparent',
            borderTopColor: '#346cb0',
            borderRightColor: 'rgba(52, 108, 176, 0.3)',
            animation: animated ? 'spin 1.5s linear infinite' : 'none',
        },
        ringOuter: {
            position: 'absolute',
            width: `${size + 36}px`,
            height: `${size + 36}px`,
            borderRadius: '26px',
            border: '2px solid transparent',
            borderBottomColor: 'rgba(52, 108, 176, 0.5)',
            borderLeftColor: 'rgba(52, 108, 176, 0.2)',
            animation: animated ? 'spinReverse 2s linear infinite' : 'none',
        },
    };

    const keyframes = `
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                box-shadow: 0 10px 40px rgba(52, 108, 176, 0.3);
            }
            50% {
                transform: scale(1.02);
                box-shadow: 0 15px 50px rgba(52, 108, 176, 0.4);
            }
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        @keyframes spinReverse {
            to {
                transform: rotate(-360deg);
            }
        }
    `;

    // render
    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.container} className={className}>
                {animated && <div style={styles.ringOuter}></div>}
                {animated && <div style={styles.ring}></div>}
                <img
                    src={app?.icon_images?.icon_200x200 || app?.icon || '/img/base.png'}
                    alt="icon-app"
                    style={styles.image}
                />
            </div>
        </>
    );
}

export default AppIconCube;
