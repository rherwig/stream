import { Server } from 'socket.io';

export default (io: Server) => {
    let broadcaster;

    io.sockets.on('connection', socket => {
        console.info(`[Socket Server] New connection from ${socket.id}.`);

        socket.on('broadcaster', () => {
            console.info(`[Socket Server] New broadcaster: ${socket.id}`);

            broadcaster = socket.id;
            socket.broadcast.emit('broadcaster');
        });

        socket.on('watcher', () => {
            console.info(`[Socket Server] New watcher: ${socket.id}`);

            socket.to(broadcaster).emit('watcher', socket.id);
        });

        socket.on('disconnect', () => {
            console.info(`[Socket Server] Socket left: ${socket.id}`);

            socket.to(broadcaster).emit('disconnectPeer', socket.id);
        });

        socket.on('offer', (id, message) => {
            socket.to(id).emit('offer', socket.id, message);
        });

        socket.on('answer', (id, message) => {
            socket.to(id).emit('answer', socket.id, message);
        });

        socket.on('candidate', (id, message) => {
            socket.to(id).emit('candidate', socket.id, message);
        });
    });
};
