import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from '../../components/loadingScreen/LoadingScreen'; 

const ChatHistoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ChatTile = styled.div`
  width: 300px;
  padding: 20px;
  margin: 10px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }
`;

const ChatHistoryPage = () => {
  const [userId, setUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.post("/api/v1/users/protectedRoute", {}, {
          withCredentials: true,
        });

        const fetchedUserId = response.data.data;
        setUserId(fetchedUserId);
      } catch (error) {
        setIsLoading(false); 
        console.error("Error fetching userId:", error);
        setError("Failed to fetch user ID.");
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!userId) return; 

        const response = await axios.get(`/api/v1/chats/user/${userId}`, {
          withCredentials: true,
        });

        const fetchedChats = response.data;
        setChats(fetchedChats);
        setIsLoading(false); 
      } catch (error) {
        setIsLoading(false); 
        console.error("Error fetching chats:", error);
        setError("Failed to fetch chats.");
      }
    };

    if (userId) {
      fetchChats();
    }
  }, [userId]);

  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <ChatHistoryWrapper>
          <h2>Chat History</h2>
          {error ? (
            <p>Error: {error}</p>
          ) : chats.length === 0 ? (
            <p>No chats found.</p>
          ) : (
            chats.map((chat) => (
              <Link key={chat.chatId} to={`/chat/${chat.chatId}`} style={{ textDecoration: 'none' }}>
                <ChatTile>
                  <h3>Chat with {chat.name}</h3>
                  <p>Regarding: {chat.productName}</p>
                </ChatTile>
              </Link>
            ))
          )}
        </ChatHistoryWrapper>
      )}
    </>
  );
};

export default ChatHistoryPage;
