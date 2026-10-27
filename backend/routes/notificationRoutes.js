
const express = require("express");

const {
  getNotifications,
  markNotificationAsRead,
  createPaymentReminders,
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

module.exports = router;
