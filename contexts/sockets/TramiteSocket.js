import { createContext, useContext, useEffect } from 'react';
import useSocket from '../../hooks/useSocket';
import { ws } from '../../env.json';
import { AuthContext } from '../AuthContext';

export const TramiteSocket = createContext();

export const TramiteSocketProvider = ({ children }) => {

    // config socket
    const { host, path } = ws.API_SOCKET;
    // auth
    const { auth, is_logged } = useContext(AuthContext);

    // hooks
    const { socket, online, connectSocket, disconnectSocket } = useSocket({ host: `${host}/tramite`, path });

    // connectar
    useEffect(() => {
        if (is_logged) connectSocket();
    }, [auth, connectSocket]);

    // desconnectar
    useEffect(() => {
        return () => disconnectSocket();
    }, [disconnectSocket]);

    // render
    return <TramiteSocket.Provider value={{ socket, online }}>
        {children}
    </TramiteSocket.Provider>
}