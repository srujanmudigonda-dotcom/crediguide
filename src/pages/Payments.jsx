import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import {
  CalendarDays,
  CreditCard,
  CircleDollarSign,
  Info,
  CheckCircle,
  Clock3,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import api from "../services/api";

function Payments() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await api.get("/loans");

      setLoans(response.data.loans || []);
    } catch (error) {
      console.error("Payments Error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load payment information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const paymentHistory = useMemo(() => {
    const payments = [];

    loans.forEach((loan) => {
      (loan.paymentHistory || []).forEach((payment, index) => {
        let scoreImpact = 0;

        if (payment.status === "Paid") {
          scoreImpact = 5;
        } else if (payment.status === "Late") {
          scoreImpact = -5;
        } else if (payment.status === "Missed") {
          scoreImpact = -20;
        }

        payments.push({
          id: `${loan._id}-${index}`,
          loanId: loan._id,
          loanName: loan.loanName,
          loanType: loan.loanType,
          amount: Number(payment.amount || 0),
          paymentDate: payment.paymentDate,
          dueDate: payment.dueDate || loan.dueDate,
          status: payment.status,
          notes: payment.notes || "",
          scoreImpact,
        });
      });
    });

    return payments.sort(
      (a, b) =>
        new Date(b.paymentDate) -
        new Date(a.paymentDate)
    );
  }, [loans]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return loans
      .filter(
        (loan) =>
          loan.status !== "Paid" &&
          loan.dueDate
      )
      .map((loan) => {
        const dueDate = new Date(loan.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        const differenceInDays = Math.ceil(
          (dueDate - today) /
            (1000 * 60 * 60 * 24)
        );

        return {
          ...loan,
          differenceInDays,
        };
      })
      .sort(
        (a, b) =>
          new Date(a.dueDate) -
          new Date(b.dueDate)
      );
  }, [loans]);

  const totalPaidAmount = useMemo(() => {
    return paymentHistory
      .filter(
        (payment) =>
          payment.status !== "Missed"
      )
      .reduce(
        (total, payment) =>
          total + payment.amount,
        0
      );
  }, [paymentHistory]);

  const getLoanIcon = (loanType) => {
    if (loanType === "Credit Card") {
      return CreditCard;
    }

    return CircleDollarSign;
  };

  const getStatusStyle = (status) => {
    if (status === "Paid") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Late") {
      return "bg-orange-100 text-orange-700";
    }

    if (status === "Missed") {
      return "bg-red-100 text-red-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    if (status === "Paid") {
      return CheckCircle;
    }

    if (status === "Late") {
      return Clock3;
    }

    if (status === "Missed") {
      return XCircle;
    }

    return Info;
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getDueStatus = (days) => {
    if (days < 0) {
      return {
        text: `${Math.abs(days)} day${
          Math.abs(days) === 1 ? "" : "s"
        } overdue`,
        style: "bg-red-100 text-red-700",
      };
    }

    if (days === 0) {
      return {
        text: "Due today",
        style: "bg-orange-100 text-orange-700",
      };
    }

    if (days <= 7) {
      return {
        text: `Due in ${days} day${
          days === 1 ? "" : "s"
        }`,
        style: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      text: `Due in ${days} days`,
      style: "bg-blue-100 text-blue-700",
    };
  };

  const getScoreImpactStyle = (impact) => {
    if (impact > 0) {
      return "text-green-600";
    }

    if (impact < 0) {
      return "text-red-600";
    }

    return "text-gray-500";
  };

  const getScoreImpactText = (impact) => {
    if (impact > 0) {
      return `+${impact}`;
    }

    return `${impact}`;
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Payments
              </h2>

              <p className="mt-2 text-gray-500">
                Track your loan payments, payment behavior,
                score impact and upcoming due dates.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <p className="text-sm text-gray-500">
                  Loading payment information...
                </p>
              </div>
            ) : (
              <>
                {/* Payment Summary */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Total Payments
                    </p>

                    <p className="mt-2 text-3xl font-bold text-gray-800">
                      {paymentHistory.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                      On-Time Payments
                    </p>

                    <p className="mt-2 text-3xl font-bold text-green-600">
                      {
                        paymentHistory.filter(
                          (payment) =>
                            payment.status === "Paid"
                        ).length
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Late Payments
                    </p>

                    <p className="mt-2 text-3xl font-bold text-orange-600">
                      {
                        paymentHistory.filter(
                          (payment) =>
                            payment.status === "Late"
                        ).length
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Missed Payments
                    </p>

                    <p className="mt-2 text-3xl font-bold text-red-600">
                      {
                        paymentHistory.filter(
                          (payment) =>
                            payment.status === "Missed"
                        ).length
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                      Recorded Amount
                    </p>

                    <p className="mt-2 text-2xl font-bold text-blue-600">
                      {formatCurrency(
                        totalPaidAmount
                      )}
                    </p>
                  </div>

                </div>

                {/* Score Impact Information */}
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                  <div className="flex items-start gap-3">
                    <Info
                      size={21}
                      className="mt-0.5 shrink-0 text-blue-600"
                    />

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Simulated Score Impact
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        CrediGuide uses the following educational
                        simulation rules for recorded payments:
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-white p-4">
                          <p className="text-sm text-gray-500">
                            Paid on time
                          </p>

                          <p className="mt-1 font-bold text-green-600">
                            +5 points
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <p className="text-sm text-gray-500">
                            Paid late
                          </p>

                          <p className="mt-1 font-bold text-orange-600">
                            -5 points
                          </p>
                        </div>

                        <div className="rounded-xl bg-white p-4">
                          <p className="text-sm text-gray-500">
                            Missed
                          </p>

                          <p className="mt-1 font-bold text-red-600">
                            -20 points
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Payments */}
                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                      <CalendarDays
                        size={22}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Upcoming Payments
                      </h3>

                      <p className="text-sm text-gray-500">
                        Your active loans and their upcoming due dates.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {upcomingPayments.length === 0 ? (
                      <div className="rounded-xl bg-gray-50 p-6 text-center">
                        <p className="text-sm text-gray-500">
                          No upcoming payments found.
                        </p>
                      </div>
                    ) : (
                      upcomingPayments.map((loan) => {
                        const LoanIcon = getLoanIcon(
                          loan.loanType
                        );

                        const dueStatus = getDueStatus(
                          loan.differenceInDays
                        );

                        return (
                          <div
                            key={loan._id}
                            className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                                <LoanIcon
                                  size={21}
                                  className="text-blue-600"
                                />
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {loan.loanName}
                                </h4>

                                <p className="mt-1 text-sm text-gray-500">
                                  {loan.loanType}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  Due on{" "}
                                  {formatDate(
                                    loan.dueDate
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="sm:text-right">
                              <p className="text-xl font-bold text-gray-800">
                                {formatCurrency(
                                  loan.emiAmount ||
                                    loan.minimumDue
                                )}
                              </p>

                              <span
                                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${dueStatus.style}`}
                              >
                                {dueStatus.text}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Payment History */}
                <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                      <CircleDollarSign
                        size={22}
                        className="text-green-600"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Payment History
                      </h3>

                      <p className="text-sm text-gray-500">
                        Your recorded loan payment behavior.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6">
                    {paymentHistory.length === 0 ? (
                      <div className="rounded-xl bg-gray-50 p-8 text-center">
                        <Info
                          size={28}
                          className="mx-auto text-gray-400"
                        />

                        <h4 className="mt-3 font-semibold text-gray-700">
                          No payment history yet
                        </h4>

                        <p className="mt-2 text-sm text-gray-500">
                          Record a loan payment from the Loans
                          page to see it here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paymentHistory.map((payment) => {
                          const StatusIcon =
                            getStatusIcon(
                              payment.status
                            );

                          const isSelected =
                            selectedPayment?.id ===
                            payment.id;

                          return (
                            <button
                              key={payment.id}
                              type="button"
                              onClick={() =>
                                setSelectedPayment(
                                  payment
                                )
                              }
                              className={`w-full rounded-xl border p-5 text-left transition ${
                                isSelected
                                  ? "border-blue-300 bg-blue-50"
                                  : "border-gray-100 bg-gray-50 hover:bg-gray-100"
                              }`}
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div className="flex items-center gap-4">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                                    <StatusIcon
                                      size={21}
                                      className={
                                        payment.status ===
                                        "Paid"
                                          ? "text-green-600"
                                          : payment.status ===
                                            "Late"
                                          ? "text-orange-600"
                                          : "text-red-600"
                                      }
                                    />
                                  </div>

                                  <div>
                                    <h4 className="font-semibold text-gray-800">
                                      {payment.loanName}
                                    </h4>

                                    <p className="mt-1 text-sm text-gray-500">
                                      {payment.loanType}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-400">
                                      Paid on{" "}
                                      {formatDate(
                                        payment.paymentDate
                                      )}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 lg:justify-end">
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Amount
                                    </p>

                                    <p className="text-lg font-bold text-gray-800">
                                      {formatCurrency(
                                        payment.amount
                                      )}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Status
                                    </p>

                                    <span
                                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                                        payment.status
                                      )}`}
                                    >
                                      {payment.status}
                                    </span>
                                  </div>

                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Score Impact
                                    </p>

                                    <p
                                      className={`mt-1 font-bold ${getScoreImpactStyle(
                                        payment.scoreImpact
                                      )}`}
                                    >
                                      {payment.scoreImpact > 0 && (
                                        <TrendingUp
                                          size={15}
                                          className="mr-1 inline"
                                        />
                                      )}

                                      {payment.scoreImpact < 0 && (
                                        <TrendingDown
                                          size={15}
                                          className="mr-1 inline"
                                        />
                                      )}

                                      {getScoreImpactText(
                                        payment.scoreImpact
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Payment Details */}
                {selectedPayment && (
                  <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          Payment Details
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Details of the selected payment.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedPayment(null)
                        }
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                      >
                        Close
                      </button>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                          Loan
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {selectedPayment.loanName}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                          Amount
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {formatCurrency(
                            selectedPayment.amount
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                          Payment Date
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {formatDate(
                            selectedPayment.paymentDate
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                          Due Date
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                          {formatDate(
                            selectedPayment.dueDate
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 p-4">
                        <p className="text-xs text-gray-500">
                          Score Impact
                        </p>

                        <p
                          className={`mt-1 font-bold ${getScoreImpactStyle(
                            selectedPayment.scoreImpact
                          )}`}
                        >
                          {getScoreImpactText(
                            selectedPayment.scoreImpact
                          )}{" "}
                          points
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Payment Status
                      </p>

                      <span
                        className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          selectedPayment.status
                        )}`}
                      >
                        {selectedPayment.status}
                      </span>

                      {selectedPayment.notes && (
                        <p className="mt-3 text-sm text-gray-600">
                          {selectedPayment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Educational Notice */}
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    About Payment Tracking
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    CrediGuide uses your recorded loan payment
                    behavior to provide educational credit guidance.
                    On-time, late and missed payments can affect your
                    simulated credit score according to the
                    application's scoring rules.
                  </p>

                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    This is an educational simulation and is not your
                    actual TransUnion CIBIL score or an official credit
                    report.
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Payments;