const express = require("express");

const {
  getPaymentPreventionAlerts,
} = require("../controllers/paymentPreventionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/alerts",
  protect,
  getPaymentPreventionAlerts
);

module.exports = router;