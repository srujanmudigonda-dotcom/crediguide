const Loan = require("../models/Loan");

const getEmiRiskPrediction = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      availableFunds,
      monthlyIncome,
    } = req.body;

    const funds = Number(availableFunds || 0);
    const income = Number(monthlyIncome || 0);

    if (funds < 0 || income < 0) {
      return res.status(400).json({
        success: false,
        message: "Income and available funds cannot be negative.",
      });
    }

    const loans = await Loan.find({
      user: userId,
      status: { $ne: "Paid" },
    }).sort({
      dueDate: 1,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingLoans = loans.filter((loan) => {
      if (!loan.dueDate) {
        return false;
      }

      const dueDate = new Date(loan.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      return dueDate >= today;
    });

    const upcomingPayments = upcomingLoans.map((loan) => {
      const dueDate = new Date(loan.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.ceil(
        (dueDate - today) /
          (1000 * 60 * 60 * 24)
      );

      const amount =
        Number(loan.emiAmount || 0) ||
        Number(loan.minimumDue || 0);

      return {
        loanId: loan._id,
        loanName: loan.loanName,
        loanType: loan.loanType,
        amount,
        dueDate: loan.dueDate,
        daysUntilDue,
        interestRate: Number(loan.interestRate || 0),
        missedPayments: Number(loan.missedPayments || 0),
        latePayments: Number(loan.latePayments || 0),
      };
    });

    const totalUpcomingPayments =
      upcomingPayments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

    const totalOutstanding =
      loans.reduce(
        (sum, loan) =>
          sum + Number(loan.outstandingAmount || 0),
        0
      );

    const totalMissedPayments =
      loans.reduce(
        (sum, loan) =>
          sum + Number(loan.missedPayments || 0),
        0
      );

    const totalLatePayments =
      loans.reduce(
        (sum, loan) =>
          sum + Number(loan.latePayments || 0),
        0
      );

    const shortfall = Math.max(
      totalUpcomingPayments - funds,
      0
    );

    const coverageRatio =
      totalUpcomingPayments > 0
        ? Math.round(
            (funds / totalUpcomingPayments) * 100
          )
        : 100;

    let riskLevel = "Low";
    let riskDirection = "Lower Risk";

    if (
      totalUpcomingPayments > funds ||
      totalMissedPayments >= 2 ||
      totalLatePayments >= 3
    ) {
      riskLevel = "High";
      riskDirection = "Higher Risk";
    } else if (
      totalUpcomingPayments > 0 &&
      funds < totalUpcomingPayments * 1.25
    ) {
      riskLevel = "Medium";
      riskDirection = "Moderate Risk";
    }

    const priorityPayments = [...upcomingPayments]
      .sort((a, b) => {
        if (a.daysUntilDue !== b.daysUntilDue) {
          return a.daysUntilDue - b.daysUntilDue;
        }

        if (a.missedPayments !== b.missedPayments) {
          return b.missedPayments - a.missedPayments;
        }

        return b.interestRate - a.interestRate;
      })
      .slice(0, 3);

    const recommendations = [];

    if (shortfall > 0) {
      recommendations.push(
        `Your upcoming payments exceed the available funds by ₹${shortfall.toLocaleString(
          "en-IN"
        )}. Review your budget before the due dates.`
      );
    }

    if (priorityPayments.length > 0) {
      const firstPayment = priorityPayments[0];

      recommendations.push(
        `Prioritize ${firstPayment.loanName}, with ₹${firstPayment.amount.toLocaleString(
          "en-IN"
        )} due in ${firstPayment.daysUntilDue} day${
          firstPayment.daysUntilDue === 1 ? "" : "s"
        }.`
      );
    }

    if (totalMissedPayments > 0) {
      recommendations.push(
        "You have previously recorded missed payments. Prioritize upcoming obligations and avoid another missed payment where possible."
      );
    }

    if (totalLatePayments > 0) {
      recommendations.push(
        "Your payment history includes late payments. Consider setting reminders several days before each due date."
      );
    }

    if (
      funds > 0 &&
      totalUpcomingPayments === 0
    ) {
      recommendations.push(
        "No upcoming EMI payments were identified from your recorded loan accounts."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Your recorded upcoming payments are currently covered by the available funds you entered. Continue monitoring upcoming due dates."
      );
    }

    return res.json({
      success: true,

      prediction: {
        riskLevel,
        riskDirection,

        availableFunds: funds,
        monthlyIncome: income,

        totalUpcomingPayments,
        totalOutstanding,

        shortfall,
        coverageRatio,

        upcomingPaymentCount:
          upcomingPayments.length,

        totalMissedPayments,
        totalLatePayments,

        priorityPayments,
        recommendations,

        disclaimer:
          "This is an educational budgeting and payment-risk assessment based on the information you entered and your recorded CrediGuide loans. It is not a guaranteed prediction of loan default, lender decisions, or credit-bureau outcomes.",
      },
    });
  } catch (error) {
    console.error(
      "EMI Risk Prediction Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate EMI risk prediction.",
    });
  }
};

module.exports = {
  getEmiRiskPrediction,
};