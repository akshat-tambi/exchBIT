import { Chat } from '../models/chat.model.js';
import { User } from '../models/user.model.js';

export const getChatHistory = async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    try {
        // current user
        const currentUser = await User.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: 'Current user not found' });
        }

        // chat IDs from the user's chat array
        const chatIds = currentUser.chats;

        // chat history using the chat IDs
        const chatHistory = await Chat.find({
            _id: { $in: chatIds },
            $or: [
                { from: currentUserId, to: userId },
                { from: userId, to: currentUserId }
            ]
        }).sort({ timestamp: 1 });

        res.status(200).json({ success: true, chatHistory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching chat history' });
    }
};
