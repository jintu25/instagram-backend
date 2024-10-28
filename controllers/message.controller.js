import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { getReceiverSocketId } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const senderId = req.id;  // Sender's ID from authenticated user
        const receiverId = req.params.id;  // Receiver's ID from the URL
        const { message } = req.body;  // Message from the request body
        console.log(message)
        // Check if message is valid and not empty
        if (!message || message.trim() === '') {
            return res.status(400).json({ success: false, message: 'Message content is required.' });
        }

        // Check if a conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('message');

        if (!conversation) {
            // If no conversation exists, create a new one
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        // Create a new message document
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message
        });

        // Push the new message into the conversation's message array
        conversation.message.push(newMessage._id);
        await conversation.save();

        // Socket.io: Notify the receiver about the new message
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId && req.io) {  // Ensure req.io exists
            req.io.to(receiverSocketId).emit('newMessage', newMessage);
        }
        // Return the newly created message
        return res.status(201).json({
            success: true,
            newMessage
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

export const getMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;

        const conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        }).populate('message');

        if (!conversation) {
            return res.status(200).json({ success: true, messages: [] });
        }

        return res.status(200).json({ success: true, messages: conversation.message });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

