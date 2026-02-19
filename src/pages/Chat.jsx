import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import '../styles/Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const isInitializedRef = useRef(false);

  const API_URL = import.meta.env.VITE_WS_BASE_URL || 'http://localhost:3000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Функция для добавления сообщения с проверкой на дубликаты
  const addMessage = useCallback((newMessage) => {
    setMessages(prev => {
      // Проверяем, нет ли уже такого сообщения
      const isDuplicate = prev.some(msg => 
        msg.id === newMessage.id || 
        (msg.content === newMessage.content && 
         msg.username === newMessage.username &&
         Math.abs(new Date(msg.timestamp) - new Date(newMessage.timestamp)) < 1000)
      );
      
      if (isDuplicate) {
        console.log('🔄 Duplicate message detected, skipping:', newMessage);
        return prev;
      }
      
      console.log('✅ Adding new message:', newMessage);
      return [...prev, newMessage];
    });
  }, []);

  // Авторизация и подключение
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log('🔄 Chat already initialized, skipping...');
      return;
    }

    const initializeChat = async () => {
      try {
        isInitializedRef.current = true;
        setIsLoading(true);
        setError(null);

        // Регистрируем случайного пользователя
        const username = 'user' + Math.floor(Math.random() * 1000);
        console.log('👤 Registering user:', username);
        
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password: '123456'
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Registration successful:', data);
        setUser(data.user);

        // Подключаемся к WebSocket
        const newSocket = io(API_URL, {
          auth: {
            token: data.token
          },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
          console.log('✅ Connected to chat server, socket ID:', newSocket.id);
          setIsConnected(true);
          setError(null);
          
          // Загружаем историю сообщений
          newSocket.emit('get_message_history', { limit: 50 }, (response) => {
            console.log('📜 Message history response:', response);
            if (response?.success) {
              setMessages([]);
              response.messages.forEach(msg => addMessage(msg));
            } else {
              setError('Failed to load message history: ' + (response?.error || 'Unknown error'));
            }
          });
        });

        newSocket.on('new_message', (message) => {
          console.log('📨 New message received:', message);
          addMessage(message);
        });

        newSocket.on('disconnect', () => {
          console.log('❌ Disconnected from chat server');
          setIsConnected(false);
          setError('Disconnected from server');
        });

        newSocket.on('connect_error', (error) => {
          console.error('🔌 Connection error:', error);
          setIsConnected(false);
          setError('Connection failed: ' + error.message);
        });

      } catch (error) {
        console.error('🚨 Failed to initialize chat:', error);
        setError('Failed to initialize chat: ' + error.message);
        isInitializedRef.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up chat component');
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [addMessage]);

  const sendMessage = async () => {
    const currentSocket = socketRef.current;
    if (!currentSocket || !inputMessage.trim()) {
      console.log('❌ Cannot send: no socket or empty message');
      return;
    }

    try {
      const messageToSend = inputMessage.trim();
      console.log('📤 Sending message:', messageToSend);
      
      setIsSending(true);
      setInputMessage('');
      
      currentSocket.emit('send_message', { message: messageToSend }, (response) => {
        setIsSending(false);
        console.log('📩 Send message callback response:', response);
        
        if (response?.success) {
          setError(null);
          console.log('✅ Message sent successfully');
        } else {
          const errorMsg = response?.error || 'No response from server';
          setError(errorMsg);
          console.error('❌ Failed to send message:', response);
          setInputMessage(messageToSend);
        }
      });

    } catch (error) {
      console.error('🚨 Error sending message:', error);
      setError('Error sending message: ' + error.message);
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="chat-container">
        <div className="loading">Подключение к чату...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Чат</h2>
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢' : '🔴'}
          </span>
          <span>{isConnected ? 'Подключено' : 'Отключено'}</span>
          {user && (
            <span className="username">Вы: {user.username}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            Нет сообщений. Будьте первым, кто напишет!
          </div>
        ) : (
          messages.map((message) => (
            <div key={`${message.id}-${message.timestamp}`} className="message">
              <span className="message-username">{message.username}:</span>
              <span className="message-content">{message.content}</span>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          disabled={!isConnected || isSending}
          className="message-input"
        />
        <button 
          onClick={sendMessage} 
          disabled={!isConnected || !inputMessage.trim() || isSending}
          className="send-button"
        >
          {isSending ? '⏳' : 'Отправить'}
        </button>
      </div>
    </div>
  );
};

export default Chat;