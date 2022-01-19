import { createContext, useContext, useEffect } from 'react';
import useSocket from '../../hooks/useSocket';
import { AuthContext } from '../AuthContext';

export const SignatureSocket = createContext();

export const SignatureSocketProvider = ({ children }) => {

    // config socket
    const host = process?.env?.NEXT_PUBLIC_WS_SOCKET_URL || ''
    const path = process?.env?.NEXT_PUBLIC_WS_SOCKET_PATH || ''
    // auth
    const { auth, is_logged } = useContext(AuthContext);

    // hooks
    const { socket, online, connectSocket, disconnectSocket } = useSocket({ host: `${host}/signature`, path });

    // connectar
    useEffect(() => {
        if (is_logged) connectSocket();
    }, [auth, connectSocket]);

    // desconnectar
    useEffect(() => {
        return () => disconnectSocket();
    }, [disconnectSocket]);

    // render
    return <SignatureSocket.Provider value={{ socket, online }}>
        {children}
    </SignatureSocket.Provider>
}