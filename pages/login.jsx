import React, { useState, useContext, useEffect } from 'react';
import { GUEST } from '../services/auth';
import { AppContext } from '../contexts/AppContext';
import Swal from 'sweetalert2';
import { authentication } from '../services/apis';
import Cookies from 'js-cookie';
import Show from '../components/show';
import Link from 'next/link';
import DownloadApps from '../components/downloadApps';

const Login = () => {
    // app
    const app_context = useContext(AppContext);

    // estados
    const [show_password, setShowPassword] = useState(false);
    const [form, setForm] = useState({});
    const [errors, setErrors] = useState({});
    const [current_loading, setCurrentLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [option, setOption] = useState("");

    // cambiar form
    const handleInput = ({ name, value }) => {
        const newForm = Object.assign({}, form);
        newForm[name] = value;
        setForm(newForm);
        const newErrors = Object.assign({}, errors);
        newErrors[name] = [];
        setErrors(newErrors);
    }

    // authenticar usuario
    const login = async (e) => {
        setCurrentLoading(true);
        await authentication.post('login', form)
        .then(async res => {
            let { success, message, token } = res.data;
            if (!success) throw new Error(message);
            await Cookies.set('auth_token', token);
            localStorage.setItem('auth_token', token);
            history.go('/');
        })
        .catch(err => {
            try {
                setCurrentLoading(false);
                let { data } = err.response;
                if (typeof data != 'object') throw new Error(err.message);
                if (typeof data.errors != 'object') throw new Error(data.message);
                Swal.fire({ icon: 'warning', text: data.message });
                setErrors(data.errors || {});
            } catch (error) {
                Swal.fire({ icon: 'error', text: err.message })
            }
        });
    }

    // montar componente
    useEffect(() => {
        GUEST();
    }, []);

    // Estilos
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, rgba(52, 108, 176, 0.9) 0%, rgba(26, 54, 88, 0.95) 100%), url(${app_context.app?.cover || '/img/fondo.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            padding: '20px',
            fontFamily: "'Roboto', sans-serif",
        },
        card: {
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            padding: '48px 40px',
            animation: 'slideUp 0.6s ease-out',
        },
        logoContainer: {
            textAlign: 'center',
            marginBottom: '32px',
        },
        logo: {
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            objectFit: 'contain',
            padding: '12px',
            background: 'linear-gradient(135deg, #346cb0 0%, #1a3658 100%)',
            boxShadow: '0 10px 30px rgba(52, 108, 176, 0.3)',
            marginBottom: '16px',
        },
        title: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a202c',
            margin: '0 0 8px 0',
        },
        subtitle: {
            fontSize: '14px',
            color: '#718096',
            margin: 0,
        },
        inputGroup: {
            marginBottom: '20px',
            position: 'relative',
        },
        inputLabel: {
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#4a5568',
            marginBottom: '8px',
            transition: 'color 0.3s ease',
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
        },
        inputIcon: {
            position: 'absolute',
            left: '16px',
            color: '#a0aec0',
            fontSize: '18px',
            transition: 'color 0.3s ease',
            zIndex: 1,
        },
        input: {
            width: '100%',
            padding: '14px 16px 14px 48px',
            fontSize: '15px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            outline: 'none',
            transition: 'all 0.3s ease',
            background: '#f7fafc',
        },
        inputFocused: {
            borderColor: '#346cb0',
            background: '#fff',
            boxShadow: '0 0 0 4px rgba(52, 108, 176, 0.1)',
        },
        inputError: {
            borderColor: '#e53e3e',
            background: '#fff5f5',
        },
        errorText: {
            fontSize: '12px',
            color: '#e53e3e',
            marginTop: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
        },
        passwordToggle: {
            position: 'absolute',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#a0aec0',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
            transition: 'color 0.3s ease',
        },
        button: {
            width: '100%',
            padding: '16px',
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            background: 'linear-gradient(135deg, #346cb0 0%, #2c5aa0 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 14px rgba(52, 108, 176, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '8px',
        },
        buttonDisabled: {
            opacity: 0.6,
            cursor: 'not-allowed',
            boxShadow: 'none',
        },
        buttonHover: {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 20px rgba(52, 108, 176, 0.5)',
        },
        links: {
            textAlign: 'center',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid #e2e8f0',
        },
        link: {
            fontSize: '14px',
            color: '#346cb0',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'color 0.3s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
        },
        divider: {
            display: 'flex',
            alignItems: 'center',
            margin: '16px 0',
            color: '#a0aec0',
            fontSize: '13px',
        },
        dividerLine: {
            flex: 1,
            height: '1px',
            background: '#e2e8f0',
        },
        dividerText: {
            padding: '0 12px',
        },
        footer: {
            textAlign: 'center',
            marginTop: '32px',
            fontSize: '12px',
            color: '#a0aec0',
        },
        spinner: {
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
        },
    };

    const keyframes = `
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
    `;

    const isButtonDisabled = current_loading || !form.password || !form.email;

    // render
    return (
        <>
            <style>{keyframes}</style>
            <div style={styles.container}>
                <div style={styles.card}>
                    {/* Logo y título */}
                    <div style={styles.logoContainer}>
                        <a href={app_context.app?.support || '#'}>
                            <img
                                src={app_context.app?.icon_images?.icon_200x200 || '/img/base.png'}
                                alt={app_context.app?.name || "Integración"}
                                style={styles.logo}
                            />
                        </a>
                        <h1 style={styles.title}>
                            {app_context.app?.name || "Integración"}
                        </h1>
                        <p style={styles.subtitle}>
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={(e) => { e.preventDefault(); login(); }}>
                        {/* Email */}
                        <div style={styles.inputGroup}>
                            <label style={{
                                ...styles.inputLabel,
                                color: focusedField === 'email' ? '#346cb0' : '#4a5568'
                            }}>
                                Correo Electrónico
                            </label>
                            <div style={styles.inputWrapper}>
                                <i
                                    className="fas fa-envelope"
                                    style={{
                                        ...styles.inputIcon,
                                        color: focusedField === 'email' ? '#346cb0' : '#a0aec0'
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    name="email"
                                    value={form.email || ""}
                                    onChange={({ target }) => handleInput(target)}
                                    onFocus={() => setFocusedField('email')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={current_loading}
                                    style={{
                                        ...styles.input,
                                        ...(focusedField === 'email' ? styles.inputFocused : {}),
                                        ...(errors.email?.[0] ? styles.inputError : {}),
                                    }}
                                />
                            </div>
                            {errors.email?.[0] && (
                                <div style={styles.errorText}>
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.email[0]}
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div style={styles.inputGroup}>
                            <label style={{
                                ...styles.inputLabel,
                                color: focusedField === 'password' ? '#346cb0' : '#4a5568'
                            }}>
                                Contraseña
                            </label>
                            <div style={styles.inputWrapper}>
                                <i
                                    className="fas fa-lock"
                                    style={{
                                        ...styles.inputIcon,
                                        color: focusedField === 'password' ? '#346cb0' : '#a0aec0'
                                    }}
                                />
                                <input
                                    type={show_password ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    name="password"
                                    value={form.password || ""}
                                    onChange={({ target }) => handleInput(target)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={current_loading || !form.email}
                                    style={{
                                        ...styles.input,
                                        paddingRight: '48px',
                                        ...(focusedField === 'password' ? styles.inputFocused : {}),
                                        ...(errors.password?.[0] ? styles.inputError : {}),
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(prev => !prev)}
                                    style={styles.passwordToggle}
                                    tabIndex={-1}
                                >
                                    <i className={`fas fa-${show_password ? 'eye' : 'eye-slash'}`}></i>
                                </button>
                            </div>
                            {errors.password?.[0] && (
                                <div style={styles.errorText}>
                                    <i className="fas fa-exclamation-circle"></i>
                                    {errors.password[0]}
                                </div>
                            )}
                        </div>

                        {/* Botón de login */}
                        <button
                            type="submit"
                            disabled={isButtonDisabled}
                            style={{
                                ...styles.button,
                                ...(isButtonDisabled ? styles.buttonDisabled : {}),
                            }}
                            onMouseEnter={(e) => {
                                if (!isButtonDisabled) {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 20px rgba(52, 108, 176, 0.5)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 14px rgba(52, 108, 176, 0.4)';
                            }}
                        >
                            {current_loading ? (
                                <>
                                    <div style={styles.spinner}></div>
                                    Verificando...
                                </>
                            ) : (
                                <>
                                    Iniciar Sesión
                                    <i className="fas fa-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div style={styles.links}>
                        <Link
                            href="/recovery_password"
                            style={styles.link}
                            onMouseEnter={(e) => e.target.style.color = '#2c5aa0'}
                            onMouseLeave={(e) => e.target.style.color = '#346cb0'}
                        >
                            <i className="fas fa-key"></i>
                            ¿Olvidaste tu contraseña?
                        </Link>

                        <div style={styles.divider}>
                            <div style={styles.dividerLine}></div>
                            <span style={styles.dividerText}>o</span>
                            <div style={styles.dividerLine}></div>
                        </div>

                        <a
                            href="#"
                            style={styles.link}
                            onClick={(e) => {
                                e.preventDefault();
                                setOption('APPS');
                            }}
                            onMouseEnter={(e) => e.target.style.color = '#2c5aa0'}
                            onMouseLeave={(e) => e.target.style.color = '#346cb0'}
                        >
                            <i className="fas fa-th-large"></i>
                            Explorar más aplicaciones
                        </a>
                    </div>

                    {/* Footer */}
                    <div style={styles.footer}>
                        © {new Date().getFullYear()} {app_context.app?.name || 'Integración'}
                        <br />
                        Todos los derechos reservados
                    </div>
                </div>

                <Show condicion={option === 'APPS'}>
                    <DownloadApps isClose={() => setOption("")}/>
                </Show>
            </div>
        </>
    );
}

export default Login;
