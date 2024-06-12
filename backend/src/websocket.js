import { WebSocketServer } from 'ws';
import { createClient } from 'redis';
import { Chat } from './models/chat.model.js';
import { User } from './models/user.model.js';
import { Notification } from './models/notification.model.js';
import { Product } from './models/products.model.js';
import { Request } from './models/request.model.js';
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
                
                // to receiver's chat array
                await User.findByIdAndUpdate(parsedMessage.to, { $push: { chats: chatMessage._id } });

                // message to other clients
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(chatMessage));
                    }
                });
                break;
                
                case 'ACCEPT_REQUEST':
    {
        // accept
        const acceptedRequest = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'accepted' }, { new: true });
        if (!acceptedRequest) {
            console.error('Request not found');
            return;
        }

        // clear product's requests array
        await Product.findByIdAndUpdate(acceptedRequest.product, { requests: [] });

        // mark product-status
        await Product.findByIdAndUpdate(acceptedRequest.product, { status: true });

        // add product to cart
        const user = await User.findById(acceptedRequest.buyer);
        user.cart.push(acceptedRequest.product);
        await user.save();

        // remove the request 
        await User.findByIdAndUpdate(acceptedRequest.buyer, { $pull: { outgoingRequests: acceptedRequest._id } });

        // remove the request 
        await User.findByIdAndUpdate(acceptedRequest.owner, { $pull: { incomingRequests: acceptedRequest._id } });

        //notify
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

        // remove
        await User.findByIdAndUpdate(rejectedRequest.buyer, { $pull: { outgoingRequests: rejectedRequest._id } });

        // remove
        await Product.findByIdAndUpdate(rejectedRequest.product, { $pull: { requests: rejectedRequest._id } });

        // remove
        await User.findByIdAndUpdate(rejectedRequest.owner, { $pull: { incomingRequests: rejectedRequest._id } });

        // notify
        const rejectionMessage = `Your request for the product has been rejected`;
        const rejectionNotification = new Notification({ user: rejectedRequest.buyer, message: rejectionMessage });
        await rejectionNotification.save();
        await User.findByIdAndUpdate(rejectedRequest.buyer, { $push: { notif: rejectionNotification._id } });
        break;
    }

    case 'REQUEST_REQUEST':
        const product = await Product.findById(parsedMessage.productId);
        const request = new Request({
            owner: product.user,
            buyer: parsedMessage.from,
            product: parsedMessage.productId
        });
        await request.save();
    
        // add
        await User.findByIdAndUpdate(parsedMessage.from, { $push: { outgoingRequests: request._id } });
    
        //add
        await Product.findByIdAndUpdate(parsedMessage.productId, { $push: { requests: request._id } });
    
        // add
        await User.findByIdAndUpdate(product.user, { $push: { incomingRequests: request._id } });
    
        // notify
        const requestNotificationMessage = `You have received a request for your product`;
        const requestNotification = new Notification({ user: product.user, message: requestNotificationMessage });
        await requestNotification.save();
        await User.findByIdAndUpdate(product.user, { $push: { notif: requestNotification._id } });
        break;
    

    case 'CANCEL_DEAL_OWNER':
    {   
        const request = await Request.findByIdAndUpdate(parsedMessage.requestId, { status: 'cancelled' }, { new: true });
        if (!request) {
            console.error('Request not found');
            return;
        }

        // updating the product status
        const product = await Product.findByIdAndUpdate(request.product, { status: false });
        if (!product) {
            console.error('Product not found');
            return;
        }

        // remove the product
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

        // remove
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
});

export { wss, redisClient };
