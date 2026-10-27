import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { recordLoanPayment } from "../services/loanService";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Edit3,
  IndianRupee,
  Percent,
  Plus,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

function Loans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLoanId, setEditingLoanId] = useState(null);

  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentLoanId, setPaymentLoanId] = useState(null);

  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amount: "",
    status: "Paid",
    notes: "",
  });

  const emptyForm = {
    loanType: "Personal Loan",
    loanName: "",
    totalAmount: "",
    amountPaid: "",
    outstandingAmount: "",
    emiAmount: "",
    minimumDue: "",
    interestRate: "",
    creditLimit: "",
    dueDate: "",
    startDate: "",
    endDate: "",
    status: "Active",
    reminderEnabled: true,
    notes: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // ==========================================
  // FETCH LOANS
  // ==========================================
  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/loans");

      if (response.data.success) {
        setLoans(response.data.loans || []);
      } else {
        setError(
          response.data.message || "Failed to load loans."
        );
      }
    } catch (err) {
      console.error("Loans Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load loans."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD + REMINDERS
  // ==========================================
  useEffect(() => {
    const loadLoansAndReminders = async () => {
      try {
        await api.post("/loans/create-reminders");
      } catch (err) {
        console.error(
          "Loan reminder check failed:",
          err
        );
      }

      await fetchLoans();
    };

    loadLoansAndReminders();
  }, []);

  // ==========================================
  // FORM HELPERS
  // ==========================================
  const formatAmount = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatInputDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ==========================================
  // CREATE / UPDATE LOAN
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const totalAmount = Number(
        formData.totalAmount || 0
      );

      const amountPaid = Number(
        formData.amountPaid || 0
      );

      const outstandingAmount =
        formData.outstandingAmount !== ""
          ? Number(formData.outstandingAmount)
          : Math.max(
              0,
              totalAmount - amountPaid
            );

      const loanData = {
        loanType: formData.loanType,
        loanName: formData.loanName.trim(),
        totalAmount,
        amountPaid,
        outstandingAmount,
        emiAmount: Number(
          formData.emiAmount || 0
        ),
        minimumDue: Number(
          formData.minimumDue || 0
        ),
        interestRate: Number(
          formData.interestRate || 0
        ),
        creditLimit: Number(
          formData.creditLimit || 0
        ),
        dueDate: formData.dueDate,
        startDate:
          formData.startDate || null,
        endDate:
          formData.endDate || null,
        status: formData.status,
        reminderEnabled:
          formData.reminderEnabled,
        notes: formData.notes.trim(),
      };

      if (!loanData.loanName) {
        setError("Please enter a loan or account name.");
        return;
      }

      if (!loanData.dueDate) {
        setError("Please select the next due date.");
        return;
      }

      if (loanData.totalAmount < 0) {
        setError("Total amount cannot be negative.");
        return;
      }

      if (loanData.amountPaid < 0) {
        setError("Amount paid cannot be negative.");
        return;
      }

      if (loanData.outstandingAmount < 0) {
        setError(
          "Outstanding amount cannot be negative."
        );
        return;
      }

      if (loanData.minimumDue < 0) {
        setError("Minimum due cannot be negative.");
        return;
      }

      if (
        loanData.interestRate < 0 ||
        loanData.interestRate > 100
      ) {
        setError(
          "Interest rate must be between 0 and 100."
        );
        return;
      }

      if (loanData.creditLimit < 0) {
        setError("Credit limit cannot be negative.");
        return;
      }

      if (
        loanData.loanType === "Credit Card" &&
        loanData.creditLimit <= 0
      ) {
        setError(
          "Please enter the credit limit for a credit card."
        );
        return;
      }

      let response;

      if (editingLoanId) {
        response = await api.put(
          `/loans/${editingLoanId}`,
          loanData
        );
      } else {
        response = await api.post(
          "/loans",
          loanData
        );
      }

      if (response.data.success) {
        setFormData({
          ...emptyForm,
        });

        setEditingLoanId(null);
        setShowForm(false);

        await fetchLoans();
      } else {
        setError(
          response.data.message ||
            (editingLoanId
              ? "Failed to update loan."
              : "Failed to add loan.")
        );
      }
    } catch (err) {
      console.error(
        editingLoanId
          ? "Update Loan Error:"
          : "Create Loan Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          (editingLoanId
            ? "Unable to update loan."
            : "Unable to add loan.")
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // ADD / CLOSE FORM
  // ==========================================
  const handleAddLoan = () => {
    setEditingLoanId(null);
    setFormData({
      ...emptyForm,
    });
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLoanId(null);
    setFormData({
      ...emptyForm,
    });
    setError("");
  };

  // ==========================================
  // EDIT LOAN
  // ==========================================
  const handleEdit = (loan) => {
    setFormData({
      loanType:
        loan.loanType || "Personal Loan",

      loanName:
        loan.loanName || "",

      totalAmount:
        loan.totalAmount ?? "",

      amountPaid:
        loan.amountPaid ?? "",

      outstandingAmount:
        loan.outstandingAmount ?? "",

      emiAmount:
        loan.emiAmount ?? "",

      minimumDue:
        loan.minimumDue ?? "",

      interestRate:
        loan.interestRate ?? "",

      creditLimit:
        loan.creditLimit ?? "",

      dueDate:
        formatInputDate(loan.dueDate),

      startDate:
        formatInputDate(loan.startDate),

      endDate:
        formatInputDate(loan.endDate),

      status:
        loan.status || "Active",

      reminderEnabled:
        loan.reminderEnabled !== undefined
          ? loan.reminderEnabled
          : true,

      notes:
        loan.notes || "",
    });

    setEditingLoanId(loan._id);
    setError("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // CLOSE LOAN
  // ==========================================
  const handleCloseLoan = async (loan) => {
    const confirmed = window.confirm(
      `Are you sure you want to close "${loan.loanName}"? This will mark the loan as fully paid.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await api.put(
        `/loans/${loan._id}`,
        {
          loanType: loan.loanType,
          loanName: loan.loanName,
          totalAmount: Number(
            loan.totalAmount || 0
          ),
          amountPaid: Number(
            loan.totalAmount || 0
          ),
          outstandingAmount: 0,
          emiAmount: Number(
            loan.emiAmount || 0
          ),
          minimumDue: 0,
          interestRate: Number(
            loan.interestRate || 0
          ),
          creditLimit: Number(
            loan.creditLimit || 0
          ),
          dueDate: loan.dueDate,
          startDate:
            loan.startDate || null,
          endDate:
            loan.endDate || null,
          status: "Paid",
          reminderEnabled: false,
          notes: loan.notes || "",
        }
      );

      if (response.data.success) {
        await fetchLoans();
      } else {
        setError(
          response.data.message ||
            "Failed to close loan."
        );
      }
    } catch (err) {
      console.error(
        "Close Loan Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to close loan."
      );
    }
  };

  // ==========================================
  // DELETE LOAN
  // ==========================================
  const handleDelete = async (loanId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this loan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response =
        await api.delete(
          `/loans/${loanId}`
        );

      if (response.data.success) {
        await fetchLoans();
      } else {
        setError(
          response.data.message ||
            "Failed to delete loan."
        );
      }
    } catch (err) {
      console.error(
        "Delete Loan Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete loan."
      );
    }
  };

  // ==========================================
  // PAYMENT
  // ==========================================
  const selectedPaymentLoan =
    loans.find(
      (loan) =>
        loan._id === paymentLoanId
    );

  const getExpectedScoreChange = () => {
    switch (paymentData.status) {
      case "Paid":
        return {
          value: "+5",
          label: "Paid on time",
          className:
            "text-green-700",
          bgClass:
            "bg-green-50",
        };

      case "Late":
        return {
          value: "-5",
          label: "Paid late",
          className:
            "text-yellow-700",
          bgClass:
            "bg-yellow-50",
        };

      case "Missed":
        return {
          value: "-20",
          label: "Payment missed",
          className:
            "text-red-700",
          bgClass:
            "bg-red-50",
        };

      default:
        return {
          value: "0",
          label: "No change",
          className:
            "text-gray-700",
          bgClass:
            "bg-gray-50",
        };
    }
  };

  const handlePaymentChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setPaymentData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const handleOpenPayment = (loan) => {
    setPaymentLoanId(
      loan._id
    );

    setPaymentData({
      paymentDate:
        new Date()
          .toISOString()
          .split("T")[0],

      amount:
        loan.emiAmount ||
        loan.minimumDue ||
        "",

      status: "Paid",

      notes: "",
    });

    setError("");
  };

  const handleClosePayment = () => {
    setPaymentLoanId(null);
    setPaymentSaving(false);
  };

  const handleRecordPayment = async (event) => {
    event.preventDefault();

    if (!paymentLoanId) {
      return;
    }

    if (
      paymentData.status !== "Missed" &&
      Number(paymentData.amount) <= 0
    ) {
      setError(
        "Please enter a valid payment amount."
      );
      return;
    }

    try {
      setPaymentSaving(true);
      setError("");

      const response =
        await recordLoanPayment(
          paymentLoanId,
          {
            paymentDate:
              paymentData.paymentDate,

            amount:
              paymentData.status ===
              "Missed"
                ? 0
                : Number(
                    paymentData.amount
                  ),

            status:
              paymentData.status,

            notes:
              paymentData.notes.trim(),
          }
        );

      if (response.success) {
        const change =
          response.score?.change;

        const changeText =
          typeof change === "number"
            ? change > 0
              ? `+${change}`
              : `${change}`
            : "0";

        if (response.score) {
          alert(
            `Payment recorded successfully.\n\n` +
              `Payment status: ${
                paymentData.status
              }\n` +
              `Simulated score change: ${changeText} points\n` +
              `Current simulated score: ${
                response.score.currentScore
              }`
          );
        } else {
          alert(
            "Payment recorded successfully."
          );
        }

        setPaymentLoanId(null);

        setPaymentData({
          paymentDate:
            new Date()
              .toISOString()
              .split("T")[0],

          amount: "",

          status: "Paid",

          notes: "",
        });

        await fetchLoans();
      } else {
        setError(
          response.message ||
            "Failed to record payment."
        );
      }
    } catch (err) {
      console.error(
        "Record Payment Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to record payment."
      );
    } finally {
      setPaymentSaving(false);
    }
  };

  // ==========================================
  // CALCULATIONS
  // ==========================================
  const getOutstanding = (loan) => {
    if (
      loan.outstandingAmount !==
      undefined
    ) {
      return Number(
        loan.outstandingAmount || 0
      );
    }

    return Math.max(
      0,
      Number(loan.totalAmount || 0) -
        Number(loan.amountPaid || 0)
    );
  };

  const getPaidPercentage = (loan) => {
    const total =
      Number(loan.totalAmount || 0);

    if (total <= 0) {
      return 0;
    }

    const paid =
      Number(loan.amountPaid || 0);

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (paid / total) * 100
        )
      )
    );
  };

  const getUtilization = (loan) => {
    if (
      loan.loanType !==
      "Credit Card"
    ) {
      return 0;
    }

    if (
      loan.creditUtilization !==
      undefined
    ) {
      return Number(
        loan.creditUtilization || 0
      );
    }

    const limit =
      Number(loan.creditLimit || 0);

    if (limit <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (getOutstanding(loan) /
          limit) *
          100
      )
    );
  };

  const getStatusClass = (status) => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }

    if (
      status === "Overdue" ||
      status === "Missed"
    ) {
      return "bg-red-100 text-red-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const getDueInfo = (loan) => {
    if (!loan.dueDate) {
      return {
        label: "Due date unavailable",
        className: "text-gray-500",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(loan.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    const difference = Math.ceil(
      (dueDate - today) /
        (1000 * 60 * 60 * 24)
    );

    if (loan.status === "Paid") {
      return {
        label: "Account paid",
        className: "text-green-600",
      };
    }

    if (difference < 0) {
      return {
        label: `${Math.abs(
          difference
        )} day${
          Math.abs(difference) === 1
            ? ""
            : "s"
        } overdue`,
        className: "text-red-600",
      };
    }

    if (difference === 0) {
      return {
        label: "Due today",
        className: "text-orange-600",
      };
    }

    if (difference <= 7) {
      return {
        label: `Due in ${difference} day${
          difference === 1 ? "" : "s"
        }`,
        className: "text-orange-600",
      };
    }

    return {
      label: `Due in ${difference} days`,
      className: "text-blue-600",
    };
  };

  // ==========================================
  // PAGE SUMMARY
  // ==========================================
  const summary = useMemo(() => {
    const activeLoans = loans.filter(
      (loan) =>
        loan.status !== "Paid"
    );

    const totalOutstanding =
      activeLoans.reduce(
        (total, loan) =>
          total + getOutstanding(loan),
        0
      );

    const monthlyEmi =
      activeLoans.reduce(
        (total, loan) =>
          total +
          Number(loan.emiAmount || 0),
        0
      );

    const totalPaid =
      loans.reduce(
        (total, loan) =>
          total +
          Number(loan.amountPaid || 0),
        0
      );

    const overdueLoans =
      activeLoans.filter((loan) => {
        if (!loan.dueDate) {
          return false;
        }

        const dueDate =
          new Date(loan.dueDate);

        return (
          dueDate <
          new Date()
        );
      }).length;

    return {
      totalAccounts: loans.length,
      activeAccounts: activeLoans.length,
      totalOutstanding,
      monthlyEmi,
      totalPaid,
      overdueLoans,
    };
  }, [loans]);

  const scoreImpact =
    getExpectedScoreChange();

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* HEADER */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                    <WalletCards
                      size={25}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      Loans & Credit
                    </h2>

                    <p className="mt-1 text-gray-500">
                      Manage your loans and credit
                      accounts in one place.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  showForm
                    ? handleCloseForm
                    : handleAddLoan
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                {showForm ? (
                  <X size={18} />
                ) : (
                  <Plus size={18} />
                )}

                {showForm
                  ? "Close Form"
                  : "Add Account"}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle
                  size={19}
                  className="mt-0.5 shrink-0"
                />

                <p>{error}</p>
              </div>
            )}

            {/* SUMMARY */}
            {!loading && loans.length > 0 && (
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Total Accounts
                      </p>

                      <p className="mt-2 text-3xl font-bold text-gray-800">
                        {summary.totalAccounts}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                      <WalletCards
                        size={21}
                        className="text-blue-600"
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    {summary.activeAccounts} active
                    account
                    {summary.activeAccounts === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Total Outstanding
                      </p>

                      <p className="mt-2 text-2xl font-bold text-gray-800">
                        {formatAmount(
                          summary.totalOutstanding
                        )}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100">
                      <IndianRupee
                        size={21}
                        className="text-orange-600"
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Across active accounts
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Monthly EMI
                      </p>

                      <p className="mt-2 text-2xl font-bold text-gray-800">
                        {formatAmount(
                          summary.monthlyEmi
                        )}
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100">
                      <CircleDollarSign
                        size={21}
                        className="text-purple-600"
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Scheduled EMI amount
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">
                        Payment Attention
                      </p>

                      <p
                        className={`mt-2 text-3xl font-bold ${
                          summary.overdueLoans > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {summary.overdueLoans}
                      </p>
                    </div>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        summary.overdueLoans > 0
                          ? "bg-red-100"
                          : "bg-green-100"
                      }`}
                    >
                      {summary.overdueLoans > 0 ? (
                        <AlertCircle
                          size={21}
                          className="text-red-600"
                        />
                      ) : (
                        <CheckCircle2
                          size={21}
                          className="text-green-600"
                        />
                      )}
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-500">
                    Overdue active accounts
                  </p>
                </div>
              </div>
            )}

            {/* SIMULATED SCORE NOTICE */}
            <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <Percent
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-blue-900">
                    Payment behavior simulation
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    CrediGuide uses your registered
                    starting score and recorded
                    payment behavior for an
                    educational simulation. It does
                    not calculate your actual CIBIL
                    score.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-4">
                  <p className="font-semibold text-green-700">
                    Paid on time
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Positive simulated behavior
                  </p>

                  <p className="mt-2 text-lg font-bold text-green-600">
                    +5 points
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="font-semibold text-yellow-700">
                    Paid late
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Negative simulated behavior
                  </p>

                  <p className="mt-2 text-lg font-bold text-yellow-600">
                    -5 points
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="font-semibold text-red-700">
                    Payment missed
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Stronger simulated negative behavior
                  </p>

                  <p className="mt-2 text-lg font-bold text-red-600">
                    -20 points
                  </p>
                </div>
              </div>
            </div>

            {/* FORM */}
            {showForm && (
              <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                    <Plus
                      size={20}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {editingLoanId
                        ? "Edit Account"
                        : "Add Loan or Credit Account"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Add the information available
                      from your loan or credit-card
                      statement.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-6"
                >
                  <div className="grid gap-5 md:grid-cols-2">

                    {/* TYPE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Account Type
                      </label>

                      <select
                        name="loanType"
                        value={formData.loanType}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Credit Card">
                          Credit Card
                        </option>

                        <option value="Personal Loan">
                          Personal Loan
                        </option>

                        <option value="Home Loan">
                          Home Loan
                        </option>

                        <option value="Vehicle Loan">
                          Vehicle Loan
                        </option>

                        <option value="Education Loan">
                          Education Loan
                        </option>

                        <option value="Gold Loan">
                          Gold Loan
                        </option>

                        <option value="Other Finance">
                          Other Finance
                        </option>
                      </select>
                    </div>

                    {/* NAME */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Account Name
                      </label>

                      <input
                        type="text"
                        name="loanName"
                        value={formData.loanName}
                        onChange={handleChange}
                        placeholder="Example: HDFC Credit Card"
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* TOTAL */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Total Loan Amount
                      </label>

                      <input
                        type="number"
                        name="totalAmount"
                        value={formData.totalAmount}
                        onChange={handleChange}
                        min="0"
                        placeholder="Example: 500000"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* PAID */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Amount Already Paid
                      </label>

                      <input
                        type="number"
                        name="amountPaid"
                        value={formData.amountPaid}
                        onChange={handleChange}
                        min="0"
                        placeholder="Example: 100000"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* OUTSTANDING */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Outstanding Balance
                      </label>

                      <input
                        type="number"
                        name="outstandingAmount"
                        value={formData.outstandingAmount}
                        onChange={handleChange}
                        min="0"
                        placeholder="Example: 400000"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        For credit cards, enter the
                        current outstanding amount
                        from your statement.
                      </p>
                    </div>

                    {/* EMI */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Monthly EMI
                      </label>

                      <input
                        type="number"
                        name="emiAmount"
                        value={formData.emiAmount}
                        onChange={handleChange}
                        min="0"
                        placeholder="Example: 15000"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* MINIMUM DUE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Minimum Due
                      </label>

                      <input
                        type="number"
                        name="minimumDue"
                        value={formData.minimumDue}
                        onChange={handleChange}
                        min="0"
                        placeholder="Example: 2500"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <p className="mt-1 text-xs text-gray-500">
                        Useful for credit cards and
                        accounts with a minimum
                        payment requirement.
                      </p>
                    </div>

                    {/* INTEREST */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Interest Rate (%)
                      </label>

                      <input
                        type="number"
                        name="interestRate"
                        value={formData.interestRate}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Example: 12.5"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* CREDIT LIMIT */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Credit Limit
                        {formData.loanType ===
                          "Credit Card" &&
                          " *"}
                      </label>

                      <input
                        type="number"
                        name="creditLimit"
                        value={formData.creditLimit}
                        onChange={handleChange}
                        min="0"
                        placeholder={
                          formData.loanType ===
                          "Credit Card"
                            ? "Example: 100000"
                            : "Optional"
                        }
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      {formData.loanType ===
                        "Credit Card" && (
                        <p className="mt-1 text-xs text-gray-500">
                          Used to calculate credit
                          utilization.
                        </p>
                      )}
                    </div>

                    {/* DUE DATE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Next Due Date
                      </label>

                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* START DATE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Start Date
                      </label>

                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* END DATE */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        End Date
                      </label>

                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* STATUS */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Status
                      </label>

                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Active">
                          Active
                        </option>

                        <option value="Paid">
                          Paid
                        </option>

                        <option value="Overdue">
                          Overdue
                        </option>

                        <option value="Missed">
                          Missed
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* NOTES */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Account Notes
                    </label>

                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Optional notes about this loan or account"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* REMINDERS */}
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      name="reminderEnabled"
                      checked={
                        formData.reminderEnabled
                      }
                      onChange={handleChange}
                      className="h-4 w-4 rounded"
                    />

                    <span className="text-sm text-gray-700">
                      Enable due-date reminders
                    </span>
                  </label>

                  {/* BUTTONS */}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleCloseForm}
                      className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving
                        ? "Saving..."
                        : editingLoanId
                        ? "Update Account"
                        : "Save Account"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LOADING */}
            {loading && (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-gray-500">
                  Loading accounts...
                </p>
              </div>
            )}

            {/* EMPTY */}
            {!loading &&
              !error &&
              loans.length === 0 && (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                    <WalletCards
                      size={27}
                      className="text-blue-600"
                    />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-gray-800">
                    No loans or credit accounts
                  </h3>

                  <p className="mx-auto mt-2 max-w-lg text-gray-500">
                    Add your accounts to start tracking
                    balances, due dates and payment
                    behavior.
                  </p>

                  <button
                    type="button"
                    onClick={handleAddLoan}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Add Account
                  </button>
                </div>
              )}

            {/* LOAN CARDS */}
            {!loading &&
              !error &&
              loans.length > 0 && (
                <div className="grid gap-6 xl:grid-cols-2">
                  {loans.map((loan) => {
                    const outstanding =
                      getOutstanding(loan);

                    const paidPercentage =
                      getPaidPercentage(loan);

                    const utilization =
                      getUtilization(loan);

                    const dueInfo =
                      getDueInfo(loan);

                    return (
                      <div
                        key={loan._id}
                        className="overflow-hidden rounded-2xl bg-white shadow-sm"
                      >
                        {/* CARD HEADER */}
                        <div className="border-b border-gray-100 p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                                {loan.loanType ===
                                "Credit Card" ? (
                                  <CreditCard
                                    size={23}
                                    className="text-blue-600"
                                  />
                                ) : (
                                  <CircleDollarSign
                                    size={23}
                                    className="text-blue-600"
                                  />
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-medium text-gray-500">
                                  {loan.loanType}
                                </p>

                                <h3 className="mt-1 text-xl font-bold text-gray-800">
                                  {loan.loanName}
                                </h3>
                              </div>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                loan.status
                              )}`}
                            >
                              {loan.status}
                            </span>
                          </div>

                          {/* DUE INFO */}
                          <div className="mt-5 flex items-center gap-2 text-sm">
                            <CalendarDays
                              size={17}
                              className="text-gray-400"
                            />

                            <span className="text-gray-500">
                              Due{" "}
                              {formatDate(
                                loan.dueDate
                              )}
                            </span>

                            <span
                              className={`font-semibold ${dueInfo.className}`}
                            >
                              · {dueInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* BALANCE */}
                        <div className="grid grid-cols-2 gap-px bg-gray-100">
                          <div className="bg-white p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Outstanding
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-800">
                              {formatAmount(
                                outstanding
                              )}
                            </p>
                          </div>

                          <div className="bg-white p-5">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Monthly EMI
                            </p>

                            <p className="mt-2 text-xl font-bold text-gray-800">
                              {formatAmount(
                                loan.emiAmount
                              )}
                            </p>
                          </div>
                        </div>

                        {/* MAIN DETAILS */}
                        <div className="p-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs text-gray-500">
                                Minimum Due
                              </p>

                              <p className="mt-1 font-bold text-gray-800">
                                {formatAmount(
                                  loan.minimumDue
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs text-gray-500">
                                Interest Rate
                              </p>

                              <p className="mt-1 font-bold text-gray-800">
                                {Number(
                                  loan.interestRate || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                                %
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs text-gray-500">
                                Amount Paid
                              </p>

                              <p className="mt-1 font-bold text-green-600">
                                {formatAmount(
                                  loan.amountPaid
                                )}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-4">
                              <p className="text-xs text-gray-500">
                                Payments
                              </p>

                              <p className="mt-1 font-bold text-gray-800">
                                {loan.paymentHistory
                                  ?.length || 0}
                              </p>
                            </div>
                          </div>

                          {/* CREDIT CARD UTILIZATION */}
                          {loan.loanType ===
                            "Credit Card" && (
                            <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-5">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="font-semibold text-purple-900">
                                    Credit Utilization
                                  </p>

                                  <p className="mt-1 text-xs text-purple-700">
                                    Limit:{" "}
                                    {formatAmount(
                                      loan.creditLimit
                                    )}
                                  </p>
                                </div>

                                <p className="text-2xl font-bold text-purple-700">
                                  {utilization.toFixed(
                                    1
                                  )}
                                  %
                                </p>
                              </div>

                              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-purple-100">
                                <div
                                  className="h-full rounded-full bg-purple-600 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      utilization,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* LOAN PROGRESS */}
                          {loan.loanType !==
                            "Credit Card" &&
                            Number(
                              loan.totalAmount || 0
                            ) > 0 && (
                            <div className="mt-6">
                              <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">
                                  Loan repayment progress
                                </span>

                                <span className="text-sm font-bold text-gray-800">
                                  {paidPercentage}%
                                </span>
                              </div>

                              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full rounded-full bg-green-500 transition-all"
                                  style={{
                                    width: `${paidPercentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* PAYMENT COUNTERS */}
                          <div className="mt-6">
                            <p className="mb-3 text-sm font-semibold text-gray-700">
                              Payment behavior
                            </p>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="rounded-xl bg-green-50 p-3 text-center">
                                <p className="text-xs text-green-700">
                                  On time
                                </p>

                                <p className="mt-1 text-lg font-bold text-green-700">
                                  {loan.onTimePayments ||
                                    0}
                                </p>
                              </div>

                              <div className="rounded-xl bg-yellow-50 p-3 text-center">
                                <p className="text-xs text-yellow-700">
                                  Late
                                </p>

                                <p className="mt-1 text-lg font-bold text-yellow-700">
                                  {loan.latePayments ||
                                    0}
                                </p>
                              </div>

                              <div className="rounded-xl bg-red-50 p-3 text-center">
                                <p className="text-xs text-red-700">
                                  Missed
                                </p>

                                <p className="mt-1 text-lg font-bold text-red-700">
                                  {loan.missedPayments ||
                                    0}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* PAYMENT HISTORY */}
                          <div className="mt-6 border-t pt-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-gray-800">
                                  Recent Payments
                                </h4>

                                <p className="mt-1 text-xs text-gray-500">
                                  Latest recorded payment
                                  activity
                                </p>
                              </div>

                              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                {loan.paymentHistory
                                  ?.length || 0}{" "}
                                total
                              </span>
                            </div>

                            {loan.paymentHistory &&
                            loan.paymentHistory.length >
                              0 ? (
                              <div className="mt-4 space-y-3">
                                {[
                                  ...loan.paymentHistory,
                                ]
                                  .reverse()
                                  .slice(0, 5)
                                  .map(
                                    (payment) => (
                                      <div
                                        key={
                                          payment._id
                                        }
                                        className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                                      >
                                        <div className="flex items-center justify-between gap-3">
                                          <div>
                                            <p className="font-semibold text-gray-800">
                                              {formatAmount(
                                                payment.amount
                                              )}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                              {formatDate(
                                                payment.paymentDate
                                              )}
                                            </p>
                                          </div>

                                          <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                              payment.status ===
                                              "Paid"
                                                ? "bg-green-100 text-green-700"
                                                : payment.status ===
                                                  "Late"
                                                ? "bg-yellow-100 text-yellow-700"
                                                : "bg-red-100 text-red-700"
                                            }`}
                                          >
                                            {
                                              payment.status
                                            }
                                          </span>
                                        </div>

                                        {payment.notes && (
                                          <p className="mt-2 border-t border-gray-200 pt-2 text-xs text-gray-600">
                                            {
                                              payment.notes
                                            }
                                          </p>
                                        )}
                                      </div>
                                    )
                                  )}
                              </div>
                            ) : (
                              <div className="mt-4 rounded-xl bg-gray-50 p-5 text-center">
                                <p className="text-sm text-gray-500">
                                  No payments recorded
                                  yet.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* ACTIONS */}
                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {loan.status !==
                              "Paid" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenPayment(
                                    loan
                                  )
                                }
                                className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                              >
                                Record Payment
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  loan
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-600 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                              <Edit3 size={16} />
                              Edit Account
                            </button>

                            {loan.status !==
                              "Paid" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleCloseLoan(
                                    loan
                                  )
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-600 px-4 py-3 text-sm font-semibold text-green-600 transition hover:bg-green-50"
                              >
                                <CheckCircle2
                                  size={16}
                                />
                                Mark Paid
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  loan._id
                                )
                              }
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-600 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            {/* EDUCATIONAL NOTICE */}
            {!loading && (
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800">
                  About loan and payment tracking
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  CrediGuide uses the loan information and
                  payment behavior you record to provide
                  educational financial guidance.
                </p>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  The simulated score changes shown in this
                  application are not the actual TransUnion
                  CIBIL scoring formula and should not be
                  treated as an official credit report.
                </p>
              </div>
            )}
          </div>

          {/* PAYMENT MODAL */}
          {paymentLoanId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Record Payment
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedPaymentLoan?.loanName ||
                        "Loan payment"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleClosePayment
                    }
                    className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {selectedPaymentLoan && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Due Date
                      </p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {formatDate(
                          selectedPaymentLoan.dueDate
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Outstanding
                      </p>

                      <p className="mt-1 font-semibold text-gray-800">
                        {formatAmount(
                          getOutstanding(
                            selectedPaymentLoan
                          )
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* SCORE IMPACT */}
                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-700">
                    Educational simulated impact
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-green-50 p-3">
                      <p className="font-semibold text-green-700">
                        On time
                      </p>

                      <p className="mt-1 font-bold text-green-600">
                        +5
                      </p>
                    </div>

                    <div className="rounded-lg bg-yellow-50 p-3">
                      <p className="font-semibold text-yellow-700">
                        Late
                      </p>

                      <p className="mt-1 font-bold text-yellow-600">
                        -5
                      </p>
                    </div>

                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="font-semibold text-red-700">
                        Missed
                      </p>

                      <p className="mt-1 font-bold text-red-600">
                        -20
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-gray-500">
                    These are CrediGuide simulation values,
                    not the actual CIBIL scoring formula.
                  </p>
                </div>

                <form
                  onSubmit={
                    handleRecordPayment
                  }
                  className="mt-6 space-y-5"
                >
                  {/* DATE */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Payment Date
                    </label>

                    <input
                      type="date"
                      name="paymentDate"
                      value={
                        paymentData.paymentDate
                      }
                      onChange={
                        handlePaymentChange
                      }
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* AMOUNT */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Payment Amount
                      {paymentData.status ===
                        "Missed" &&
                        " (Optional)"}
                    </label>

                    <input
                      type="number"
                      name="amount"
                      value={
                        paymentData.amount
                      }
                      onChange={
                        handlePaymentChange
                      }
                      min="0"
                      required={
                        paymentData.status !==
                        "Missed"
                      }
                      placeholder={
                        paymentData.status ===
                        "Missed"
                          ? "No payment made"
                          : "Enter payment amount"
                      }
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* STATUS */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Payment Status
                    </label>

                    <select
                      name="status"
                      value={
                        paymentData.status
                      }
                      onChange={
                        handlePaymentChange
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Paid">
                        Paid on time
                      </option>

                      <option value="Late">
                        Paid late
                      </option>

                      <option value="Missed">
                        Payment missed
                      </option>
                    </select>
                  </div>

                  {/* SELECTED IMPACT */}
                  <div
                    className={`rounded-xl p-4 ${scoreImpact.bgClass}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Selected payment behavior
                        </p>

                        <p
                          className={`mt-1 text-sm font-medium ${scoreImpact.className}`}
                        >
                          {scoreImpact.label}
                        </p>
                      </div>

                      <p
                        className={`text-2xl font-bold ${scoreImpact.className}`}
                      >
                        {scoreImpact.value}
                      </p>
                    </div>
                  </div>

                  {/* NOTES */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Notes
                    </label>

                    <textarea
                      name="notes"
                      value={
                        paymentData.notes
                      }
                      onChange={
                        handlePaymentChange
                      }
                      placeholder="Optional notes"
                      rows="3"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* BUTTONS */}
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={
                        handleClosePayment
                      }
                      className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        paymentSaving
                      }
                      className="rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {paymentSaving
                        ? "Saving..."
                        : "Save Payment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Loans;