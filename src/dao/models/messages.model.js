import mongoose from 'mongoose';
const { Schema } = mongoose;

export const messagesCollection = 'messages'

const messagesSchema = new Schema({
  user: {
    type: String,
    required: true,
    match: /^\S+@\S+\.\S+$/
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  },
});

const MessagesModel = mongoose.model(messagesCollection, messagesSchema);

export default MessagesModel;