let socket = null;

if (typeof window == 'object') {
    const adonisWs = require('@adonisjs/websocket-client');
    socket = adonisWs(process?.env?.NEXT_PUBLIC_WS_SOCKET_URL);
}

export default socket;



