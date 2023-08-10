import React, { useState, useEffect, useRef } from 'react';
import {
  BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Link
} from 'react-router-dom';
import queryString from 'query-string';
import io from 'socket.io-client';
import './App.css';
import Alert from './components/Alert';
import Spinner from './components/Spinner';
import { AiOutlineSend } from 'react-icons/ai';
import InputEmoji from "react-input-emoji";

const Home = () => {
  /* The code snippet is using the `useState` hook from React to define and manage state variables in a
  functional component. */
  const [name, setName] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  /**
   * The handleNameChange function updates the name state with the value from the event target.
   * @param event - The event parameter is an object that represents the event that triggered the
   * function. In this case, it is likely an event object that is generated when the value of an input
   * field is changed.
   */
  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  /**
   * The function `handleRoomCodeChange` updates the value of `roomCode` based on the value of the
   * event target.
   * @param event - The `event` parameter is an object that represents the event that triggered the
   * function. In this case, it is likely an event object that is generated when the value of an input
   * field is changed.
   */
  const handleRoomCodeChange = (event) => {
    setRoomCode(event.target.value);
  };

  /**
   * The function `handleCreateRoom` generates a new room code and navigates to a new room game page
   * with the user's name and the generated room code as query parameters.
   * @returns nothing (undefined).
   */
  const handleCreateRoom = () => {
    /* The above code is defining a constant variable `newRoomCode` and assigning it the value returned
    by the function `generateRoomCode()`. */
    const newRoomCode = generateRoomCode();

    /* The above code is checking if the length of the variable "name" is equal to 0. If it is, it sets
    an error message and shows an alert. */
    if (name.length === 0) {
      setErrorMessage('Por favor ingrese su nombre.');
      setShowAlert(true);

      return;
    }

    /* The above code is using JavaScript to navigate to a specific URL. It is using template literals
    to construct the URL by including the values of the variables `name` and `newRoomCode`. The
    values are also being encoded using the `encodeURIComponent` function to ensure that any special
    characters in the values are properly encoded in the URL. */
    navigate(`/roomgame?name=${encodeURIComponent(name)}&roomCode=${encodeURIComponent(newRoomCode)}`);
  };

  /**
   * The function `handleJoinRoom` checks if the name and room code are entered, and if so, navigates
   * to a room game page with the encoded name and room code as parameters.
   * @returns nothing (undefined).
   */
  const handleJoinRoom = () => {
    /* The above code is checking if the length of the variable "name" is equal to 0. If it is, it sets
    an error message and shows an alert. */
    if (name.length === 0) {
      setErrorMessage('Por favor ingrese su nombre.');
      setShowAlert(true);

      return;
    }

    /* The above code is checking if the length of the variable `roomCode` is equal to 0. If it is, it
    sets an error message and shows an alert. */
    if (roomCode.length === 0) {
      setErrorMessage('Por favor ingrese su código de sala.');
      setShowAlert(true);
      return;
    }

    /* The above code is using JavaScript to navigate to a specific URL. It is using template literals
    to construct the URL with the values of the `name` and `roomCode` variables. The
    `encodeURIComponent` function is used to encode the values in case they contain special
    characters that could break the URL. */
    navigate(`/roomgame?name=${encodeURIComponent(name)}&roomCode=${encodeURIComponent(roomCode)}`);
  };

  /* The above code is using the useEffect hook in React to set up a timer. It checks if the value of
  the showAlert variable is true, and if so, it sets a timer using the setTimeout function. After
  3000 milliseconds (3 seconds), the timer expires and the setShowAlert function is called to set
  the value of showAlert to false. Additionally, the setErrorMessage function is called to set the
  value of errorMessage to an empty string. This code is likely used to display an alert message for
  a certain period of time and then hide it. */
  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        setShowAlert(false);
        setErrorMessage('');
      }, 3000);
    }
  }, [showAlert])

  /**
   * The function generates a random 7-character room code consisting of uppercase letters.
   * @returns The function `generateRoomCode` returns a randomly generated room code consisting of 7
   * uppercase letters.
   */
  function generateRoomCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let roomCode = "";

    /* The above code is generating a random string of characters by looping through a set of letters
    and appending a randomly selected letter to the "roomCode" variable. The loop will run 7 times,
    generating a 7-character random string. */
    for (let i = 0; i < 7; i++) {
      roomCode += letters[Math.floor(Math.random() * letters.length)];
    }

    return roomCode;
  }

  return (
    <div className="container h-screen flex justify-center items-center">
      <div className="flex flex-col justify-center mx-auto">
        {showAlert && <Alert display={showAlert} message={errorMessage} />}
        <h1 className='text-4xl font-bold mb-8 text-white'>TicTacToe Game</h1>
        <form onSubmit={(event) => event.preventDefault()}>
          <div className='flex flex-col gap-3 rounded-lg shadow-lg bg-gray-300 p-4'>
            <div className='mb-2'>
              <label className='font-bold text-gray-700 block' htmlFor="name">Nombre</label>
              <input className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5' type="text" id='name' value={name} onChange={handleNameChange} placeholder="Juan" />
            </div>
            <div className='mb-4'>
              <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors w-full' onClick={handleCreateRoom}>Crear sala</button>
            </div>
            <div className='mb-2'>
              <label className='font-bold text-gray-700 block' htmlFor="roomCode">Código de sala</label>
              <input className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5' id='roomCode' type="text" value={roomCode} onChange={handleRoomCodeChange} placeholder="AZSQCT" />
            </div>
            <div className='mb-4'>
              <button className='bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition-colors w-full' onClick={handleJoinRoom}>Ingresar a la sala</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Chat = ({ websocket, name, roomCode }) => {
  /* The above code is written in JavaScript and it is using React hooks. */
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = useRef(null);

  /* The above code is a React useEffect hook that sets up a WebSocket event listener for the
  'receivedMessage' event. When a 'receivedMessage' event is received, the handleReceivedMessage
  function is called. */
  useEffect(() => {
    /**
     * The function handles received messages by updating the messages state and scrolling to the
     * bottom of the messages container.
     * @param message - The `message` parameter is an object that contains the following properties:
     */
    const handleReceivedMessage = (message) => {
      /* The above code is updating an array of messages. It checks if the last message in the array
      has the same name as the new message being added. If it does, it updates the last message by
      adding the new message to its messages array. If the names do not match, it adds a new object
      to the array with the new message. */
      setMessages((prevMessages) => {
        /* The above code is retrieving the last element from an array called `prevMessages` and
        assigning it to the variable `lastMessage`. */
        const lastMessage = prevMessages[prevMessages.length - 1];

        /* The above code is checking if the last message in the `prevMessages` array has the same name
        as the current `message`. If they have the same name, it updates the last message by adding
        the current `message` to its `messages` array. If they have different names, it adds a new
        object to the `prevMessages` array with the `name` and `messages` properties set to the
        values of the current `message`. The updated `prevMessages` array is then returned. */
        if (lastMessage && lastMessage.name === message.name) {
          const updatedMessages = prevMessages.slice(0, -1);

          /* The above code is creating a new object called `updatedLastMessage` by spreading the
          properties of an existing object called `lastMessage`. It then adds a new property called
          `messages` to `updatedLastMessage` by spreading the elements of an array called
          `lastMessage.messages` and appending a new element `message.message` to the end of the
          array. */
          const updatedLastMessage = {
            ...lastMessage,
            messages: [...lastMessage.messages, message.message],
          };

          return [...updatedMessages, updatedLastMessage];
        } else {
          return [...prevMessages, { name: message.name, messages: [message.message] }];
        }
      });

      /* The above code is using JavaScript to scroll to the bottom of a messages container. It checks
      if the `messagesRef.current` exists, and if it does, it sets a timeout function to execute
      after 0 milliseconds. Inside the timeout function, it sets the `scrollTop` property of
      `messagesRef.current` to `messagesRef.current.scrollHeight`, which will scroll the container
      to the bottom. */
      if (messagesRef.current) {
        setTimeout(() => {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }, 0);
      }
    };

    /* The above code is registering an event listener for the 'receivedMessage' event on a WebSocket
    connection. When a 'receivedMessage' event is emitted, the function 'handleReceivedMessage' will
    be called. */
    websocket.on('receivedMessage', handleReceivedMessage);

    /* The above code is defining an arrow function that is used to remove an event listener for the
    'receivedMessage' event on a websocket. The event listener is named 'handleReceivedMessage'. */
    return () => {
      websocket.off('receivedMessage', handleReceivedMessage);
    };
  }, [websocket]);

  /**
   * The function `handleSendMessage` sends a chat message to a websocket server if the message is not
   * empty.
   */
  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = { name, message: newMessage };

      websocket.emit('chatMessage', { roomCode, ...message });
      setNewMessage('');
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-96">
      <div className="mb-4">
        <div className="font-bold text-2xl">TicTacToe Chat</div>
      </div>
      <div className="mb-2 min-h-[250px] max-h-[250px] overflow-y-scroll p-2" ref={messagesRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`rounded-lg p-2 mb-1 ${message.name === name ? 'bg-blue-200' : 'bg-gray-300'
              }`}
          >
            <div className={`font-semibold ${message.name === name ? 'text-blue-800' : ''}`}>
              {message.name}
            </div>
            {message.messages.map((msg, msgIndex) => (
              <div key={msgIndex}>{msg}</div>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-row gap-4">
        <InputEmoji
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onEnter={handleSendMessage}
          onChange={setNewMessage}
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          onClick={handleSendMessage}
        >
          <AiOutlineSend size={20} />
        </button>
      </div>
    </div>
  );
}

const RoomGame = () => {
  /* The above code is written in JavaScript and is using React hooks to manage state in a game
  application. */
  const [socket, setSocket] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [player2Name, setPlayer2Name] = useState("Jugador 2");
  const [gameResult, setGameResult] = useState(null);
  const location = useLocation();
  const { name, roomCode } = queryString.parse(location.search);

  /* The above code is using the `useEffect` hook in React to establish a WebSocket connection with a
  server at `http://127.0.0.1:3001`. It creates a new socket using the `io` function from a library
  (possibly Socket.IO) and sets it as the value of the `socket` state variable. The socket is
  configured to use the WebSocket transport, auto-connect on initialization, and allow cross-origin
  requests from any origin. */
  useEffect(() => {
    const newSocket = io('http://127.0.0.1:3001', {
      transports: ['websocket'],
      autoConnect: true,
      cors: {
        origin: '*',
      },
    });

    /* The above code is setting a new socket using the function `setSocket`. */
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  /* The above code is using the useEffect hook in React to set up event listeners for socket events.
  It first checks if the socket exists, and if not, it returns early. */
  useEffect(() => {
    /* The above code is checking if the variable "socket" is falsy (null, undefined, false, 0, NaN, or
    an empty string). If it is falsy, the code will return and not execute any further code. */
    if (!socket) return;

    /* The above code is using the `socket` object to emit a `joinRoom` event with an object containing
    the `name` and `roomCode` as data. This code is likely part of a real-time communication system
    using sockets, where a user is trying to join a specific room identified by a room code. */
    socket.emit('joinRoom', { name, roomCode });

    /* The above code is listening for a 'gameStart' event on a socket connection. When the event is
    received, it updates the state variables 'isMyTurn', 'isGameStarted', and 'player2Name' based on
    the 'currentPlayer' object received in the event. If the 'currentPlayer' name is equal to the
    'name' variable, it sets 'isMyTurn' to true and sets 'player2Name' to "Jugador 2". Otherwise, it
    sets 'isMyTurn' to false and sets 'player2Name' to the 'currentPlayer' */
    socket.on('gameStart', (currentPlayer) => {
      setIsMyTurn(currentPlayer.name === name);
      setIsGameStarted(true);
      setPlayer2Name(currentPlayer.name === name ? "Jugador 2" : currentPlayer.name);
    });

    /* The above code is listening for a 'updateBoard' event on a socket connection. When the event is
    received, it updates the board and checks if it is the current player's turn based on the
    'nextPlayer' value. If the 'nextPlayer' value is equal to the 'name' variable, it sets the
    'isMyTurn' variable to true, otherwise it sets it to false. */
    socket.on('updateBoard', ({ board, nextPlayer }) => {
      setBoard(board);
      setIsMyTurn(nextPlayer === name ? true : false);
    });

    /* The above code is listening for a 'gameOver' event on a socket connection. When the event is
    received, it calls a callback function that takes a 'result' parameter. Inside the callback
    function, it sets the game result using the 'setGameResult' function and sets the
    'isGameStarted' variable to false. */
    socket.on('gameOver', (result) => {
      setGameResult(result);
      setIsGameStarted(false);
    });
  }, [socket, name, roomCode]);

  /**
   * The function `handleCellClick` updates the game board and emits a player move event if it is the
   * player's turn and the clicked cell is empty.
   * @param index - The `index` parameter represents the index of the cell that was clicked in the game
   * board.
   */
  const handleCellClick = (index) => {
    /* The above code is checking if the game has started, if it is the player's turn, and if the
    specified index on the board is empty. If all conditions are met, it creates a new copy of the
    board, updates the board at the specified index with the first two characters of the player's
    name in uppercase, sets the new board, sets the player's turn to false, and emits a 'playerMove'
    event with the room code and the new board to the server. */
    if (isGameStarted && isMyTurn && board[index] === null) {
      /* The above code is creating a new array called `newBoard` using the spread operator (`...`) to
      copy all the elements from an existing array called `board`. */
      const newBoard = [...board];

      /* The above code is updating a board array by setting the value at a specific index to the first
      two characters of a given name, converted to uppercase. It then updates the board state with
      the new array and sets a boolean variable, isMyTurn, to false. */
      newBoard[index] = name.substring(0, 2).toUpperCase();
      setBoard(newBoard);
      setIsMyTurn(false);

      socket.emit('playerMove', { roomCode, newBoard });
    }
  };

  /**
   * The renderCell function returns a div element representing a cell in a board, with an onClick
   * event handler.
   * @param index - The `index` parameter in the `renderCell` function represents the index of the cell
   * in the board array. It is used to uniquely identify each cell and perform actions based on the
   * clicked cell.
   * @returns The renderCell function is returning a div element with a key attribute set to the index
   * parameter. It has a className of "cell" and an onClick event listener that calls the
   * handleCellClick function with the index parameter. The content of the div is the value of the
   * board at the given index.
   */
  const renderCell = (index) => {
    return (
      <div
        key={index}
        className="cell"
        onClick={() => handleCellClick(index)}
      >
        {board[index]}
      </div>
    );
  };

  /**
   * The function `renderGameContent` returns different JSX elements based on the game state and
   * result.
   * @returns The `renderGameContent` function returns JSX elements based on the conditions specified
   * in the code.
   */
  const renderGameContent = () => {
    if (!isGameStarted && gameResult === null) {
      return (
        <div className='flex flex-col justify-center items-center gap-6'>
          <h1 className='text-4xl font-bold text-white text-center'>TicTacToe Game</h1>

          <div className='flex flex-col justify-center items-center gap-4 mb-4'>
            <h3 className='text-2xl font-bold text-gray-300'>Código de sala</h3>
            <span title='Código de sala' className='text-xl font-semibold text-gray-400'>{roomCode}</span>
          </div>

          <Spinner text='Esperando a que empiece el partido...' />
        </div>
      );
    }

    if (isGameStarted && gameResult === null) {
      return (
        <div className='flex flex-col md:flex-row justify-center items-center gap-6'>
          <div className='flex flex-col justify-center items-center gap-6'>
            <h1 className='text-4xl font-bold text-white text-center'>TicTacToe Game</h1>

            <div className='flex flex-col justify-center items-center gap-4 mb-4'>
              <h3 className='text-2xl font-bold text-gray-300'>{name} vs {player2Name}</h3>
            </div>

            <div className="board">
              {board.map((_, index) => renderCell(index))}
            </div>
            <div>
              <p className='text-lg font-semibold text-gray-400'>
                Turno de: <span className='text-white font-bold'>{isMyTurn ? name : player2Name}</span>
              </p>
            </div>
          </div>
          <Chat websocket={socket} name={name} roomCode={roomCode} />
        </div>
      );
    }

    return (
      <div className='flex flex-col justify-center items-center gap-6'>
        <h1 className='text-4xl font-bold text-white text-center'>TicTacToe Game</h1>
        <h2 className='text-2xl font-bold text-gray-300 text-center'>Resultados</h2>
        <span className='text-xl font-semibold text-gray-400 text-center'>{gameResult}</span>
        <Link to='/' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors w-full text-center'>
          Volver al inicio
        </Link>
      </div>
    );
  };

  return (
    <div className='container h-screen flex justify-center items-center'>
      <div className="flex flex-col justify-center mx-auto">
        {renderGameContent()}
      </div>
    </div>
  );
};

function App() {
  /* The above code is setting up routes for a React application using React Router. It creates a
  router component using the `<Router>` component from React Router. Inside the router component, it
  defines two routes using the `<Route>` component. The first route is for the home page and it
  renders the `<Home>` component. The second route is for a room game page and it renders the
  `<RoomGame>` component. */
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roomgame" element={<RoomGame />} />
      </Routes>
    </Router>
  );
}
export default App;
