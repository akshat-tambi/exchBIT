import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import { Chat } from './models/chat.model.js';
import { User } from './models/user.model.js';
import { Notification } from './models/notification.model.js';
import { Product } from './models/products.model.js';
import { Request } from './models/request.model.js';

// const redisClient = createClient();

// redisClient.on('error', (err) => console.log('Redis Client Error', err));
// await redisClient.connect();

const wss = new WebSocketServer({ noServer: true });

const rooms = new Map();

wss.on('connection', async (ws) => {
    ws.on('message', async (message) => {
        const parsedMessage = JSON.parse(message);

        switch (parsedMessage.type) {
            case 'INITIATE_CHAT':
                {
                    const { productId, userId } = parsedMessage;
                    const prod= await Product.findById(productId);
                    const ownerId=prod.user;
                   
                    let chat = await Chat.findOne({ product: productId, owner: ownerId, user: userId });
                    
                    if(chat) { return; }
                    else 
                    {
                        chat = new Chat({
                            product: productId,
                            owner: ownerId,
                            user: userId,
                            messages: []
                        });
                        await chat.save();

                        // add chatId
                        await User.findByIdAndUpdate(ownerId, { $push: { chats: chat._id } });
                        await User.findByIdAndUpdate(userId, { $push: { chats: chat._id } });
                        
                        const roomKey = chat._id.toString();
                        rooms.set(roomKey, new Set());
                        rooms.get(roomKey).add(ws);
                        ws.roomKey = roomKey;

                        ws.send(JSON.stringify({ type: 'CHAT_INITIATED', chatId: roomKey, messages: chat.messages }));
                    }  
                    break;
                }

            case 'CHAT_MESSAGE':
                {
                    const { chatId, from, message: msg } = parsedMessage;

                    let chat = await Chat.findById(chatId);
                    if (!chat) {
                        console.error('Chat not found');
                        return;
                    }

                    // handle room not existing
                    const roomKey = chat._id.toString();
                    if (!rooms.has(roomKey)) {
                        rooms.set(roomKey, new Set());
                       
                        // adding ws client to the room
                        rooms.get(roomKey).add(ws);
                        ws.roomKey = roomKey;
                    }

                    // save msg
                    const chatMessage = { from, message: msg, timestamp: new Date() };
                    chat.messages.push(chatMessage);
                    await chat.save();

                    // send msg to all clients
                    rooms.get(roomKey).forEach(client => {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify({ type: 'CHAT_MESSAGE', chatId, chatMessage }));
                        }
                    });
                    break;
                }

                case 'ACCEPT_REQUEST':
                    {
                        const acceptedRequest = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'accepted' }, { new: true });
                        if (!acceptedRequest) {
                            console.error('Request not found');
                            return;
                        }
                
                        // product status
                        await Product.findByIdAndUpdate(acceptedRequest.product, { status: true });
                
                        // add to cart
                        const user = await User.findById(acceptedRequest.buyer);
                        user.cart.push(acceptedRequest.product);
                        await user.save();
                
                        //remove req
                        await User.findByIdAndUpdate(acceptedRequest.buyer, { $pull: { outgoingRequests: acceptedRequest._id } });
                        await User.findByIdAndUpdate(acceptedRequest.owner, { $pull: { incomingRequests: acceptedRequest._id } });
                
                        // auto reject req
                        const otherRequests = await Request.find({ product: acceptedRequest.product, status: 'pending' });
                        for (const req of otherRequests) {
                            await Request.findByIdAndUpdate(req._id, { status: 'rejected' });
                            await User.findByIdAndUpdate(req.buyer, { $pull: { outgoingRequests: req._id } });
                            await User.findByIdAndUpdate(req.owner, { $pull: { incomingRequests: req._id } });
                            const rejectionMessage = `Your request for the product has been rejected`;
                            const rejectionNotification = new Notification({ user: req.buyer, message: rejectionMessage });
                            await rejectionNotification.save();
                            await User.findByIdAndUpdate(req.buyer, { $push: { notif: rejectionNotification._id } });
                        }

                        // clear prod req array
                        await Product.findByIdAndUpdate(acceptedRequest.product, { requests: [] });

                        // notify
                        const notificationMessage = `Your request for the product has been accepted`;
                        const notification = new Notification({ user: acceptedRequest.buyer, message: notificationMessage });
                        await notification.save();
                        await User.findByIdAndUpdate(acceptedRequest.buyer, { $push: { notif: notification._id } });

                        break;
                    }
                
                case 'REJECT_REQUEST':
                    {
                        const rejectedRequest = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'rejected' }, { new: true });
                        if (!rejectedRequest) {
                            console.error('Request not found');
                            return;
                        }
                
                        // remove req
                        await User.findByIdAndUpdate(rejectedRequest.buyer, { $pull: { outgoingRequests: rejectedRequest._id } });
                        await Product.findByIdAndUpdate(rejectedRequest.product, { $pull: { requests: rejectedRequest._id } });
                        await User.findByIdAndUpdate(rejectedRequest.owner, { $pull: { incomingRequests: rejectedRequest._id } });
                
                        // notify
                        const rejectionMessage = `Your request for the product has been rejected`;
                        const rejectionNotification = new Notification({ user: rejectedRequest.buyer, message: rejectionMessage });
                        await rejectionNotification.save();
                        await User.findByIdAndUpdate(rejectedRequest.buyer, { $push: { notif: rejectionNotification._id } });
                        break;
                    }
                
                case 'REQUEST_REQUEST':
                    {
                        const product = await Product.findById(parsedMessage.productId);
                        if (!product) {
                            console.error('Product not found');
                            return;
                        }
                
                        if (product.status) {
                            console.error('Request cannot be sent, product is sold');
                            return;
                        }
                
                        const request = new Request({
                            owner: product.user,
                            buyer: parsedMessage.from,
                            product: parsedMessage.productId
                        });
                        await request.save();
                
                        // add request to arrays
                        await User.findByIdAndUpdate(parsedMessage.from, { $push: { outgoingRequests: request._id } });
                        await Product.findByIdAndUpdate(parsedMessage.productId, { $push: { requests: request._id } });
                        await User.findByIdAndUpdate(product.user, { $push: { incomingRequests: request._id } });
                
                        // notify
                        const requestNotificationMessage = `You have received a request for your product`;
                        const requestNotification = new Notification({ user: product.user, message: requestNotificationMessage });
                        await requestNotification.save();
                        await User.findByIdAndUpdate(product.user, { $push: { notif: requestNotification._id } });
                        break;
                    }
                
                case 'CANCEL_DEAL_OWNER':
                    {
                        const request = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'cancelled' }, { new: true });
                        if (!request) {
                            console.error('Request not found');
                            return;
                        }
                
                        // upd prod status
                        const product = await Product.findByIdAndUpdate(request.product, { status: false });
                        if (!product) {
                            console.error('Product not found');
                            return;
                        }
                
                        // remove from cart
                        const user = await User.findByIdAndUpdate(request.buyer, { $pull: { cart: request.product } });
                        if (!user) {
                            console.error('User not found');
                            return;
                        }
                
                        // notify
                        const dealCancellationMessageByOwner = `The deal for the product has been cancelled by the owner`;
                        const dealCancellationNotificationByOwner = new Notification({ user: request.buyer, message: dealCancellationMessageByOwner });
                        await dealCancellationNotificationByOwner.save();
                        await User.findByIdAndUpdate(request.buyer, { $push: { notif: dealCancellationNotificationByOwner._id } });
                        break;
                    }
                
                case 'CANCEL_DEAL_USER':
                    {
                        const request = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'cancelled' }, { new: true });
                        if (!request) {
                            console.error('Request not found');
                            return;
                        }
                
                        // upd prod status
                        const product = await Product.findByIdAndUpdate(request.product, { status: false });
                        if (!product) {
                            console.error('Product not found');
                            return;
                        }
                
                        // remove from cart
                        const user = await User.findByIdAndUpdate(request.buyer, { $pull: { cart: request.product } });
                        if (!user) {
                            console.error('User not found');
                            return;
                        }
                
                        // notify
                        const dealCancellationMessageByUser = `The deal for your product has been cancelled by the user`;
                        const dealCancellationNotificationByUser = new Notification({ user: product.user, message: dealCancellationMessageByUser });
                        await dealCancellationNotificationByUser.save();
                        await User.findByIdAndUpdate(product.user, { $push: { notif: dealCancellationNotificationByUser._id } });
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

export { wss};//, redisClient };




