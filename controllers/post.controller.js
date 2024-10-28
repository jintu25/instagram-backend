import { Comment } from "../models/comment.model.js";
import Post from "../models/post.model.js";
import sharp from "sharp"
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id;

        if(!image) return res.status(400).json({message: "image is required"})
        // Use sharp to resize and convert the image to a buffer
        const optimizeBuffer = await sharp(image.buffer)
            .resize({ height: 800, width: 800, fit: sharp.fit.inside }) // Corrected
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toBuffer();

        // Convert the buffer to a Data URI
        const dataUri = `data:image/jpeg;base64,${optimizeBuffer.toString('base64')}`;

        // Upload the image to Cloudinary
        const cloudResponse = await cloudinary.uploader.upload(dataUri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        })
        const user = await User.findById(authorId)
        if (user) {
            user.posts.push(post._id)
            await user.save()
        }

        await post.populate({ path: "author", select: ("-password") })
        return res.status(201).json({
            message: "new post added",
            success: true,
            post
        })
    } catch (error) {
        console.log(error)
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({ path: 'author', select: "username profilePicture" })
            .populate({
                path: "comments",
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: "author",
                    select: "username profilePicture"
                }
            });

        return res.status(200).json({
            success: true,
            posts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server Error' }); // Add an error response
    }
};


export const getUserPosts = async(req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
        .populate({ path: 'author', select: "username, profilePicture" })
        populate({
            path: "comments",
            sort: { createdAt: -1 },
            populate: {
                path: "author",
                select: "username, profilePicture"
            }
        })
        return res.status(200).json({
            success: true,
            posts
        })
    } catch (error) {
        console.log(error)
    }
}

export const likePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ // Added return to prevent further execution
                message: "Post not found",
                success: false
            });
        }

        await post.updateOne({ $addToSet: { likes: userId } });

        // implement socket io for real time chat application 
        const user = await User.findById(userId).select("username, profilePicture")
        const ownerId = post.author.toString()
        if (user !== ownerId) {
            const notification = {
                userId: userId, // Assuming the post model has an ownerId field
                postId: postId,
                userDetails: user,
                type: "like", // Specify the type of notification
                message: `${user.username} liked your post`, // Assuming req.user contains the user details
            }
            const postOwnerSocketId = getReceiverSocketId(ownerId)
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({ // Added success response
            message: "Post liked",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ // Added error response
            message: "Internal server error",
            success: false
        });
    }
};

export const dislikePost = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ // Added return to prevent further execution
                message: "Post not found",
                success: false
            });
        }

        await post.updateOne({ $pull: { likes: userId } });
        // implement socket io for real time chat application 
        const user = await User.findById(userId).select("username, profilePicture")
        const ownerId = post.author.toString()
        if (user !== ownerId) {
            const notification = {
                userId: userId, // Assuming the post model has an ownerId field
                postId: postId,
                userDetails: user,
                type: "dislike", // Specify the type of notification
                message: `${user.username} dislike your post`, // Assuming req.user contains the user details
            }
            const postOwnerSocketId = getReceiverSocketId(ownerId)
            io.to(postOwnerSocketId).emit('notification', notification);
        }

        return res.status(200).json({ // Added success response
            message: "Post disliked",
            success: true
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ // Added error response
            message: "Internal server error",
            success: false
        });
    }
};
export const addComment = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;
        const { text } = req.body;
        if (!text) res.status(400).json({ message: "comment text required", success: false })
        const post = await Post.findById(postId)
        if (!post) res.status(400).json({ message: "post not found", success: false })
        const comment = await Comment.create({
            text,
            author: userId,
            post: postId
        })
        await comment.populate({
            path: "author",
            select: "username profilePicture"
        })
        post.comments.push(comment._id)
        await post.save()
        return res.status(201).json({
            message: "comment added successfully",
            success: true,
            comment
        })
    } catch (error) {
        console.log(error)
    }
}


export const getCommentOfPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const comments = await Comment.find({ post: postId }).populate({
            path: "author",
            select: "username, profilePicture"
        })
        if (!comments) return res.status(404).json({
            message: "Comment Not Found",
            success: false
        })
        return res.status(200).json({
            success: true,
            comments
        })
    } catch (error) {
        console.log(error)
    }
}

export const postDelete = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId)
        if (!post) return res.status(404).json({ message: "post not found", success: false })
        if (post.author.toString() !== userId) {
            return res.status(403).json({ message: "Unauthorized", success: false })
        }
        await Post.findByIdAndDelete(postId)
        let user = await User.findById(userId)
        user.posts = user.posts.filter(id => id.toString() !== postId)
        await user.save()
        await Comment.deleteMany({ post: postId })
        return res.status(200).json({
            message: "post deleted",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const bookmarks = async (req, res) => {
    try {
        const userId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                message: "post not found",
                success: false
            })
        }
        const user = await User.findById(userId)
        if (user.bookmarks.includes(post._id)) {
            //if already bookmarks add work this concepts
            //remove the bookmarks
            await user.updateOne({ $pull: { bookmarks: post_id } })
            user.save()
            return res.status(200).json({
                type: "unsaved",
                success: true,
                message: "post remove from bookmarks"
            })
        } else {
            // add to bookmarks
            await user.updateOne({ $addToSet: { bookmarks: post_id } })
            user.save()
            return res.status(200).json({
                type: "saved",
                success: true,
                message: "post bookmarks"
            })
        }
    } catch (error) {
        console.log(error)
    }
}