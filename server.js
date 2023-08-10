/* These lines of code are importing the necessary modules and setting up the basic configuration for a
Node.js server using Express, Socket.io, and CORS. */
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const app = express();

/* The `const whitelist` variable is an array that contains a list of allowed origins for CORS
(Cross-Origin Resource Sharing). CORS is a mechanism that allows resources (e.g., fonts, JavaScript,
etc.) on a web page to be requested from another domain outside the domain from which the resource
originated. In this case, the whitelist array specifies the origins that are allowed to make
requests to the server. Any request coming from an origin not listed in the whitelist will be
rejected by the server. */
const whitelist = ["https://127.0.0.1:3000", "http://localhost:3000"];

/* The `corsOptions` object is a configuration object for the CORS (Cross-Origin Resource Sharing)
middleware. It specifies the allowed origins for making requests to the server and enables
credentials. */
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

/* The line `app.use(cors(corsOptions));` is configuring the Express app to use the CORS (Cross-Origin
Resource Sharing) middleware with the specified options. */
app.use(cors(corsOptions));

/* These lines of code are creating a server using the `http` module and initializing a Socket.io
instance on that server. */
const server = http.createServer(app);
const io = socketio(server);

/* The line `const PORT = process.env.PORT || 3001;` is setting the port number for the server to
listen on. */
const PORT = process.env.PORT || 3001;

/* The `server.listen(PORT, () => { console.log(`Server running on port `); });` code is
starting the server and listening for incoming requests on the specified port number (`PORT`). Once
the server is successfully started, it will log a message to the console indicating that the server
is running and listening on the specified port. */
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

/* The line `const rooms = {};` is declaring and initializing an empty object called `rooms`. This
object is used to store information about the different game rooms in the server. Each room is
identified by a unique room code, and the `rooms` object stores the players in each room, the
current state of the game board, and the index of the current player in each room. */
const rooms = {};

io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    /* The `socket.on('joinRoom', ({ name, roomCode }) => { ... })` code is an event listener that
    listens for the 'joinRoom' event emitted by a client. When this event is triggered, the code
    inside the callback function is executed. */
    socket.on('joinRoom', ({ name, roomCode }) => {
        socket.join(roomCode);

        /* This code block is checking if a room with the specified `roomCode` already exists in the
        `rooms` object. If the room does not exist, a new room is created with the `roomCode` as the
        key in the `rooms` object. The new room object contains an array of players, where the first
        player is added with the specified `name` and `id`, an empty game board represented by an
        array of 9 `null` values, and the `currentPlayerIndex` set to 0. */
        if (!rooms[roomCode]) {
            rooms[roomCode] = {
                players: [{ name: name, id: socket.id }],
                board: Array(9).fill(null),
                currentPlayerIndex: 0,
            };
        } else {
            rooms[roomCode].players.push({ name: name, id: socket.id });
        }

        /* This code block is checking if there are exactly two players in the specified game room
        (`roomCode`). If there are two players, it retrieves the current player from the `players`
        array in the `rooms` object using the `currentPlayerIndex`. Then, it emits a 'gameStart'
        event to all clients in the room (`io.to(roomCode).emit('gameStart', currentPlayer)`),
        passing the current player as the data payload. This event indicates that the game has
        started and provides the information about the current player to the clients. */
        if (rooms[roomCode].players.length === 2) {
            const currentPlayer = rooms[roomCode].players[rooms[roomCode].currentPlayerIndex];
            io.to(roomCode).emit('gameStart', currentPlayer);
        }
    });

    /* The `socket.on('gameStart', () => { ... })` code is an event listener that listens for the
    'gameStart' event emitted by a client. When this event is triggered, the code inside the
    callback function is executed. */
    socket.on('gameStart', () => {
        /* The line `const roomCode = socket.roomCode;` is assigning the value of the `roomCode`
        property of the `socket` object to the `roomCode` variable. This assumes that the `socket`
        object has a `roomCode` property. The purpose of this line is to retrieve the room code
        associated with the current socket connection. */
        const roomCode = socket.roomCode;

        /* The line `if (!roomCode || !rooms[roomCode] || rooms[roomCode].gameStarted) return;` is
        performing a check to determine if the game has already started or if the room code is
        invalid. */
        if (!roomCode || !rooms[roomCode] || rooms[roomCode].gameStarted) return;

        /* The line `rooms[roomCode].gameStarted = true;` is setting the `gameStarted` property of the
        `rooms[roomCode]` object to `true`. This property is used to keep track of whether the game
        has started in a specific room identified by the `roomCode`. By setting `gameStarted` to
        `true`, it indicates that the game has started in that room. */
        rooms[roomCode].gameStarted = true;

        /* These lines of code are used to randomly select a current player from the players array in a
        specific game room. */
        const currentPlayerIndex = Math.floor(Math.random() * rooms[roomCode].players.length);
        const currentPlayer = rooms[roomCode].players[currentPlayerIndex];

        io.to(roomCode).emit('gameStart', { currentPlayer: currentPlayer });
    });

    /* The `socket.on('chatMessage', ({ roomCode, name, message }) => { ... })` code is an event
    listener that listens for the 'chatMessage' event emitted by a client. When this event is
    triggered, the code inside the callback function is executed. */
    socket.on('chatMessage', ({ roomCode, name, message }) => {
        io.to(roomCode).emit('receivedMessage', { name, message });
    });

    /* The `socket.on('playerMove', ({ roomCode, newBoard }) => { ... })` code is an event listener
    that listens for the 'playerMove' event emitted by a client. When this event is triggered, the
    code inside the callback function is executed. */
    socket.on('playerMove', ({ roomCode, newBoard }) => {
        /* The line `if (!rooms[roomCode] || !rooms[roomCode].players) return;` is performing a check to
        determine if the specified game room (`roomCode`) exists or if it has any players. */
        if (!rooms[roomCode] || !rooms[roomCode].players) return;

        /* The line `rooms[roomCode].board = newBoard;` is updating the game board for a specific game
        room identified by `roomCode`. It assigns the value of `newBoard` to the `board` property of
        the `rooms[roomCode]` object. This updates the state of the game board in that room with the
        new board configuration. */
        rooms[roomCode].board = newBoard;

        /* The line `rooms[roomCode].currentPlayerIndex = (rooms[roomCode].currentPlayerIndex + 1) %
        rooms[roomCode].players.length;` is updating the `currentPlayerIndex` property of the
        `rooms[roomCode]` object. */
        rooms[roomCode].currentPlayerIndex = (rooms[roomCode].currentPlayerIndex + 1) % rooms[roomCode].players.length;
        /* The line `const nextPlayer = rooms[roomCode].players[rooms[roomCode].currentPlayerIndex];`
        is retrieving the next player from the `players` array in a specific game room. */
        const nextPlayer = rooms[roomCode].players[rooms[roomCode].currentPlayerIndex];

        /* The line `io.to(roomCode).emit('updateBoard', { board: newBoard, nextPlayer: nextPlayer ?
        nextPlayer.name : null });` is emitting an 'updateBoard' event to all clients in the
        specified room (`roomCode`). */
        io.to(roomCode).emit('updateBoard', { board: newBoard, nextPlayer: nextPlayer ? nextPlayer.name : null });

        /* The line `const winner = calculateWinner(newBoard, rooms[roomCode].players);` is calling the
        `calculateWinner` function and passing two arguments: `newBoard` and
        `rooms[roomCode].players`. */
        const winner = calculateWinner(newBoard, rooms[roomCode].players);

        /* This code block is checking for a winner or a draw in the game. */
        if (winner) {
            io.to(roomCode).emit('gameOver', `${winner} gana!`);
        } else if (!newBoard.includes(null)) {
            io.to(roomCode).emit('gameOver', "Los jugadores han empatado!");
        }
    });

    /* The `socket.on('disconnect', () => { ... })` code is an event listener that listens for the
    'disconnect' event, which is triggered when a client socket disconnects from the server. When
    this event is triggered, the code inside the callback function is executed. */
    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);

        /* This code block is responsible for removing disconnected players from the game rooms and
        deleting empty game rooms. */
        for (const roomCode in rooms) {
            rooms[roomCode].players = rooms[roomCode].players.filter((player) => player.id !== socket.id);

            if (rooms[roomCode].players.length === 0) {
                delete rooms[roomCode];
            }
        }
    });
});

