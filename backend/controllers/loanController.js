
const Loan = require("../models/Loan");
const CibilSimulator = require("../models/CibilSimulator");
const Notification = require("../models/Notification");
const User = require("../models/User");

// ==========================================
// HELPER: CALCULATE CREDIT CARD UTILIZATION
// ==========================================
const calculateCreditUtilization = (
  outstandingAmount,
  creditLimit
) => {
  if (!creditLimit || creditLimit <= 0) {
    return 0;
  }

  const utilization =
    (Number(outstandingAmount || 0) /
      Number(creditLimit || 0)) *
    100;

  return Math.min(
    100,
    Math.max(0, Number(utilization.toFixed(2)))
  );
};

// ==========================================
// HELPER: GET USER ID
// ==========================================
const getUserId = (req) => {
  return (
    req.user?.userId ||
    req.user?._id ||
    req.user?.id
  );
};

// ==========================================
// GET ALL LOANS
// ==========================================
const getLoans = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const loans = await Loan.find({
      user: userId,
    }).sort({
      dueDate: 1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      loans,
    });
  } catch (error) {
    console.error("Get Loans Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch loans.",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE LOAN
// ==========================================
const getLoanById = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const loan = await Loan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan or credit account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      loan,
    });
  } catch (error) {
    console.error("Get Loan Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch loan.",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE LOAN / CREDIT ACCOUNT
// ==========================================
const createLoan = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      loanType,
      loanName,
      totalAmount,
      amountPaid,
      outstandingAmount,
      emiAmount,
      minimumDue,
      interestRate,
      creditLimit,
      dueDate,
      startDate,
      endDate,
      status,
      reminderEnabled,
      notes,
    } = req.body;

    if (!loanType || !loanName || !dueDate) {
      return res.status(400).json({
        success: false,
        message:
          "Loan type, account name and due date are required.",
      });
    }

    const parsedTotalAmount = Number(totalAmount || 0);
    const parsedAmountPaid = Number(amountPaid || 0);
    const parsedEmiAmount = Number(emiAmount || 0);
    const parsedMinimumDue = Number(minimumDue || 0);
    const parsedInterestRate = Number(interestRate || 0);
    const parsedCreditLimit = Number(creditLimit || 0);

    let parsedOutstandingAmount;

    if (
      outstandingAmount !== undefined &&
      outstandingAmount !== null &&
      outstandingAmount !== ""
    ) {
      parsedOutstandingAmount =
        Number(outstandingAmount);
    } else {
      parsedOutstandingAmount = Math.max(
        0,
        parsedTotalAmount - parsedAmountPaid
      );
    }

    if (
      !Number.isFinite(parsedTotalAmount) ||
      !Number.isFinite(parsedAmountPaid) ||
      !Number.isFinite(parsedOutstandingAmount) ||
      !Number.isFinite(parsedEmiAmount) ||
      !Number.isFinite(parsedMinimumDue) ||
      !Number.isFinite(parsedInterestRate) ||
      !Number.isFinite(parsedCreditLimit)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid numeric financial values.",
      });
    }

    if (
      parsedTotalAmount < 0 ||
      parsedAmountPaid < 0 ||
      parsedOutstandingAmount < 0 ||
      parsedEmiAmount < 0 ||
      parsedMinimumDue < 0 ||
      parsedInterestRate < 0 ||
      parsedCreditLimit < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Financial amounts cannot be negative.",
      });
    }

    const creditUtilization =
      loanType === "Credit Card"
        ? calculateCreditUtilization(
            parsedOutstandingAmount,
            parsedCreditLimit
          )
        : 0;

    const loan = await Loan.create({
      user: userId,
      loanType,
      loanName: loanName.trim(),
      totalAmount: parsedTotalAmount,
      amountPaid: parsedAmountPaid,
      outstandingAmount:
        parsedOutstandingAmount,
      emiAmount: parsedEmiAmount,
      minimumDue: parsedMinimumDue,
      interestRate: parsedInterestRate,
      creditLimit: parsedCreditLimit,
      creditUtilization,
      dueDate,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || "Active",
      reminderEnabled:
        reminderEnabled !== undefined
          ? Boolean(reminderEnabled)
          : true,
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message:
        "Loan or credit account added successfully.",
      loan,
    });
  } catch (error) {
    console.error("Create Loan Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to create loan or credit account.",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE LOAN / CREDIT ACCOUNT
// ==========================================
const updateLoan = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const loan = await Loan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan or credit account not found.",
      });
    }

    const allowedFields = [
      "loanType",
      "loanName",
      "totalAmount",
      "amountPaid",
      "outstandingAmount",
      "emiAmount",
      "minimumDue",
      "interestRate",
      "creditLimit",
      "dueDate",
      "startDate",
      "endDate",
      "status",
      "reminderEnabled",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        loan[field] = req.body[field];
      }
    });

    if (
      req.body.outstandingAmount === undefined &&
      (
        req.body.totalAmount !== undefined ||
        req.body.amountPaid !== undefined
      )
    ) {
      loan.outstandingAmount = Math.max(
        0,
        Number(loan.totalAmount || 0) -
          Number(loan.amountPaid || 0)
      );
    }

    if (loan.loanType === "Credit Card") {
      loan.creditUtilization =
        calculateCreditUtilization(
          Number(loan.outstandingAmount || 0),
          Number(loan.creditLimit || 0)
        );
    } else {
      loan.creditUtilization = 0;
    }

    await loan.save();

    return res.status(200).json({
      success: true,
      message:
        "Loan or credit account updated successfully.",
      loan,
    });
  } catch (error) {
    console.error("Update Loan Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to update loan or credit account.",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE LOAN / CREDIT ACCOUNT
// ==========================================
const deleteLoan = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const loan = await Loan.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan or credit account not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Loan or credit account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Loan Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete loan or credit account.",
      error: error.message,
    });
  }
};

