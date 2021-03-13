import React, { useCallback, useEffect, useState } from "react";
import io from 'socket.io-client';

const useSocket = (serverPath) => {

    // estados
    const [online, setOnline] = useState(false);
    const [socket, setSocket] = useState(null);

    // conectar socket
    const connectSocket = useCallback(() => {
        const socketTemp = io.connect(serverPath, { 
            transports: ['websocket'],
            autoConnect: true,
            forceNew: true
        });
        setSocket(socketTemp);
    }, [serverPath]);

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
        socket?.on('disconnect', () => setOnline( false ))

    }, [socket])

    return { socket, online, connectSocket, disconnectSocket };
}

export default useSocket;