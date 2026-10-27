const express = require("express");

const {
  getCibilSimulator,
} = require("../controllers/cibilSimulatorController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getCibilSimulator
);

module.exports = router;