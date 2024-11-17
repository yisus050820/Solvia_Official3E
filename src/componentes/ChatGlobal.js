import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';  // Importar framer-motion

export default function ChatGlobal() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const chatContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Obtener el id del usuario logueado desde el backend del chat
  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }
    
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/chat', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        setUserId(response.data.user_id);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error al obtener los mensajes:', error);
      }
    };
    fetchMessages();

    // Actualizar los mensajes cada 5 segundos
    const intervalId = setInterval(fetchMessages, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  // Desplazarse automáticamente al final de los mensajes
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Manejar el envío de mensajes
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === '') return;

    try {
      const response = await axios.post(
        'http://localhost:5000/chat',
        { message: inputMessage },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const newMessage = response.data;
      setMessages([...messages, newMessage]);
      setInputMessage('');
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white w-full md:w-3/4 lg:w-2/3 mx-auto">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <h1 className="text-xl font-bold">Chat Grupal</h1>
      </div>

      {/* Chat messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.user_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 ${message.user_id === userId ? 'flex-row-reverse' : ''}`}>
              {message.user_id !== userId && (
                <Avatar src={`http://localhost:5000${message.avatar}?${new Date().getTime()}`} alt={message.user} className="w-8 h-8 rounded-full" />
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.user_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}
              >
                {message.user_id !== userId && (
                  <p className="font-bold text-sm mb-1">{message.user}</p>
                )}
                <p className="text-sm">{message.message}</p>
                <p className="text-xs text-gray-300 text-right mt-1">{message.timestamp}</p>
              </div>
              {message.user_id === userId && (
                <Avatar src={`http://localhost:5000${message.avatar}?${new Date().getTime()}`} alt="You" className="w-8 h-8 rounded-full" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="bg-gray-800 p-4 flex space-x-2">
        <motion.input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          initial={{ scale: 1 }}
          whileFocus={{ scale: 1.05 }}  // Al enfocarse, se agranda un poco
        />
        <motion.button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          initial={{ scale: 1 }}
          whileTap={{ scale: 0.95 }} // Botón reduce tamaño al hacer clic
        >
          Enviar
        </motion.button>
      </form>
    </div>
  );
}

