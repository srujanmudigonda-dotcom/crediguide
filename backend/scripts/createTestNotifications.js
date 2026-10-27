const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("../config/db");
const User = require("../models/User");
const Notification = require("../models/Notification");

const createTestNotifications = async () => {
  try {
    await connectDB();

    const user = await User.findOne({
      email: "testuser@crediguide.com",
    });

    if (!user) {
      console.log("Test user not found");
      process.exit(1);
    }

    await Notification.deleteMany({
      user: user._id,
    });

    const notifications = await Notification.insertMany([
      {
        user: user._id,
        type: "Payment",
        title: "Credit Card Payment Due",
        message:
          "Your credit card payment of ₹8,500 was due on 05 October 2026.",
        read: false,
        scheduledFor: new Date("2026-10-03"),
      },
      {
        user: user._id,
        type: "EMI",
        title: "EMI Payment Reminder",
        message:
          "Your EMI payment of ₹12,000 is due on 10 October 2026.",
        read: false,
        scheduledFor: new Date("2026-10-08"),
      },
      {
        user: user._id,
        type: "Credit Score",
        title: "Credit Score Updated",
        message:
          "Your latest credit score is 750. Continue making payments on time.",
        read: false,
        scheduledFor: new Date(),
      },
    ]);

    console.log("Test notifications created successfully");

    notifications.forEach((notification) => {
      console.log({
        id: notification._id.toString(),
        type: notification.type,
        title: notification.title,
        read: notification.read,
      });
    });

    process.exit(0);
  } catch (error) {
    console.error(
      "Error creating test notifications:",
      error.message
    );

    process.exit(1);
  }
};

createTestNotifications();