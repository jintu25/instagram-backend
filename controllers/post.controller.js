import Post from "../models/post.model";

export const newPost = async(req, res) => {
    try {
        const {caption} = req.body;
        const image = req.file;
        const authorId = req.id;

        if(!image) return res.status(400).json({message: "image is required"})
        // image upload option work next time
    } catch (error) {
        console.log(error)
    }
}

export const getAllPosts = async(req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
        .populate({ path: 'author', select: "username, profilePicture"})
        populate({
            path: "comments",
            sort: {createdAt: -1},
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