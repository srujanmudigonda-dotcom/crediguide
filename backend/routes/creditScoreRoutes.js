const express = require("express");

const {
  getCreditScore,
  getCreditScoreHistory,
  getImprovementPlan,
} = require("../controllers/creditScoreController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* -------------------- Latest Credit Score -------------------- */

router.get("/", protect, getCreditScore);

/* -------------------- Credit Score History -------------------- */

router.get("/history", protect, getCreditScoreHistory);

/* -------------------- Improvement Plan -------------------- */

router.get(
  "/improvement-plan",
  protect,
  getImprovementPlan
);

module.exports = router;