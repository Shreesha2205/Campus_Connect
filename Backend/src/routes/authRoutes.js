import express from "express";
import { registerUser, loginUser,updateProfile,getProfile } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);
router.get("/profile", protect, getProfile);
export default router;