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
  const [name, setName] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleRoomCodeChange = (event) => {
    setRoomCode(event.target.value);
  };

  const handleCreateRoom = () => {
    const newRoomCode = generateRoomCode();

    if (name.length === 0) {
      setErrorMessage('Por favor ingrese su nombre.');
      setShowAlert(true);
      return;
    }

    navigate(`/roomgame?name=${encodeURIComponent(name)}&roomCode=${encodeURIComponent(newRoomCode)}`);
  };

  const handleJoinRoom = () => {
    if (name.length === 0) {
      setErrorMessage('Por favor ingrese su nombre.');
      setShowAlert(true);
      return;
    }

    if (roomCode.length === 0) {
      setErrorMessage('Por favor ingrese su código de sala.');
      setShowAlert(true);
      return;
    }

    navigate(`/roomgame?name=${encodeURIComponent(name)}&roomCode=${encodeURIComponent(roomCode)}`);
  };

  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        setShowAlert(false);
        setErrorMessage('');
      }, 3000);
    }
  }, [showAlert])

  function generateRoomCode() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let roomCode = "";
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
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesRef = useRef(null);

  useEffect(() => {
    const handleReceivedMessage = (message) => {
      setMessages((prevMessages) => {
        const lastMessage = prevMessages[prevMessages.length - 1];

        if (lastMessage && lastMessage.name === message.name) {
          const updatedMessages = prevMessages.slice(0, -1);

          const updatedLastMessage = {
            ...lastMessage,
            messages: [...lastMessage.messages, message.message],
          };

          return [...updatedMessages, updatedLastMessage];
        } else {
          return [...prevMessages, { name: message.name, messages: [message.message] }];
        }
      });

      if (messagesRef.current) {
        setTimeout(() => {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }, 0);
      }
    };

    websocket.on('receivedMessage', handleReceivedMessage);

    return () => {
      websocket.off('receivedMessage', handleReceivedMessage);
    };
  }, [websocket]);

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
  const [socket, setSocket] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [player2Name, setPlayer2Name] = useState("Jugador 2");
  const [gameResult, setGameResult] = useState(null);
  const location = useLocation();
  const { name, roomCode } = queryString.parse(location.search);

  useEffect(() => {
    const newSocket = io('https://tictactoeserver.netlify.app', {
      transports: ['websocket'],
      autoConnect: true,
      cors: {
        origin: '*',
      },
    });
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinRoom', { name, roomCode });

    socket.on('gameStart', (currentPlayer) => {
      setIsMyTurn(currentPlayer.name === name);
      setIsGameStarted(true);
      setPlayer2Name(currentPlayer.name === name ? "Jugador 2" : currentPlayer.name);
    });

    socket.on('updateBoard', ({ board, nextPlayer }) => {
      setBoard(board);
      setIsMyTurn(nextPlayer === name ? true : false);
    });

    socket.on('gameOver', (result) => {
      setGameResult(result);
      setIsGameStarted(false);
    });
  }, [socket, name, roomCode]);

  const handleCellClick = (index) => {
    if (isGameStarted && isMyTurn && board[index] === null) {
      const newBoard = [...board];

      newBoard[index] = name.substring(0, 2).toUpperCase();
      setBoard(newBoard);
      setIsMyTurn(false);

      socket.emit('playerMove', { roomCode, newBoard });
    }
  };

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

  const renderGameContent = () => {
    if (!isGameStarted && gameResult === null) {
      return (
        <div className='flex flex-col justify-center items-center gap-6'>
          <h1 className='text-4xl font-bold text-white text-center'>TicTacToe Game</h1>

          <div className='flex flex-col justify-center items-center gap-4 mb-4'>
            <h3 className='text-2xl font-bold text-gray-300'>Código de sala</h3>
            <span title='Código de sala' className='text-xl font-semibold text-gray-400'>{roomCode}</span>
          </div>

          <Spinner text='Esperando a que empiece el partido...' />
        </div>
      );
    } else if (isGameStarted && gameResult === null) {
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
              <p className='text-lg font-semibold text-gray-400'>Turno de: <span className='text-white font-bold'>{isMyTurn ? name : player2Name}</span></p>
            </div>
          </div>
          <Chat websocket={socket} name={name} roomCode={roomCode} />
        </div>
      );
    } else {
      return <div className='flex flex-col justify-center items-center gap-6'>
        <h1 className='text-4xl font-bold text-white text-center'>TicTacToe Game</h1>
        <h2 className='text-2xl font-bold text-gray-300 text-center'>Resultados</h2>
        <span className='text-xl font-semibold text-gray-400 text-center'>{gameResult}</span>
        <Link to='/' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors w-full text-center'>Volver al inicio</Link>
      </div>;
    }
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
