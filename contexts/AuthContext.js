import { createContext, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import { Content } from '../components/Utils';
import Show from '../components/show';
import { EntityProvider } from '../contexts/EntityContext';
import { SocketProvider } from '../contexts/SocketContext';
import { NotificationProvider } from '../contexts/notification/NotificationContext';
import Cookies from 'js-cookie';

// Valor por defecto para evitar undefined cuando se usa fuera del provider
const defaultAuthValue = {
    auth: {},
    setAuth: () => {},
    logout: () => {},
    is_logged: false,
    loading: true,
    token: null
};

export const AuthContext = createContext(defaultAuthValue);


export const AuthProvider = ({ children }) => {

    // estados
    const [auth, setAuth] = useState({});
    const [token, setToken] = useState(null)

    // auth context
    const { getAuth, logout, is_logged, loading, removeToken } = useAuth();

    // obtener el auth
    const handleAuth = async () => {
        let authTemp = await getAuth();
        setAuth(authTemp);
    }

    const recoveryToken = () => {
        setToken(Cookies.get('auth_token') || null);
    }

    // executar el auth
    useEffect(() => {
        handleAuth();
        recoveryToken();
    }, []);

    // no se pudo loggear
    useEffect(() => {
        if(typeof is_logged == 'boolean' && !is_logged) {
            removeToken();
            location.href = '/login';
        }
    }, [is_logged]);

    // Loading del dashboard - elegante
    const DashboardLoader = () => (
        <div className="col-12" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)',
            flexDirection: 'column',
            gap: '20px',
            background: 'transparent'
        }}>
            <style>{`
                @keyframes dashSpin {
                    to { transform: rotate(360deg); }
                }
                @keyframes dashPulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(0.95); }
                }
            `}</style>
            <div style={{
                position: 'relative',
                width: '60px',
                height: '60px',
            }}>
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    border: '3px solid #e2e8f0',
                    borderTopColor: '#346cb0',
                    borderRadius: '50%',
                    animation: 'dashSpin 0.8s linear infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    width: '70%',
                    height: '70%',
                    top: '15%',
                    left: '15%',
                    border: '3px solid #e2e8f0',
                    borderBottomColor: '#5a8fd8',
                    borderRadius: '50%',
                    animation: 'dashSpin 1.2s linear infinite reverse'
                }} />
            </div>
            <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#718096',
                fontWeight: '500',
                animation: 'dashPulse 1.5s ease-in-out infinite'
            }}>
                Cargando...
            </p>
        </div>
    );

    // response
    return (
        <AuthContext.Provider value={{ logout, is_logged, auth, setAuth, loading, token }}>
            <EntityProvider>
                <SocketProvider>
                    <NotificationProvider>
                        {/* navbar */}
                        <Navbar/>
                        <div className="gx-layout-content ant-layout-content">
                            <div className="gx-main-content-wrapper">
                                {/* sidebar */}
                                <Sidebar/>
                                {/* pages auth */}
                                <Content>
                                    <Show condicion={!loading && is_logged}
                                        predeterminado={<DashboardLoader />}
                                    >
                                        {children}
                                    </Show>
                                </Content>
                            </div>
                        </div>
                    </NotificationProvider>
                </SocketProvider>
            </EntityProvider>
        </AuthContext.Provider>
    );
}