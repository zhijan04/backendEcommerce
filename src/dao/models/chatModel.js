const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    user: String,
    message: String
    
}, {
    timestamps: true 
});

const ChatMessage = mongoose.model('messages', chatSchema);

module.exports = ChatMessage;