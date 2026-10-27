const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/User");
const CreditScore = require("./models/CreditScore");

dotenv.config();

const USER_EMAIL = "srujanmudigonda@gmail.com";

const createCreditScore = async () => {
  try {
    await connectDB();

    const user = await User.findOne({
      email: USER_EMAIL,
    });

    if (!user) {
      console.log(`User not found: ${USER_EMAIL}`);
      process.exit(1);
    }

    console.log(`User found: ${user.email}`);
    console.log(`User ID: ${user._id}`);

    const existingScore = await CreditScore.findOne({
      user: user._id,
    });

    if (existingScore) {
      console.log("A credit score already exists for this user.");
      console.log(`Current score: ${existingScore.score}`);
      process.exit(0);
    }

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

    console.log("Credit score created successfully.");
    console.log(`Score: ${creditScore.score}`);
    console.log(`Credit Score ID: ${creditScore._id}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create credit score:");
    console.error(error.message);

    process.exit(1);
  }
};

createCreditScore();