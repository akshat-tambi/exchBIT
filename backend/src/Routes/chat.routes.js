// routes/chat.routes.js
import express from 'express';
import { getChatById, getChatsForUserFromUserCollection } from '../controllers/chat.controller.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/:chatId', verifyJWT, async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body; // i will send in request body as {"userId": "34uhhuhu"}

    try {
        const chat = await getChatById(chatId, userId);
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/user/:userId', verifyJWT, async (req, res) => {
    const { userId } = req.params;

    try {
        const chats = await getChatsForUserFromUserCollection(userId);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
