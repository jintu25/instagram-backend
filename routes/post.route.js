import express from "express"
import { isAuthenticate } from "../middleware/isAuthenticate.js"
import { addComment, addNewPost, bookmarks, dislikePost, getAllPosts, getCommentOfPost, getUserPosts, likePost, postDelete } from "../controllers/post.controller.js"
const router = express.Router()
import upload from "../middleware/multer.js"

router.route("/addpost").post(isAuthenticate, upload.single("image"), addNewPost)
router.route("/allpost").get(isAuthenticate, getAllPosts)
router.route("/userpost/all").get(isAuthenticate, getUserPosts)
router.route("/:id/like").get(isAuthenticate, likePost)
router.route("/:id/dislike").get(isAuthenticate, dislikePost)
router.route("/:id/comment").post(isAuthenticate, addComment)
router.route("/:id/comment/all").get(isAuthenticate, getCommentOfPost)
router.route("/delete/:id").delete(isAuthenticate, postDelete)
router.route("/:id/bookmark").post(isAuthenticate, bookmarks)

export default router