import express from 'express';
import { getChatHistory } from '../controllers/chat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/history/:userId', verifyJWT, getChatHistory);

export default router;
