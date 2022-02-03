import io, { Socket } from 'socket.io-client';

let socket: Socket = null;

export default (): Socket => {
    if (socket === null) {
        socket = io({
            reconnection: true,
            rejectUnauthorized: false,
            transports: ['websocket'],
        });
    }

    return socket;
};
