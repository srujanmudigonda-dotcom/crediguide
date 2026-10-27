const mongoose = require("mongoose");

const creditScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 300,
      max: 900,
    },

    paymentHistory: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    creditUtilization: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    creditAge: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    creditAccounts: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    source: {
  type: String,
  default: "Authorized CIBIL/credit provider",
},

    scoreDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CreditScore = mongoose.model(
  "CreditScore",
  creditScoreSchema
);

module.exports = CreditScore;