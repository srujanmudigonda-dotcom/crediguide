const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Payment = require("../models/Payment");

const createTestPayments = async () => {
  try {
    await connectDB();

    const user = await User.findOne({
      email: "testuser@crediguide.com",
    });

    if (!user) {
      console.log("Test user not found");
      process.exit(1);
    }

    await Payment.deleteMany({
      user: user._id,
    });

    const payments = await Payment.insertMany([
      {
        user: user._id,
        type: "Credit Card",
        title: "Credit Card Payment",
        amount: 8500,
        dueDate: new Date("2026-10-05"),
        status: "Due Soon",
        reminderEnabled: true,
      },
      {
        user: user._id,
        type: "EMI",
        title: "EMI Payment",
        amount: 12000,
        dueDate: new Date("2026-10-10"),
        status: "Upcoming",
        reminderEnabled: true,
      },
    ]);

    console.log("Test payments created successfully");

    payments.forEach((payment) => {
      console.log({
        id: payment._id.toString(),
        type: payment.type,
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: payment.status,
      });
    });

    process.exit(0);
  } catch (error) {
    console.error("Error creating test payments:", error.message);
    process.exit(1);
  }
};

createTestPayments();