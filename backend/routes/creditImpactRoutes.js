const express = require("express");

const {
  simulateCreditImpact,
} = require("../controllers/creditImpactController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/simulate",
  protect,
  simulateCreditImpact
);

module.exports = router;