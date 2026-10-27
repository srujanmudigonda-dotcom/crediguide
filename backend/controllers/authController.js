const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTP: dispatchSMSOTP } = require("../services/smsService");

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
// Delegates to the SMS dispatcher
// (services/smsService.js):
// - DEV_OTP_MODE=true -> OTP printed in terminal
// - DEV_OTP_MODE=false -> real SMS via SMS_PROVIDER
//   (fast2sms by default, msg91 legacy)
// ==========================================
const sendOTP = async (mobileNumber, otp, email, type) => {
  const result = await dispatchSMSOTP(mobileNumber, otp);

  if (result.developmentMode) {
    console.log(
      `DEVELOPMENT ${type} OTP for ${email}: ${otp}`
    );
  }

  return result;
};

// ==========================================
// FIND USER BY IDENTIFIER
// Login and password reset accept either the
// account email or the registered mobile number.
// ==========================================
const findUserByIdentifier = async (identifier) => {
  const value = String(identifier || "").trim();

  if (!value) {
    return null;
  }

  if (value.includes("@")) {
    return User.findOne({
      email: value.toLowerCase(),
    });
  }

  const cleanedMobileNumber = value.replace(/\D/g, "");

  // Accept numbers typed with the 91 country code too.
  const tenDigit = cleanedMobileNumber.length > 10
    ? cleanedMobileNumber.slice(-10)
    : cleanedMobileNumber;

  if (tenDigit) {
    return User.findOne({ mobileNumber: tenDigit });
  }

  return null;
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
      // The user has just proved ownership of the account with the
      // OTP, so log them straight in instead of sending them back
      // to the login page.
      token: generateToken(user._id),
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
// Email or mobile number + the password set at
// registration. OTP is not asked again here:
// it verifies registration and password resets.
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { identifier, email, mobileNumber, password } = req.body;

    const loginIdentifier = identifier || email || mobileNumber;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide your email or mobile number and password.",
      });
    }

    const user = await findUserByIdentifier(loginIdentifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your account with the OTP sent to your mobile number before logging in.",
        requiresRegistrationVerification: true,
        email: user.email,
      });
    }

    // Clear any stale OTP left over from earlier flows.
    if (user.otp || user.otpExpiresAt) {
      user.otp = null;
      user.otpExpiresAt = null;

      await user.save();
    }

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
// FORGOT PASSWORD - REQUEST OTP
// Sends a one-time password to the registered
// mobile number by SMS.
// ==========================================
const forgotPassword = async (req, res) => {
  try {
    const { identifier, email, mobileNumber } = req.body;

    const loginIdentifier = identifier || email || mobileNumber;

    if (!loginIdentifier) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide your email or mobile number.",
      });
    }

    const user = await findUserByIdentifier(loginIdentifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found for the given details.",
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
        user.email,
        "PASSWORD RESET"
      );
    } catch (smsError) {
      console.error(
        "Password reset OTP failed:",
        smsError.message
      );

      user.otp = null;
      user.otpExpiresAt = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the password reset OTP. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "An OTP has been sent to your registered mobile number.",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to process the password reset request.",
      error: error.message,
    });
  }
};

// ==========================================
// RESET PASSWORD - VERIFY OTP AND SET NEW
// ==========================================
const resetPassword = async (req, res) => {
  try {
    const {
      identifier,
      email,
      mobileNumber,
      otp,
      newPassword,
    } = req.body;

    const loginIdentifier = identifier || email || mobileNumber;

    if (!loginIdentifier || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide your details, the OTP and a new password.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 6 characters.",
      });
    }

    const user = await findUserByIdentifier(loginIdentifier);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found for the given details.",
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

    user.password = await bcrypt.hash(String(newPassword), 10);
    user.otp = null;
    user.otpExpiresAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset the password.",
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
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
};