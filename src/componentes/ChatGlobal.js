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
  const [atBottom, setAtBottom] = useState(true);  // Estado para verificar si el usuario está al final

  const handleLogout = () => {
    localStorage.clear(); 
    delete axios.defaults.headers.common['Authorization']; 
    window.location.href = '/index'; 
  };
  // Obtener el id del usuario logueado desde el backend del chat
  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No se encontró el token.');
      setLoading(false);
      return;
    }
    
    // Función para obtener los mensajes
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

    fetchMessages(); // Obtener mensajes al cargar el componente

    // Actualizar los mensajes cada 5 segundos
    const intervalId = setInterval(fetchMessages, 1000);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, []);

  // Desplazarse automáticamente al final de los mensajes si el usuario está al final
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer && atBottom) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages, atBottom]);  

  // Función para manejar el cambio de scroll
  const handleScroll = () => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      // Si el usuario está muy cerca del final, actualizamos el estado
      setAtBottom(chatContainer.scrollHeight - chatContainer.scrollTop === chatContainer.clientHeight);
    }
  };

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
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');
      
      // Forzar scroll al final
      const chatContainer = chatContainerRef.current;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch (error) {
      console.error('Error al enviar el mensaje:', error);
    }
  };  

  return (
    <div
      className="flex flex-col h-screen mx-auto"
      style={{
        backgroundColor: '#383D3B', // Fondo oscuro
        color: '#EEE5E9', // Texto claro
        width: '80%', // Más ancho (ajusta al porcentaje deseado)
        maxWidth: '1200px', // Ancho máximo para pantallas grandes
      }}
    >
                                          {/* Botón de cerrar sesión */}
                                          <button
        onClick={handleLogout}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#ff0000', // Rojo brillante
          color: 'white',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '5px',
          fontSize: '14px',
          cursor: 'pointer',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
          zIndex: 9999,
        }}
      >
        Cerrar sesión
      </button>
      {/* Header */}
      <div style={{ backgroundColor: '#7C7C7C' }} className="p-4 text-center"> {/* Fondo gris medio */}
        <h1 className="text-xl font-bold">Chat Grupal</h1>
      </div>
  
      {/* Chat messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ maxHeight: 'calc(100vh - 120px)' }}
        onScroll={handleScroll} // Detectar el scroll
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
                <Avatar
                  src={`http://localhost:5000${message.avatar}?${new Date().getTime()}`}
                  alt={message.user}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user_id === userId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'
                }`}
                style={{
                  backgroundColor: message.user_id === userId ? '#92DCE5' : '#7C7C7C', // Azul claro para enviados, gris medio para recibidos
                  color: message.user_id === userId ? '#383D3B' : '#EEE5E9', // Texto oscuro para enviados
                }}
              >
                {message.user_id !== userId && (
                  <p className="font-bold text-sm mb-1">{message.user}</p>
                )}
                <p className="text-sm">{message.message}</p>
                <p
                  className="text-xs text-right mt-1"
                  style={{
                    color: message.user_id === userId ? '#000000' : '#EEE5E9', // Negro para hora en enviados, claro en recibidos
                  }}
                >
                  {message.timestamp}
                </p>
              </div>
              {message.user_id === userId && (
                <Avatar
                  src={`http://localhost:5000${message.avatar}?${new Date().getTime()}`}
                  alt="You"
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>
  
      {/* Message input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 flex space-x-2"
        style={{
          backgroundColor: '#7C7C7C', // Fondo gris medio
        }}
      >
        <motion.input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 rounded-full focus:outline-none focus:ring-2"
          style={{
            backgroundColor: '#383D3B', // Fondo oscuro
            color: '#EEE5E9', // Texto claro
          }}
          initial={{ scale: 1 }}
          whileFocus={{ scale: 1.05 }} // Al enfocarse, se agranda un poco
        />
        <motion.button
          type="submit"
          className="px-4 py-2 rounded-full focus:outline-none focus:ring-2"
          style={{
            backgroundColor: '#92DCE5', // Botón azul claro
            color: '#383D3B', // Texto oscuro
          }}
          whileHover={{ backgroundColor: '#7C7C7C', scale: 1.1 }} // Gris medio al hover
          whileTap={{ scale: 0.95 }} // Botón reduce tamaño al hacer clic
        >
          Enviar
        </motion.button>
      </form>
    </div>
  );
}  