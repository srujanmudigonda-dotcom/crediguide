const Loan = require("../models/Loan");

const getPaymentPreventionAlerts = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      availableFunds = 0,
      monthlyIncome = 0,
    } = req.query;

    const funds = Number(availableFunds) || 0;
    const income = Number(monthlyIncome) || 0;

    const loans = await Loan.find({
      user: userId,
      status: { $ne: "Paid" },
    }).sort({
      dueDate: 1,
    });

    const alerts = [];
    const today = new Date();

    let upcomingPaymentTotal = 0;
    let overduePaymentTotal = 0;

    const upcomingPayments = [];

    loans.forEach((loan) => {
      const dueDate = new Date(loan.dueDate);

      const differenceInDays = Math.ceil(
        (dueDate - today) /
          (1000 * 60 * 60 * 24)
      );

      const paymentAmount = Number(
        loan.emiAmount ||
          loan.minimumDue ||
          0
      );

      if (differenceInDays < 0) {
        overduePaymentTotal += paymentAmount;

        alerts.push({
          type: "Overdue",
          severity: "High",
          loanId: loan._id,
          loanName: loan.loanName,
          message: `${loan.loanName} payment is overdue. Make the payment as soon as possible to avoid further negative impact on your simulated credit score.`,
          days: Math.abs(differenceInDays),
          amount: paymentAmount,
        });
      } else {
        upcomingPaymentTotal += paymentAmount;

        upcomingPayments.push({
          loanId: loan._id,
          loanName: loan.loanName,
          amount: paymentAmount,
          dueDate,
          days: differenceInDays,
        });

        if (differenceInDays === 0) {
          alerts.push({
            type: "Due Today",
            severity: "High",
            loanId: loan._id,
            loanName: loan.loanName,
            message: `${loan.loanName} payment is due today. Make the payment today to maintain on-time payment behavior.`,
            days: 0,
            amount: paymentAmount,
          });
        } else if (differenceInDays <= 3) {
          alerts.push({
            type: "Due Soon",
            severity: "Medium",
            loanId: loan._id,
            loanName: loan.loanName,
            message: `${loan.loanName} payment is due in ${differenceInDays} day${
              differenceInDays === 1 ? "" : "s"
            }. Keep ₹${paymentAmount.toLocaleString(
              "en-IN"
            )} ready for the payment.`,
            days: differenceInDays,
            amount: paymentAmount,
          });
        }
      }
    });

    /*
      Financial risk analysis
    */

    const totalUpcomingPayments = upcomingPayments
      .filter((payment) => payment.days <= 30)
      .reduce(
        (sum, payment) => sum + payment.amount,
        0
      );

    let availablePaymentCapacity = funds;

    /*
      If the user provides monthly income but no
      available funds, use income as a reference
      for affordability analysis.
    */
    if (availablePaymentCapacity <= 0 && income > 0) {
      availablePaymentCapacity = income;
    }

    const paymentShortfall =
      Math.max(
        0,
        totalUpcomingPayments -
          availablePaymentCapacity
      );

    let financialRisk = "Low";

    if (
      paymentShortfall > 0 ||
      overduePaymentTotal > 0
    ) {
      financialRisk = "High";
    } else if (
      totalUpcomingPayments > 0 &&
      availablePaymentCapacity <
        totalUpcomingPayments * 1.25
    ) {
      financialRisk = "Medium";
    }

    /*
      Previous repayment behavior
    */

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

    if (totalMissedPayments > 0) {
      alerts.push({
        type: "Repayment Risk",
        severity: "High",
        loanId: null,
        loanName: "Overall Credit Profile",
        message: `You have ${totalMissedPayments} recorded missed payment${
          totalMissedPayments === 1
            ? ""
            : "s"
        }. Prioritize upcoming payments to avoid further negative changes to your simulated score.`,
        days: null,
        amount: 0,
      });
    } else if (totalLatePayments > 0) {
      alerts.push({
        type: "Repayment Risk",
        severity: "Medium",
        loanId: null,
        loanName: "Overall Credit Profile",
        message: `You have ${totalLatePayments} recorded late payment${
          totalLatePayments === 1
            ? ""
            : "s"
        }. Consider setting reminders several days before each due date.`,
        days: null,
        amount: 0,
      });
    }

    /*
      Cash shortfall warning
    */

    if (
      paymentShortfall > 0 &&
      (funds > 0 || income > 0)
    ) {
      alerts.push({
        type: "Cash Shortfall Risk",
        severity: "High",
        loanId: null,
        loanName: "Upcoming Payments",
        message: `Your available funds may not be enough to cover your next 30 days of payments. Estimated shortfall: ₹${paymentShortfall.toLocaleString(
          "en-IN"
        )}.`,
        days: null,
        amount: paymentShortfall,
      });
    } else if (
      financialRisk === "Medium" &&
      (funds > 0 || income > 0)
    ) {
      alerts.push({
        type: "Limited Payment Buffer",
        severity: "Medium",
        loanId: null,
        loanName: "Upcoming Payments",
        message:
          "Your payment obligations are currently manageable, but your available payment buffer is limited. Keep additional funds ready for unexpected expenses.",
        days: null,
        amount: 0,
      });
    }

    /*
      Recommendations
    */

    const recommendations = [];

    if (overduePaymentTotal > 0) {
      recommendations.push(
        "Clear overdue payments as soon as possible."
      );
    }

    if (paymentShortfall > 0) {
      recommendations.push(
        "Review your upcoming expenses and arrange additional funds before the next payment dates."
      );
    }

    if (totalMissedPayments > 0) {
      recommendations.push(
        "Prioritize essential loan and credit-card payments before discretionary spending."
      );
    }

    if (totalLatePayments > 0) {
      recommendations.push(
        "Set reminders several days before every payment due date."
      );
    }

    if (
      recommendations.length === 0
    ) {
      recommendations.push(
        "Continue monitoring upcoming payments and maintain enough funds before each due date."
      );
    }

    /*
      Sort alerts by severity
    */

    const severityOrder = {
      High: 1,
      Medium: 2,
      Low: 3,
    };

    alerts.sort(
      (a, b) =>
        (severityOrder[a.severity] || 3) -
        (severityOrder[b.severity] || 3)
    );

    return res.json({
      success: true,

      alerts,
      alertCount: alerts.length,

      financialAnalysis: {
        availableFunds: funds,
        monthlyIncome: income,
        upcomingPaymentTotal:
          totalUpcomingPayments,
        overduePaymentTotal,
        paymentShortfall,
        financialRisk,
        totalLatePayments,
        totalMissedPayments,
      },

      recommendations,

      disclaimer:
        "These payment-prevention alerts are based on your CrediGuide loan records and the financial information you provide. They are educational estimates and do not guarantee future credit-score changes.",
    });
  } catch (error) {
    console.error(
      "Payment Prevention Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to generate payment prevention alerts.",
    });
  }
};

module.exports = {
  getPaymentPreventionAlerts,
};