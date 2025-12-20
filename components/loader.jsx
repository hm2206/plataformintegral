import React from "react";

const Loading = ({ size = "default", message = "", fullScreen = true }) => {

    const sizes = {
        small: { spinner: 24, border: 3 },
        default: { spinner: 40, border: 4 },
        large: { spinner: 56, border: 5 },
    };

    const currentSize = sizes[size] || sizes.default;

    const styles = {
        container: {
            width: '100%',
            height: fullScreen ? '100vh' : '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
        },
        spinnerContainer: {
            position: 'relative',
            width: `${currentSize.spinner}px`,
            height: `${currentSize.spinner}px`,
        },
        spinner: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `${currentSize.border}px solid #e2e8f0`,
            borderTopColor: '#346cb0',
            animation: 'spin 0.8s linear infinite',
        },
        spinnerInner: {
            position: 'absolute',
            width: '70%',
            height: '70%',
            top: '15%',
            left: '15%',
            borderRadius: '50%',
            border: `${currentSize.border - 1}px solid #e2e8f0`,
            borderBottomColor: '#5a8fd8',
            animation: 'spinReverse 1.2s linear infinite',
        },
        message: {
            fontSize: '14px',
            color: '#718096',
            fontWeight: '500',
        },
    };

    const keyframes = `
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        @keyframes spinReverse {
            to { transform: rotate(-360deg); }
        }
    `;

    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <div style={styles.spinnerContainer}>
                    <div style={styles.spinner}></div>
                    <div style={styles.spinnerInner}></div>
                </div>
                {message && <p style={styles.message}>{message}</p>}
            </div>
        </>
    );
}

export default Loading;
