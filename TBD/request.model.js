// import mongoose from "mongoose";

// const requestSchema = new mongoose.Schema({
//   owner: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   buyer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   product: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Product',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'accepted', 'rejected'],
//     default: 'pending'
//   }
// }, { timestamps: true });

// export const Request = mongoose.model('Request', requestSchema);
