import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 10px;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  border: 1px solid #ccc;
  margin-bottom: 10px;
`;

const ChatMessage = styled.div`
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
`;

const MyMessage = styled.div`
  background-color: #dcf8c6;
  align-self: flex-end;
`;

const TheirMessage = styled.div`
  background-color: #fff;
  align-self: flex-start;
`;

const ChatInput = styled.div`
  display: flex;
  gap: 10px;
`;

const ChatInputField = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const ChatSendButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
`;

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState(null); 
  const ws = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.post("http://localhost:8000/api/v1/users/protectedRoute", {}, {
          withCredentials: true,
        });

        const fetchedUserId = response.data.data;
        setUserId(fetchedUserId); 
      } catch (error) {
        console.error("Error fetching userId:", error);
      }
    };

    const connectWebSocket = () => {
      ws.current = new WebSocket("ws://localhost:8000");

      ws.current.onopen = () => {
        console.log('WebSocket connection opened');
        
        // Send JOIN_ROOM message when WebSocket connection is established
        if (chatId && userId) {
          ws.current.send(JSON.stringify({ type: 'JOIN_ROOM', chatId }));
        }
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'CHAT_MESSAGE') {
          const { chatMessage } = message;
          setMessages(prevMessages => [...prevMessages, chatMessage]);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    };

    fetchUserId(); 
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [chatId, userId]); 

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      if (userId) {
        ws.current.send(JSON.stringify({ type: 'CHAT_MESSAGE', chatId, from: userId, message: inputMessage }));
        setInputMessage('');
      } else {
        console.error("User ID is not available.");
      }
    }
  };

  return (
    <ChatPageWrapper>
      <h2>Chat Room: {chatId}</h2>
      <ChatMessages>
        {messages.map((msg, index) => (
          <ChatMessage key={index} className={msg.from === userId ? 'my-message' : 'their-message'}>
            <p>{msg.message}</p>
          </ChatMessage>
        ))}
      </ChatMessages>
      <ChatInput>
        <ChatInputField
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <ChatSendButton onClick={handleSendMessage}>Send</ChatSendButton>
      </ChatInput>
    </ChatPageWrapper>
  );
};

export default ChatPage;
