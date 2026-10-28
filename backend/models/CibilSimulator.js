const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    loanName: {
      type: String,
      required: true,
      trim: true,
    },

    loanType: {
      type: String,
      enum: [
        "Personal Loan",
        "Home Loan",
        "Vehicle Loan",
        "Education Loan",
        "Gold Loan",
        "Credit Card",
        "Other",
      ],
      required: true,
    },

    outstandingAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    emiAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },

    totalEmis: {
      type: Number,
      default: 0,
      min: 0,
    },

    paidEmis: {
      type: Number,
      default: 0,
      min: 0,
    },

    source: {
      type: String,
      enum: ["Existing Loan", "Simulator"],
      default: "Simulator",
    },

    sourceLoanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      default: null,
    },
  },
  { _id: true }
);

const scoreHistorySchema = new mongoose.Schema(
  {
    previousScore: {
      type: Number,
      required: true,
      min: 300,
      max: 900,
    },

    change: {
      type: Number,
      required: true,
    },

    newScore: {
      type: Number,
      required: true,
      min: 300,
      max: 900,
    },

    action: {
      type: String,
      enum: [
        "Starting Score",
        "Loan Added",
        "EMI Paid",
        "Loan Completed",
        "EMI Missed",
        "EMI Paid Late",
        "Manual Adjustment",
      ],
      required: true,
    },

    loanName: {
      type: String,
      default: "",
      trim: true,
    },

    amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const cibilSimulatorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    startingScore: {
      type: Number,
      required: true,
      min: 300,
      max: 900,
    },

    currentScore: {
      type: Number,
      required: true,
      min: 300,
      max: 900,
    },

    activeLoans: {
      type: [loanSchema],
      default: [],
    },

    scoreHistory: {
      type: [scoreHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const CibilSimulator = mongoose.model(
  "CibilSimulator",
  cibilSimulatorSchema
);

module.exports = CibilSimulator;