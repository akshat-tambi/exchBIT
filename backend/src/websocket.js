import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import { Chat } from './models/chat.model.js';
import { User } from './models/user.model.js';

const redisClient = createClient();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
await redisClient.connect();

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'CHAT_MESSAGE':

                // to MongoDB
                const chatMessage = new Chat({
                    from: parsedMessage.from,
                    to: parsedMessage.to,
                    message: parsedMessage.message,
                    timestamp: new Date(),
                });
                await chatMessage.save();
                
                // to Redis 
                const chatKey = `chat:${parsedMessage.from}:${parsedMessage.to}`;
                await redisClient.rPush(chatKey, JSON.stringify(chatMessage));

                //  sender's array
                await User.findByIdAndUpdate(parsedMessage.from, { $push: { chats: chatMessage._id } });
                // Save message to receiver's chat array
                await User.findByIdAndUpdate(parsedMessage.to, { $push: { chats: chatMessage._id } });

                // message to other clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(chatMessage));
                    }
                });
                break;
            default:
                console.log('Unknown message type:', parsedMessage.type);
        }
    });
});

export { wss, redisClient };
