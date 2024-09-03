const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const players = {};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add the new player to the players object
    players[socket.id] = {
        playerId: socket.id,
        x: 100,
        y: 450
    };

    // Send the players object to the new player
    socket.emit('newPlayer', players);

    // Broadcast a message to all other players about the new player
    socket.broadcast.emit('newPlayer', players);

    // Handle player movement
    socket.on('playerMovement', (data) => {
        const player = players[socket.id];
        player.x = data.x;
        player.y = data.y;

        // Broadcast the movement to other players
        socket.broadcast.emit('playerMoved', data);
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove the player from the players object
        delete players[socket.id];

        // Broadcast a message to all players that a player has disconnected
        socket.broadcast.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});