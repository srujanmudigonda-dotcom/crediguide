
const Loan = require("../models/Loan");
const CibilSimulator = require("../models/CibilSimulator");

const getRecoveryPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({
      user: userId,
    }).sort({
      dueDate: 1,
    });

    const scoreProfile = await CibilSimulator.findOne({
      user: userId,
    });

    const currentScore = scoreProfile?.currentScore || 0;

    if (!loans.length) {
      return res.json({
        success: true,
        currentScore,
        healthStatus: "Getting Started",
        progress: 0,
        actions: [
          {
            priority: "High",
            title: "Add your loan details",
            description:
              "Add your active loans and payment information to create a personalized credit health recovery plan.",
          },
          {
            priority: "Medium",
            title: "Build consistent payment behavior",
            description:
              "Make every payment on or before the due date to build positive simulated payment behavior.",
          },
        ],
      });
    }

    const totalOnTimePayments = loans.reduce(
      (sum, loan) => sum + (loan.onTimePayments || 0),
      0
    );

    const totalLatePayments = loans.reduce(
      (sum, loan) => sum + (loan.latePayments || 0),
      0
    );

    const totalMissedPayments = loans.reduce(
      (sum, loan) => sum + (loan.missedPayments || 0),
      0
    );

    const creditCardLoans = loans.filter(
      (loan) => loan.loanType === "Credit Card"
    );

    const highUtilizationLoans = creditCardLoans.filter(
      (loan) => (loan.creditUtilization || 0) > 30
    );

    const overdueLoans = loans.filter(
      (loan) =>
        loan.status === "Overdue" || loan.status === "Missed"
    );

    const activeLoans = loans.filter(
      (loan) => loan.status !== "Paid"
    );

    const totalPayments =
      totalOnTimePayments +
      totalLatePayments +
      totalMissedPayments;

    const paymentScore =
      totalPayments > 0
        ? Math.round(
            (totalOnTimePayments / totalPayments) * 100
          )
        : 50;

    const utilizationValues = creditCardLoans
      .map((loan) => loan.creditUtilization || 0)
      .filter((value) => value >= 0);

    const averageUtilization =
      utilizationValues.length > 0
        ? Math.round(
            utilizationValues.reduce(
              (sum, value) => sum + value,
              0
            ) / utilizationValues.length
          )
        : 0;

    const paymentComponent = paymentScore * 0.6;

    const utilizationComponent =
      Math.max(0, 100 - averageUtilization) * 0.4;

    const progress = Math.min(
      100,
      Math.max(
        0,
        Math.round(paymentComponent + utilizationComponent)
      )
    );

    let healthStatus = "Needs Improvement";

    if (progress >= 80) {
      healthStatus = "Healthy";
    } else if (progress >= 60) {
      healthStatus = "Fair";
    }

    const actions = [];

    if (overdueLoans.length > 0) {
      actions.push({
        priority: "High",
        title: "Clear overdue payments",
        description: `You have ${overdueLoans.length} overdue or missed loan payment${
          overdueLoans.length > 1 ? "s" : ""
        }. Prioritize these payments to prevent further negative impact on your simulated credit score.`,
      });
    }

    if (totalMissedPayments > 0) {
      actions.push({
        priority: "High",
        title: "Avoid missed payments",
        description:
          "Set reminders before every EMI due date and maintain enough balance to make payments on time.",
      });
    }

    if (totalLatePayments > 0) {
      actions.push({
        priority: "Medium",
        title: "Reduce late payments",
        description:
          "Try to make payments before the due date instead of relying on last-minute payments.",
      });
    }

    if (highUtilizationLoans.length > 0) {
      actions.push({
        priority: "High",
        title: "Reduce credit utilization",
        description:
          "Your credit-card utilization is above 30%. Reducing outstanding balances can improve your simulated credit health.",
      });
    }

    if (activeLoans.length > 0) {
      actions.push({
        priority: "Medium",
        title: "Maintain on-time payments",
        description:
          "Continue paying your active loan EMIs on or before their due dates to strengthen your simulated payment history.",
      });
    }

    if (currentScore < 700) {
      actions.push({
        priority: "Medium",
        title: "Build consistent credit behavior",
        description:
          "Your simulated score is below 700. Focus on consistent on-time payments and reducing outstanding balances.",
      });
    } else {
      actions.push({
        priority: "Low",
        title: "Maintain your current progress",
        description:
          "Your simulated score is in a stronger range. Continue your current positive payment behavior.",
      });
    }

    if (actions.length === 0) {
      actions.push({
        priority: "Low",
        title: "Keep going",
        description:
          "Continue making payments on time and monitor your loans regularly.",
      });
    }

    return res.json({
      success: true,
      currentScore,
      healthStatus,
      progress,
      paymentScore,
      averageUtilization,
      totalOnTimePayments,
      totalLatePayments,
      totalMissedPayments,
      actions,
      disclaimer:
        "This recovery plan is an educational simulation based on your CrediGuide loan and payment behavior. It is not an official TransUnion CIBIL report or score.",
    });
  } catch (error) {
    console.error("Credit Recovery Plan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate your credit recovery plan.",
    });
  }
};

module.exports = {
  getRecoveryPlan,
};
