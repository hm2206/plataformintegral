import React, { useCallback, useEffect, useState } from "react";
import io from 'socket.io-client';

const useSocket = ({ host, path }) => {

    // estados
    const [online, setOnline] = useState(false);
    const [socket, setSocket] = useState(null);

    // conectar socket
    const connectSocket = useCallback(() => {
        const socketTemp = io.connect(host, { 
            path,
            transports: ['websocket'],
            autoConnect: true,
            forceNew: true
        });
        setSocket(socketTemp);
    }, [host]);

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