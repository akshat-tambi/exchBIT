import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ChatPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20px;
  background-color: #f0f0f0;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fff;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px; /* Increase vertical spacing between messages */
`;

const ChatMessage = styled.div`
  max-width: 70%;
  background-color: ${props => props.isOwnMessage ? '#dcf8c6' : '#e1f0ff'};
  color: black;
  padding: 10px;
  border-radius: 10px;
  word-break: break-word;
  align-self: ${props => props.isOwnMessage ? 'flex-end' : 'flex-start'};
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &::before {
    content: "${props => props.showSender ? (props.isOwnMessage ? 'You:' : props.senderName + ':') : ''}";
    position: absolute;
    top: -18px;
    left: 10px;
    font-size: 12px;
    color: grey;
    white-space: nowrap; /* Ensure the text does not wrap */
  }
`;

const ChatInput = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

const ChatInputField = styled.input`
  flex: 1;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChatSendButton = styled.button`
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  background-color: rgba(83, 178, 172, 1);
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: rgba(83, 178, 172, 0.8);
  }
`;

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [pName, setPName] = useState('');
  const [senderName, setSenderName] = useState('');
  const ws = useRef(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.post("/api/v1/users/protectedRoute", {}, {
          withCredentials: true,
        });

        const fetchedUserId = response.data.data;
        setUserId(fetchedUserId);
      } catch (error) {
        console.error("Error fetching userId:", error);
      }
    };

    const fetchChatHistory = async () => {
      try {
        const response = await axios.post(`/api/v1/chats/${chatId}`, { userId }, {
          withCredentials: true,
        });

        const chatData = response.data;

        setPName(chatData.productName);
        setSenderName(chatData.name);
        setMessages(chatData.messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    const connectWebSocket = () => {
      ws.current = new WebSocket("wss://exchbit.onrender.com");

      ws.current.onopen = () => {
        //console.log('WebSocket connection opened');

        if (chatId && userId) {
          ws.current.send(JSON.stringify({ type: 'JOIN_ROOM', chatId }));
          ws.current.send(JSON.stringify({ type: 'TRIGGER_SAVE' }));
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
        //console.log('WebSocket connection closed'); 
      };
    };
 
    fetchUserId();
    

    setTimeout(() => {
      if (userId) {
        fetchChatHistory();
      }

      setTimeout(()=>{
        connectWebSocket();
      },100)
    }, 100);

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
      <h2>Chat with {senderName}, Product: {pName}</h2>
      <ChatMessages>
        {messages.map((msg, index) => {
          const isOwnMessage = msg.from === userId;
          const showSender = index === 0 || messages[index - 1].from !== msg.from;
          return (
            <ChatMessage key={index} isOwnMessage={isOwnMessage} showSender={showSender} senderName={senderName}>
              <p>{msg.message}</p>
            </ChatMessage>
          );
        })}
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
