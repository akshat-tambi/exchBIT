// routes/chat.routes.js
import express from 'express';
import { getChatById, getChatsForUserFromUserCollection } from '../controllers/chat.controller.js';

const router = express.Router();

router.get('/:chatId', async (req, res) => {
    const { chatId } = req.params;

    try {
        const chat = await getChatById(chatId);
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const chats = await getChatsForUserFromUserCollection(userId);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
