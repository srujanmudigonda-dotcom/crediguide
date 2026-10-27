
const express = require("express");

const {
  getLoans,
  createLoan,
  updateLoan,
  deleteLoan,
  createLoanDueNotifications,
  recordLoanPayment,
} = require("../controllers/loanController");

const {
  getRepaymentAdvice,
} = require("../controllers/advisorController");

const {
  getPaymentPreventionAlerts,
} = require("../controllers/paymentPreventionController");

const {
  getRecoveryPlan,
} = require("../controllers/recoveryController");

const {
  getDebtRepaymentPlan,
} = require("../controllers/debtOptimizerController");

const {
  getChatbotResponse,
} = require("../controllers/chatbotController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Get all loans
router.get("/", protect, getLoans);

// Create a new loan
router.post("/", protect, createLoan);

// Personalized repayment advisor
router.get("/advisor", protect, getRepaymentAdvice);

// Credit health recovery planner
router.get("/recovery-plan", protect, getRecoveryPlan);

// AI debt repayment optimizer
router.get("/debt-optimizer", protect, getDebtRepaymentPlan);

// Intelligent missed-payment prevention
router.get(
  "/payment-prevention",
  protect,
  getPaymentPreventionAlerts
);

// AI financial chatbot
router.post("/chatbot", protect, getChatbotResponse);

// Check and create loan due-date notifications
router.post(
  "/create-reminders",
  protect,
  createLoanDueNotifications
);
    

// Update a loan
router.put("/:id", protect, updateLoan);

// Record a loan payment
router.post("/:id/payments", protect, recordLoanPayment);

// Delete a loan
router.delete("/:id", protect, deleteLoan);

module.exports = router;
