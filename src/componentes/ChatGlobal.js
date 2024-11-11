import React, { useState, useEffect, useRef } from 'react'

const INITIAL_MESSAGES = [
  { id: 1, text: "Hola! ¿Cómo estás?", user: "Alice", avatar: "/placeholder.svg?height=40&width=40", timestamp: "10:30" },
  { id: 2, text: "¿Alguien sabe a qué hora es la reunión mañana?", user: "Bob", avatar: "/placeholder.svg?height=40&width=40", timestamp: "10:32" },
]

export default function ChatGlobal() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [inputMessage, setInputMessage] = useState('')
  const chatContainerRef = useRef(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (inputMessage.trim() !== '') {
      const newMessage = {
        id: Date.now(),
        text: inputMessage,
        user: "You",
        avatar: "/placeholder.svg?height=40&width=40",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages([...messages, newMessage])
      setInputMessage('')
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4">
        <h1 className="text-xl font-bold">Chat Grupal</h1>
      </div>

      {/* Chat messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.user === "You" ? 'justify-end' : 'justify-start'}`}
          >
            <div className="flex items-end space-x-2">
              {message.user !== "You" && (
                <img src={message.avatar} alt={message.user} className="w-8 h-8 rounded-full" />
              )}
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user === "You" ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                {message.user !== "You" && (
                  <p className="font-bold text-sm mb-1">{message.user}</p>
                )}
                <p className="text-sm">{message.text}</p>
                <p className="text-xs text-gray-400 text-right mt-1">{message.timestamp}</p>
              </div>
              {message.user === "You" && (
                <img src={message.avatar} alt={message.user} className="w-8 h-8 rounded-full" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="bg-gray-800 p-4 flex space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  )
}