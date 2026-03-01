import express from "express";
import protect from "../middleware/authMiddleware.js";
import { createPost, getPosts, toggleLike, deletePost } from "../controllers/postController.js";


const router = express.Router();

router.route("/")
  .post(protect, createPost)
  .get(protect, getPosts);
router.put("/:id/like", protect, toggleLike);
router.delete("/:id", protect, deletePost);
export default router;