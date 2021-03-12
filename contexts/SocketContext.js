import { createContext } from 'react';
import useSocket from '../hooks/useSocket';
import { ws } from '../env.json';

const SocketContext = createContext();

const SocketProvider = ({ children }) => {

    const { socket, online } = useSocket(ws.API_SOCKET);

    // render
    return <SocketContext.Provider >
        {children}
    </SocketContext.Provider>
}