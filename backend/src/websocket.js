import { WebSocketServer } from 'ws';
import { kv } from '@vercel/kv';
import WebSocket from 'ws';


import { Chat } from './models/chat.model.js';
import { User } from './models/user.model.js';
import { Product } from './models/products.model.js';

const rooms = new Map();

const SYNC_INTERVAL_MS = 5 *1000*60;

await kv.set("user_1_session", `${process.env.KV_REST_API_TOKEN}`);
const session = await kv.get("user_1_session");

function broadcastToRoom(roomKey, message) {
    rooms.get(roomKey)?.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// sync kv -> db
async function syncKVToMongo() {
    try {
        for (const [roomKey, clients] of rooms.entries()) {
            const [productId, ownerId, userId] = roomKey.split(':');
            const chatKey = `chat:${roomKey}`;
            const chatMessages = await kv.lrange(chatKey, 0, -1);

            console.log(`Room Key: ${roomKey}, Chat Messages: ${chatMessages.length}`);
            if (chatMessages.length > 0) {
                let chat = await Chat.findOne({ product: productId, owner: ownerId, user: userId });
                if (!chat) {
                    // new chat if not found in the db
                    chat = new Chat({
                        product: productId,
                        owner: ownerId,
                        user: userId,
                        messages: []
                    });
                }

                // push new messages to chat
                const parsedMessages = chatMessages.map(msg => {
                    try {
                        console.log('Original Message:', msg);
                        return typeof msg === 'string' ? JSON.parse(msg) : msg;
                    } catch (e) {
                        console.error(`Failed to parse message: ${msg}`, e);
                        return null;
                    }
                }).filter(msg => msg !== null);

                console.log('Parsed Messages:', parsedMessages);

                chat.messages.push(...parsedMessages);
                await chat.save();

                // clear kv
                await kv.del(chatKey);
            }
        }

        console.log('KV data synced to MongoDB');
    } catch (error) {
        console.error('Error syncing KV data to MongoDB:', error);
    }
}

// periodic sync
const syncInterval = setInterval(syncKVToMongo, SYNC_INTERVAL_MS);

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (ws) => {
    ws.on('message', async (message) => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'INITIATE_CHAT': {
                try {
                    const { productId, userId } = parsedMessage;
                    const prod = await Product.findById(productId);
                    const ownerId = prod.user;
                    const roomKey = `${productId}:${ownerId}:${userId}`;

                    let chat = await Chat.findOne({ product: productId, owner: ownerId, user: userId });

                    if (chat || rooms.has(roomKey)) {
                        const chatMessages = await kv.lrange(`chat:${roomKey}`, 0, -1);
                        ws.send(JSON.stringify({ type: 'CHAT_INITIATED', chatId: chat._id, messages: chatMessages.map(msg => typeof msg === 'string' ? JSON.parse(msg) : msg) || [] }));
                        return;
                    }

                    chat = new Chat({
                        product: productId,
                        owner: ownerId,
                        user: userId,
                        messages: []
                    });
                    await chat.save();

                    if (!rooms.has(roomKey)) {
                        rooms.set(roomKey, new Set());
                    }

                    rooms.get(roomKey).add(ws);
                    ws.roomKey = roomKey;

                    await User.findByIdAndUpdate(ownerId, { $push: { chats: chat._id } });
                    await User.findByIdAndUpdate(userId, { $push: { chats: chat._id } });

                    const chatMessages = await kv.lrange(`chat:${roomKey}`, 0, -1);
                    ws.send(JSON.stringify({ type: 'CHAT_INITIATED', chatId: chat._id, messages: chatMessages.map(msg => typeof msg === 'string' ? JSON.parse(msg) : msg) || [] }));

                } catch (error) {
                    console.log("Error handling INITIATE_CHAT:", error);
                }
                break;
            }

            case 'JOIN_ROOM': {
                try {
                    const { chatId } = parsedMessage;
                    const chat = await Chat.findById(chatId);
                    if (!chat) {
                        console.error(`Chat with ID ${chatId} not found`);
                        return;
                    }

                    const roomKey = `${chat.product}:${chat.owner}:${chat.user}`;

                    if (!rooms.has(roomKey)) {
                        rooms.set(roomKey, new Set());
                    }

                    rooms.get(roomKey).add(ws);
                    ws.roomKey = roomKey;

                    console.log(`WebSocket client joined room for chat ID: ${chatId}`);
                    ws.send(JSON.stringify({ type: 'ROOM_JOINED', chatId }));
                } catch (error) {
                    console.error('Error joining room:', error);
                }
                break;
            }

            case 'CHAT_MESSAGE': {
                try {
                    let { chatId, from, message: msg } = parsedMessage;
                    let chat = await Chat.findById(chatId);
                    let roomKey = `${chat.product}:${chat.owner}:${chat.user}`;
            
                    
                    if (!rooms.has(roomKey)) {
                        rooms.set(roomKey, new Set());
                    }
            
                
                    if (!rooms.get(roomKey).has(ws)) {
                        rooms.get(roomKey).add(ws);
                        ws.roomKey = roomKey;
                    }
            
                    const chatMessage = { from, message: msg, timestamp: new Date() };
            
        
                    await kv.rpush(`chat:${roomKey}`, JSON.stringify(chatMessage));
            
        
                    broadcastToRoom(roomKey, { type: 'CHAT_MESSAGE', chatId, chatMessage });
            
        
                    // if (chat) {
                    //     chat.messages.push(chatMessage);
                    //     await chat.save();
                    // }
            
                } catch (error) {
                    console.log("Error handling CHAT_MESSAGE:", error);
                }
                break;
            }
            

            case 'TRIGGER_SAVE': {
                try {
                    await syncKVToMongo();
                    ws.send(JSON.stringify({ type: 'SAVE_TRIGGERED', message: 'KV data synced to MongoDB successfully.' }));
                } catch (error) {
                    console.log("Error handling TRIGGER_SAVE:", error);
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Error syncing KV data to MongoDB.' }));
                }
                break;
            }

            default:
                console.log('Unknown message type:', parsedMessage.type);
        }
    });

    ws.on('close', () => {
        if (ws.roomKey && rooms.has(ws.roomKey)) {
            rooms.get(ws.roomKey).delete(ws);
            if (rooms.get(ws.roomKey).size === 0) {
                rooms.delete(ws.roomKey);
            }
        }
    });
});

