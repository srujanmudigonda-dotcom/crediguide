const dotenv = require("dotenv");

const connectDB = require("./config/db");
const User = require("./models/User");
const Payment = require("./models/Payment");

dotenv.config();

const USER_EMAIL = "srujanmudigonda@gmail.com";

const createTestPayment = async () => {
  try {
    await connectDB();

    const user = await User.findOne({
      email: USER_EMAIL,
    });

    if (!user) {
      console.log(`User not found: ${USER_EMAIL}`);
      process.exit(1);
    }

    const existingPayment = await Payment.findOne({
      user: user._id,
      title: "Test Credit Card Payment",
      status: {
        $in: ["Upcoming", "Due Soon", "Overdue"],
      },
    });

    if (existingPayment) {
      console.log("Test payment already exists.");
      console.log(`Payment ID: ${existingPayment._id}`);
      process.exit(0);
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 5);

    const payment = await Payment.create({
      user: user._id,
      type: "Credit Card",
      title: "Test Credit Card Payment",
      amount: 5000,
      dueDate,
      status: "Upcoming",
      reminderEnabled: true,
    });

    console.log("Test payment created successfully.");
    console.log(`Payment: ${payment.title}`);
    console.log(`Amount: ₹${payment.amount}`);
    console.log(`Due Date: ${payment.dueDate}`);
    console.log(`Status: ${payment.status}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create test payment:");
    console.error(error.message);

    process.exit(1);
  }
};

createTestPayment();