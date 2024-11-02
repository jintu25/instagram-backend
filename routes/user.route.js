import express from "express"
import { editProfile, followOrUnFollow, getFollowersAndFollowing, getProfile, login, logout, register, suggestedUsers } from "../controllers/user.controller.js"
import { isAuthenticate } from "../middleware/isAuthenticate.js"
import upload from "../middleware/multer.js"
const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/:id/profile").get(isAuthenticate, getProfile)
router.route("/profile/edit").post(isAuthenticate, upload.single("profilePicture"), editProfile )
router.route("/suggested").get(isAuthenticate, suggestedUsers)
router.route("/followorunfollow/:id").post(isAuthenticate, followOrUnFollow)
router.route("/followersAndFollowing/:id").get(isAuthenticate, getFollowersAndFollowing)
export default router 
