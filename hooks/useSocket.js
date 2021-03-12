import React, { useEffect, useMemo } from "react";
import io from 'socket.io-client';

const useSocket = (pathServer) => {

    const socket = useMemo(() => io.connect(pathServer, {
        transports: ['websocket']
    }), [pathServer]);

    return { socket }
}

export default useSocket;