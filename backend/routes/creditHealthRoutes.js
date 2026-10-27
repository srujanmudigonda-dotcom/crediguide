const express = require("express");

const {
  getCreditHealth,
} = require("../controllers/creditHealthController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

/* -------------------- Credit Health -------------------- */

router.get("/", protect, getCreditHealth);

module.exports = router;