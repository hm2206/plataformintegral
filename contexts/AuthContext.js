import { createContext, useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/navbar';
import Sidebar from '../components/sidebar';
import { Content } from '../components/Utils';
import Show from '../components/show';
import SkullContent from '../components/loaders/skullContent';
import { EntityProvider } from '../contexts/EntityContext';
import { SocketProvider } from '../contexts/SocketContext';
import { NotificationProvider } from '../contexts/notification/NotificationContext';
import router from 'next/router';
import Cookies from 'js-cookie';

export const AuthContext = createContext();


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
            router.push('/login');
        }
    }, [is_logged]);

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
                                        predeterminado={
                                            <div className="col-md-12">
                                                <SkullContent/>
                                            </div>
                                        }
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