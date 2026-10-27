
const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  createPaymentReminders,
  runDueReminders,
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getNotifications);

router.patch(
  "/:id/read",
  protect,
  markNotificationAsRead
);

router.post(
  "/create-reminders",
  protect,
  createPaymentReminders
);

router.post(
  "/run-due-reminders",
  protect,
  runDueReminders
);

module.exports = router;
