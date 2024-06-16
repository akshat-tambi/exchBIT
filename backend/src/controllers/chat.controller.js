import { Chat } from '../models/chat.model.js';
import { User } from "../models/user.model.js"; 

export const getChatById = async (chatId) => {
    try {
        const chat = await Chat.findById(chatId).populate('owner', 'username').populate('user', 'username');
        
        if (!chat) {
            throw new Error(`Chat with ID ${chatId} not found.`);
        }

        return chat;
    } catch (error) {
        throw new Error(`Error retrieving chat: ${error.message}`);
    }
};

export const getChatsForUserFromUserCollection = async (userId) => {
    try {
        const user = await User.findById(userId).populate('chats');

        if (!user) {
            throw new Error(`User with ID ${userId} not found.`);
        }

        const chatIds = user.chats.map(chat => chat._id);

        const chats = await Promise.all(chatIds.map(chatId => getChatById(chatId)));

        return chats;
    } catch (error) {
        throw new Error(`Error retrieving chats for user from User collection: ${error.message}`);
    }
};