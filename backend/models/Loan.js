
const mongoose = require("mongoose");

// ==========================================
// PAYMENT HISTORY
// ==========================================
const paymentHistorySchema = new mongoose.Schema(
  {
    paymentDate: {
      type: Date,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Paid", "Late", "Missed"],
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
  }
);

// ==========================================
// LOAN / CREDIT ACCOUNT
// ==========================================
const loanSchema = new mongoose.Schema(
  {
    // --------------------------------------
    // USER
    // --------------------------------------
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // --------------------------------------
    // ACCOUNT TYPE
    // --------------------------------------
    loanType: {
      type: String,
      enum: [
        "Credit Card",
        "Personal Loan",
        "Home Loan",
        "Vehicle Loan",
        "Education Loan",
        "Gold Loan",
        "Other Finance",
      ],
      required: true,
    },

    // --------------------------------------
    // ACCOUNT NAME
    // --------------------------------------
    loanName: {
      type: String,
      required: true,
      trim: true,
    },

    // --------------------------------------
    // FINANCIAL DETAILS
    // --------------------------------------
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    outstandingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    emiAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    interestRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // --------------------------------------
    // CREDIT CARD DETAILS
    // --------------------------------------
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    creditUtilization: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // --------------------------------------
    // DATES
    // --------------------------------------
    dueDate: {
      type: Date,
      required: true,
    },

    startDate: {
      type: Date,
      default: null,
    },

    endDate: {
      type: Date,
      default: null,
    },

    // --------------------------------------
    // STATUS
    // --------------------------------------
    status: {
      type: String,
      enum: [
        "Active",
        "Paid",
        "Overdue",
        "Missed",
      ],
      default: "Active",
    },

    // --------------------------------------
    // PAYMENT BEHAVIOR
    // --------------------------------------
    paymentHistory: {
      type: [paymentHistorySchema],
      default: [],
    },

    onTimePayments: {
      type: Number,
      default: 0,
      min: 0,
    },

    latePayments: {
      type: Number,
      default: 0,
      min: 0,
    },

    missedPayments: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------------------------
    // REMINDERS
    // --------------------------------------
    reminderEnabled: {
      type: Boolean,
      default: true,
    },

    // --------------------------------------
    // NOTES
    // --------------------------------------
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// AUTOMATIC CALCULATIONS
// ==========================================
// Modern Mongoose middleware style.
// No next() callback is used.
// ==========================================
loanSchema.pre("save", function () {
  // --------------------------------------
  // CREDIT CARD UTILIZATION
  // --------------------------------------
  if (
    this.loanType === "Credit Card" &&
    this.creditLimit > 0
  ) {
    const utilization =
      (this.outstandingAmount / this.creditLimit) * 100;

    this.creditUtilization = Math.min(
      100,
      Math.max(0, utilization)
    );
  }

  // --------------------------------------
  // OUTSTANDING AMOUNT
  // --------------------------------------
  if (
    this.totalAmount > 0 &&
    this.amountPaid >= 0
  ) {
    const calculatedOutstanding =
      this.totalAmount - this.amountPaid;

    // Only calculate automatically when
    // outstandingAmount was not explicitly set.
    if (
      this.outstandingAmount === undefined ||
      this.outstandingAmount === null ||
      this.outstandingAmount === 0
    ) {
      this.outstandingAmount = Math.max(
        0,
        calculatedOutstanding
      );
    }
  }

  // --------------------------------------
  // PREVENT OVERPAYMENT VALUES
  // --------------------------------------
  if (
    this.totalAmount > 0 &&
    this.amountPaid > this.totalAmount
  ) {
    this.amountPaid = this.totalAmount;
  }

  // --------------------------------------
  // RECALCULATE OUTSTANDING AFTER
  // OVERPAYMENT PROTECTION
  // --------------------------------------
  if (
    this.totalAmount > 0 &&
    this.outstandingAmount === 0
  ) {
    this.outstandingAmount = Math.max(
      0,
      this.totalAmount - this.amountPaid
    );
  }

  // --------------------------------------
  // AUTOMATIC PAID STATUS
  // --------------------------------------
  if (
    this.totalAmount > 0 &&
    this.amountPaid >= this.totalAmount
  ) {
    this.amountPaid = this.totalAmount;
    this.outstandingAmount = 0;
    this.status = "Paid";
  }
});

// ==========================================
// MODEL
// ==========================================
const Loan = mongoose.model("Loan", loanSchema);

module.exports = Loan;