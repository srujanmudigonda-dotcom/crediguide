const CibilSimulator = require("../models/CibilSimulator");

/*
|--------------------------------------------------------------------------
| Get Simulated Credit Score
|--------------------------------------------------------------------------
*/

const getCreditScore = async (req, res) => {
  try {
    const simulator = await CibilSimulator.findOne({
      user: req.user._id,
    });

    if (!simulator) {
      return res.status(404).json({
        success: false,
        message:
          "Simulated credit score is not available yet.",
      });
    }

    res.json({
      success: true,
      score: simulator.currentScore,
      startingScore: simulator.startingScore,
      currentScore: simulator.currentScore,
      scoreHistory: simulator.scoreHistory || [],
      range: {
        min: 300,
        max: 900,
      },
      status:
        simulator.currentScore >= 800
          ? "Excellent"
          : simulator.currentScore >= 750
          ? "Very Good"
          : simulator.currentScore >= 700
          ? "Good"
          : simulator.currentScore >= 650
          ? "Fair"
          : "Needs Improvement",
      lastUpdated: simulator.updatedAt,
      source: "CrediGuide Educational Simulation",
    });
  } catch (error) {
    console.error(
      "Get Simulated Credit Score Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch simulated credit score.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Simulated Score History
|--------------------------------------------------------------------------
*/

const getCreditScoreHistory = async (req, res) => {
  try {
    const simulator = await CibilSimulator.findOne({
      user: req.user._id,
    });

    if (!simulator) {
      return res.status(404).json({
        success: false,
        message:
          "Simulated score history is not available yet.",
      });
    }

    res.json({
      success: true,
      startingScore: simulator.startingScore,
      currentScore: simulator.currentScore,
      history: simulator.scoreHistory || [],
    });
  } catch (error) {
    console.error(
      "Get Simulated Score History Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch simulated score history.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get Simulated Improvement Plan
|--------------------------------------------------------------------------
*/

const getImprovementPlan = async (req, res) => {
  try {
    const simulator = await CibilSimulator.findOne({
      user: req.user._id,
    });

    if (!simulator) {
      return res.status(404).json({
        success: false,
        message:
          "Improvement plan is not available yet.",
      });
    }

    const plan = [];

    const history = simulator.scoreHistory || [];

    const latePayments = history.filter(
      (item) =>
        item.action === "EMI Paid Late"
    ).length;

    const missedPayments = history.filter(
      (item) =>
        item.action === "EMI Missed"
    ).length;

    const paidPayments = history.filter(
      (item) =>
        item.action === "EMI Paid"
    ).length;

    if (missedPayments > 0) {
      plan.push({
        title: "Avoid Missed Payments",
        description:
          "Make every future EMI payment on or before the due date to avoid negative changes in your simulated score.",
        priority: "High",
      });
    }

    if (latePayments > 0) {
      plan.push({
        title: "Reduce Late Payments",
        description:
          "Try to make payments before the due date and set reminders several days in advance.",
        priority: "High",
      });
    }

    if (paidPayments > 0) {
      plan.push({
        title: "Continue On-Time Payments",
        description:
          "Continue making payments on time to maintain positive simulated credit behavior.",
        priority: "Medium",
      });
    }

    if (simulator.currentScore < 650) {
      plan.push({
        title: "Focus on Credit Recovery",
        description:
          "Your simulated score is currently in the needs-improvement range. Prioritize timely payments and avoid missed EMIs.",
        priority: "High",
      });
    } else if (simulator.currentScore < 700) {
      plan.push({
        title: "Build Consistent Payment Behavior",
        description:
          "Maintain consistent on-time payments and avoid additional late or missed payments.",
        priority: "Medium",
      });
    } else if (simulator.currentScore < 750) {
      plan.push({
        title: "Strengthen Your Credit Behavior",
        description:
          "Continue paying on time and maintain responsible borrowing behavior.",
        priority: "Medium",
      });
    } else {
      plan.push({
        title: "Maintain Healthy Credit Behavior",
        description:
          "Your simulated score is in a stronger range. Continue making payments on time and manage your loans responsibly.",
        priority: "Low",
      });
    }

    res.json({
      success: true,
      currentScore: simulator.currentScore,
      startingScore: simulator.startingScore,
      plan,
      disclaimer:
        "This is an educational CrediGuide simulation and is not your actual TransUnion CIBIL score.",
    });
  } catch (error) {
    console.error(
      "Get Simulated Improvement Plan Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to generate improvement plan.",
    });
  }
};

module.exports = {
  getCreditScore,
  getCreditScoreHistory,
  getImprovementPlan,
};