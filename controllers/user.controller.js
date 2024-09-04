import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "something want wrong...",
                success: false
            });
        }
        const existEmail = await User.findOne({ email })
        if (existEmail) {
            return res.status(400).json({
                message: "User already exists",
                success: false
            });
        }
        const hashPassword = await bcrypt.hash(password, 12)

        await User.create({
            username,
            email,
            password: hashPassword
        })
        return res.status(201).json({
            message: "Account created successfully...",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "something want wrong...",
                success: false
            });
        }
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }
        const isCorrectPassword = await bcrypt.compare(password, user.password)
        if (!isCorrectPassword) {
            return res.status(400).json({
                message: "Invalid credentials",
                success: false
            });
        }
        user = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            followers: user.followers,
            following: user.following,
            posts: user.posts
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" })
        return res.cookie("token", token).json({
            message: `welcome back ${user.username}`,
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
    }
}

export const logout = async (req, res) => {
    try {
        return res.cookie("token", "").json({
            message: "Logged out successfully...",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id
        const user = await User.findById(userId).select("-password")

        if (!user) {
            return res.status(404).json({
                message: "user not found",
                message: false
            })
        }
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.log(error)
    }
}

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        // Handle profile picture upload if provided
        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        // Find the user by ID
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        // Update user details
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;  // Use secure_url

        // Save the updated user data
        await user.save();

        // Respond with success
        return res.status(200).json({
            message: "Profile updated",
            success: true,
            user
        });
    } catch (error) {
        console.log(error);

        // Respond with error status and message
        return res.status(500).json({
            message: "An error occurred while updating the profile",
            success: false,
            error: error.message
        });
    }
};

export const suggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password").limit(10);
        if (!suggestedUsers) { 
            return res.status(404).json({
                message: "currently do not have any user ",
                success: false
            })
        }
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error)
    }
}

export const followOrUnFollow = async (req, res) => {
    try {
        const userId = req.id; // ID of the logged-in user
        const targetUserId = req.params.id; // ID of the user to follow or unfollow

        if (userId === targetUserId) {
            return res.status(400).json({
                message: "You cannot follow yourself",
                success: false
            });
        }

        const user = await User.findById(userId);
        const targetedUser = await User.findById(targetUserId);

        if (!user || !targetedUser) {
            return res.status(400).json({
                message: "User not found",
                success: false
            });
        }

        const isFollowing = user.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow logic
            await Promise.all([
                User.updateOne({ _id: userId }, { $pull: { following: targetUserId } }),
                User.updateOne({ _id: targetUserId }, { $pull: { followers: userId } })
            ]);

            return res.status(200).json({
                message: `You have unfollowed ${targetedUser.username}`,
                success: true,
                action: "unfollow"
            });
        } else {
            // Follow logic
            await Promise.all([
                User.updateOne({ _id: userId }, { $push: { following: targetUserId } }),
                User.updateOne({ _id: targetUserId }, { $push: { followers: userId } })
            ]);

            return res.status(200).json({
                message: `You are now following ${targetedUser.username}`,
                success: true,
                action: "follow"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};
