import { ws } from '../env.json';

let socket = null;

if (typeof window == 'object') {
    const adonisWs = require('@adonisjs/websocket-client');
    socket = adonisWs(ws.API_AUTHENTICATION);
}

export default socket;



