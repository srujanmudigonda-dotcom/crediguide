const Loan = require("../models/Loan");
const CibilSimulator = require("../models/CibilSimulator");

const getCreditReportExplanation = async (req, res) => {
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
    const startingScore = scoreProfile?.startingScore || currentScore;

    const totalLoans = loans.length;

    const activeLoans = loans.filter(
      (loan) => loan.status === "Active"
    ).length;

    const paidLoans = loans.filter(
      (loan) => loan.status === "Paid"
    ).length;

    const overdueLoans = loans.filter(
      (loan) => loan.status === "Overdue"
    ).length;

    const missedLoans = loans.filter(
      (loan) => loan.status === "Missed"
    ).length;

    const totalOutstanding = loans.reduce(
      (sum, loan) =>
        sum + Number(loan.outstandingAmount || 0),
      0
    );

    const totalAmount = loans.reduce(
      (sum, loan) =>
        sum + Number(loan.totalAmount || 0),
      0
    );

    const totalPaid = loans.reduce(
      (sum, loan) =>
        sum + Number(loan.amountPaid || 0),
      0
    );

    const totalOnTimePayments = loans.reduce(
      (sum, loan) =>
        sum + Number(loan.onTimePayments || 0),
      0
    );

    const totalLatePayments = loans.reduce(
      (sum, loan) =>
        sum + Number(loan.latePayments || 0),
      0
    );

    const totalMissedPayments = loans.reduce(
      (sum, loan) =>
        sum + Number(loan.missedPayments || 0),
      0
    );

    const creditCards = loans.filter(
      (loan) =>
        loan.loanType === "Credit Card" &&
        Number(loan.creditLimit || 0) > 0
    );

    const totalCreditLimit = creditCards.reduce(
      (sum, loan) =>
        sum + Number(loan.creditLimit || 0),
      0
    );

    const totalCreditCardOutstanding =
      creditCards.reduce(
        (sum, loan) =>
          sum + Number(loan.outstandingAmount || 0),
        0
      );

    const creditUtilization =
      totalCreditLimit > 0
        ? Math.round(
            (totalCreditCardOutstanding /
              totalCreditLimit) *
              100
          )
        : 0;

    let scoreBand = "Not Available";

    if (currentScore >= 750) {
      scoreBand = "Excellent";
    } else if (currentScore >= 700) {
      scoreBand = "Good";
    } else if (currentScore >= 650) {
      scoreBand = "Fair";
    } else if (currentScore >= 600) {
      scoreBand = "Needs Improvement";
    } else if (currentScore > 0) {
      scoreBand = "High Risk";
    }

    let paymentBehavior = "No payment history available.";

    if (
      totalOnTimePayments > 0 &&
      totalLatePayments === 0 &&
      totalMissedPayments === 0
    ) {
      paymentBehavior =
        "Your recorded payment behavior is consistently on time.";
    } else if (
      totalLatePayments > 0 ||
      totalMissedPayments > 0
    ) {
      paymentBehavior =
        "Your payment history contains late or missed payments that may require attention.";
    } else if (totalOnTimePayments > 0) {
      paymentBehavior =
        "You have recorded on-time payments, but more payment history may be needed for a stronger assessment.";
    }

    let utilizationStatus = "No credit-card utilization data.";

    if (creditUtilization <= 30 && totalCreditLimit > 0) {
      utilizationStatus =
        "Your recorded credit-card utilization is relatively low.";
    } else if (
      creditUtilization <= 50 &&
      totalCreditLimit > 0
    ) {
      utilizationStatus =
        "Your credit-card utilization is moderate. Reducing balances could strengthen your profile.";
    } else if (totalCreditLimit > 0) {
      utilizationStatus =
        "Your credit-card utilization is high. Reducing outstanding balances could improve your credit profile.";
    }

    const strengths = [];
    const concerns = [];
    const recommendations = [];

    if (currentScore >= 700) {
      strengths.push(
        "Your current simulated score is in a relatively strong range."
      );
    }

    if (totalOnTimePayments > 0) {
      strengths.push(
        `You have recorded ${totalOnTimePayments} on-time payment${
          totalOnTimePayments === 1 ? "" : "s"
        }.`
      );
    }

    if (
      creditUtilization > 0 &&
      creditUtilization <= 30
    ) {
      strengths.push(
        "Your recorded credit-card utilization is below 30%."
      );
    }

    if (paidLoans > 0) {
      strengths.push(
        `You have successfully completed ${paidLoans} loan${
          paidLoans === 1 ? "" : "s"
        }.`
      );
    }

    if (totalLatePayments > 0) {
      concerns.push(
        `You have ${totalLatePayments} recorded late payment${
          totalLatePayments === 1 ? "" : "s"
        }.`
      );

      recommendations.push(
        "Set payment reminders several days before every due date."
      );
    }

    if (totalMissedPayments > 0) {
      concerns.push(
        `You have ${totalMissedPayments} recorded missed payment${
          totalMissedPayments === 1 ? "" : "s"
        }.`
      );

      recommendations.push(
        "Prioritize upcoming payments to avoid additional missed obligations."
      );
    }

    if (
      creditUtilization > 30 &&
      totalCreditLimit > 0
    ) {
      concerns.push(
        `Your credit-card utilization is currently around ${creditUtilization}%.`
      );

      recommendations.push(
        "Consider reducing credit-card outstanding balances where your budget allows."
      );
    }

    if (totalOutstanding > 0) {
      recommendations.push(
        "Continue reducing outstanding balances while maintaining timely payments."
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Continue making payments on time and monitor your loan balances regularly."
      );
    }

    const scoreChange =
      currentScore - startingScore;

    return res.json({
      success: true,

      report: {
        currentScore,
        startingScore,
        scoreChange,
        scoreBand,

        totalLoans,
        activeLoans,
        paidLoans,
        overdueLoans,
        missedLoans,

        totalAmount,
        totalPaid,
        totalOutstanding,

        totalOnTimePayments,
        totalLatePayments,
        totalMissedPayments,

        totalCreditLimit,
        totalCreditCardOutstanding,
        creditUtilization,

        paymentBehavior,
        utilizationStatus,

        strengths,
        concerns,
        recommendations,

        disclaimer:
          "This explanation is based on your CrediGuide loan records and simulated score data. It is educational and is not an official TransUnion CIBIL credit report or credit-bureau assessment.",
      },
    });
  } catch (error) {
    console.error(
      "Credit Report Explainer Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to explain the credit report.",
    });
  }
};

module.exports = {
  getCreditReportExplanation,
};