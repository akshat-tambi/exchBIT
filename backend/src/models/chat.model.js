import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    messages: [
        {
            from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
        }
    ]
}, { timestamps: true });

chatSchema.index({ product: 1, owner: 1, user: 1 }, { unique: true });

const Chat = mongoose.model('Chat', chatSchema);

export { Chat };
