
const Loan = require("../models/Loan");

const getDebtRepaymentPlan = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({
      user: userId,
      status: { $ne: "Paid" },
    }).sort({
      dueDate: 1,
    });

    if (!loans.length) {
      return res.json({
        success: true,
        message: "No active loans found.",
        loans: [],
        strategy: "Getting Started",
        recommendations: [
          "Add your active loans to receive a personalized debt repayment strategy.",
        ],
      });
    }

    const totalOutstanding = loans.reduce(
      (sum, loan) => sum + (loan.outstandingAmount || 0),
      0
    );

    const totalMonthlyEMI = loans.reduce(
      (sum, loan) => sum + (loan.emiAmount || loan.minimumDue || 0),
      0
    );

    // Calculate a priority score for each loan.
    // Higher priority means the loan should receive more attention.
    const prioritizedLoans = loans
      .map((loan) => {
        const outstanding = loan.outstandingAmount || 0;
        const interestRate = loan.interestRate || 0;
        const missedPayments = loan.missedPayments || 0;
        const latePayments = loan.latePayments || 0;

        let priorityScore = 0;

        // Higher interest gets higher priority.
        priorityScore += interestRate * 3;

        // Larger outstanding balances get additional priority.
        if (totalOutstanding > 0) {
          priorityScore +=
            (outstanding / totalOutstanding) * 30;
        }

        // Missed and late payments increase priority.
        priorityScore += missedPayments * 20;
        priorityScore += latePayments * 5;

        // Earlier due dates receive additional priority.
        if (loan.dueDate) {
          const today = new Date();
          const dueDate = new Date(loan.dueDate);

          const daysUntilDue = Math.ceil(
            (dueDate - today) / (1000 * 60 * 60 * 24)
          );

          if (daysUntilDue < 0) {
            priorityScore += 40;
          } else if (daysUntilDue <= 7) {
            priorityScore += 20;
          }
        }

        return {
          loan,
          priorityScore,
        };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore);

    const repaymentOrder = prioritizedLoans.map(
      (item, index) => {
        const loan = item.loan;

        return {
          rank: index + 1,
          loanId: loan._id,
          loanName: loan.loanName,
          loanType: loan.loanType,
          outstandingAmount: loan.outstandingAmount || 0,
          emiAmount: loan.emiAmount || loan.minimumDue || 0,
          interestRate: loan.interestRate || 0,
          dueDate: loan.dueDate,
          priorityScore: Math.round(item.priorityScore),
        };
      }
    );

    const highestPriority = repaymentOrder[0];

    const recommendations = [];

    if (highestPriority) {
      recommendations.push(
        `Prioritize ${highestPriority.loanName} first because it has the highest repayment priority based on your loan details and payment behavior.`
      );
    }

    const highInterestLoan = [...loans].sort(
      (a, b) =>
        (b.interestRate || 0) - (a.interestRate || 0)
    )[0];

    if (
      highInterestLoan &&
      (highInterestLoan.interestRate || 0) > 0
    ) {
      recommendations.push(
        `${highInterestLoan.loanName} has the highest interest rate at ${highInterestLoan.interestRate}%. Consider directing extra repayment toward this loan after meeting all required EMIs.`
      );
    }

    const overdueLoan = loans.find(
      (loan) =>
        loan.status === "Overdue" ||
        loan.status === "Missed"
    );

    if (overdueLoan) {
      recommendations.push(
        `Clear ${overdueLoan.loanName} as soon as possible because it has an overdue or missed payment.`
      );
    }

    recommendations.push(
      `Keep all required EMIs covered first. Your current combined monthly EMI requirement is ₹${totalMonthlyEMI.toLocaleString(
        "en-IN"
      )}.`
    );

    recommendations.push(
      "After required EMIs are covered, consider putting additional available money toward the highest-priority loan."
    );

    return res.json({
      success: true,
      strategy: "Personalized Debt Repayment Strategy",
      totalOutstanding,
      totalMonthlyEMI,
      activeLoanCount: loans.length,
      repaymentOrder,
      recommendations,
      disclaimer:
        "This is an educational repayment simulation based on your CrediGuide loan information. It is not professional financial advice.",
    });
  } catch (error) {
    console.error("Debt Optimizer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate your debt repayment plan.",
    });
  }
};

module.exports = {
  getDebtRepaymentPlan,
};
