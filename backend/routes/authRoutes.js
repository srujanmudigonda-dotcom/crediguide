const express = require("express");

const {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/status", (req, res) => {
  res.json({
    success: true,
    message: "Authentication API is working",
  });
});

router.post("/register", registerUser);

router.post("/verify-otp", verifyOTP);

router.post("/resend-otp", resendOTP);

router.post("/login", loginUser);

router.post("/verify-login-otp", verifyLoginOTP);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);

router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

module.exports = router;