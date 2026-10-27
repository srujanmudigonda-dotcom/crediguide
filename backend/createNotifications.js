const dotenv = require("dotenv");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const User = require("./models/User");
const Payment = require("./models/Payment");
const Notification = require("./models/Notification");

dotenv.config();

const USER_EMAIL = "srujanmudigonda@gmail.com";

const createNotifications = async () => {
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

    const payments = await Payment.find({
      user: user._id,
      status: {
        $in: ["Upcoming", "Due Soon", "Overdue"],
      },
    }).sort({ dueDate: 1 });

    if (payments.length === 0) {
      console.log("No upcoming payments found for this user.");
      process.exit(0);
    }

    let createdCount = 0;

    for (const payment of payments) {
      let type = "Payment";
      let title = "Payment Reminder";

      if (payment.type === "EMI") {
        type = "EMI";
        title = "EMI Payment Reminder";
      } else if (payment.type === "Credit Card") {
        type = "Payment";
        title = "Credit Card Payment Reminder";
      }

      const formattedAmount = payment.amount.toLocaleString(
        "en-IN"
      );

      const formattedDueDate = new Date(
        payment.dueDate
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const existingNotification =
        await Notification.findOne({
          user: user._id,
          type,
          title,
          message: {
            $regex: payment._id.toString(),
          },
        });

      if (existingNotification) {
        console.log(
          `Notification already exists for: ${payment.title}`
        );

        continue;
      }

      const notification = await Notification.create({
        user: user._id,
        type,
        title,
        message: `${payment.title} of ₹${formattedAmount} is due on ${formattedDueDate}. Please make the payment on or before the due date.`,
        read: false,
        scheduledFor: payment.dueDate,
      });

      createdCount++;

      console.log(
        `Notification created: ${notification.title}`
      );
    }

    console.log("");
    console.log(
      `Successfully created ${createdCount} notification(s).`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to create notifications:");
    console.error(error.message);

    process.exit(1);
  }
};

createNotifications();