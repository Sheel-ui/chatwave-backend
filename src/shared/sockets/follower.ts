import { IFollowers } from '@follower/interfaces/followerInterface';
import { Server, Socket } from 'socket.io';

export let socketIOFollowerObject: Server;

export class SocketIOFollowerHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIOFollowerObject = io;
    }

    // Event listeners for Socket.IO connections
    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            socket.on('unfollow user', (data: IFollowers) => {
                // Emit a 'remove follower' event to connected client
                this.io.emit('remove follower', data);
            });
        });
    }
}