// ==========================================
// SYNC LOAN WITH SIMULATED CREDIT PROFILE
// ==========================================
const syncLoanToScoreProfile = async (
  userId,
  loan
) => {
  let scoreProfile =
    await CibilSimulator.findOne({
      user: userId,
    });

  const activeLoan = {
    loanName: loan.loanName,
    loanType:
      loan.loanType === "Other Finance"
        ? "Other"
        : loan.loanType,
    outstandingAmount:
      Number(loan.outstandingAmount) || 0,
    emiAmount:
      Number(
        loan.emiAmount || loan.minimumDue
      ) || 0,
    dueDate: loan.dueDate,
    status:
      loan.status === "Paid"
        ? "Completed"
        : "Active",
    totalEmis: 0,
    paidEmis:
      Number(loan.onTimePayments || 0),
    source: "Existing Loan",
    sourceLoanId: loan._id,
  };

  if (!scoreProfile) {
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    scoreProfile =
      await CibilSimulator.create({
        user: userId,
        startingScore:
          user.currentCibilScore,
        currentScore:
          user.currentCibilScore,
        activeLoans: [activeLoan],
        scoreHistory: [
          {
            previousScore:
              user.currentCibilScore,
            change: 0,
            newScore:
              user.currentCibilScore,
            action: "Starting Score",
            loanName: "",
            amount: 0,
            notes:
              "Starting score provided during registration.",
            date: new Date(),
          },
        ],
      });

    return scoreProfile;
  }

  const existingIndex =
    scoreProfile.activeLoans.findIndex(
      (item) =>
        item.sourceLoanId &&
        item.sourceLoanId.toString() ===
          loan._id.toString()
    );

  if (existingIndex >= 0) {
    scoreProfile.activeLoans[existingIndex] =
      activeLoan;
  } else {
    scoreProfile.activeLoans.push(
      activeLoan
    );
  }

  await scoreProfile.save();

  return scoreProfile;
};

