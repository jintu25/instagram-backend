import { Server } from 'socket.io';
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust based on your frontend URL
        methods: ["GET", "POST"],
        credentials: true,
    }
});

let userSocketMap = {}; // Keeps track of user connections

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId]

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
        userSocketMap[userId] = socket.id; // Add user to the map
        console.log(`User connected: ${userId}, socket id: ${socket.id}`);

        // Emit the updated online users list to all sockets
        io.emit('getOnlineUser', Object.keys(userSocketMap));

        // Handle user disconnection
        socket.on("disconnect", () => {
            if (userId) {
                console.log(`user Connected: userId ${userId}, socketId ${socket.id}`)
                delete userSocketMap[userId]
            }
            io.emit('getOnlineUser', Object.keys(userSocketMap));
        });
    }
});

export { app, server, io };
