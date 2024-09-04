import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true, // Removes whitespace from both ends of the string
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,  // Converts email to lowercase
        match: [/\S+@\S+\.\S+/, 'is invalid']  // Email format validation
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
        maxlength: 150  
    },
    gender: {
        type: String,
        enum : ['male', 'female']
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }]
},
{
    timestamps: true  // Automatically adds createdAt and updatedAt fields
})

const User = mongoose.model('User', userSchema);

export default User;

