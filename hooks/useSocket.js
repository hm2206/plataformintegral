import React, { useCallback, useContext, useEffect, useState } from "react";
import io from 'socket.io-client';
import { AuthContext } from '../contexts/AuthContext';

const useSocket = ({ host, path }) => {

    // app
    const { auth } = useContext(AuthContext);

    // estados
    const [online, setOnline] = useState(false);
    const [socket, setSocket] = useState(null);

    // conectar socket
    const connectSocket = useCallback(() => {
        // token
        let { token } = auth || {}; 
        // config socket
        const socketTemp = io(host, { 
            path,
            transports: ['websocket'],
            autoConnect: true,
            forceNew: true,
            auth: {
                Authorization: `Bearer ${token?.token}`,
                ClientId: process?.env?.NEXT_PUBLIC_CLIENT_ID || '',
                ClientSecret: process?.env?.NEXT_PUBLIC_CLIENT_SECRET || ''
            },
        });
        setSocket(socketTemp);
    }, [auth, host]);

    // desconectar socket
    const disconnectSocket = useCallback(() => {
        socket?.disconnect();
    }, [socket]);

    useEffect(() => {
        setOnline(socket?.connected);
    }, [socket])

    useEffect( () => {
        socket?.on('connect', () => setOnline(true))
    }, [socket])

    useEffect( () => {
        socket?.on('disconnect', () => setOnline(false))
    }, [socket])

    return { socket, online, connectSocket, disconnectSocket };
}

export default useSocket;