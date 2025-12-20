import React from 'react';
import AppIconCube from './appIconCube';

const VerificarAuthentication = ({ my_app = {} }) => {

    const styles = {
        container: {
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            minHeight: '100vh',
            width: '100%',
            zIndex: 6000,
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Roboto', sans-serif",
        },
        content: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '40px',
            maxWidth: '400px',
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a202c',
            margin: '32px 0 12px 0',
            animation: 'fadeIn 0.6s ease-out',
        },
        subtitle: {
            fontSize: '15px',
            color: '#718096',
            lineHeight: '1.6',
            margin: 0,
            animation: 'fadeIn 0.6s ease-out 0.2s backwards',
        },
        progressContainer: {
            marginTop: '32px',
            width: '200px',
            animation: 'fadeIn 0.6s ease-out 0.4s backwards',
        },
        progressBar: {
            width: '100%',
            height: '4px',
            background: '#e2e8f0',
            borderRadius: '4px',
            overflow: 'hidden',
        },
        progressFill: {
            width: '30%',
            height: '100%',
            background: 'linear-gradient(90deg, #346cb0 0%, #5a8fd8 100%)',
            borderRadius: '4px',
            animation: 'progress 1.5s ease-in-out infinite',
        },
        appName: {
            marginTop: '24px',
            fontSize: '13px',
            color: '#a0aec0',
            fontWeight: '500',
            letterSpacing: '0.5px',
            animation: 'fadeIn 0.6s ease-out 0.6s backwards',
        },
    };

    const keyframes = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes progress {
            0% {
                width: 0%;
                margin-left: 0%;
            }
            50% {
                width: 60%;
                margin-left: 20%;
            }
            100% {
                width: 0%;
                margin-left: 100%;
            }
        }
    `;

    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <div style={styles.content}>
                    <AppIconCube size={90} animated={true} />

                    <h1 style={styles.title}>
                        Verificando Acceso
                    </h1>

                    <p style={styles.subtitle}>
                        Estamos validando tus credenciales.
                        <br />
                        Esto solo tomara un momento.
                    </p>

                    <div style={styles.progressContainer}>
                        <div style={styles.progressBar}>
                            <div style={styles.progressFill}></div>
                        </div>
                    </div>

                    {my_app?.name && (
                        <p style={styles.appName}>
                            {my_app.name}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

export default VerificarAuthentication;
