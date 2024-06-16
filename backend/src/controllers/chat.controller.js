import { Chat } from '../models/chat.model.js';
import { User } from "../models/user.model.js"; 

export const getChatById = async (chatId, userId) => {
    try {

        const chat = await Chat.findById(chatId)
            .populate('owner', 'username')
            .populate('user', 'username')
            .populate({
                path: 'product',
                select: 'pName'
            });

        if (!chat) {
            throw new Error(`Chat with ID ${chatId} not found.`);
        }

        const { product, owner, user, messages } = chat;

        const formattedMessages = messages.map(msg => ({
            message: msg.message,
            from: msg.from
        }));

        let ownerName;
        if (owner._id.toString() === userId.toString()) {
            ownerName = user.username;
        } else {
            ownerName = owner.username;
        }

        return {
            productName: product.pName,
            name: ownerName,
            messages: formattedMessages
        };
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

        const chats = await Promise.all(user.chats.map(async (chat) => {
            const chatData = await Chat.findById(chat._id)
                .populate('owner', 'username')
                .populate('user', 'username')
                .populate({
                    path: 'product',
                    select: 'pName'
                });

            if (!chatData) {
                throw new Error(`Chat with ID ${chat._id} not found.`);
            }

            const { product, owner, user: chatUser } = chatData;

            const name = owner._id.toString() === userId.toString() ? chatUser.username : owner.username;

            return {
                name: name,
                productName: product.pName,
                chatId: chat._id
            };
        }));

        return chats;
    } catch (error) {
        throw new Error(`Error retrieving chats for user from User collection: ${error.message}`);
    }
};
