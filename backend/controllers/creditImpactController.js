const Loan = require("../models/Loan");
const CibilSimulator = require("../models/CibilSimulator");

const simulateCreditImpact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { scenario, loanId, amount } = req.body;

    const validScenarios = [
      "on_time",
      "minimum_due",
      "late_payment",
      "missed_payment",
      "reduce_utilization",
    ];

    if (!validScenarios.includes(scenario)) {
      return res.status(400).json({
        success: false,
        message: "Invalid credit impact scenario.",
      });
    }

    const loans = await Loan.find({
      user: userId,
    });

    const scoreProfile = await CibilSimulator.findOne({
      user: userId,
    });

    const currentScore = scoreProfile?.currentScore || 0;

    let selectedLoan = null;

    if (loanId) {
      selectedLoan = loans.find(
        (loan) => loan._id.toString() === loanId
      );
    }

    let title = "";
    let riskDirection = "";
    let riskLevel = "";
    let explanation = "";
    let recommendations = [];

    switch (scenario) {
      case "on_time":
        title = "Pay on Time";
        riskDirection = "Positive";
        riskLevel = "Lower Risk";

        explanation =
          "Making payments on or before the due date supports a healthy payment history. Consistent on-time payments can help demonstrate responsible credit behavior.";

        recommendations = [
          "Pay the required amount on or before the due date.",
          "Keep enough funds available before upcoming EMI dates.",
          "Continue maintaining consistent payment behavior.",
        ];
        break;

      case "minimum_due":
        title = "Pay Only Minimum Due";
        riskDirection = "Neutral / Caution";
        riskLevel = "Moderate Risk";

        explanation =
          "Paying at least the minimum due can help avoid an immediate missed-payment situation, but the remaining balance may continue to accrue interest. For credit cards, a high outstanding balance can also keep utilization elevated.";

        recommendations = [
          "Pay at least the minimum due before the deadline.",
          "Pay more than the minimum when your budget allows.",
          "Try to reduce outstanding credit-card balances over time.",
        ];
        break;

      case "late_payment":
        title = "Pay Late";
        riskDirection = "Negative";
        riskLevel = "Higher Risk";

        explanation =
          "A late payment can negatively affect repayment behavior and may result in additional charges. If a lender reports the late payment to a credit bureau, it may negatively influence your credit profile.";

        recommendations = [
          "Make the payment as soon as possible.",
          "Avoid repeated late payments.",
          "Set reminders before future due dates.",
        ];
        break;

      case "missed_payment":
        title = "Miss a Payment";
        riskDirection = "Strongly Negative";
        riskLevel = "High Risk";

        explanation =
          "Missing a required payment can increase financial and credit risk. It may lead to late fees, additional interest and, if reported by the lender, a negative payment-history entry.";

        recommendations = [
          "Prioritize the missed payment as soon as possible.",
          "Contact the lender if you are unable to make the payment.",
          "Review your upcoming obligations to prevent another missed payment.",
        ];
        break;

      case "reduce_utilization":
        title = "Reduce Credit-Card Utilization";
        riskDirection = "Positive";
        riskLevel = "Lower Risk";

        explanation =
          "Reducing the amount of available credit currently being used can improve the overall health of your credit profile. Lower utilization is generally viewed more positively than consistently carrying a high balance.";

        recommendations = [
          "Reduce outstanding credit-card balances where possible.",
          "Avoid unnecessary increases in card balances.",
          "Keep utilization comfortably below your available credit limit.",
        ];
        break;
    }

    let utilization = 0;

    const creditCards = loans.filter(
      (loan) =>
        loan.loanType === "Credit Card" &&
        Number(loan.creditLimit) > 0
    );

    if (creditCards.length > 0) {
      const totalLimit = creditCards.reduce(
        (sum, loan) => sum + Number(loan.creditLimit || 0),
        0
      );

      const totalOutstanding = creditCards.reduce(
        (sum, loan) =>
          sum + Number(loan.outstandingAmount || 0),
        0
      );

      utilization =
        totalLimit > 0
          ? Math.round((totalOutstanding / totalLimit) * 100)
          : 0;
    }

    if (
      selectedLoan &&
      selectedLoan.loanType === "Credit Card" &&
      Number(selectedLoan.creditLimit) > 0 &&
      amount
    ) {
      const simulatedOutstanding =
        Number(selectedLoan.outstandingAmount || 0) +
        Number(amount || 0);

      const simulatedUtilization =
        (simulatedOutstanding /
          Number(selectedLoan.creditLimit)) *
        100;

      utilization = Math.round(simulatedUtilization);
    }

    return res.json({
      success: true,

      simulation: {
        scenario,
        title,
        currentScore,
        riskDirection,
        riskLevel,
        utilization,
        explanation,
        recommendations,
        disclaimer:
          "This is an educational credit-risk simulation. It does not predict an exact CIBIL score change and is not an official TransUnion CIBIL assessment.",
      },
    });
  } catch (error) {
    console.error(
      "Credit Impact Simulation Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate credit impact simulation.",
    });
  }
};

module.exports = {
  simulateCreditImpact,
};