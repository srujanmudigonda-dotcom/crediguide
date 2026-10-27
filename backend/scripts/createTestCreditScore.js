const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const CreditScore = require("../models/CreditScore");

dotenv.config();

const createTestCreditScore = async () => {
  try {
    await connectDB();

    const user = await User.findOne({
      email: "testuser@crediguide.com",
    });

    if (!user) {
      console.log("Test user not found");
      process.exit(1);
    }

    await CreditScore.deleteMany({
      user: user._id,
    });

    const creditScore = await CreditScore.create({
      user: user._id,
      score: 750,
      paymentHistory: 95,
      creditUtilization: 30,
      creditAge: 75,
      creditAccounts: 80,
      source: "Mock Credit Data",
      scoreDate: new Date(),
    });

    console.log("Credit score created successfully");
    console.log({
      id: creditScore._id,
      user: user.email,
      score: creditScore.score,
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating credit score:", error.message);
    process.exit(1);
  }
};

createTestCreditScore();