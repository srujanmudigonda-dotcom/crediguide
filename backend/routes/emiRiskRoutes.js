const express = require("express");

const {
  getEmiRiskPrediction,
} = require("../controllers/emiRiskController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/predict",
  protect,
  getEmiRiskPrediction
);

module.exports = router;