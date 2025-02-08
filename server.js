const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
    console.log('a user connected');

    
    socket.on('join private room', (userId) => {
        socket.join(userId);
        onlineUsers.set(socket.id, userId); 
        io.emit('update user list', Array.from(onlineUsers.values())); 
        console.log(`User ${userId} joined their private room`);
    });

    
    socket.on('private message', ({ recipientId, message }) => {
        socket.to(recipientId).emit('private message', { senderId: socket.id, message });
        console.log(`Private message sent to ${recipientId}: ${message}`);
    });

    
    socket.on('disconnect', () => {
        const userId = onlineUsers.get(socket.id);
        onlineUsers.delete(socket.id); 
        io.emit('update user list', Array.from(onlineUsers.values()));
        console.log(`User ${userId} disconnected`);
    });
});

const PORT = process.env.PORT || 7777; 
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});