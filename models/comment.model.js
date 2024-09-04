import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Post"
    }
})

export default Comment = mongoose.model("Comment", commentSchema)