// ==========================================
// RECORD LOAN PAYMENT
// ==========================================
const recordLoanPayment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const loan = await Loan.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!loan) {
      return res.status(404).json({
        success: false,
        message: "Loan or credit account not found.",
      });
    }

    const {
      paymentDate,
      amount,
      status,
      notes,
    } = req.body;

    if (
      !paymentDate ||
      amount === undefined ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment date, amount and status are required.",
      });
    }

    if (
      !["Paid", "Late", "Missed"].includes(
        status
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status.",
      });
    }

    const paymentAmount = Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be valid.",
      });
    }

    // --------------------------------------
    // STORE PAYMENT
    // --------------------------------------

    loan.paymentHistory.push({
      paymentDate,
      amount: paymentAmount,
      status,
      dueDate: loan.dueDate,
      notes: notes || "",
    });

    // --------------------------------------
    // UPDATE PAYMENT COUNTERS
    // --------------------------------------

    if (status === "Paid") {
      loan.onTimePayments =
        Number(loan.onTimePayments || 0) + 1;
    }

    if (status === "Late") {
      loan.latePayments =
        Number(loan.latePayments || 0) + 1;
    }

    if (status === "Missed") {
      loan.missedPayments =
        Number(loan.missedPayments || 0) + 1;
    }

    // --------------------------------------
    // UPDATE FINANCIAL VALUES
    // --------------------------------------

    if (status !== "Missed") {
      loan.amountPaid =
        Number(loan.amountPaid || 0) +
        paymentAmount;

      loan.outstandingAmount = Math.max(
        0,
        Number(loan.totalAmount || 0) -
          Number(loan.amountPaid || 0)
      );
    }

    // --------------------------------------
    // CREDIT CARD UTILIZATION
    // --------------------------------------

    if (loan.loanType === "Credit Card") {
      loan.creditUtilization =
        calculateCreditUtilization(
          loan.outstandingAmount,
          loan.creditLimit
        );
    }

    // --------------------------------------
    // UPDATE LOAN STATUS
    // --------------------------------------

    if (
      loan.outstandingAmount <= 0 &&
      Number(loan.totalAmount || 0) > 0
    ) {
      loan.status = "Paid";
    } else if (status === "Missed") {
      loan.status = "Missed";
    } else if (status === "Late") {
      loan.status = "Overdue";
    } else {
      loan.status = "Active";
    }

    await loan.save();

    // --------------------------------------
    // SYNC LOAN WITH SCORE PROFILE
    // --------------------------------------

    await syncLoanToScoreProfile(
      userId,
      loan
    );

    // --------------------------------------
    // GET LATEST SCORE PROFILE
    // --------------------------------------

    let scoreProfile =
      await CibilSimulator.findOne({
        user: userId,
      });

    if (!scoreProfile) {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      scoreProfile =
        await CibilSimulator.create({
          user: userId,
          startingScore:
            user.currentCibilScore,
          currentScore:
            user.currentCibilScore,
          activeLoans: [],
          scoreHistory: [
            {
              previousScore:
                user.currentCibilScore,
              change: 0,
              newScore:
                user.currentCibilScore,
              action: "Starting Score",
              loanName: "",
              amount: 0,
              notes:
                "Starting score provided during registration.",
              date: new Date(),
            },
          ],
        });
    }

    // --------------------------------------
    // CALCULATE SCORE CHANGE
    // --------------------------------------

    const previousScore =
      Number(scoreProfile.currentScore);

    let scoreChange = 0;
    let action = "EMI Paid";

    if (status === "Paid") {
      scoreChange = 5;
      action = "EMI Paid";
    } else if (status === "Late") {
      scoreChange = -5;
      action = "EMI Paid Late";
    } else if (status === "Missed") {
      scoreChange = -20;
      action = "EMI Missed";
    }

    const newScore = Math.min(
      900,
      Math.max(
        300,
        previousScore + scoreChange
      )
    );

    // --------------------------------------
    // UPDATE SCORE
    // --------------------------------------

    scoreProfile.currentScore = newScore;

    // --------------------------------------
    // ADD SCORE HISTORY
    // --------------------------------------

    scoreProfile.scoreHistory.push({
      previousScore,
      change: newScore - previousScore,
      newScore,
      action,
      loanName: loan.loanName,
      amount: paymentAmount,
      notes:
        notes ||
        `Payment recorded as ${status}.`,
      date: new Date(),
    });

    // --------------------------------------
    // SAVE SCORE PROFILE
    // --------------------------------------

    await scoreProfile.save();

    // --------------------------------------
    // PAYMENT NOTIFICATION
    // --------------------------------------

    let paymentTitle = "";
    let paymentMessage = "";

    if (status === "Paid") {
      paymentTitle = "Payment Successful";

      paymentMessage =
        `${loan.loanName} payment of ₹${paymentAmount.toLocaleString(
          "en-IN"
        )} was recorded successfully. ` +
        `Your simulated credit score increased by ${scoreChange} points.`;
    } else if (status === "Late") {
      paymentTitle = "Late Payment Recorded";

      paymentMessage =
        `${loan.loanName} payment was recorded as late. ` +
        `Your simulated credit score changed by ${scoreChange} points.`;
    } else {
      paymentTitle = "Missed Payment Recorded";

      paymentMessage =
        `${loan.loanName} payment was recorded as missed. ` +
        `Your simulated credit score changed by ${scoreChange} points.`;
    }

    await Notification.create({
      user: userId,
      loan: loan._id,
      type: "Payment",
      title: paymentTitle,
      message: paymentMessage,
      isRead: false,
    });

    // --------------------------------------
    // SCORE NOTIFICATION
    // --------------------------------------

    if (scoreChange > 0) {
      await Notification.create({
        user: userId,
        loan: loan._id,
        type: "Score",
        title: "Simulated Score Increased",
        message:
          `Your simulated credit score increased by ${scoreChange} points. ` +
          `Your current simulated score is ${newScore}.`,
        isRead: false,
      });
    }

    if (scoreChange < 0) {
      await Notification.create({
        user: userId,
        loan: loan._id,
        type: "Score",
        title: "Simulated Score Decreased",
        message:
          `Your simulated credit score changed by ${scoreChange} points. ` +
          `Your current simulated score is ${newScore}.`,
        isRead: false,
      });
    }

    // --------------------------------------
    // RESPONSE
    // --------------------------------------

    return res.status(200).json({
      success: true,
      message: "Payment recorded successfully.",
      loan,
      score: {
        previousScore,
        change: newScore - previousScore,
        currentScore: newScore,
        action,
      },
    });
  } catch (error) {
    console.error(
      "Record Loan Payment Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to record payment.",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE DUE NOTIFICATIONS
// ==========================================
const createLoanDueNotifications = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const loans = await Loan.find({
      user: userId,
      reminderEnabled: true,
      status: {
        $in: [
          "Active",
          "Overdue",
          "Missed",
        ],
      },
    });

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const notifications = [];

    for (const loan of loans) {
      if (!loan.dueDate) {
        continue;
      }

      const dueDate = new Date(loan.dueDate);

      dueDate.setHours(0, 0, 0, 0);

      const difference =
        dueDate.getTime() -
        today.getTime();

      const daysUntilDue = Math.ceil(
        difference /
          (1000 * 60 * 60 * 24)
      );

      // --------------------------------------
      // OVERDUE
      // --------------------------------------

      if (daysUntilDue < 0) {
        loan.status = "Overdue";

        await loan.save();

        const existingOverdue =
          await Notification.findOne({
            user: userId,
            loan: loan._id,
            type: "Overdue",
            isRead: false,
          });

        if (!existingOverdue) {
          const notification =
            await Notification.create({
              user: userId,
              loan: loan._id,
              type: "Overdue",
              title: "Payment Overdue",
              message:
                `${loan.loanName} payment is overdue. ` +
                `Please make the payment as soon as possible to avoid further negative impact on your simulated credit score.`,
              isRead: false,
            });

          notifications.push(
            notification
          );
        }

        continue;
      }

      // --------------------------------------
      // DUE TODAY
      // --------------------------------------

      if (daysUntilDue === 0) {
        const existingToday =
          await Notification.findOne({
            user: userId,
            loan: loan._id,
            type: "Due Today",
            isRead: false,
          });

        if (!existingToday) {
          const notification =
            await Notification.create({
              user: userId,
              loan: loan._id,
              type: "Due Today",
              title: "Payment Due Today",
              message:
                `${loan.loanName} payment is due today. ` +
                `Please make the payment today to maintain positive payment behavior.`,
              isRead: false,
            });

          notifications.push(
            notification
          );
        }

        continue;
      }

      // --------------------------------------
      // DUE WITHIN 15 DAYS
      // --------------------------------------

      if (
        daysUntilDue > 0 &&
        daysUntilDue <= 15
      ) {
        const existingSoon =
          await Notification.findOne({
            user: userId,
            loan: loan._id,
            type: "Due Soon",
            isRead: false,
          });

        if (!existingSoon) {
          const notification =
            await Notification.create({
              user: userId,
              loan: loan._id,
              type: "Due Soon",
              title: "Payment Due Soon",
              message:
                `${loan.loanName} payment is due in ${daysUntilDue} day${
                  daysUntilDue === 1
                    ? ""
                    : "s"
                }. ` +
                `Please keep the EMI amount ready.`,
              isRead: false,
            });

          notifications.push(
            notification
          );
        }
      }
    }

    return res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error(
      "Create Loan Notifications Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create loan notifications.",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLERS
// ==========================================
module.exports = {
  getLoans,
  getLoanById,
  createLoan,
  updateLoan,
  deleteLoan,
  recordLoanPayment,
  createLoanDueNotifications,
};
