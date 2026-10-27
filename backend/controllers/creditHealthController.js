const CreditScore = require("../models/CreditScore");
console.log("NEW CREDIT HEALTH CONTROLLER LOADED");

/* -------------------- Get Credit Health -------------------- */

const getCreditHealth = async (req, res) => {
  try {
    const creditScore = await CreditScore.findOne({
      user: req.user._id,
    }).sort({ scoreDate: -1 });

    if (!creditScore) {
      return res.status(404).json({
        success: false,
        message: "Credit health data not found",
      });
    }

    const overallHealth = Math.round(
      (
        creditScore.paymentHistory +
        Math.max(0, 100 - creditScore.creditUtilization) +
        creditScore.creditAge +
        creditScore.creditAccounts
      ) / 4
    );

    res.json({
      success: true,
      overallHealth,
      health: {
        paymentHistory: creditScore.paymentHistory,
        creditUtilization: creditScore.creditUtilization,
        creditAge: creditScore.creditAge,
        creditAccounts: creditScore.creditAccounts,
      },
      score: creditScore.score,
      lastUpdated: creditScore.scoreDate,
    });
  } catch (error) {
    console.error("Get Credit Health Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch credit health",
    });
  }
};

module.exports = {
  getCreditHealth,
};