import { ICommentDocument } from '@comment/interfaces/commentInterface';
import { IReactionDocument } from '@reaction/interfaces/reactionInterface';
import { Server, Socket } from 'socket.io';

export let socketIOPostObject: Server;

export class SocketIOPostHandler {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        socketIOPostObject = io;
    }

    // Method to set up event listeners for Socket.IO connections
    public listen(): void {
        this.io.on('connection', (socket: Socket) => {
            // Event listener for 'reaction' event
            socket.on('reaction', (reaction: IReactionDocument) => {
                this.io.emit('update like', reaction);
            });

            // Event listener for 'comment' event
            socket.on('comment', (data: ICommentDocument) => {
                this.io.emit('update comment', data);
            });
        });
    }
}
