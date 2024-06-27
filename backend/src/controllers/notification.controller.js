import { User } from "../models/user.model.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import {Notification} from "../models/notification.model.js" ;

export const sendNotification = asyncHandler(async (userId, message) => {
    const notification = new Notification({ user: userId, message });
    await notification.save();

    await User.findByIdAndUpdate(userId, { $push: { notif: notification._id } });
});

export const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId).populate('notif');
        const notifications = user.notif; 

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while fetching notifications" });
    }
});
