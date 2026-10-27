const express = require("express");

const {
  getCreditReportExplanation,
} = require("../controllers/creditReportExplainerController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/explain",
  protect,
  getCreditReportExplanation
);

module.exports = router;