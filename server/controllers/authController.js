import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ── GET current user profile ──────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPDATE profile (name, phone, rollNo, college, etc.) ───────────
export const updateUserProfile = async (req, res) => {
  try {
    const {
      name, phone, rollNo, college,
      department, year, division, bio,
      linkedin, github,
      currentPassword, newPassword
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update basic fields
    if (name)       user.name       = name.trim();
    if (phone)      user.phone      = phone.trim();
    if (rollNo)     user.rollNo     = rollNo.trim();
    if (college)    user.college    = college.trim();
    if (department) user.department = department.trim();
    if (year)       user.year       = year.trim();
    if (division)   user.division   = division.trim();
    if (bio !== undefined)      user.bio      = bio.trim();
    if (linkedin !== undefined) user.linkedin = linkedin.trim();
    if (github !== undefined)   user.github   = github.trim();

    // Change password if requested
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });
      if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    // Return updated user (without password)
    const updated = await User.findById(req.user.id).select("-password");
    res.json({ message: "Profile updated successfully", user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── GET ALL USERS (Admin) ──────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── UPLOAD AVATAR ─────────────────────────────────────────────────
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const avatarPath = req.file.path;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarPath },
      { new: true }
    ).select("-password");

    res.json({ message: "Avatar updated!", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword, role: "student" });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};