// server.js
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();

const whitelist = ["http://localhost:3000"];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("Not allowed by CORS"))
        }
    },
    credentials: true,
}

app.use(cors(corsOptions))

const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const rooms = {};

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinRoom', ({ name, roomCode }) => {
        socket.join(roomCode);

        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [{ name: name, id: socket.id }],
                board: Array(9).fill(null),
                currentPlayerIndex: 0,
            };
        } else {
            rooms[roomCode].players.push({ name: name, id: socket.id });
        }

        if (rooms[roomCode].players.length === 2) {
            const currentPlayer = rooms[roomCode].players[rooms[roomCode].currentPlayerIndex];
            io.to(roomCode).emit('gameStart', currentPlayer);
        }
    });

    socket.on('gameStart', () => {
        const roomCode = socket.roomCode;
        if (!roomCode || !rooms[roomCode] || rooms[roomCode].gameStarted) return;

        rooms[roomCode].gameStarted = true;

        const currentPlayerIndex = Math.floor(Math.random() * rooms[roomCode].players.length);
        const currentPlayer = rooms[roomCode].players[currentPlayerIndex];

        io.to(roomCode).emit('gameStart', { currentPlayer: currentPlayer });
    });

    socket.on('playerMove', ({ roomCode, newBoard }) => {
        if (!rooms[roomCode] || !rooms[roomCode].players) return;

        rooms[roomCode].board = newBoard;

        rooms[roomCode].currentPlayerIndex = (rooms[roomCode].currentPlayerIndex + 1) % rooms[roomCode].players.length;
        const nextPlayer = rooms[roomCode].players[rooms[roomCode].currentPlayerIndex];

        io.to(roomCode).emit('updateBoard', { board: newBoard, nextPlayer: nextPlayer ? nextPlayer.name : null });

        const winner = calculateWinner(newBoard, rooms[roomCode].players);

        if (winner) {
            io.to(roomCode).emit('gameOver', `${winner} gana!`);
        } else if (!newBoard.includes(null)) {
            io.to(roomCode).emit('gameOver', "Los jugadores han empatado!");
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);

        for (const roomCode in rooms) {
            rooms[roomCode].players = rooms[roomCode].players.filter((player) => player.id !== socket.id);

            if (rooms[roomCode].players.length === 0) {
                delete rooms[roomCode];
            }
        }
    });
});

const calculateWinner = (board, players) => {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            const playerNameShort = board[a];
            const player = players.find(player => player.name.substring(0, 2).toUpperCase() === playerNameShort);
            return player ? player.name : null;
        }
    }

    return null;
};
