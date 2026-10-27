const Payment = require("../models/Payment");

/* -------------------- Get All Payments -------------------- */

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get Payments Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
    });
  }
};

/* -------------------- Get Upcoming Payments -------------------- */

const getUpcomingPayments = async (req, res) => {
  try {
    const payments = await Payment.find({
      user: req.user._id,
      status: {
        $in: ["Upcoming", "Due Soon", "Overdue"],
      },
    }).sort({ dueDate: 1 });

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("Get Upcoming Payments Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming payments",
    });
  }
};

/* -------------------- Mark Payment as Paid -------------------- */

const markPaymentAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.paymentId,
      user: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.status = "Paid";
    payment.paidAt = new Date();

    await payment.save();

    res.json({
      success: true,
      message: "Payment marked as paid",
      payment,
    });
  } catch (error) {
    console.error("Mark Payment Paid Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update payment",
    });
  }
};

module.exports = {
  getPayments,
  getUpcomingPayments,
  markPaymentAsPaid,
};