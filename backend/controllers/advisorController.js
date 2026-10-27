const Loan = require("../models/Loan");
const CibilSimulator = require("../models/CibilSimulator");

const getRepaymentAdvice = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({ user: userId }).sort({
      dueDate: 1,
    });

    const scoreProfile = await CibilSimulator.findOne({
      user: userId,
    });

    const currentScore = scoreProfile?.currentScore || 0;

    if (!loans.length) {
      return res.json({
        success: true,
        advice: [
          "No active loans found.",
          "Add your loan details to receive personalized repayment guidance.",
        ],
        summary: "Add your loans to start receiving repayment advice.",
      });
    }

    const advice = [];

    const activeLoans = loans.filter(
      (loan) => loan.status !== "Paid"
    );

    const overdueLoans = activeLoans.filter(
      (loan) => loan.status === "Overdue" || loan.status === "Missed"
    );

    const highUtilizationLoans = activeLoans.filter(
      (loan) =>
        loan.loanType === "Credit Card" &&
        loan.creditUtilization >= 30
    );

    const upcomingLoans = activeLoans.filter((loan) => {
      const today = new Date();
      const dueDate = new Date(loan.dueDate);

      const difference =
        (dueDate - today) / (1000 * 60 * 60 * 24);

      return difference >= 0 && difference <= 7;
    });

    if (overdueLoans.length > 0) {
      advice.push(
        `Prioritize ${overdueLoans[0].loanName} because it has an overdue or missed payment.`
      );
    }

    if (upcomingLoans.length > 0) {
      advice.push(
        `${upcomingLoans[0].loanName} has an EMI due within the next 7 days. Keep the EMI amount ready.`
      );
    }

    if (highUtilizationLoans.length > 0) {
      advice.push(
        "Your credit card utilization is relatively high. Try to reduce the outstanding balance before the next billing cycle."
      );
    }

    const largestLoan = activeLoans.reduce(
      (largest, loan) =>
        loan.outstandingAmount > (largest?.outstandingAmount || 0)
          ? loan
          : largest,
      null
    );

    if (largestLoan) {
      advice.push(
        `Your largest outstanding balance is ${largestLoan.loanName} with ₹${largestLoan.outstandingAmount.toLocaleString("en-IN")} outstanding.`
      );
    }

    if (currentScore > 0 && currentScore < 700) {
      advice.push(
        "Focus on making every EMI payment on or before the due date to improve your simulated credit score."
      );
    } else if (currentScore >= 700) {
      advice.push(
        "Your simulated credit score is in a stronger range. Continue making payments on time to maintain healthy credit behavior."
      );
    }

    if (!advice.length) {
      advice.push(
        "Continue making your EMI payments on time and avoid unnecessary increases in outstanding debt."
      );
    }

    return res.json({
      success: true,
      currentScore,
      advice,
      summary:
        "Based on your current loans and payment behavior, these are your recommended repayment actions.",
    });
  } catch (error) {
    console.error("Repayment advisor error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate repayment advice.",
    });
  }
};

module.exports = {
  getRepaymentAdvice,
};