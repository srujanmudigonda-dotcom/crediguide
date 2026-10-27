const express = require("express");

const {
  getPayments,
  getUpcomingPayments,
  markPaymentAsPaid,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* -------------------- All Payments -------------------- */

router.get("/", protect, getPayments);

/* -------------------- Upcoming Payments -------------------- */

router.get("/upcoming", protect, getUpcomingPayments);

/* -------------------- Mark Payment as Paid -------------------- */

router.patch(
  "/:paymentId/paid",
  protect,
  markPaymentAsPaid
);

module.exports = router;