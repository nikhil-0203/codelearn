import express from "express";
import {
  registerUser, loginUser, getAllUsers,
  getUserProfile, updateUserProfile, uploadAvatar as uploadAvatarCtrl,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { uploadAvatar } from "../config/cloudinary.js";

const router = express.Router();

// Public
router.post("/register", registerUser);
router.post("/login",    loginUser);

// Student
router.get("/profile",  protect, getUserProfile);
router.put("/profile",  protect, updateUserProfile);
router.post("/avatar",  protect, uploadAvatar.single("avatar"), uploadAvatarCtrl);

// Admin
router.get("/users", protect, adminOnly, getAllUsers);

export default router;