/**
 * The `calculateWinner` function checks if there is a winner in a tic-tac-toe game board and returns
 * the name of the winning player.
 * @param board - The `board` parameter represents the current state of the game board. It is an array
 * of length 9, where each element represents a cell on the board. The elements can be either "X", "O",
 * or null, indicating whether a player has placed their mark in that cell or if
 * @param players - The `players` parameter is an array of objects representing the players in the
 * game. Each player object has a `name` property which is a string representing the player's name.
 * @returns The function `calculateWinner` returns the name of the player who has won the game, or
 * `null` if there is no winner.
 */
const calculateWinner = (board, players) => {
    /* The `winPatterns` constant is an array of arrays that represents the possible winning patterns
    in a tic-tac-toe game. Each inner array contains the indices of the cells on the game board that
    need to be occupied by the same player in order to win the game. */
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
    ];

    /* The above code is iterating over an array of win patterns and checking if the values in the
    board array match any of these win patterns. If a match is found, it retrieves the corresponding
    player's name from the players array and returns it. If no match is found, it returns null. */
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;

        /* The above code is checking if there is a winning combination on a tic-tac-toe board. It
        checks if the values at positions `a`, `b`, and `c` on the board are equal and not null. If
        they are equal, it finds the player with a name that matches the first two characters of the
        winning value and returns the player's full name. If no player is found, it returns null. */
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            /* The above code is declaring a constant variable named `playerNameShort` and assigning it
            the value of `board[a]`. */
            const playerNameShort = board[a];
            /* The above code is using the `find` method to search for a player in an array called
            `players`. It is using an arrow function to check if the first two characters of the
            player's name, converted to uppercase, match a variable called `playerNameShort`. If a
            match is found, the `find` method will return the player object. */
            const player = players.find(player => player.name.substring(0, 2).toUpperCase() === playerNameShort);

            /* The above code is a JavaScript function that takes in a variable called "player" and
            returns the name property of the player object. If the player object is not provided or
            is null, the function returns null. */
            return player ? player.name : null;
        }
    }

    return null;
};
