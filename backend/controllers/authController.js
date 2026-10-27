const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTPViaMSG91 } = require("../services/msg91Service");

// ==========================================
// GENERATE OTP
// ==========================================
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ==========================================
// GENERATE JWT TOKEN
// ==========================================
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ==========================================
// SEND OTP
// Development mode:
// - DEV_OTP_MODE=true -> OTP printed in terminal
// - DEV_OTP_MODE=false -> OTP sent through MSG91
// ==========================================
const sendOTP = async (mobileNumber, otp, email, type) => {
  if (process.env.DEV_OTP_MODE === "true") {
    console.log(
      `DEVELOPMENT ${type} OTP for ${email}: ${otp}`
    );

    return {
      success: true,
      developmentMode: true,
    };
  }

  await sendOTPViaMSG91(mobileNumber, otp);

  return {
    success: true,
    developmentMode: false,
  };
};

// ==========================================
// REGISTER USER
// ==========================================
const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      password,
      currentCibilScore,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !mobileNumber ||
      !password ||
      currentCibilScore === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    const cleanedMobileNumber = String(mobileNumber).replace(
      /\D/g,
      ""
    );

    if (!/^[6-9]\d{9}$/.test(cleanedMobileNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid 10-digit Indian mobile number.",
      });
    }

    const score = Number(currentCibilScore);

    if (!Number.isInteger(score) || score < 300 || score > 900) {
      return res.status(400).json({
        success: false,
        message: "CIBIL score must be between 300 and 900.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();

    const otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: cleanedMobileNumber,
      password: hashedPassword,
      currentCibilScore: score,
      isEmailVerified: false,
      otp,
      otpExpiresAt,
    });

    try {
      await sendOTP(
        cleanedMobileNumber,
        otp,
        normalizedEmail,
        "REGISTRATION"
      );
    } catch (smsError) {
      console.error(
        "Registration OTP failed:",
        smsError.message
      );

      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message:
          "Account could not be created because the OTP could not be sent. Please try again.",
      });
    }

    console.log(
      `Registration OTP generated for ${normalizedEmail}`
    );

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully. OTP sent to your mobile number.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        currentCibilScore: user.currentCibilScore,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
      error: error.message,
    });
  }
};

// ==========================================
// VERIFY REGISTRATION OTP
// ==========================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message:
          "No active OTP found. Please request a new OTP.",
      });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    if (String(otp).trim() !== String(user.otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account verified successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        currentCibilScore: user.currentCibilScore,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP.",
      error: error.message,
    });
  }
};

// ==========================================
// RESEND REGISTRATION OTP
// ==========================================
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "This account is already verified.",
      });
    }

    if (!user.mobileNumber) {
      return res.status(400).json({
        success: false,
        message:
          "No mobile number is associated with this account.",
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    try {
      await sendOTP(
        user.mobileNumber,
        otp,
        normalizedEmail,
        "REGISTRATION RESEND"
      );
    } catch (smsError) {
      console.error(
        "Resend registration OTP failed:",
        smsError.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the new OTP. Please try again.",
      });
    }

    console.log(
      `New registration OTP sent to ${normalizedEmail}`
    );

    return res.status(200).json({
      success: true,
      message:
        "A new OTP has been sent to your mobile number.",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to resend OTP.",
      error: error.message,
    });
  }
};

// ==========================================
// LOGIN
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your account before logging in.",
      });
    }

    if (!user.mobileNumber) {
      return res.status(400).json({
        success: false,
        message:
          "No mobile number is associated with this account.",
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    await user.save();

    try {
      await sendOTP(
        user.mobileNumber,
        otp,
        normalizedEmail,
        "LOGIN"
      );
    } catch (smsError) {
      console.error(
        "Login OTP failed:",
        smsError.message
      );

      user.otp = null;
      user.otpExpiresAt = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Unable to send login OTP. Please try again.",
      });
    }

    console.log(
      `Login OTP sent to ${normalizedEmail}`
    );

    return res.status(200).json({
      success: true,
      message:
        "Login OTP sent to your mobile number.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        currentCibilScore: user.currentCibilScore,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
      error: error.message,
    });
  }
};

// ==========================================
// VERIFY LOGIN OTP
// ==========================================
const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "No active login OTP found.",
      });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please login again.",
      });
    }

    if (String(otp).trim() !== String(user.otp).trim()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        currentCibilScore: user.currentCibilScore,
      },
    });
  } catch (error) {
    console.error(
      "Login OTP Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to verify login OTP.",
      error: error.message,
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(
      req.user._id
    ).select("-password -otp -otpExpiresAt");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PROFILE
// ==========================================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.userId;

    const { fullName, mobileNumber } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Full name is required.",
      });
    }

    const cleanedMobileNumber = String(
      mobileNumber || ""
    ).replace(/\D/g, "");

    if (
      cleanedMobileNumber &&
      !/^[6-9]\d{9}$/.test(cleanedMobileNumber)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a valid 10-digit Indian mobile number.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.fullName = fullName.trim();

    if (cleanedMobileNumber) {
      user.mobileNumber = cleanedMobileNumber;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        currentCibilScore: user.currentCibilScore,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  registerUser,
  verifyOTP,
  resendOTP,
  loginUser,
  verifyLoginOTP,
  getProfile,
  updateProfile,
};