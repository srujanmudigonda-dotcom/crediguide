
const Notification = require("../models/Notification");
const Loan = require("../models/Loan");

/* -------------------- Get Notifications -------------------- */

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error("Get Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load notifications.",
    });
  }
};

/* -------------------- Mark Notification as Read -------------------- */

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId,
      },
      {
        isRead: true,
      },
      {
        returnDocument: "after",
      }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.json({
      success: true,
      notification,
    });
  } catch (error) {
    console.error("Mark Notification Read Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update notification.",
    });
  }
};

/* -------------------- Create Payment Reminders -------------------- */

const createPaymentReminders = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({
      user: userId,
      status: { $ne: "Paid" },
      reminderEnabled: true,
    });

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const createdNotifications = [];

    for (const loan of loans) {
      if (!loan.dueDate) {
        continue;
      }

      const dueDate = new Date(loan.dueDate);

      dueDate.setHours(0, 0, 0, 0);

      const differenceInDays = Math.ceil(
        (dueDate - today) / (1000 * 60 * 60 * 24)
      );

      let title = "";
      let message = "";
      let type = "";

      /* -------------------- Overdue -------------------- */

      if (differenceInDays < 0) {
        title = "Payment Overdue";

        message = `${loan.loanName} payment is overdue. Please make the payment as soon as possible to avoid further negative impact on your simulated credit score.`;

        type = "Overdue";
      }

      /* -------------------- Due Today -------------------- */

      else if (differenceInDays === 0) {
        title = "Payment Due Today";

        message = `${loan.loanName} payment is due today. Please make the payment today to maintain positive payment behavior.`;

        type = "Due Today";
      }

      /* -------------------- Due Within 15 Days -------------------- */

      else if (differenceInDays <= 15) {
        title = "Payment Due Soon";

        message = `${loan.loanName} payment is due in ${differenceInDays} day${
          differenceInDays === 1 ? "" : "s"
        }. Please keep the EMI amount ready.`;

        type = "Due Soon";
      }

      /* -------------------- More Than 15 Days -------------------- */

      else {
        continue;
      }

      /* -------------------- Avoid Duplicate Notifications -------------------- */

      const existingNotification =
        await Notification.findOne({
          user: userId,
          loan: loan._id,
          type,
          isRead: false,
        });

      if (existingNotification) {
        continue;
      }

      /* -------------------- Create Notification -------------------- */

      const notification = await Notification.create({
        user: userId,
        loan: loan._id,
        title,
        message,
        type,
        isRead: false,
      });

      createdNotifications.push(notification);
    }

    return res.json({
      success: true,
      notifications: createdNotifications,
      message:
        createdNotifications.length > 0
          ? "Payment reminders created successfully."
          : "No new payment reminders.",
    });
  } catch (error) {
    console.error(
      "Create Payment Reminders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create payment reminders.",
    });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  createPaymentReminders,
};