wss.on('close', async () => {
    try {
        // sync residual data
        await syncKVToMongo();

        console.log('WebSocket server closed gracefully');
    } catch (error) {
        console.error('Error closing WebSocket server:', error);
    }
});

export { wss, kv };






/*
OLD REDIS FUNC, TBD in future



// case 'ACCEPT_REQUEST':
            //     {
            //     try {
            //         const acceptedRequest = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'accepted' }, { new: true });
            //         if (!acceptedRequest) {
            //             console.error('Request not found');
            //             return;
            //         }

            //         // product status
            //         await Product.findByIdAndUpdate(acceptedRequest.product, { status: true });

            //         // add to cart
            //         const user = await User.findById(acceptedRequest.buyer);
            //         user.cart.push(acceptedRequest.product);
            //         await user.save();

            //         //remove req
            //         await User.findByIdAndUpdate(acceptedRequest.buyer, { $pull: { outgoingRequests: acceptedRequest._id } });
            //         await User.findByIdAndUpdate(acceptedRequest.owner, { $pull: { incomingRequests: acceptedRequest._id } });

            //         // auto reject req
            //         const otherRequests = await Request.find({ product: acceptedRequest.product, status: 'pending' });
            //         for (const req of otherRequests) {
            //             await Request.findByIdAndUpdate(req._id, { status: 'rejected' });
            //             await User.findByIdAndUpdate(req.buyer, { $pull: { outgoingRequests: req._id } });
            //             await User.findByIdAndUpdate(req.owner, { $pull: { incomingRequests: req._id } });
            //             const rejectionMessage = `Your request for the product has been rejected`;
            //             const rejectionNotification = new Notification({ user: req.buyer, message: rejectionMessage });
            //             await rejectionNotification.save();
            //             await User.findByIdAndUpdate(req.buyer, { $push: { notif: rejectionNotification._id } });
            //         }

            //         // clear prod req array
            //         await Product.findByIdAndUpdate(acceptedRequest.product, { requests: [] });

            //         // notify
            //         const notificationMessage = `Your request for the product has been accepted`;
            //         const notification = new Notification({ user: acceptedRequest.buyer, message: notificationMessage });
            //         await notification.save();
            //         await User.findByIdAndUpdate(acceptedRequest.buyer, { $push: { notif: notification._id } });

            //         break;
            //     } catch(error) {console.log(error)};
            //     }
            // case 'REJECT_REQUEST':
            //     {
            //         try {
            //         const rejectedRequest = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'rejected' }, { new: true });
            //         if (!rejectedRequest) {
            //             console.error('Request not found');
            //             return;
            //         }

            //         // remove req
            //         await User.findByIdAndUpdate(rejectedRequest.buyer, { $pull: { outgoingRequests: rejectedRequest._id } });
            //         await Product.findByIdAndUpdate(rejectedRequest.product, { $pull: { requests: rejectedRequest._id } });
            //         await User.findByIdAndUpdate(rejectedRequest.owner, { $pull: { incomingRequests: rejectedRequest._id } });

            //         // notify
            //         const rejectionMessage = `Your request for the product has been rejected`;
            //         const rejectionNotification = new Notification({ user: rejectedRequest.buyer, message: rejectionMessage });
            //         await rejectionNotification.save();
            //         await User.findByIdAndUpdate(rejectedRequest.buyer, { $push: { notif: rejectionNotification._id } });
            //         break;
            //         } catch(error) {console.log(error)};
            //     }

            // case 'REQUEST_REQUEST':
            //     {
            //         try{
            //         const product = await Product.findById(parsedMessage.productId);
            //         if (!product) {
            //             console.error('Product not found');
            //             return;
            //         }

            //         if (product.status) {
            //             console.error('Request cannot be sent, product is sold');
            //             return;
            //         }

            //         const request = new Request({
            //             owner: product.user,
            //             buyer: parsedMessage.from,
            //             product: parsedMessage.productId
            //         });
            //         await request.save();

            //         // add request to arrays
            //         await User.findByIdAndUpdate(parsedMessage.from, { $push: { outgoingRequests: request._id } });
            //         await Product.findByIdAndUpdate(parsedMessage.productId, { $push: { requests: request._id } });
            //         await User.findByIdAndUpdate(product.user, { $push: { incomingRequests: request._id } });

            //         // notify
            //         const requestNotificationMessage = `You have received a request for your product`;
            //         const requestNotification = new Notification({ user: product.user, message: requestNotificationMessage });
            //         await requestNotification.save();
            //         await User.findByIdAndUpdate(product.user, { $push: { notif: requestNotification._id } });
            //         break;
            //         } catch(error) {console.log(error)};
            //     }

            // case 'CANCEL_DEAL_OWNER':
            //     {
            //         {
            //         try
            //         {
            //         const request = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'cancelled' }, { new: true });
            //         if (!request) {
            //             console.error('Request not found');
            //             return;
            //         }

            //         // upd prod status
            //         const product = await Product.findByIdAndUpdate(request.product, { status: false });
            //         if (!product) {
            //             console.error('Product not found');
            //             return;
            //         }

            //         // remove from cart
            //         const user = await User.findByIdAndUpdate(request.buyer, { $pull: { cart: request.product } });
            //         if (!user) {
            //             console.error('User not found');
            //             return;
            //         }

            //         // notify
            //         const dealCancellationMessageByOwner = `The deal for the product has been cancelled by the owner`;
            //         const dealCancellationNotificationByOwner = new Notification({ user: request.buyer, message: dealCancellationMessageByOwner });
            //         await dealCancellationNotificationByOwner.save();
            //         await User.findByIdAndUpdate(request.buyer, { $push: { notif: dealCancellationNotificationByOwner._id } });
            //         break;
            //         } catch(error) {console.log(error)};
            //         }
            //     }

            // case 'CANCEL_DEAL_USER':
            //     {
            //         try{
            //         const request = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'cancelled' }, { new: true });
            //         if (!request) {
            //             console.error('Request not found');
            //             return;
            //         }

            //         // upd prod status
            //         const product = await Product.findByIdAndUpdate(request.product, { status: false });
            //         if (!product) {
            //             console.error('Product not found');
            //             return;
            //         }

            //         // remove from cart
            //         const user = await User.findByIdAndUpdate(request.buyer, { $pull: { cart: request.product } });
            //         if (!user) {
            //             console.error('User not found');
            //             return;
            //         }

            //         // notify
            //         const dealCancellationMessageByUser = `The deal for your product has been cancelled by the user`;
            //         const dealCancellationNotificationByUser = new Notification({ user: product.user, message: dealCancellationMessageByUser });
            //         await dealCancellationNotificationByUser.save();
            //         await User.findByIdAndUpdate(product.user, { $push: { notif: dealCancellationNotificationByUser._id } });
            //         break;
            //         }catch(error) {console.log(error)};
            //     }

*/